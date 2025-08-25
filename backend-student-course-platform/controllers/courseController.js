const courseService = require('../services/courseService');

class CourseController {
  async createCourse(req, res, next) {
    try {
      const course = await courseService.createCourse(req.body);
      res.status(201).json({
        status: 'success',
        data: { course }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req, res, next) {
    try {
      const course = await courseService.updateCourse(req.params.courseId, req.body);
      res.json({
        status: 'success',
        data: { course }
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req, res, next) {
    try {
      await courseService.deleteCourse(req.params.courseId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getCourse(req, res, next) {
    try {
      const course = await courseService.getCourse(req.params.courseId);
      res.json({
        status: 'success',
        data: { course }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req, res, next) {
    try {
      console.log('Getting all courses...');
      
      // Extract pagination and search parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder || 'desc';
      
      console.log('Pagination params:', { page, limit, search, sortBy, sortOrder });
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Build search filter
      let filter = {};
      if (search) {
        filter = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        };
      }
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Get total count for pagination
      const totalCourses = await courseService.getCourseCount(filter);
      
      // Get paginated courses
      const courses = await courseService.getCoursesWithPagination(filter, sort, skip, limit);
      
      // Get additional stats for dashboard
      const totalChapters = await courseService.getTotalChapters(filter);
      const totalQuestions = await courseService.getTotalQuestions(filter);
      
      console.log('Courses found:', courses.length);
      console.log('Total courses:', totalCourses);
      console.log('Total chapters:', totalChapters);
      console.log('Total questions:', totalQuestions);
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalCourses / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      res.json({
        status: 'success',
        results: courses.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalCourses,
          limit,
          hasNextPage,
          hasPrevPage,
          totalChapters,
          totalQuestions
        },
        data: { courses }
      });
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      next(error);
    }
  }
}

module.exports = new CourseController();
