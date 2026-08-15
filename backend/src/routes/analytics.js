const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { Event, Certificate } = require('../models');

router.get('/stats', auth, async (req, res) => {
    try {
        const { Collaborator } = require('../models');

        // Count events owned by user
        const totalOwnedEvents = await Event.count({ where: { organizerId: req.user.id } });

        // Find events belonging to this user (owned)
        const ownedEvents = await Event.findAll({ where: { organizerId: req.user.id }, attributes: ['id'] });

        // Find events where user is accepted collaborator
        const collaborations = await Collaborator.findAll({
            where: { userId: req.user.id, status: 'ACCEPTED' },
            attributes: ['eventId']
        });

        // Combine event IDs
        const ownedEventIds = ownedEvents.map(e => e.id);
        const collabEventIds = collaborations.map(c => c.eventId);
        const allEventIds = [...new Set([...ownedEventIds, ...collabEventIds])];

        const totalEvents = allEventIds.length;

        const allEventsFull = await Event.findAll({
            where: { id: allEventIds },
            attributes: ['id', 'createdAt']
        });

        const allCertsFull = await Certificate.findAll({
            where: { eventId: allEventIds, generationStatus: 'GENERATED' },
            attributes: ['id', 'createdAt']
        });

        const totalSentCerts = await Certificate.count({
            where: { eventId: allEventIds, emailStatus: 'SENT' }
        });

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

        const totalCertificates = allCertsFull.length;

        res.json({
            totalEvents,
            totalCertificates,
            totalSentCerts,
            monthlyData
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
