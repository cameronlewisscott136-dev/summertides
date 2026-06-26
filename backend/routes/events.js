// routes/events.js
const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    seedEvents
} = require('../controllers/eventController');

// Get all events
router.get('/', getAllEvents);

// Get single event
router.get('/:id', getEventById);

// Seed events (development only)
router.post('/seed', seedEvents);

// Create event (admin only)
router.post('/', createEvent);

// Update event (admin only)
router.put('/:id', updateEvent);

module.exports = router;