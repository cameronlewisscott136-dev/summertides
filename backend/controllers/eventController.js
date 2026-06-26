// controllers/eventController.js
const Event = require('../models/Event');

// Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({ isActive: true });
        res.json({
            success: true,
            data: events,
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get events',
        });
    }
};

// Get single event
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findOne({ id });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get event',
        });
    }
};

// Create event (admin only - for future use)
const createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const event = new Event(eventData);
        await event.save();

        res.status(201).json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create event',
        });
    }
};

// Update event (admin only)
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const event = await Event.findOneAndUpdate(
            { id },
            updates,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found',
            });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update event',
        });
    }
};

// Seed initial event (for development)
const seedEvents = async (req, res) => {
    try {
        const events = [{
            id: 'event_1',
            title: 'SUMMERTIDES 2026',
            description: "Summertides is Africa's Biggest Annual Beach Festival that cuts across diverse music experiences with DJs all over the world",
            date: 'Thu, Jul 02 - 6:00 PM',
            endDate: 'Sun, Jul 05 - 7:00 AM',
            location: 'Malindi, Kenya',
            price: '3,000.00',
            image: 'https://firebasestorage.googleapis.com/v0/b/hustle-build.appspot.com/o/23625%2Fproduct%2Fc7f37190-35e2-4568-8738-0fcf2b494cd6.jpg?alt=media&token=249f6a8b-b611-4bb7-9227-683e09c3e1c3',
            tickets: [
                { id: 'ticket_1', name: 'TIER 3', price: 6000, description: 'This ticket admits you to 3 days of the festival', available: true },
                { id: 'ticket_2', name: 'PRE-SALE TICKETS', price: 3000, description: 'This ticket admits you to 3 days of the festival', available: false, soldOut: true },
                { id: 'ticket_3', name: 'TIER 1', price: 4000, description: 'This ticket admits you to 3 days of the festival', available: false, soldOut: true },
                { id: 'ticket_4', name: 'TIER 2', price: 5000, description: 'This ticket admits you to 3 days of the festival', available: false, soldOut: true },
            ],
            isActive: true,
        }];

        // Clear existing events
        await Event.deleteMany({});

        // Insert events
        const inserted = await Event.insertMany(events);

        res.json({
            success: true,
            message: 'Events seeded successfully',
            data: inserted,
        });
    } catch (error) {
        console.error('Seed events error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to seed events',
        });
    }
};

// Export all functions
module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    seedEvents
};