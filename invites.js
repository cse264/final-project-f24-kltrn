const express = require('express');
const router = express.Router();

// All endpoints in this file start with /invitation followed by whatever is declared in the router.post('/..') section

// Getting schema from schema file
const { Invitation } = require('./db_schema/Schema.js');

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
        const updateInvite = await Invitation.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });

        if (!updateInvite) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        res.status(200).json({ message: 'Invitation status updated: ', invitation: updateInvite });
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

        const invitations = await Invitation.find({inviteeId: userId })
        .populate('eventId', 'title description startTime endTime location organizerId')
        .populate('eventId.organizerId', 'name email');

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