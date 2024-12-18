const express = require('express');
const router = express.Router();

// All endpoints in this file start with /invitations followed by whatever is declared in the router.post('/..') section

// Getting schema from schema file
const { Event, User, Invitation } = require('./db_schema/Schema.js');

// Updating an invitation status - 'http://localhost:8000/invitations/:id'
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Need status to update' });
    }

    const validStatus = ['pending', 'accepted', 'declined'];
    if (!validStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be pending, accepted, or declined.' });
    }

    try {
        const updateInvite = await Invitation.findByIdAndUpdate(
            id, { status }, { new: true, runValidators: true })
            .populate('eventId', 'title description startTime endTime location organizerId')
            .populate('eventId.organizerId', 'name email');
        

        if (!updateInvite) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        const formattedInvite = {
            invitationId: updateInvite._id,
            status: updateInvite.status,
            event: {
                id: updateInvite.eventId._id,
                title: updateInvite.eventId.title,
                description: updateInvite.eventId.description,
                startTime: updateInvite.eventId.startTime,
                endTime: updateInvite.eventId.endTime,
                location: updateInvite.eventId.location,
                organizer: {
                    id: updateInvite.eventId.organizerId._id,
                    name: updateInvite.eventId.organizerId.name,
                    email: updateInvite.eventId.organizerId.email,
                },
            },
        }

        res.status(200).json({ message: 'Invitation status updated: ', invitation: formattedInvite });
    } catch (err) {
        console.error('Error updating invitation status:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get list of invitations that an invitee has received - 'http://localhost:8000/invitations/:user_id'
router.get('/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'Invitee') {
            return res.status(404).json({ message: 'Invitee not found or invalid role.' });
        }

        const invitations = await Invitation.find({ inviteeId: userId })
            .populate({
                path: 'eventId',
                select: 'title description startTime endTime location organizerId',
                populate: {
                    path: 'organizerId', 
                    select: 'name email', 
                }
            });

        if (invitations.length === 0) {
            return res.status(404).json({ message: 'No invitations found for this user' });
        }

        const formatInvites = invitations.map((invitation) => ({
            invitationId: invitation._id,
            status: invitation.status,
            event: {
                id: invitation.eventId._id,
                title: invitation.eventId.title,
                description: invitation.eventId.description,
                startTime: invitation.eventId.startTime,
                endTime: invitation.eventId.endTime,
                location: invitation.eventId.location,
                organizer: {
                    id: invitation.eventId.organizerId._id,
                    name: invitation.eventId.organizerId.name,
                    email: invitation.eventId.organizerId.email,
                },
            },
        }));

        res.status(200).json({ invitations: formatInvites });
    } catch (err) {
        console.error('Error retrieving invitations for invitee:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get list of invitations associated with an event - 'http://localhost:8000/invitations/event/:event_id'
router.get('/event/:event_id', async (req, res) => {
    const eventId = req.params.event_id;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Find the invitations associated with the event
        const invitations = await Invitation.find({ eventId: eventId })
            .populate({
                path: 'inviteeId',
                select: 'name email'
            });

        // Check if no invitations are found
        if (invitations.length === 0) {
            return res.status(404).json({ message: 'No invitations found for this event' });
        }

        // Format the invitations for the response
        const formattedInvitations = invitations.map(invitation => ({
            invitationId: invitation._id,
            status: invitation.status,
            invitee: {
                id: invitation.inviteeId._id,
                name: invitation.inviteeId.name,
                email: invitation.inviteeId.email
            }
        }));

        // Return the formatted invitations
        res.status(200).json({ invitations: formattedInvitations });
    } catch (err) {
        console.error('Error retrieving invitations for event:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Export the router
module.exports = router;