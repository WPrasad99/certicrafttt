const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Message, Event, User, Collaborator } = require('../models');

// Helper to check access — returns the event if accessible, null otherwise
const checkAccess = async (userId, eventId) => {
  const event = await Event.findByPk(eventId);
  if (event && String(event.organizerId) === String(userId)) return true;
  const collab = await Collaborator.findOne({ where: { eventId, userId, status: 'ACCEPTED' } });
  return !!collab;
};

router.get('/messages/event/:eventId', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { partnerId } = req.query;
    const currentUserId = req.user.id;

    if (!await checkAccess(currentUserId, eventId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let whereClause = { eventId };

    if (partnerId) {
      const Op = require('sequelize').Op;
      whereClause[Op.or] = [
        { userId: currentUserId, receiverId: partnerId },
        { userId: partnerId, receiverId: currentUserId }
      ];
    } else {
      whereClause.receiverId = null;
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['id', 'fullName'] }], // removed email from logs
      order: [['createdAt', 'ASC']]
    });

    res.json(messages.map(m => ({
      id: m.id,
      text: m.content,
      sender: m.User ? m.User.fullName : 'Unknown',
      senderId: m.userId,
      receiverId: m.receiverId,
      timestamp: m.createdAt,
      isRead: m.isRead
    })));
  } catch (err) {
    console.error('[Messages:get]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/messages/send', auth, async (req, res) => {
  try {
    const { eventId, text, receiverId } = req.body;

    // Basic validation
    if (!eventId || !text || String(text).trim().length === 0) {
      return res.status(400).json({ error: 'eventId and text are required' });
    }
    if (String(text).length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 characters)' });
    }

    if (!await checkAccess(req.user.id, eventId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const msg = await Message.create({
      eventId,
      userId: req.user.id,
      receiverId: receiverId || null,
      content: String(text).trim()
    });

    const user = await User.findByPk(req.user.id, { attributes: ['fullName'] });

    res.json({
      success: true,
      message: {
        id: msg.id,
        text: msg.content,
        sender: user ? user.fullName : 'Unknown',
        senderId: msg.userId,
        receiverId: msg.receiverId,
        timestamp: msg.createdAt
      }
    });
  } catch (err) {
    console.error('[Messages:send]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/messages/unread-count', auth, async (req, res) => {
  res.json({ count: 0 });
});

router.get('/messages/unread', auth, async (req, res) => {
  res.json([]);
});

router.post('/messages/event/:eventId/read', auth, async (req, res) => {
  res.json({ success: true });
});

// GET /requests — Fix N+1: batch-load organizers instead of per-iteration findByPk
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Collaborator.findAll({
      where: { userId: req.user.id, status: 'PENDING' },
      include: [
        {
          model: Event,
          include: [{ model: User, as: 'Organizer', attributes: ['id', 'fullName'] }]
        }
      ]
    });

    const result = requests
      .filter(r => r.Event)
      .map(r => ({
        id: r.id,
        eventId: r.Event.id,
        eventName: r.Event.eventName,
        senderName: r.Event.Organizer ? r.Event.Organizer.fullName : 'Unknown',
        status: r.status
      }));

    res.json(result);
  } catch (err) {
    console.error('[Collaboration:requests]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/sent-requests', auth, async (req, res) => {
  try {
    const events = await Event.findAll({ where: { organizerId: req.user.id } });
    const eventIds = events.map(e => e.id);

    if (eventIds.length === 0) return res.json([]);

    const requests = await Collaborator.findAll({
      where: { eventId: eventIds },
      include: [{ model: User, attributes: ['id', 'fullName'] }]
    });

    const result = requests.map(r => {
      const event = events.find(e => String(e.id) === String(r.eventId));
      return {
        id: r.id,
        eventId: r.eventId,
        eventName: event ? event.eventName : 'Unknown',
        senderName: r.User ? r.User.fullName : 'Unknown',
        status: r.status,
        updatedAt: r.updatedAt
      };
    });

    res.json(result);
  } catch (err) {
    console.error('[Collaboration:sent]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/requests/:id/accept', auth, async (req, res) => {
  try {
    const collab = await Collaborator.findByPk(req.params.id);
    if (!collab) return res.status(404).json({ error: 'Request not found' });
    if (String(collab.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Access denied' });

    await collab.update({ status: 'ACCEPTED' });
    res.json({ success: true });
  } catch (err) {
    console.error('[Collaboration:accept]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/requests/:id/decline', auth, async (req, res) => {
  try {
    const collab = await Collaborator.findByPk(req.params.id);
    if (!collab) return res.status(404).json({ error: 'Request not found' });
    if (String(collab.userId) !== String(req.user.id)) return res.status(403).json({ error: 'Access denied' });

    await collab.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('[Collaboration:decline]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/owned-events/logs', auth, (req, res) => res.json([]));

module.exports = router;
