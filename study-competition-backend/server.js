require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/auth');
const studyRoutes = require('./routes/study');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static("PROGRAM_FILE"));

// Routes
app.use('/auth', authRoutes);
app.use('/study', studyRoutes);

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "PROGRAM_FILE", "index.html"));
});

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, "PROGRAM_FILE", "dashboard.html"));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "PROGRAM_FILE", "Login.html"));
});

// // Serve the register page
// app.get('/register', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'register.html'));
// });

// Serve the leaderboard page
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, "PROGRAM_FILE", "leaderBoard.html"));
});

// Add this route for testing
app.get('/test-db', async (req, res) => {
    try {
        const users = await User.find().limit(5);
        res.json({ message: 'Database connection successful', userCount: users.length });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ message: 'Database connection error' });
    }
});

// Add this route for debugging
app.post('/auth/login', (req, res) => {
    console.log('Login request received:', req.body);
    res.status(200).json({ message: 'Login route hit successfully' });
});

// Add this near your other routes
app.get('/test', async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.json({ message: 'Server is running and connected to the database' });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Server listening
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Add this to handle errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});
