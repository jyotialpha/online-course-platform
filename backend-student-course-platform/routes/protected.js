const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const courseService = require('../services/courseService');
const User = require('../models/User');
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

// Get all courses for students
router.get('/protected/student/courses', authenticateToken, restrictTo('student'), async (req, res, next) => {
  try {
    // console.log('Student courses endpoint hit');
    const courses = await courseService.getCoursesWithPagination({}, { createdAt: -1 }, 0, 50);
    // console.log('Courses found:', courses.length);
    
    // Ensure all courses have isFree field
    const coursesWithIsFree = courses.map(course => {
      const courseObj = course.toObject ? course.toObject() : course;
      if (courseObj.isFree === undefined) {
        courseObj.isFree = courseObj.price === 0;
      }
      return courseObj;
    });
    
    res.json({
      status: 'success',
      data: { courses: coursesWithIsFree }
    });
  } catch (error) {
    console.error('Error in student courses:', error);
    next(error);
  }
});

// Enroll in a course
router.post('/protected/student/enroll/:courseId', authenticateToken, restrictTo('student'), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Find user by ID or email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(enrollment => 
      enrollment.courseId.toString() === courseId
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Verify course exists
    const course = await courseService.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is paid
    if (!course.isFree && course.price > 0) {
      return res.status(400).json({ 
        message: 'This is a paid course. Payment required to enroll.',
        requiresPayment: true,
        price: course.price
      });
    }
    
    // Add enrollment for free courses
    user.enrolledCourses.push({
      courseId: courseId,
      enrolledAt: new Date(),
      status: 'enrolled',
      amount: 0
    });
    
    await user.save();
    
    res.json({
      status: 'success',
      message: 'Successfully enrolled in course',
      data: {
        courseId,
        courseName: course.title,
        enrolledAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get enrolled courses
router.get('/protected/student/my-courses', authenticateToken, restrictTo('student'), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format enrolled courses with enrollment details
    const enrolledCourses = user.enrolledCourses.map(enrollment => ({
      ...enrollment.courseId.toObject(),
      enrollmentDetails: {
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        amount: enrollment.amount
      }
    }));
    
    res.json({
      status: 'success',
      data: { 
        courses: enrolledCourses,
        totalEnrolled: enrolledCourses.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;