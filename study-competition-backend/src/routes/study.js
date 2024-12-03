const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudySession = require('../models/StudySession');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

router.post('/start', verifyToken, async (req, res) => {
    try {
        const { topic, duration } = req.body;
        const userId = req.userId;

        const studySession = new StudySession({
            user: userId,
            topic,
            duration: parseInt(duration) // Ensure duration is saved as an integer
        });

        await studySession.save();

        res.json({ message: 'Study session recorded' });
    } catch (error) {
        console.error('Error recording study session:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/leaderboard', verifyToken, async (req, res) => {
    try {
        const { type, value } = req.query;
        let query = {};

        if (type === 'city' && value) {
            query.city = new RegExp(value, 'i'); // Case-insensitive search
        } else if (type === 'college' && value) {
            query.college = new RegExp(value, 'i'); // Case-insensitive search
        }

        const users = await User.find(query)
            .sort({ studyTime: -1 }) // Sort by studyTime in descending order
            .limit(10) // Limit to top 10 users
            .select('name studyTime'); // Select only name and studyTime fields

        res.json(users);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/complete-session', verifyToken, async (req, res) => {
    try {
        const { topic, duration } = req.body;
        const userId = req.user.id;

        // Create a new study session
        const studySession = new StudySession({
            user: userId,
            topic,
            duration
        });
        await studySession.save();

        // Update the user's total study time
        await User.findByIdAndUpdate(userId, {
            $inc: { studyTime: duration }
        });

        res.json({ message: 'Study session completed and total time updated' });
    } catch (error) {
        console.error('Error completing study session:', error);
        res.status(500).json({ message: 'Failed to complete study session' });
    }
});

router.get('/report', verifyToken, async (req, res) => {
    try {
        const sessions = await StudySession.find({ user: req.userId });
        const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0);
        const sessionsCompleted = sessions.length;
        const averageSessionDuration = sessionsCompleted > 0 ? totalStudyTime / sessionsCompleted : 0;

        res.json({
            totalStudyTime,
            sessionsCompleted,
            averageSessionDuration: Math.round(averageSessionDuration)
        });
    } catch (error) {
        console.error('Error fetching study report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/log-session', verifyToken, async (req, res) => {
    try {
        const { topic, duration } = req.body;
        const newSession = new StudySession({
            user: req.user.id,
            topic,
            duration: parseInt(duration)
        });
        await newSession.save();
        res.status(201).json({ message: 'Study session logged successfully' });
    } catch (error) {
        console.error('Error logging study session:', error);
        res.status(500).json({ message: 'Failed to log study session' });
    }
});

module.exports = router;
