const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudySession', StudySessionSchema);
