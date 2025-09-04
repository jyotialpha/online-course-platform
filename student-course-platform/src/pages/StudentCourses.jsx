import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, Users } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/courses?limit=50`);
      if (response.ok) {
        const data = await response.json();
        // console.log('Fetched courses:', data.data.courses);
        setCourses(data.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

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
        setMessage('Successfully enrolled in course!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        if (data.requiresPayment) {
          setMessage(`This course costs ₹${data.price}. Payment integration coming soon!`);
        } else {
          setMessage(data.message || 'Enrollment failed');
        }
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      setMessage('Enrollment failed');
      setTimeout(() => setMessage(''), 3000);
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Available Courses
          </h1>
          <p className="text-gray-300 text-lg">Discover and enroll in courses to start your learning journey</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('failed') 
                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-green-500/20 border border-green-500/30 text-green-400'
            }`}
          >
            {message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20"
            >
              <div className="relative h-48 overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                  {course.chapters?.length || 0} chapters
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-300 mb-4 text-sm">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course.chapters?.length || 0} chapters
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.chapters?.reduce((total, chapter) => 
                      total + (chapter.questions?.length || 0), 0) || 0} questions
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {(course.isFree === true || course.price === 0) ? 'Free' : `₹${course.price}`}
                  </span>
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrolling === course._id}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {enrolling === course._id ? 'Enrolling...' : (course.isFree === true || course.price === 0) ? 'Enroll Free' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {courses.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-2xl text-gray-400">No courses available yet!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default StudentCourses;