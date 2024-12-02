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
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    invitees: [{ type: mongoose.Schema.Types.ObjectId }],
});

const invitationSchema = new mongoose.Schema({
    organizerEmail: { type: String, required: true },
    inviteeEmail: { type: String, required: true },
    status: { type: String, required: true},
})

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);
const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = { User, Event };