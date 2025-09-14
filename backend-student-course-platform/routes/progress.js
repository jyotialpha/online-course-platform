const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Progress routes working' });
});

// Update chapter progress
router.post('/progress/chapter', authenticateToken, async (req, res) => {
  try {
    const { courseId, chapterId, timeSpent } = req.body;
    const userId = req.user.id;

    console.log('Progress update request:', { userId, courseId, chapterId, timeSpent });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const enrolledCourse = user.enrolledCourses.find(
      course => course.courseId.toString() === courseId
    );

    if (!enrolledCourse) {
      return res.status(404).json({ success: false, message: 'Course not enrolled' });
    }

    // Initialize progress if not exists
    if (!enrolledCourse.progress) {
      enrolledCourse.progress = {
        completedChapters: [],
        lastAccessedChapter: '',
        lastAccessedAt: new Date(),
        overallProgress: 0,
        timeSpent: 0
      };
    }

    // Update chapter completion
    if (!enrolledCourse.progress.completedChapters.includes(chapterId)) {
      enrolledCourse.progress.completedChapters.push(chapterId);
    }

    enrolledCourse.progress.lastAccessedChapter = chapterId;
    enrolledCourse.progress.lastAccessedAt = new Date();
    enrolledCourse.progress.timeSpent += timeSpent || 0;

    // Calculate overall progress
    const course = await Course.findById(courseId);
    if (course) {
      let totalChapters = 0;
      if (course.subjects && course.subjects.length > 0) {
        // New structure: count chapters across all subjects
        totalChapters = course.subjects.reduce((total, subject) => {
          return total + (subject.chapters ? subject.chapters.length : 0);
        }, 0);
      } else if (course.chapters) {
        // Legacy structure
        totalChapters = course.chapters.length;
      }
      
      const completedChapters = enrolledCourse.progress.completedChapters.length;
      enrolledCourse.progress.overallProgress = totalChapters > 0 
        ? Math.min(100, Math.round((completedChapters / totalChapters) * 100))
        : 0;
    }

    await user.save();

    console.log('Progress updated successfully:', {
      courseId,
      chapterId,
      completedChapters: enrolledCourse.progress.completedChapters,
      overallProgress: enrolledCourse.progress.overallProgress
    });

    res.json({
      success: true,
      data: {
        progress: enrolledCourse.progress
      }
    });
  } catch (error) {
    console.error('Error updating chapter progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save test results
router.post('/progress/test-result', authenticateToken, async (req, res) => {
  try {
    const { courseId, chapterId, score, totalQuestions, correctAnswers, timeSpent, answers } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const testResult = {
      courseId,
      chapterId,
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      answers,
      completedAt: new Date()
    };

    user.testResults.push(testResult);
    await user.save();

    res.json({
      success: true,
      data: { testResult }
    });
  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user progress for a course
router.get('/progress/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const enrolledCourse = user.enrolledCourses.find(
      course => course.courseId && course.courseId._id && course.courseId._id.toString() === courseId
    );

    if (!enrolledCourse) {
      return res.status(404).json({ success: false, message: 'Course not enrolled' });
    }

    // Get test results for this course
    const testResults = user.testResults.filter(
      result => result.courseId.toString() === courseId
    );

    res.json({
      success: true,
      data: {
        progress: enrolledCourse.progress || {
          completedChapters: [],
          lastAccessedChapter: '',
          lastAccessedAt: null,
          overallProgress: 0,
          timeSpent: 0
        },
        testResults
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset course progress
router.post('/reset/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    console.log('Reset progress request:', { userId, courseId });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const enrolledCourse = user.enrolledCourses.find(
      course => course.courseId.toString() === courseId
    );

    if (!enrolledCourse) {
      return res.status(404).json({ success: false, message: 'Course not enrolled' });
    }

    // Reset progress
    enrolledCourse.progress = {
      completedChapters: [],
      lastAccessedChapter: '',
      lastAccessedAt: new Date(),
      overallProgress: 0,
      timeSpent: 0
    };

    // Remove test results for this course
    user.testResults = user.testResults.filter(
      result => result.courseId.toString() !== courseId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Course progress reset successfully',
      data: {
        progress: enrolledCourse.progress
      }
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get analytics dashboard data
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = 'all' } = req.query;
    const user = await User.findById(userId).populate('enrolledCourses.courseId');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate date range
    let dateFilter = new Date(0); // Default: all time
    const now = new Date();
    
    if (timeRange === 'week') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'month') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Filter test results by time range
    const filteredTests = user.testResults.filter(
      test => test.completedAt >= dateFilter
    );

    // Calculate analytics
    const totalCourses = user.enrolledCourses.length;
    const completedCourses = user.enrolledCourses.filter(
      course => course.courseId && course.progress && course.progress.overallProgress === 100
    ).length;

    const totalTestsTaken = filteredTests.length;
    const averageScore = totalTestsTaken > 0 
      ? Math.round(filteredTests.reduce((sum, test) => sum + test.score, 0) / totalTestsTaken)
      : 0;

    const totalTimeSpent = user.enrolledCourses
      .filter(course => course.courseId)
      .reduce((total, course) => total + (course.progress?.timeSpent || 0), 0);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTests = user.testResults.filter(
      test => test.completedAt >= sevenDaysAgo
    ).length;

    // Performance by course (filtered by time range)
    const coursePerformance = user.enrolledCourses
      .filter(enrollment => enrollment.courseId && enrollment.courseId._id) // Filter out null courses
      .map(enrollment => {
        const courseTests = filteredTests.filter(
          test => test.courseId.toString() === enrollment.courseId._id.toString()
        );
        
        const avgScore = courseTests.length > 0
          ? Math.round(courseTests.reduce((sum, test) => sum + test.score, 0) / courseTests.length)
          : 0;

        return {
          courseId: enrollment.courseId._id,
          courseName: enrollment.courseId.title,
          progress: Math.min(100, enrollment.progress?.overallProgress || 0),
          testsCompleted: courseTests.length,
          averageScore: avgScore,
          timeSpent: enrollment.progress?.timeSpent || 0
        };
      });

    res.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          completedCourses,
          totalTestsTaken,
          averageScore,
          totalTimeSpent,
          recentTests
        },
        coursePerformance
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;