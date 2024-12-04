const express = require('express');
const router = express.Router();

// All endpoints in this file start with /events followed by whatever is declared in the router.post('/..') section

// Getting schema from schema file
const { User, Invitation, Event } = require('./db_schema/Schema.js');

// Post an event and associated invitation - 'http://localhost:8000/events'
router.post('/', async (req, res) => {
    const { title, description, startTime, endTime, location, organizerId, invitees } = req.body;

    if (!title || !startTime || !endTime || !organizerId) {
        return res.status(400).json({ message: 'Title, start time, end time, or organizerId missing.'});
    }

    try {
        // Checking organizer exists
        const organizer = await User.findById(organizerId);
        if (!organizer || organizer.role !== 'Event Organizer') {
            return res.status(404).json({ message: 'Organizer not found or invalid role.' });
        }

        // Validating invitees exist in db
        const inviteeValidationPromises = invitees.map((email) => User.findOne({ email }));
        const inviteeResults = await Promise.all(inviteeValidationPromises);
        const missingInvitees = invitees.filter((email, index) => !inviteeResults[index]);

        if (missingInvitees.length > 0) {
            return res.status(400).json({ message: 'Some invitees do not exist in the database: ', missingInvitees });
        }

        const inviteeIds = inviteeResults.map((user) => user._id);

        // Create event
        const newEvent = await Event.create({ title, description, startTime, endTime, location, organizerId, invitees: inviteeIds });

        // Create associated invitations
        const invitationPromises = inviteeIds.map((inviteeId) => {
            return Invitation.create({ eventId: newEvent._id, inviteeId, status: 'pending' });
        });
        await Promise.all(invitationPromises);

        res.status(200).json({ event: newEvent });
    }
    catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Edit an existing event - 'http://localhost:8000/events/:id'
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, startTime, endTime, location } = req.body;

    try {
        const updateEvent = await Event.findByIdAndUpdate(id, { title, description, startTime, endTime, location }, { new: true, runValidators: true});

        if (!updateEvent) {
            res.status(404).json({ message: 'Event not found'});
        }

        res.status(200).json({ event: updateEvent });
    }
    catch (error) {
        console.error('Error editing event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Retrieve events for an event organizer - 'http://localhost:8000/events/organizer/:user_id'
router.get('/organizer/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    try {
        // Check organizer exists
        const organizer = await User.findById(userId);
        if (!organizer || organizer.role !== 'Event Organizer') {
            return res.status(404).json({ message: 'Organizer not found or invalid role.' });
        }

        // Get events for organizer
        const userEvents = await Event.find({ organizerId: userId });
        if (!userEvents || userEvents.length === 0) {
            return res.status(404).json({ message: 'No events found for this user' });
        }

        res.status(200).json({ events: userEvents });
    } catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Retrieve accepted events for an invitee - 'http://localhost:8000/events/invitee/:user_id'
router.get('/invitee/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    try {
        // Check that invitee exists
        const invitee = await User.findById(userId);
        if (!invitee || invitee.role !== 'Invitee') {
            return res.status(404).json({ message: 'Invitee not found or invalid role.' });
        }

        // Collecting accepted events for an invitee
        const invitations = await Invitation.find({ inviteeId: userId, status: 'accepted' }).populate('eventId');
        const events = invitations.map((invitation) => invitation.eventId);

        res.status(200).json({ events });
    } catch (error) {
        console.error('Error retrieving events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Retrieve a single event by id - 'http://localhost:8000/events/:id'
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

// Deleting an event by id - 'http://localhost:8000/events/:id'
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Deleting associated invitations
        await Invitation.deleteMany({ eventId: id });

        res.status(200).json({ message: 'Event deleted successfully', event: deletedEvent });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Export the router
module.exports = router;