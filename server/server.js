const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
// 🌟 IMPORTANT: Ensures your frontend can talk to the backend
app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb+srv://adhyashaktiair17:Xkhbo697@aat.l2yk9yo.mongodb.net/QR';
// --- MongoDB Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- User Schema and Model ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    mobile: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// --- API Routes ---

// Test route
app.get('/api', (req, res) => {
    res.send('QR User API is running!');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        message: 'QR API is running...',
        status: 'UP',
    });
});

// POST /api/users - Create a new user
app.post('/api/users', async (req, res) => {
    try {
        const { email, username, mobile } = req.body;

        if (!email || !username || !mobile) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newUser = new User({ email, username, mobile });
        await newUser.save();

        res.status(201).json(newUser); // Send back the created user
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }); // Get newest first
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/users/:id - Get a single user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        // 🌟 This route is where the 'CastError' happened
        // It's working, but relies on a valid ID from the frontend.
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        // This log is what you sent me before
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});