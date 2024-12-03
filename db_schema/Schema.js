const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true},
    email: { type: String, required: true, unique: true},
});

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startTime: { type: Date, required: true},
    endTime: { type: Date, required: true},
    location: { type: String },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const invitationSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    inviteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, required: true, enum: ['pending', 'accepted', 'declined']},
})

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = { User, Event };