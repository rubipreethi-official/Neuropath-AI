const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rubipreethi2004_db_user:neuropath@cluster0.qjohmcm.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGODB_URI, {
  dbName: 'neuropath_db'
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Routes

// Create or update user
app.post('/api/users', async (req, res) => {
  try {
    const { uid, name, email } = req.body;

    if (!uid || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    let user = await User.findOne({ uid });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      return res.json({ message: 'User login updated', user });
    }

    // Create new user
    user = new User({ uid, name, email });
    await user.save();

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get user by UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user last login
app.patch('/api/users/:uid/login', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.params.uid },
      { lastLogin: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Login time updated', user });
  } catch (error) {
    console.error('Error updating login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (for admin purposes)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users, count: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Neuropath API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

