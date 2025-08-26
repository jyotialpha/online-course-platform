const courseRepository = require('../repositories/courseRepository');

class CourseService {
  async createCourse(courseData) {
    this.validateCourseData(courseData);
    return await courseRepository.create(courseData);
  }

  async updateCourse(courseId, updateData) {
    this.validateCourseData(updateData, true);
    return await courseRepository.update(courseId, updateData);
  }

  async deleteCourse(courseId) {
    return await courseRepository.delete(courseId);
  }

  async getCourse(courseId) {
    return await courseRepository.getById(courseId);
  }

  async getAllCourses() {
    // console.log('CourseService: getAllCourses called');
    const courses = await courseRepository.getAll();
    // console.log('CourseService: courses from repository:', courses);
    return courses;
  }

  async getCourseCount(filter = {}) {
    // console.log('CourseService: getCourseCount called with filter:', filter);
    return await courseRepository.getCount(filter);
  }

  async getCoursesWithPagination(filter = {}, sort = {}, skip = 0, limit = 10) {
    // console.log('CourseService: getCoursesWithPagination called:', { filter, sort, skip, limit });
    return await courseRepository.getWithPagination(filter, sort, skip, limit);
  }

  async getTotalChapters(filter = {}) {
    // console.log('CourseService: getTotalChapters called with filter:', filter);
    return await courseRepository.getTotalChapters(filter);
  }

  async getTotalQuestions(filter = {}) {
    // console.log('CourseService: getTotalQuestions called with filter:', filter);
    return await courseRepository.getTotalQuestions(filter);
  }

  validateCourseData(courseData, isUpdate = false) {
    const { title, description, price, chapters } = courseData;

    if (!isUpdate || title !== undefined) {
      if (!title || typeof title !== 'string' || !title.trim()) {
        throw new Error('Course title is required');
      }
    }

    if (!isUpdate || description !== undefined) {
      if (!description || typeof description !== 'string' || !description.trim()) {
        throw new Error('Course description is required');
      }
    }

    if (!isUpdate || price !== undefined) {
      if (price === undefined || price === null || isNaN(Number(price)) || price < 0) {
        throw new Error('Course price must be a non-negative number');
      }
    }

    if (!isUpdate || chapters !== undefined) {
      if (!Array.isArray(chapters) || chapters.length === 0) {
        throw new Error('At least one chapter is required');
      }

      chapters.forEach((chapter, index) => {
        if (!chapter.title || !chapter.questions || !Array.isArray(chapter.questions)) {
          throw new Error(`Chapter ${index + 1} is missing required fields`);
        }

        chapter.questions.forEach((question, qIndex) => {
          if (!question.question || !Array.isArray(question.options) || 
              question.correctAnswer === undefined) {
            throw new Error(`Invalid question format in chapter ${index + 1}, question ${qIndex + 1}`);
          }
          
          // Validate that all options are non-empty strings
          if (question.options.some(option => typeof option !== 'string' || !option.trim())) {
            throw new Error(`All options must be non-empty in chapter ${index + 1}, question ${qIndex + 1}`);
          }
          
          // Validate correctAnswer is within bounds
          if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
            throw new Error(`Invalid correctAnswer index in chapter ${index + 1}, question ${qIndex + 1}`);
          }
        });
      });
    }
  }
}

module.exports = new CourseService();
