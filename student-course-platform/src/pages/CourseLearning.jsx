import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileText, HelpCircle, ArrowLeft, ArrowRight, Lock, CheckCircle, Maximize2, Minimize2, Monitor, Smartphone, Menu, X, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import SecurePDFViewer from '../components/student/SecurePDFViewer';
import progressService from '../services/progressService';

function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    fetchCourse();
    fetchProgress();
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

  const fetchProgress = async () => {
    try {
      const progressData = await progressService.getCourseProgress(courseId);
      setProgress(progressData.data.progress);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const handleChapterSelect = (index) => {
    setCurrentChapter(index);
    // Mark chapter as accessed even without PDF
    if (course?.chapters?.[index]?._id) {
      progressService.updateChapterProgress(courseId, course.chapters[index]._id, 0)
        .catch(error => console.error('Failed to mark chapter access:', error));
    }
    setTimeout(() => fetchProgress(), 1000);
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
      {!isFullscreen && (
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/student/my-courses')}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg lg:text-xl font-bold text-white truncate">{course?.title}</h1>
                  <p className="text-gray-400 text-xs lg:text-sm">Chapter {currentChapter + 1} of {course?.chapters?.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Menu className="w-5 h-5 text-white" />
                </button>
                {/* Desktop Progress */}
                <div className="hidden lg:flex items-center gap-2">
                  <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-cyan-500/30">
                    <span className="text-cyan-400 text-sm font-medium">
                      Progress: {Math.min(100, progress?.overallProgress || 0)}%
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm('Reset all progress for this course? This will clear all completed chapters and test results.')) {
                        try {
                          await progressService.resetCourseProgress(courseId);
                          await fetchProgress();
                          alert('Progress reset successfully!');
                        } catch (error) {
                          alert('Failed to reset progress');
                        }
                      }
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-colors"
                    title="Reset Progress"
                  >
                    <RotateCcw className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && !isFullscreen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-white/10 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Course Menu</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Mobile Progress */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-3 rounded-xl border border-cyan-500/30 mb-6">
              <span className="text-cyan-400 text-sm font-medium">Progress: {Math.min(100, progress?.overallProgress || 0)}%</span>
            </div>
            
            {/* Mobile Chapter List */}
            <div className="space-y-2">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Chapters
              </h4>
              {course?.chapters?.map((chapter, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleChapterSelect(index);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    currentChapter === index
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">Chapter {index + 1}</p>
                      <p className="text-gray-400 text-xs truncate">{chapter.title}</p>
                    </div>
                    <CheckCircle className={`w-4 h-4 ${
                      progress?.completedChapters?.includes(chapter._id) ? 'text-green-400' : 'text-gray-500'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-2 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Desktop Sidebar - Chapter List */}
          {!isFullscreen && (
            <div className="hidden lg:block lg:col-span-1">
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
                        <CheckCircle className={`w-4 h-4 ${
                          progress?.completedChapters?.includes(chapter._id) ? 'text-green-400' : 'text-gray-500'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={isFullscreen ? 'col-span-full' : 'col-span-1 lg:col-span-3'}>
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
                <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 transition-all duration-300 ${
                  isFullscreen ? 'fixed inset-4 z-50 p-6' : 'p-6'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">Study Material</h3>
                    </div>
                    
                    {course.chapters[currentChapter].pdf && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* View Mode Toggle - Hidden on mobile */}
                        <div className="hidden lg:flex bg-gray-700 rounded-lg p-1">
                          <button
                            onClick={() => setViewMode('desktop')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              viewMode === 'desktop' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <Monitor className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setViewMode('mobile')}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                              viewMode === 'mobile' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                          >
                            <Smartphone className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Fullscreen Toggle */}
                        <button
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-white" />
                          ) : (
                            <Maximize2 className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {course.chapters[currentChapter].pdf ? (
                    <div>
                      <SecurePDFViewer
                        pdfUrl={`${API_BASE_URL}/api/protected/pdf-viewer/${courseId}/${currentChapter}?token=${localStorage.getItem('token')}`}
                        className={isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100vh-200px)] lg:min-h-[400px]'}
                        courseId={courseId}
                        chapterId={course.chapters[currentChapter]._id}
                      />
                      <div className="p-2 lg:p-4 bg-gray-900/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span className="hidden sm:inline">Protected content - </span>View only
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Chapter {currentChapter + 1}/{course?.chapters?.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800 rounded-xl p-6 lg:p-8 text-center min-h-[300px] lg:min-h-[400px] flex items-center justify-center">
                      <div>
                        <FileText className="w-12 h-12 lg:w-16 lg:h-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400 text-sm lg:text-base">No study material available for this chapter</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mock Test Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Chapter Mock Test</h3>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-300 mb-2 text-sm lg:text-base">
                        Test your knowledge with {course.chapters[currentChapter].questions?.length || 0} questions
                      </p>
                      <p className="text-gray-400 text-xs lg:text-sm">
                        Complete the reading material before attempting the test
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartMockTest(currentChapter)}
                      className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Start Test
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                {!isFullscreen && (
                  <div className="flex flex-col lg:flex-row gap-3 lg:justify-between">
                    <button
                      onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                      disabled={currentChapter === 0}
                      className="w-full lg:w-auto px-6 py-3 bg-white/10 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous Chapter
                    </button>
                    <button
                      onClick={() => setCurrentChapter(Math.min(course.chapters.length - 1, currentChapter + 1))}
                      disabled={currentChapter === course.chapters.length - 1}
                      className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                    >
                      Next Chapter
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseLearning;