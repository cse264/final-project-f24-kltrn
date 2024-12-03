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
    if (!validStatus.include(status)) {
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