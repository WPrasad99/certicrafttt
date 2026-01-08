const express = require('express');
const router = express.Router();
const { Event } = require('../models');
const auth = require('../middleware/auth');

// CRUD for events
// CRUD for events
router.get('/', auth, async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const { Collaborator } = require('../models');

    // 1. Events owned by user
    const ownedEvents = await Event.findAll({ where: { organizerId: req.user.id } });

    // 2. Events where user is an accepted collaborator
    const collaborations = await Collaborator.findAll({
      where: { userId: req.user.id, status: 'ACCEPTED' },
      include: [{ model: Event }]
    });

    // Extract events from collaborations
    const sharedEvents = collaborations.map(c => c.Event).filter(e => e !== null);

    // Combine and deduplicate
    const allEvents = [...ownedEvents, ...sharedEvents];
    const uniqueEvents = Array.from(new Map(allEvents.map(item => [item.id, item])).values());

    res.json(uniqueEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const payload = { ...req.body, organizerId: req.user.id };
    const event = await Event.create(payload);
    res.json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ error: error.message || 'Failed to create event' });
  }
});

router.get('/:id', auth, async (req, res) => {
  const id = req.params.id;

  // Check if user is organizer
  let event = await Event.findOne({ where: { id, organizerId: req.user.id } });
  if (event) return res.json(event);

  // Check if user is accepted collaborator
  const { Collaborator } = require('../models');
  const isCollab = await Collaborator.findOne({
    where: { eventId: id, userId: req.user.id, status: 'ACCEPTED' }
  });

  if (isCollab) {
    event = await Event.findByPk(id);
    if (event) return res.json(event);
  }

  return res.status(404).json({ message: 'Not found' });
});

router.put('/:id', auth, async (req, res) => {
  const id = req.params.id;

  // Check if user is organizer
  let event = await Event.findOne({ where: { id, organizerId: req.user.id } });
  if (event) {
    await event.update(req.body);
    return res.json(event);
  }

  // Check if user is accepted collaborator
  const { Collaborator } = require('../models');
  const isCollab = await Collaborator.findOne({
    where: { eventId: id, userId: req.user.id, status: 'ACCEPTED' }
  });

  if (isCollab) {
    event = await Event.findByPk(id);
    if (event) {
      await event.update(req.body);
      return res.json(event);
    }
  }

  return res.status(404).json({ message: 'Not found' });
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findOne({ where: { id, organizerId: req.user.id } });

    if (!event) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    // Explicitly delete template file if it exists
    const template = await Template.findOne({ where: { eventId: id } });
    if (template && template.filePath && fs.existsSync(template.filePath)) {
      try {
        fs.unlinkSync(template.filePath);
      } catch (err) {
        console.error('Failed to delete template file:', err);
      }
    }

    // Delete the event - cascades will handle the rest
    await event.destroy();
    res.json({ message: 'deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: error.message });
  }
});

// generate certificates for event
const { Participant, Certificate, Template } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { generateCertificatePdf } = require('../utils/certificateGenerator');
const path = require('path');
const fs = require('fs');
const certOutDir = path.join(__dirname, '..', '..', 'uploads', 'certificates');
fs.mkdirSync(certOutDir, { recursive: true });

router.post('/:eventId/generate', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if user is organizer
    let event = await Event.findOne({ where: { id: eventId, organizerId: req.user.id } });
    if (!event) {
      // Check if user is accepted collaborator
      const isCollab = await Collaborator.findOne({
        where: { eventId, userId: req.user.id, status: 'ACCEPTED' }
      });
      if (!isCollab) return res.status(403).json({ error: 'Access denied' });
    }

    const participants = await Participant.findAll({ where: { eventId } });
    const created = [];
    for (const p of participants) {
      let existing = await Certificate.findOne({ where: { participantId: p.id, eventId } });

      if (!existing) {
        existing = await Certificate.create({ verificationId: uuidv4(), participantId: p.id, eventId, generationStatus: 'PENDING' });
      } else {
        // Force regeneration: mark pending, clear previous error, and remove old file if present
        await existing.update({ generationStatus: 'PENDING', errorMessage: null });
        if (existing.filePath && fs.existsSync(existing.filePath)) {
          try { fs.unlinkSync(existing.filePath); } catch (e) { /* ignore */ }
        }
      }

      try {
        const template = await Template.findOne({ where: { eventId } });
        if (!template || !template.filePath || !fs.existsSync(template.filePath)) {
          await existing.update({ generationStatus: 'FAILED', errorMessage: 'Template not found' });
          continue;
        }

        const outPath = path.join(certOutDir, `cert_${existing.id}.pdf`);
        const coords = { nameX: template.nameX, nameY: template.nameY };
        const qrCoords = { qrX: template.qrX, qrY: template.qrY };
        await generateCertificatePdf({
          templatePath: template.filePath,
          name: p.name,
          coords,
          fontSize: template.fontSize,
          fontColor: template.fontColor,
          qrCoords,
          qrSize: template.qrSize || 100,
          verificationId: existing.verificationId,
          outputPath: outPath
        });

        await existing.update({ filePath: outPath, generationStatus: 'GENERATED', generatedAt: new Date() });
        created.push(existing);
      } catch (err) {
        await existing.update({ generationStatus: 'FAILED', errorMessage: err.message });
      }
    }

    res.json({ createdCount: created.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// status endpoint
router.get('/:eventId/status', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if user is organizer
    let event = await Event.findOne({ where: { id: eventId, organizerId: req.user.id } });
    if (!event) {
      // Check if user is accepted collaborator
      const isCollab = await Collaborator.findOne({
        where: { eventId, userId: req.user.id, status: 'ACCEPTED' }
      });
      if (!isCollab) return res.status(403).json({ error: 'Access denied' });
      event = await Event.findByPk(eventId);
    }
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const participants = await Participant.findAll({ where: { eventId } });
    const certificates = await Certificate.findAll({ where: { eventId } });

    const result = participants.map(p => {
      const cert = certificates.find(c => String(c.participantId) === String(p.id));
      return {
        id: cert ? cert.id : null,
        participantId: p.id,
        participantName: p.name,
        email: p.email,
        generationStatus: cert ? cert.generationStatus : 'NOT_GENERATED',
        emailStatus: cert ? cert.emailStatus : 'NOT_SENT',
        verificationId: cert ? cert.verificationId : null,
        generatedAt: cert ? cert.generatedAt : null
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Collaborative features
const { User, Collaborator } = require('../models');

router.get('/:eventId/collaborators', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    // Check if user is organizer OR collaborator
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: 'Not found' });

    // Authorization check (simplified)
    if (event.organizerId !== req.user.id) {
      const isCollab = await Collaborator.findOne({ where: { eventId, userId: req.user.id } });
      if (!isCollab) return res.status(403).json({ message: 'Access denied' });
    }

    const collaborators = await Collaborator.findAll({
      where: { eventId },
      include: [{ model: User, attributes: ['id', 'fullName', 'email'] }]
    });

    // Map to simple structure
    const collaboratorList = collaborators.map(c => ({
      id: c.User.id,
      userId: c.User.id,
      name: c.User.fullName,
      email: c.User.email,
      role: c.role,
      status: c.status
    }));

    // Add owner to the list
    const owner = {
      id: event.Organizer ? event.Organizer.id : event.organizerId,
      userId: event.Organizer ? event.Organizer.id : event.organizerId,
      name: event.Organizer ? event.Organizer.fullName : (event.organizerName || 'Owner'),
      email: event.Organizer ? event.Organizer.email : (event.organizerEmail || ''),
      role: 'OWNER',
      status: 'ACCEPTED'
    };

    // If we didn't include Organizer in the findByPk, let's try to fetch it if name is missing
    if (!owner.name || owner.name === 'Owner') {
      const organizer = await User.findByPk(event.organizerId);
      if (organizer) {
        owner.name = organizer.fullName;
        owner.email = organizer.email;
        owner.id = organizer.id;
        owner.userId = organizer.id;
      }
    }

    res.json([owner, ...collaboratorList]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:eventId/collaborators/invite', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { email } = req.body;

    const event = await Event.findOne({ where: { id: eventId, organizerId: req.user.id } });
    if (!event) return res.status(403).json({ error: 'Only organizer can invite' });

    const userToInvite = await User.findOne({ where: { email } });
    if (!userToInvite) return res.status(404).json({ error: 'User not found' });

    if (userToInvite.id === req.user.id) return res.status(400).json({ error: 'Cannot invite yourself' });

    const existing = await Collaborator.findOne({ where: { eventId, userId: userToInvite.id } });
    if (existing) return res.status(400).json({ error: 'Already a collaborator' });

    await Collaborator.create({
      eventId,
      userId: userToInvite.id,
      status: 'PENDING',
      role: 'EDITOR'
    });

    res.json({ success: true, message: 'Invitation sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:eventId/collaborators/:userId', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const targetUserId = req.params.userId;

    const event = await Event.findOne({ where: { id: eventId, organizerId: req.user.id } });
    if (!event) return res.status(403).json({ error: 'Only organizer can remove' });

    await Collaborator.destroy({ where: { eventId, userId: targetUserId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:eventId/collaborators/:userId/logs', auth, async (req, res) => {
  try {
    const { ActivityLog } = require('../models');
    const { eventId, userId } = req.params;

    // Authorization: User must be organizer or the target user asking for their own logs
    // Or if it's a shared team view, maybe allow teammates to see each other's logs (simplified for now: allow if access to event)

    // Check access to event first
    let event = await Event.findOne({ where: { id: eventId } });
    // Simplified check: if you can view the team (which checkCollaborator does), you can view logs?
    // Let's stick to: Owner can view everyone. User can view themselves.

    const isOwner = event && event.organizerId === req.user.id;
    const isSelf = String(userId) === String(req.user.id);

    if (!isOwner && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const logs = await ActivityLog.findAll({
      where: { eventId, userId },
      order: [['timestamp', 'DESC']],
      limit: 50
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;