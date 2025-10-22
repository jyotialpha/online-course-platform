const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const courseController = require('../controllers/courseController');
const studentController = require('../controllers/studentController');
const Course = require('../models/Course');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes are working!' });
});

// Database status endpoint (no auth required for testing)
router.get('/db-status', async (req, res) => {
  try {
    const courseCount = await Course.countDocuments();
    res.json({ 
      message: 'Database connection working',
      courseCount,
      hasCourses: courseCount > 0
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database error',
      error: error.message 
    });
  }
});

// Admin routes
router.post('/courses', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.createCourse
);

router.get('/courses', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.getAllCourses
);

// Individual course routes
router.get('/courses/:courseId', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.getCourse
);

router.put('/courses/:courseId', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.updateCourse
);

router.delete('/courses/:courseId', 
  authenticateToken, 
  restrictTo('admin'), 
  courseController.deleteCourse
);

// Student management routes
router.get('/students', 
  authenticateToken, 
  restrictTo('admin'), 
  studentController.getAllStudents
);

router.get('/students/:studentId', 
  authenticateToken, 
  restrictTo('admin'), 
  studentController.getStudentById
);

module.exports = router;
