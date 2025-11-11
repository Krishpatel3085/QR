const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); // Allows requests from your GitHub Pages frontend
app.use(express.json()); // Parses incoming JSON payloads

// --- MongoDB Connection ---

const MONGODB_URI = 'mongodb+srv://adhyashaktiair17:Xkhbo697@aat.l2yk9yo.mongodb.net/QR';
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
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});