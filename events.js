const express = require('express');
const router = express.Router();

// Getting schema from schema file
const { Event } = require('./db_schema/Schema.js');

// Post an event
router.post('/', async (req, res) => {
    const { title, description, startTime, endTime, location, userId, invitees } = req.body;

    if (!title || !startTime || !endTime || !userId) {
        res.status(400).json({ message: 'Title, start time, end time, or userId missing.'});
    }

    try {
        const newEvent = await Event.create({ title, description, startTime, endTime, location, userId, invitees });

        res.status(200).json({ event: newEvent });
    }
    catch (error) {
        console.error('Error adding event:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit an existing event
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, startTime, endTime, location, invitees } = req.body;

    try {
        const updateEvent = await Event.findByIdAndUpdate(id, { title, description, startTime, endTime, location, invitees}, { new: true, runValidators: true});

        if (!updateEvent) {
            res.status(404).json({ message: 'Event not found'});
        }

        res.status(200).json({ event: updateEvent });
    }
    catch (error) {
        console.error('Error editing event:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Retrieve events from a specific user
router.get('/user/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    try {

        const userEvents = await Event.find({ userId });

        if (!userEvents || userEvents.length === 0) {
            return res.status(404).json({ message: 'No events found for this user' });
        }

        res.status(200).json({ events: userEvents });
    } catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Retrieve a single event by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ event });
    } catch (error) {
        console.error('Error retrieving event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Deleting an event by id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Export the router
module.exports = router;
