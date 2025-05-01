// userRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware'); // Protect middleware to check JWT
const upload = require('../middlewares/uploadMiddleware');
const { 
  getUserById, 
  updateProfile, 
  updateMoodStats 
} = require('../controllers/userController');
const User = require('../models/User');

// This route is protected by the 'protect' middleware
router.get('/me', protect, getUserById);

// Update user profile
router.put('/profile', 
  protect, 
  upload.single('profilePic'), 
  updateProfile
);

// Update mood stats
router.post('/mood', protect, updateMoodStats);

module.exports = router;




