const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {getUserById} = require('../controllers/userController'); // Adjust the path as necessary
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken'); 
const sendWelcomeMail = require('../config/nodemailer');

// Load environment variables
require('dotenv').config();

// Import authentication middleware
const protect = require('../middlewares/authMiddleware'); // Use 'protect' as the middleware function


// ✅ /me Route - Get user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ REGISTER Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all fields (username, email, password).' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = await User.create({ username, email, password });

    // Send welcome mail
    await sendWelcomeMail(email, username, 'register'); 

    // Generate JWT token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });

  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// ✅ LOGIN Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send login mail (optional but recommended)
    await sendWelcomeMail(email, user.username, 'login');

    // Respond with token and user info
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;













