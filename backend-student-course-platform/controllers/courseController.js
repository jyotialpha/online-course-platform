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
      const course = await courseService.updateCourse(req.params.id, req.body);
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
      await courseService.deleteCourse(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  async getCourse(req, res, next) {
    try {
      const course = await courseService.getCourse(req.params.id);
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
      const courses = await courseService.getAllCourses();
      res.json({
        status: 'success',
        results: courses.length,
        data: { courses }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();
