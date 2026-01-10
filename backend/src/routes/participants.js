const express = require('express');
const router = express.Router({ mergeParams: true });
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const upload = multer({ dest: '/tmp' });
const fs = require('fs');
const auth = require('../middleware/auth');
const { Participant, Event, Collaborator, ActivityLog } = require('../models');

// Middleware to check if the user is owner OR collaborator
const checkEventOwnership = async (req, res, next) => {
  const eventId = req.params.eventId;

  // 1. Check if organizer
  const event = await Event.findOne({ where: { id: eventId, organizerId: req.user.id } });
  if (event) return next();

  // 2. Check if collaborator
  const isCollab = await Collaborator.findOne({
    where: {
      eventId,
      userId: req.user.id,
      status: 'ACCEPTED'
    }
  });

  if (isCollab) return next();

  return res.status(403).json({ error: 'Access denied: You do not have permission for this event' });
};

router.get('/', auth, checkEventOwnership, async (req, res) => {
  const eventId = req.params.eventId;
  const list = await Participant.findAll({ where: { eventId } });
  res.json(list);
});

router.post('/', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });

    const p = await Participant.create({
      name: name.trim(),
      email: email.trim(),
      eventId
    });

    await ActivityLog.create({
      eventId,
      userId: req.user.id,
      action: 'ADD_PARTICIPANT',
      details: `Added participant: ${p.name}`
    });

    res.json(p);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', auth, checkEventOwnership, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const eventId = req.params.eventId;
    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, 'utf8');
    const records = parse(content, { columns: true, trim: true });

    const created = [];
    for (const r of records) {
      const name = r.name || r.Name || r.fullName || r.FullName || r.full_name || r.participantName || '';
      const email = r.email || r.Email || '';
      if (!name || !email) continue;

      const p = await Participant.create({
        name: name.toString().trim(),
        email: email.toString().trim(),
        eventId
      });
      created.push(p);
    }

    if (created.length > 0) {
      await ActivityLog.create({
        eventId,
        userId: req.user.id,
        action: 'UPLOAD_PARTICIPANTS',
        details: `Uploaded ${created.length} participants`
      });
    }

    res.json({ createdCount: created.length });
  } catch (err) {
    console.error('Participant upload error:', err);
    res.status(400).json({ message: 'Invalid CSV', error: err.message });
  }
});

router.delete('/all', auth, checkEventOwnership, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Perform deletion
    await Participant.destroy({ where: { eventId } });

    await ActivityLog.create({
      eventId,
      userId: req.user.id,
      action: 'DELETE_ALL_PARTICIPANTS',
      details: 'Removed all participants and their data'
    });

    res.json({ message: 'deleted_all' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:participantId', auth, checkEventOwnership, async (req, res) => {
  const { eventId, participantId } = req.params;
  await Participant.destroy({ where: { id: participantId, eventId } });
  res.json({ message: 'deleted' });
});

module.exports = router;