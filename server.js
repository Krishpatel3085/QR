// Import required modules
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// --- Configuration ---
// Your local MongoDB connection URL
const MONGO_URL = "mongodb+srv://adhyashaktiair17:Xkhbo697@aat.l2yk9yo.mongodb.net/QR";
const DB_NAME = "userQrApp"; // The database name
const COLLECTION_NAME = "users"; // The collection name
const PORT = 3000; // The port your server will run on
// ---------------------

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

let db;
let usersCollection;

// Function to connect to MongoDB
async function connectToMongo() {
    try {
        const client = new MongoClient(MONGO_URL);
        await client.connect();
        console.log("Connected successfully to local MongoDB");

        db = client.db(DB_NAME);
        usersCollection = db.collection(COLLECTION_NAME);

    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1); // Exit the process if connection fails
    }
}

// --- API Routes ---

// GET all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await usersCollection.find({}).toArray();
        res.json(users.map(user => ({ ...user, id: user._id }))); // Send all users
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
});

// POST a new user
app.post('/api/users', async (req, res) => {
    try {
        const { username, email, mobile } = req.body;
        if (!username || !email || !mobile) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newUser = { username, email, mobile };
        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({ ...newUser, id: result.insertedId });
    } catch (err) {
        console.error("Error adding user:", err);
        res.status(500).json({ message: "Error adding user" });
    }
});

// GET a single user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ ...user, id: user._id }); // Send the user
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user" });
    }
});


// --- Frontend Serving ---

// Serve the index.html file for the root and for any path
// This is important so that your QR code links (e.g., /?id=123)
// are also handled by your index.html file.
app.get('*', (req, res) => {
    // Check if the request is for an API route
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: "API route not found" });
    }
    // Otherwise, send the index.html file
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- Start Server ---
// First connect to Mongo, then start the Express server
connectToMongo().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Serving index.html and API routes.`);
    });
});