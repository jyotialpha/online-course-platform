const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const courseController = require('../controllers/courseController');

const router = express.Router();

// Admin routes
router.post('/courses', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.createCourse
);

router.put('/courses/:id', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.updateCourse
);

router.delete('/courses/:id', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.deleteCourse
);

router.get('/courses', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.getAllCourses
);

router.get('/courses/:id', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.getCourse
);

module.exports = router;
