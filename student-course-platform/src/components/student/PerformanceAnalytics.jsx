import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Award, BookOpen, Target, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import progressService from '../../services/progressService';

function PerformanceAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, week, month

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (range = timeRange) => {
    try {
      const data = await progressService.getAnalytics(range);
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const { overview, coursePerformance } = analytics || {};

  return (
    <div className="min-h-screen bg-gray-900 pt-20 lg:pt-6 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Performance Analytics
              </h1>
              <p className="text-gray-400 mt-2">Track your learning progress and performance</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => {
                  setTimeRange('week');
                  fetchAnalytics('week');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'week' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => {
                  setTimeRange('month');
                  fetchAnalytics('month');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'month' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => {
                  setTimeRange('all');
                  fetchAnalytics('all');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'all' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>+{overview?.recentTests || 0}</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">Total Courses</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {overview?.totalCourses || 0}
            </p>
            <p className="text-gray-400 text-sm mt-1">Active learning paths</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>{overview?.averageScore || 0}%</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">Tests Completed</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              {overview?.totalTestsTaken || 0}
            </p>
            <p className="text-gray-400 text-sm mt-1">Assessments finished</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                (overview?.averageScore || 0) >= 75 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {(overview?.averageScore || 0) >= 75 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{overview?.averageScore || 0}%</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">Average Score</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {overview?.averageScore || 0}%
            </p>
            <p className="text-gray-400 text-sm mt-1">Overall performance</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>+{Math.round((overview?.totalTimeSpent || 0) / 60)}h</span>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">Study Time</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {Math.round((overview?.totalTimeSpent || 0) / 60)}h
            </p>
            <p className="text-gray-400 text-sm mt-1">Total learning time</p>
          </motion.div>
        </div>

        {/* Course Performance */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Course Performance
            </h2>
          </div>

          {coursePerformance && coursePerformance.length > 0 ? (
            <div className="space-y-4">
              {coursePerformance.map((course, index) => (
                <motion.div
                  key={course.courseId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/5 rounded-2xl p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{course.courseName}</h3>
                      <p className="text-gray-400 text-sm">
                        {course.testsCompleted} tests completed • {Math.round(course.timeSpent / 60)} hours studied
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">{course.averageScore}%</div>
                      <div className="text-gray-400 text-sm">Avg Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Progress */}
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">Progress</span>
                        <span className="text-white font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tests */}
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-green-400">{course.testsCompleted}</div>
                      <div className="text-gray-400 text-sm">Tests</div>
                    </div>

                    {/* Time */}
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-orange-400">{Math.round(course.timeSpent / 60)}h</div>
                      <div className="text-gray-400 text-sm">Study Time</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No performance data available yet</p>
              <p className="text-gray-500 text-sm">Complete some tests to see your analytics</p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Recent Activity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">{overview?.recentTests || 0}</div>
              <div className="text-gray-400 text-sm">Tests This Week</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{overview?.completedCourses || 0}</div>
              <div className="text-gray-400 text-sm">Courses Completed</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {overview?.averageScore >= 80 ? 'Excellent' : overview?.averageScore >= 60 ? 'Good' : 'Improving'}
              </div>
              <div className="text-gray-400 text-sm">Performance Level</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PerformanceAnalytics;