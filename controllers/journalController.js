const Journal = require('../models/Journal');

// ✅ Create a journal entry
const createJournalEntry = async (req, res) => {
  try {
    const { mood, entry } = req.body;

    // Check for required fields
    if (!mood || !entry) {
      return res.status(400).json({ message: 'Mood and entry are required.' });
    }

    // Create and save the entry
    const journal = new Journal({
      user: req.user.id,  // From auth middleware
      mood,
      entry
    });

    const savedEntry = await journal.save();
    res.status(201).json({ message: 'Journal entry created', journal: savedEntry });

  } catch (error) {
    res.status(500).json({ message: 'Error creating journal entry', error: error.message });
  }
};

// ✅ Get all journal entries for the logged-in user with sorting and filtering
const getJournalEntries = async (req, res) => {
  try {
    const { sort = '-timestamp', mood } = req.query;
    const query = { user: req.user.id };

    // Add mood filter if provided
    if (mood) {
      query.mood = mood;
    }

    const entries = await Journal.find(query)
      .sort(sort)
      .select('-__v');

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journal entries', error: error.message });
  }
};

// Get a single journal entry
const getJournalEntry = async (req, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching journal entry', error: error.message });
  }
};

// Update a journal entry
const updateJournalEntry = async (req, res) => {
  try {
    const { mood, entry } = req.body;
    const journalEntry = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!journalEntry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Update fields if provided
    if (mood) journalEntry.mood = mood;
    if (entry) journalEntry.entry = entry;

    const updatedEntry = await journalEntry.save();
    res.status(200).json({ message: 'Journal entry updated', journal: updatedEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error updating journal entry', error: error.message });
  }
};

// Delete a journal entry
const deleteJournalEntry = async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    res.status(200).json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting journal entry', error: error.message });
  }
};

module.exports = {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
};
