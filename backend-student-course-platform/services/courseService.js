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

  async deleteCourseWithFiles(courseId) {
    try {
      // Get course data first to delete associated files
      const course = await courseRepository.getById(courseId);
      
      // Delete course from database
      await courseRepository.delete(courseId);
      
      // Delete associated files from S3
      await this.deleteAssociatedFiles(course);
      
      return course;
    } catch (error) {
      throw new Error(`Error deleting course with files: ${error.message}`);
    }
  }

  async deleteAssociatedFiles(course) {
    try {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      const { s3Client } = require('../config/s3');
      
      const filesToDelete = [];
      
      // Add thumbnail to deletion list
      if (course.thumbnail) {
        const url = new URL(course.thumbnail);
        filesToDelete.push(url.pathname.substring(1));
      }
      
      // Add chapter PDFs to deletion list
      if (course.chapters) {
        course.chapters.forEach(chapter => {
          if (chapter.pdf) {
            const url = new URL(chapter.pdf);
            filesToDelete.push(url.pathname.substring(1));
          }
        });
      }
      
      // Delete all files from S3
      for (const key of filesToDelete) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'jyoti-onlie-course',
            Key: key
          });
          await s3Client.send(command);
          console.log(`Deleted file from S3: ${key}`);
        } catch (error) {
          console.error(`Failed to delete file ${key}:`, error);
        }
      }
    } catch (error) {
      console.error('Error deleting associated files:', error);
    }
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

    // Set isFree based on price if not explicitly provided
    if (courseData.isFree === undefined) {
      courseData.isFree = !courseData.price || courseData.price === 0;
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
