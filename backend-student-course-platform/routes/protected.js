const express = require('express');
const { authenticateToken, restrictTo } = require('../middleware/auth');
const courseService = require('../services/courseService');
const User = require('../models/User');
const axios = require('axios');
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
    console.log('Fetching my-courses for user:', userId);
    
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found, enrolled courses count:', user.enrolledCourses.length);
    
    // Format enrolled courses with enrollment details, filter out deleted courses
    const enrolledCourses = user.enrolledCourses
      .filter(enrollment => {
        const hasValidCourse = enrollment.courseId && enrollment.courseId._id;
        if (!hasValidCourse) {
          console.log('Filtering out null/deleted course for enrollment:', enrollment._id);
        }
        return hasValidCourse;
      })
      .map(enrollment => {
        try {
          return {
            ...enrollment.courseId.toObject(),
            enrollmentDetails: {
              enrolledAt: enrollment.enrolledAt,
              status: enrollment.status,
              amount: enrollment.amount
            }
          };
        } catch (mapError) {
          console.error('Error mapping enrollment:', enrollment._id, mapError);
          return null;
        }
      })
      .filter(course => course !== null);
    
    console.log('Processed enrolled courses count:', enrolledCourses.length);
    
    res.json({
      status: 'success',
      data: { 
        courses: enrolledCourses,
        totalEnrolled: enrolledCourses.length
      }
    });
  } catch (error) {
    console.error('Error in my-courses route:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch enrolled courses',
      error: error.message 
    });
  }
});

// Get specific enrolled course for learning
router.get('/protected/student/course/:courseId', authenticateToken, restrictTo('student'), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if user is enrolled
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(enrollment => 
      enrollment.courseId.toString() === courseId
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Get course details
    const course = await courseService.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({
      status: 'success',
      data: { course }
    });
  } catch (error) {
    next(error);
  }
});

// Get chapter content (PDF + questions)
router.get('/protected/student/course/:courseId/chapter/:chapterIndex', authenticateToken, restrictTo('student'), async (req, res, next) => {
  try {
    const { courseId, chapterIndex } = req.params;
    const userId = req.user.id;
    
    // Check enrollment
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(enrollment => 
      enrollment.courseId.toString() === courseId
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    // Get course and chapter
    const course = await courseService.getCourse(courseId);
    const chapter = course.chapters[parseInt(chapterIndex)];
    
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    
    res.json({
      status: 'success',
      data: { 
        chapter,
        courseTitle: course.title,
        chapterIndex: parseInt(chapterIndex),
        totalChapters: course.chapters.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Watermarked PDF viewer endpoint - supports both old and new structure
router.get('/protected/pdf-viewer/:courseId/:subjectIndex/:chapterIndex', async (req, res, next) => {
  try {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { courseId, subjectIndex, chapterIndex } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(enrollment => 
      enrollment.courseId.toString() === courseId
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    const course = await courseService.getCourse(courseId);
    const chapter = course.subjects?.[parseInt(subjectIndex)]?.chapters?.[parseInt(chapterIndex)];
    
    if (!chapter || !chapter.pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    const response = await axios({
      method: 'GET',
      url: chapter.pdf,
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="protected.pdf"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    response.data.pipe(res);
  } catch (error) {
    console.error('PDF viewer error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(error);
  }
});

// Legacy PDF viewer endpoint for backward compatibility
router.get('/protected/pdf-viewer/:courseId/:chapterIndex', async (req, res, next) => {
  try {
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { courseId, chapterIndex } = req.params;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const isEnrolled = user.enrolledCourses.some(enrollment => 
      enrollment.courseId.toString() === courseId
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }
    
    const course = await courseService.getCourse(courseId);
    // Try new structure first, fallback to old structure
    let chapter = null;
    if (course.subjects && course.subjects.length > 0) {
      // New structure - find chapter by flattening all chapters
      let flatIndex = parseInt(chapterIndex);
      for (const subject of course.subjects) {
        if (flatIndex < subject.chapters.length) {
          chapter = subject.chapters[flatIndex];
          break;
        }
        flatIndex -= subject.chapters.length;
      }
    } else {
      // Old structure
      chapter = course.chapters?.[parseInt(chapterIndex)];
    }
    
    if (!chapter || !chapter.pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }
    
    const response = await axios({
      method: 'GET',
      url: chapter.pdf,
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="protected.pdf"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    response.data.pipe(res);
  } catch (error) {
    console.error('PDF viewer error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    next(error);
  }
});

module.exports = router;