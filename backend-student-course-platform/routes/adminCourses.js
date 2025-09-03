const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const courseController = require('../controllers/courseController');
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

// Create sample course for testing (no auth required)
router.post('/create-sample', async (req, res) => {
  try {
    const existingCourses = await Course.countDocuments();
    if (existingCourses > 0) {
      return res.json({ message: 'Courses already exist', count: existingCourses });
    }

    const sampleCourse = new Course({
      title: 'Sample JavaScript Course',
      description: 'Learn JavaScript fundamentals with this comprehensive course',
      price: 999,
      chapters: [
        {
          title: 'Introduction to JavaScript',
          questions: [
            {
              question: 'What is JavaScript?',
              options: ['A programming language', 'A markup language', 'A database', 'An operating system'],
              correctAnswer: 0
            },
            {
              question: 'Which company developed JavaScript?',
              options: ['Microsoft', 'Google', 'Netscape', 'Apple'],
              correctAnswer: 2
            }
          ]
        },
        {
          title: 'Variables and Data Types',
          questions: [
            {
              question: 'Which keyword is used to declare a variable in JavaScript?',
              options: ['var', 'let', 'const', 'All of the above'],
              correctAnswer: 3
            }
          ]
        }
      ]
    });

    await sampleCourse.save();
    res.json({ message: 'Sample course created successfully', course: sampleCourse });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sample course', error: error.message });
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

module.exports = router;
