import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, TrendingUp, Clock, ArrowRight, Sparkles, Play, Calendar, CheckCircle, Star, BarChart3 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import progressService from '../services/progressService';

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalCourses: 0, enrolledCourses: 0 });
  const [recentCourses, setRecentCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all courses
      const allCoursesResponse = await fetch(`${API_BASE_URL}/api/public/courses?limit=50`);
      
      // Fetch enrolled courses
      const myCoursesResponse = await fetch(`${API_BASE_URL}/api/protected/student/my-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (allCoursesResponse.ok && myCoursesResponse.ok) {
        const allCoursesData = await allCoursesResponse.json();
        const myCoursesData = await myCoursesResponse.json();
        
        setStats({
          totalCourses: allCoursesData.data.courses.length,
          enrolledCourses: myCoursesData.data.courses.length
        });
        
        const courses = myCoursesData.data.courses.slice(0, 3);
        setRecentCourses(courses);
        
        // Fetch progress for each course
        const progressPromises = courses.map(async (course) => {
          try {
            const progressData = await progressService.getCourseProgress(course._id);
            return { courseId: course._id, progress: progressData.data.progress };
          } catch (error) {
            console.error(`Error fetching progress for course ${course._id}:`, error);
            return { courseId: course._id, progress: null };
          }
        });
        
        const progressResults = await Promise.all(progressPromises);
        const progressMap = {};
        progressResults.forEach(({ courseId, progress }) => {
          progressMap[courseId] = progress;
        });
        setCourseProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await progressService.getAnalytics();
      setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 lg:pt-6 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-300 text-sm lg:text-lg">Continue your learning journey</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {stats.totalCourses}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-1">Available Courses</h3>
            <p className="text-gray-400 text-sm">Total courses to explore</p>
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
              <span className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {stats.enrolledCourses}
              </span>
            </div>
            <h3 className="text-white font-semibold mb-1">Enrolled Courses</h3>
            <p className="text-gray-400 text-sm">Your active learning</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {analytics?.overview?.averageScore || 0}%
              </span>
            </div>
            <h3 className="text-white font-semibold mb-1">Avg Score</h3>
            <p className="text-gray-400 text-sm">Test performance</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8"
        >
          <Link
            to="/student/courses"
            className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
              Browse Courses
            </h3>
            <p className="text-gray-400">Discover new courses and enroll to start learning</p>
          </Link>

          <Link
            to="/student/my-courses"
            className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-emerald-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
              My Courses
            </h3>
            <p className="text-gray-400">Continue learning with your enrolled courses</p>
          </Link>
        </motion.div>

        {/* Continue Learning Section */}
        {recentCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Continue Learning
                </h2>
              </div>
              <Link
                to="/student/my-courses"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-40 overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <BookOpen className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        ENROLLED
                      </div>
                    </div>
                    
                    {/* Progress Badge */}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      {courseProgress[course._id]?.overallProgress || 0}% Complete
                    </div>
                    
                    {/* Play Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </motion.div>
                    
                    {/* Course Stats */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                            <BookOpen className="w-3 h-3" />
                            <span>{course.chapters?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Award className="w-3 h-3" />
                            <span>{course.chapters?.reduce((total, chapter) => 
                              total + (chapter.questions?.length || 0), 0) || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-medium text-cyan-400">{courseProgress[course._id]?.overallProgress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full" style={{width: `${courseProgress[course._id]?.overallProgress || 0}%`}}></div>
                      </div>
                    </div>
                    
                    {/* Enrollment Date */}
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                      <Calendar className="w-3 h-3" />
                      <span>Enrolled {new Date(course.enrollmentDetails?.enrolledAt).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      onClick={() => navigate(`/student/course/${course._id}`)}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm group-hover:shadow-lg group-hover:shadow-cyan-500/25"
                    >
                      <Play className="w-4 h-4" />
                      Continue Learning
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Learning Progress Summary */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Learning Progress</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{analytics?.overview?.totalCourses || stats.enrolledCourses}</div>
                  <div className="text-sm text-gray-400">Active Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{analytics?.overview?.completedCourses || 0}</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{analytics?.overview?.totalTestsTaken || 0}</div>
                  <div className="text-sm text-gray-400">Tests Taken</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{Math.round(analytics?.overview?.totalTimeSpent / 60) || 0}h</div>
                  <div className="text-sm text-gray-400">Time Spent</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;