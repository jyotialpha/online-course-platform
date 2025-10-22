const User = require('../models/User');

class StudentController {
  async getAllStudents(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder || 'desc';
      
      const skip = (page - 1) * limit;
      
      // Build search filter
      let filter = { role: 'student' };
      if (search) {
        filter.$or = [
          { 'googleProfile.name': { $regex: search, $options: 'i' } },
          { 'googleProfile.email': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Get total count
      const totalStudents = await User.countDocuments(filter);
      
      // Get students with populated course data
      const students = await User.find(filter)
        .populate('enrolledCourses.courseId', 'title description price')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password');
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalStudents / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      res.json({
        status: 'success',
        results: students.length,
        pagination: {
          currentPage: page,
          totalPages,
          totalStudents,
          limit,
          hasNextPage,
          hasPrevPage
        },
        data: { students }
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentById(req, res, next) {
    try {
      const student = await User.findById(req.params.studentId)
        .populate('enrolledCourses.courseId', 'title description price')
        .select('-password');
      
      if (!student || student.role !== 'student') {
        return res.status(404).json({
          status: 'error',
          message: 'Student not found'
        });
      }

      res.json({
        status: 'success',
        data: { student }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();