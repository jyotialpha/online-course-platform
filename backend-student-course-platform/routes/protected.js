const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const router = express.Router();

router.get('/admin', authenticateToken, restrictTo('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

router.get('/student', authenticateToken, restrictTo('student', 'admin'), (req, res) => {
  res.json({ message: 'Welcome Student' });
});

module.exports = router;