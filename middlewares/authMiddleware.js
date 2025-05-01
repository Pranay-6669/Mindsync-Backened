const jwt = require('jsonwebtoken');
const User = require('../models/User.js'); 

const protect = async (req, res, next) => {
  console.log('Auth middleware called');
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found in middleware:', req.user);
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;
















