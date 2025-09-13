const Course = require('../models/Course');

class CourseRepository {
  async create(courseData) {
    try {
      const course = new Course(courseData);
      return await course.save();
    } catch (error) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  }

  async update(courseId, updateData) {
    try {
      const course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
      if (!course) throw new Error('Course not found');
      return course;
    } catch (error) {
      throw new Error(`Error updating course: ${error.message}`);
    }
  }

  async delete(courseId) {
    try {
      const course = await Course.findByIdAndDelete(courseId);
      if (!course) throw new Error('Course not found');
      return course;
    } catch (error) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  }

  async getById(courseId) {
    try {
      const course = await Course.findById(courseId);
      if (!course) throw new Error('Course not found');
      return course;
    } catch (error) {
      throw new Error(`Error finding course: ${error.message}`);
    }
  }

  async getAll() {
    try {
      return await Course.find({});
    } catch (error) {
      throw new Error(`Error retrieving courses: ${error.message}`);
    }
  }

  async getCount(filter = {}) {
    try {
      return await Course.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting courses: ${error.message}`);
    }
  }

  async getWithPagination(filter = {}, sort = {}, skip = 0, limit = 10) {
    try {
      return await Course.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } catch (error) {
      throw new Error(`Error retrieving paginated courses: ${error.message}`);
    }
  }

  async getTotalChapters(filter = {}) {
    try {
      const result = await Course.aggregate([
        { $match: filter },
        { $unwind: '$subjects' },
        { $unwind: '$subjects.chapters' },
        { $count: 'totalChapters' }
      ]);
      return result[0]?.totalChapters || 0;
    } catch (error) {
      throw new Error(`Error counting total chapters: ${error.message}`);
    }
  }

  async getTotalQuestions(filter = {}) {
    try {
      const result = await Course.aggregate([
        { $match: filter },
        { $unwind: '$subjects' },
        { $unwind: '$subjects.chapters' },
        { $unwind: '$subjects.chapters.questions' },
        { $count: 'totalQuestions' }
      ]);
      return result[0]?.totalQuestions || 0;
    } catch (error) {
      throw new Error(`Error counting total questions: ${error.message}`);
    }
  }
}

module.exports = new CourseRepository();
