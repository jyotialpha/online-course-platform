const express = require('express');
const courseService = require('../services/courseService');

const router = express.Router();

// Get public courses for homepage
router.get('/courses', async (req, res, next) => {
  try {
    console.log('Public courses endpoint hit');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;
    
    const courses = await courseService.getCoursesWithPagination({}, { createdAt: -1 }, skip, limit);
    console.log('Public courses found:', courses.length);
    
    res.json({
      status: 'success',
      results: courses.length,
      data: { courses }
    });
  } catch (error) {
    console.error('Error in public courses:', error);
    next(error);
  }
});

module.exports = router;