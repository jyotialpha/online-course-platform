const express = require('express');
const courseService = require('../services/courseService');

const router = express.Router();

// Get public courses for homepage
router.get('/courses', async (req, res, next) => {
  try {
    // console.log('Public courses endpoint hit');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    
    const courses = await courseService.getCoursesWithPagination({}, { createdAt: -1 }, skip, limit);
    // console.log('Public courses found:', courses.length);
    
    // Ensure all courses have isFree field
    const coursesWithIsFree = courses.map(course => {
      const courseObj = course.toObject ? course.toObject() : course;
      if (courseObj.isFree === undefined) {
        courseObj.isFree = courseObj.price === 0;
      }
      // console.log(`Course ${courseObj.title}: price=${courseObj.price}, isFree=${courseObj.isFree}`);
      return courseObj;
    });
    
    res.json({
      status: 'success',
      results: coursesWithIsFree.length,
      data: { courses: coursesWithIsFree }
    });
  } catch (error) {
    console.error('Error in public courses:', error);
    next(error);
  }
});

module.exports = router;