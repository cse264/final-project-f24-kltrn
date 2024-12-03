const express = require('express');
const router = express.Router();

// All endpoints in this file start with /event followed by whatever is declared in the router.post('/..') section

// Getting schema from schema file
const { Event } = require('./db_schema/Schema.js');

// Post an event and associated invitation - 'http://localhost:8000/event'
router.post('/', async (req, res) => {
    const { title, description, startTime, endTime, location, userId, invitees } = req.body;

    if (!title || !startTime || !endTime || !userId) {
        res.status(400).json({ message: 'Title, start time, end time, or userId missing.'});
    }

    try {
        // Getting the associated organizer email for the invitation
        const user = await User.findById(userId);
        if (!user || !user.email) {
            return res.status(404).json({ message: 'Organizer email not found.' });
        }
        const organizerEmail = user.email;
        
        // If there are invitees, validate that all invitee emails exist in the database
        if (Array.isArray(invitees) && invitees.length > 0) {
            const inviteeValidationPromises = invitees.map((email) => User.findOne({ email }));
            const inviteeResults = await Promise.all(inviteeValidationPromises);

            // Check for any missing invitees
            const missingInvitees = invitees.filter((_, index) => !inviteeResults[index]);
            if (missingInvitees.length > 0) {
                return res.status(400).json({ message: 'Some invitees do not exist in the database: ', missingInvitees });
            }
        }

        // Create event
        const newEvent = await Event.create({ title, description, startTime, endTime, location, userId, invitees });

        // Create associated invitations
        const invitationPromises = invitees.map((inviteeEmail) => {
            return Invitation.create({ organizerEmail, inviteeEmail, status: 'pending' });
        });
        await Promise.all(invitationPromises);

        res.status(200).json({ event: newEvent });
    }
    catch (error) {
        console.error('Error adding event:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit an existing event - 'http://localhost:8000/event/:id'
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

// Retrieve events from a specific user - 'http://localhost:8000/event/user/:user_id'
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

// Retrieve a single event by id - - 'http://localhost:8000/event/:id'
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

// Deleting an event by id - 'http://localhost:8000/event/:id'
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
