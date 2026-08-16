const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Event, Certificate } = require('../models');

// PERF (M3): In-memory cache with 60-second TTL per user.
// Prevents 5 DB queries on every dashboard refresh.
// Upgrade to Redis if you move to multi-instance deployment.
const analyticsCache = new Map(); // key: userId, value: { data, expiresAt }
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Return cached result if still fresh
    const cached = analyticsCache.get(String(userId));
    if (cached && Date.now() < cached.expiresAt) {
      return res.json(cached.data);
    }

    const { Collaborator } = require('../models');

    // Count events owned by user
    const totalOwnedEvents = await Event.count({ where: { organizerId: userId } });

    // Find events belonging to this user (owned)
    const ownedEvents = await Event.findAll({ where: { organizerId: userId }, attributes: ['id', 'createdAt'] });

    // Find events where user is accepted collaborator
    const collaborations = await Collaborator.findAll({
      where: { userId, status: 'ACCEPTED' },
      attributes: ['eventId']
    });

    // Combine event IDs
    const ownedEventIds = ownedEvents.map(e => e.id);
    const collabEventIds = collaborations.map(c => c.eventId);
    const allEventIds = [...new Set([...ownedEventIds, ...collabEventIds])];

    const totalEvents = allEventIds.length;

    // Only fetch collab events that aren't already in ownedEvents (avoid double fetching)
    const collabOnlyIds = collabEventIds.filter(id => !ownedEventIds.includes(id));
    let collabEventsFull = [];
    if (collabOnlyIds.length > 0) {
      collabEventsFull = await Event.findAll({
        where: { id: collabOnlyIds },
        attributes: ['id', 'createdAt']
      });
    }
    const allEventsFull = [...ownedEvents, ...collabEventsFull];

    const allCertsFull = allEventIds.length > 0
      ? await Certificate.findAll({
          where: { eventId: allEventIds, generationStatus: 'GENERATED' },
          attributes: ['id', 'createdAt']
        })
      : [];

    const totalSentCerts = allEventIds.length > 0
      ? await Certificate.count({ where: { eventId: allEventIds, emailStatus: 'SENT' } })
      : 0;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(name => ({ name, events: 0, certs: 0 }));

    allEventsFull.forEach(e => {
      const m = new Date(e.createdAt).getMonth();
      if (!isNaN(m)) monthlyData[m].events++;
    });

    allCertsFull.forEach(c => {
      const m = new Date(c.createdAt).getMonth();
      if (!isNaN(m)) monthlyData[m].certs++;
    });

    const payload = {
      totalEvents,
      totalCertificates: allCertsFull.length,
      totalSentCerts,
      monthlyData
    };

    // Store in cache
    analyticsCache.set(String(userId), { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });

    res.json(payload);
  } catch (error) {
    console.error('[Analytics]', error.message);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
