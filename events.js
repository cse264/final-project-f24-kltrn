const express = require('express');
const router = express.Router();

// Getting schema from schema file
const { Event } = require('./db_schema/Schema.js');

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

router.put('/:id', async (req, res) => {
    const id = req.params.
    const { title, description, startTime, endTime, location, invitees } = req.body;

    try {
        const updateEvent = await Event.findByIdAndUpdate(id, { title, description, startTime, endTime, location, userId, invitees}, { new: true, runValidators: true});

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

