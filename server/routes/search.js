const express = require('express');
const router = express.Router();
const { handleSearch, handleSourceStatus } = require('../controllers/searchController');

// Main search endpoint
router.get('/search', handleSearch);

// Source status endpoint
router.get('/sources', handleSourceStatus);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
