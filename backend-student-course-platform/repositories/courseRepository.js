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

  async update(id, updateData) {
    try {
      const course = await Course.findByIdAndUpdate(id, updateData, { new: true });
      if (!course) throw new Error('Course not found');
      return course;
    } catch (error) {
      throw new Error(`Error updating course: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const course = await Course.findByIdAndDelete(id);
      if (!course) throw new Error('Course not found');
      return course;
    } catch (error) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  }

  async getById(id) {
    try {
      const course = await Course.findById(id);
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
}

module.exports = new CourseRepository();
