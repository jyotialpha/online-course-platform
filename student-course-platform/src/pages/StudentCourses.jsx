import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, Users, Search, Filter, Star, Award, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import Swal from 'sweetalert2';

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, free, paid

  const getChapterCount = (subjects) => {
    return subjects?.reduce((total, subject) =>
      total + (subject.chapters?.length || 0), 0) || 0;
  };

  const getQuestionCount = (subjects) => {
    return subjects?.reduce((total, subject) =>
      total + (subject.chapters?.reduce((chapterTotal, chapter) =>
        chapterTotal + (chapter.questions?.length || 0), 0) || 0), 0) || 0;
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/courses?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data.courses);
        setFilteredCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
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
    
    // Filter by type
    if (filterType === 'free') {
      filtered = filtered.filter(course => course.isFree === true || course.price === 0);
    } else if (filterType === 'paid') {
      filtered = filtered.filter(course => course.isFree !== true && course.price > 0);
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterType]);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/protected/student/enroll/${courseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Successfully enrolled in course!',
          icon: 'success',
          confirmButtonText: 'Great!',
          confirmButtonColor: '#10b981'
        });
      } else {
        if (data.requiresPayment) {
          Swal.fire({
            title: 'Payment Required',
            text: `This course costs ₹${data.price}. Payment integration coming soon!`,
            icon: 'info',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3b82f6'
          });
        } else {
          Swal.fire({
            title: 'Enrollment Failed',
            text: data.message || 'Unable to enroll in course',
            icon: 'error',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Enrollment failed. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setEnrolling(null);
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
                Course Catalog
              </h1>
              <p className="text-gray-300 text-sm lg:text-lg">Discover {courses.length} courses to advance your skills</p>
            </div>
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full border border-green-500/30">
                <span className="text-green-400 text-sm font-medium">
                  {courses.filter(c => c.isFree === true || c.price === 0).length} Free Courses
                </span>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
                <span className="text-yellow-400 text-sm font-medium">
                  {courses.filter(c => c.isFree !== true && c.price > 0).length} Premium
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  All Courses
                </button>
                <button
                  onClick={() => setFilterType('free')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    filterType === 'free'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Free Only
                </button>
                <button
                  onClick={() => setFilterType('paid')}
                  className={`px-4 py-3 rounded-xl font-medium transition-all ${
                    filterType === 'paid'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Premium
                </button>
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
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Course Type Badge */}
                <div className="absolute top-4 left-4">
                  {(course.isFree === true || course.price === 0) ? (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      FREE
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      PREMIUM
                    </div>
                  )}
                </div>
                
                {/* Chapter Count */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {getChapterCount(course.subjects)} chapters
                </div>
                
                {/* Course Stats Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{getChapterCount(course.subjects)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Award className="w-3 h-3" />
                         <span>{getQuestionCount(course.subjects)}</span>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>
                
                {/* Course Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-white font-semibold text-sm">{getChapterCount(course.subjects)}</div>
                    <div className="text-gray-400 text-xs">Chapters</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-white font-semibold text-sm">
                      {getQuestionCount(course.subjects)}
                    </div>
                    <div className="text-gray-400 text-xs">Questions</div>
                  </div>
                </div>
                
                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      {(course.isFree === true || course.price === 0) ? 'Free' : `₹${course.price}`}
                    </div>
                    {course.isFree !== true && course.price > 0 && (
                      <div className="text-xs text-gray-400">One-time payment</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrolling === course._id}
                    className={`px-6 py-3 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 ${
                      (course.isFree === true || course.price === 0)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                    }`}
                  >
                    {enrolling === course._id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Enrolling...
                      </div>
                    ) : (
                      (course.isFree === true || course.price === 0) ? 'Enroll Free' : 'Buy Now'
                    )}
                  </button>
                </div>
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
              {searchTerm || filterType !== 'all' ? (
                <>
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-2xl text-gray-400 mb-2">No courses found</p>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                <>
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-2xl text-gray-400">No courses available yet!</p>
                </>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Loading State for More Courses */}
        {loading && courses.length > 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCourses;