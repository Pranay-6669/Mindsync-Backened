require('dotenv').config(); 
const jwt = require('jsonwebtoken');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const journalRoutes = require('./routes/journalRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/users', userRoutes);
app.use('/api', require('./routes/supportRoutes'));

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Available routes:');
  console.log('GET /test');
  console.log('POST /api/auth/login');
  console.log('GET /api/users/me');
  console.log('POST /api/journals');
});

// Example of using the JWT_SECRET environment variable
const token = jwt.sign({ userId: 12345 }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log(token);  // JWT token generated using the secret from .env

















