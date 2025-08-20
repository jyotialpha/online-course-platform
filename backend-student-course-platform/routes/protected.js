const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const router = express.Router();

router.get('/admin', authenticateToken, restrictTo('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin',
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
   });
});

router.get('/student', authenticateToken, restrictTo('student', 'admin'), (req, res) => {
  res.json({ message: 'Welcome Student' });
});

module.exports = router;