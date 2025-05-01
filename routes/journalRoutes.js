const express = require('express');
const router = express.Router();
const { 
  createJournalEntry, 
  getJournalEntries, 
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} = require('../controllers/journalController');
const authenticate = require('../middlewares/authMiddleware');

// Create new journal entry
router.post('/', authenticate, createJournalEntry);

// Get all journal entries for the logged-in user
router.get('/', authenticate, getJournalEntries);

// Get a single journal entry
router.get('/:id', authenticate, getJournalEntry);

// Update a journal entry
router.put('/:id', authenticate, updateJournalEntry);

// Delete a journal entry
router.delete('/:id', authenticate, deleteJournalEntry);

module.exports = router;


