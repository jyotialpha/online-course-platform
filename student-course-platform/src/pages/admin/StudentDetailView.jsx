import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  BookOpen,
  Trophy,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const StudentDetailView = () => {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (!user.isAuthenticated || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStudent(data.data.student);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to fetch student details: ${errorData.message || 'Unknown error'}`);
        navigate('/admin/students');
      }
    } catch (error) {
      alert(`Error fetching student details: ${error.message}`);
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotalTestsAttempted = () => {
    return student?.testResults?.length || 0;
  };

  const calculateAverageScore = () => {
    if (!student?.testResults?.length) return 0;
    const totalScore = student.testResults.reduce((sum, test) => sum + test.score, 0);
    return Math.round(totalScore / student.testResults.length);
  };

  const calculateTotalTimeSpent = () => {
    if (!student?.testResults?.length) return 0;
    const totalSeconds = student.testResults.reduce((sum, test) => sum + test.timeSpent, 0);
    return Math.round(totalSeconds / 60); // Convert to minutes
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Student not found</h2>
          <button
            onClick={() => navigate('/admin/students')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/students')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Student Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Profile */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="text-center">
                <div className="mx-auto h-24 w-24 mb-4">
                  {student.googleProfile?.photoUrl ? (
                    <img 
                      className="h-24 w-24 rounded-full object-cover mx-auto" 
                      src={student.googleProfile.photoUrl} 
                      alt={student.googleProfile?.name || 'Student'}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <User className="h-12 w-12 text-blue-600" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {student.googleProfile?.name || 'Unknown Student'}
                </h2>
                <div className="flex items-center justify-center text-gray-500 mt-2">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-sm">{student.googleProfile?.email || student.email}</span>
                </div>
                <div className="flex items-center justify-center text-gray-500 mt-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">Joined {formatDate(student.createdAt)}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{student.enrolledCourses?.length || 0}</div>
                  <div className="text-xs text-blue-600">Enrolled Courses</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{calculateTotalTestsAttempted()}</div>
                  <div className="text-xs text-green-600">Tests Attempted</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <div className="p-3 rounded-full bg-purple-100 mr-4">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{calculateAverageScore()}%</div>
                    <div className="text-sm text-purple-600">Average Score</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                  <div className="p-3 rounded-full bg-orange-100 mr-4">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{calculateTotalTimeSpent()}</div>
                    <div className="text-sm text-orange-600">Minutes Studied</div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-teal-50 rounded-lg">
                  <div className="p-3 rounded-full bg-teal-100 mr-4">
                    <Target className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">{calculateTotalTestsAttempted()}</div>
                    <div className="text-sm text-teal-600">Tests Completed</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Enrolled Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Enrolled Courses</h3>
              {student.enrolledCourses?.length > 0 ? (
                <div className="space-y-4">
                  {student.enrolledCourses.map((enrollment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {enrollment.courseId?.title || 'Course Title Not Available'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Enrolled on {formatDate(enrollment.enrolledAt)}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              enrollment.status === 'purchased' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {enrollment.status}
                            </span>
                            {enrollment.progress?.overallProgress > 0 && (
                              <span className="ml-2 text-xs text-gray-500">
                                {enrollment.progress.overallProgress}% complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{enrollment.amount || enrollment.courseId?.price || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses enrolled</h3>
                  <p className="mt-1 text-sm text-gray-500">This student hasn't enrolled in any courses yet.</p>
                </div>
              )}
            </motion.div>

            {/* Recent Test Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Test Results</h3>
              {student.testResults?.length > 0 ? (
                <div className="space-y-4">
                  {student.testResults.slice(-5).reverse().map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-4">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Test Result</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(test.completedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{test.score}%</div>
                        <div className="text-sm text-gray-500">
                          {test.correctAnswers}/{test.totalQuestions} correct
                        </div>
                        <div className="text-xs text-gray-400">
                          {Math.round(test.timeSpent / 60)} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No test results</h3>
                  <p className="mt-1 text-sm text-gray-500">This student hasn't attempted any tests yet.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailView;