import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, HelpCircle, ArrowLeft, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/protected/student/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourse(data.data.course);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load course');
      }
    } catch (error) {
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = (index) => {
    setCurrentChapter(index);
  };

  const handleStartMockTest = (chapterIndex) => {
    navigate(`/student/course/${courseId}/chapter/${chapterIndex}/test`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate('/student/my-courses')}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl"
          >
            Back to My Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/student/my-courses')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{course?.title}</h1>
                <p className="text-gray-400 text-sm">Chapter {currentChapter + 1} of {course?.chapters?.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-cyan-500/30">
                <span className="text-cyan-400 text-sm font-medium">
                  Progress: 0%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Chapter List */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Course Content
              </h3>
              <div className="space-y-2">
                {course?.chapters?.map((chapter, index) => (
                  <button
                    key={index}
                    onClick={() => handleChapterSelect(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      currentChapter === index
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm">Chapter {index + 1}</p>
                        <p className="text-gray-400 text-xs truncate">{chapter.title}</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {course?.chapters?.[currentChapter] && (
              <motion.div
                key={currentChapter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Chapter Header */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Chapter {currentChapter + 1}: {course.chapters[currentChapter].title}
                  </h2>
                  <p className="text-gray-300">{course.chapters[currentChapter].description}</p>
                </div>

                {/* PDF Viewer */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Study Material</h3>
                  </div>
                  
                  {course.chapters[currentChapter].pdf ? (
                    <div className="bg-gray-800 rounded-xl p-4 min-h-[400px]">
                      <iframe
                        src={course.chapters[currentChapter].pdf}
                        className="w-full h-96 rounded-lg"
                        title={`Chapter ${currentChapter + 1} PDF`}
                      />
                      <p className="text-gray-400 text-sm mt-2">
                        📖 Read-only mode - Download not available
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-xl p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No study material available for this chapter</p>
                    </div>
                  )}
                </div>

                {/* Mock Test Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Chapter Mock Test</h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 mb-2">
                        Test your knowledge with {course.chapters[currentChapter].questions?.length || 0} questions
                      </p>
                      <p className="text-gray-400 text-sm">
                        Complete the reading material before attempting the test
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartMockTest(currentChapter)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Start Test
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                    disabled={currentChapter === 0}
                    className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous Chapter
                  </button>
                  <button
                    onClick={() => setCurrentChapter(Math.min(course.chapters.length - 1, currentChapter + 1))}
                    disabled={currentChapter === course.chapters.length - 1}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-purple-600 transition-all flex items-center gap-2"
                  >
                    Next Chapter
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseLearning;