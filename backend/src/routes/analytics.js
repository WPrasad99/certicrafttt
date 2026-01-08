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

        const totalCertificates = await Certificate.count({
            where: {
                eventId: allEventIds,
                generationStatus: 'GENERATED'
            }
        });

        res.json({
            totalEvents,
            totalCertificates,
            monthlyData: [
                { name: 'Jan', events: totalEvents, certs: totalCertificates },
                { name: 'Feb', events: 0, certs: 0 },
                { name: 'Mar', events: 0, certs: 0 },
                { name: 'Apr', events: 0, certs: 0 },
                { name: 'May', events: 0, certs: 0 },
                { name: 'Jun', events: 0, certs: 0 },
                { name: 'Jul', events: 0, certs: 0 },
                { name: 'Aug', events: 0, certs: 0 },
                { name: 'Sep', events: 0, certs: 0 },
                { name: 'Oct', events: 0, certs: 0 },
                { name: 'Nov', events: 0, certs: 0 },
                { name: 'Dec', events: 0, certs: 0 }
            ]
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
