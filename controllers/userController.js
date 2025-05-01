const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const updates = {};

    // Update username if provided
    if (username) {
      updates.username = username;
    }

    // Handle profile picture if uploaded
    if (req.file) {
      // Delete old profile picture if exists
      const user = await User.findById(req.user.id);
      if (user.profilePic) {
        const oldPath = path.join(__dirname, '..', user.profilePic);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      // Update with new profile picture path
      updates.profilePic = req.file.path;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Update mood stats
const updateMoodStats = async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood) {
      return res.status(400).json({ message: 'Mood is required' });
    }

    const update = {};
    update[`moodStats.${mood}`] = 1;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: update },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Mood stats updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating mood stats', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getUserById,
  updateProfile,
  updateMoodStats,
  loginUser
};












