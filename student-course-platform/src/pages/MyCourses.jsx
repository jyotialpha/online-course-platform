import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Play, Award, Search, Filter, BarChart3, Calendar, CheckCircle, Star } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, title, progress

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/protected/student/my-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses);
        setFilteredCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching my courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = courses;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort courses
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'recent':
        default:
          return new Date(b.enrollmentDetails?.enrolledAt || 0) - new Date(a.enrollmentDetails?.enrolledAt || 0);
      }
    });
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                My Learning Hub
              </h1>
              <p className="text-gray-300 text-sm lg:text-lg">Track progress across {courses.length} enrolled courses</p>
            </div>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full border border-green-500/30">
                <span className="text-green-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {courses.length} Active
                </span>
              </div>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search your courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none pr-10"
                >
                  <option value="recent" className="bg-gray-800">Recently Enrolled</option>
                  <option value="title" className="bg-gray-800">Course Title</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <span>Showing {filteredCourses.length} of {courses.length} courses</span>
              {searchTerm && (
                <span>Search results for "{searchTerm}"</span>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {course.enrollmentDetails?.status === 'purchased' ? 'OWNED' : 'ENROLLED'}
                  </div>
                </div>
                
                {/* Progress Badge */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {course.chapters?.length || 0} chapters
                </div>
                
                {/* Enrollment Date */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Calendar className="w-3 h-3" />
                      <span>Enrolled {new Date(course.enrollmentDetails?.enrolledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Play Overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </motion.div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                    {course.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>
                
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Course Progress</span>
                    <span className="text-sm font-medium text-cyan-400">0%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                
                {/* Course Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-white font-semibold text-sm">{course.chapters?.length || 0}</div>
                    <div className="text-gray-400 text-xs">Chapters</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-white font-semibold text-sm">
                      {course.chapters?.reduce((total, chapter) => 
                        total + (chapter.questions?.length || 0), 0) || 0}
                    </div>
                    <div className="text-gray-400 text-xs">Questions</div>
                  </div>
                </div>
                
                {/* Action Button */}
                <button 
                  onClick={() => navigate(`/student/course/${course._id}`)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-cyan-500/25"
                >
                  <Play className="w-4 h-4" />
                  Continue Learning
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
              {searchTerm ? (
                <>
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-2xl text-gray-400 mb-2">No courses found</p>
                  <p className="text-gray-500 mb-4">Try adjusting your search criteria</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-2xl text-gray-400 mb-4">No enrolled courses yet!</p>
                  <p className="text-gray-500 mb-6">Start your learning journey by enrolling in courses</p>
                  <a
                    href="/student/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    Browse Courses
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Course Statistics */}
        {courses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Learning Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{courses.length}</div>
                <div className="text-sm text-gray-400">Total Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {courses.reduce((total, course) => total + (course.chapters?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Chapters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {courses.reduce((total, course) => 
                    total + (course.chapters?.reduce((chTotal, chapter) => 
                      chTotal + (chapter.questions?.length || 0), 0) || 0), 0)}
                </div>
                <div className="text-sm text-gray-400">Total Questions</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;