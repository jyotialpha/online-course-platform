import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import progressService from '../services/progressService';
import Swal from 'sweetalert2';

function MockTest() {
  const { courseId, subjectIndex, chapterIndex } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);

  useEffect(() => {
    fetchChapter();
  }, [courseId, subjectIndex, chapterIndex]);

  useEffect(() => {
    let timer;
    if (testStarted && timeLeft > 0 && !showResults) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testStarted, timeLeft, showResults]);

  const fetchChapter = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (subjectIndex !== undefined) {
        // New structure: subjects/chapters
        const response = await fetch(`${API_BASE_URL}/api/protected/student/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const course = data.data.course;
          const chapter = course.subjects?.[parseInt(subjectIndex)]?.chapters?.[parseInt(chapterIndex)];
          
          if (chapter) {
            setChapter({
              ...chapter,
              courseTitle: course.title,
              subjectTitle: course.subjects[parseInt(subjectIndex)].title
            });
            setTimeLeft(chapter.questions.length * 120);
          }
        }
      } else {
        // Legacy structure: direct chapters (backward compatibility)
        const response = await fetch(`${API_BASE_URL}/api/protected/student/course/${courseId}/chapter/${chapterIndex}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setChapter(data.data.chapter);
          setTimeLeft(data.data.chapter.questions.length * 120);
        }
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setTestStartTime(Date.now());
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmitTest = async () => {
    const results = calculateResults();
    const timeSpentSeconds = testStartTime ? Math.round((Date.now() - testStartTime) / 1000) : 0;
    
    // Prepare test result data
    const testResultData = {
      courseId,
      chapterId: chapter._id,
      score: results.percentage,
      totalQuestions: results.total,
      correctAnswers: results.score,
      timeSpent: timeSpentSeconds,
      answers: chapter.questions.map((question, index) => ({
        questionId: question._id || index.toString(),
        selectedAnswer: answers[index] !== undefined ? question.options[answers[index]] : '',
        isCorrect: answers[index] === question.correctAnswer,
        timeSpent: Math.round(timeSpentSeconds / results.total) // Average time per question
      }))
    };

    try {
      await progressService.saveTestResult(testResultData);
      
      // Mark chapter as completed after test
      console.log('Updating chapter progress:', { courseId, chapterId: chapter._id, timeSpent: timeSpentSeconds / 60 });
      await progressService.updateChapterProgress(courseId, chapter._id, timeSpentSeconds / 60);
      
      // Show success message
      const passed = results.percentage >= 60;
      Swal.fire({
        title: passed ? 'Test Completed!' : 'Test Completed',
        text: `You scored ${results.score}/${results.total} (${results.percentage}%)`,
        icon: passed ? 'success' : 'info',
        confirmButtonText: 'View Results',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: passed ? '#10b981' : '#6366f1'
      });
    } catch (error) {
      console.error('Failed to save test result:', error);
      Swal.fire({
        title: 'Warning',
        text: 'Test completed but results could not be saved. Please check your connection.',
        icon: 'warning',
        background: '#1f2937',
        color: '#ffffff',
        confirmButtonColor: '#f59e0b'
      });
    }
    
    setShowResults(true);
    setTestStarted(false);
  };

  const calculateResults = () => {
    if (!chapter?.questions) return { score: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    chapter.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return {
      score: correct,
      total: chapter.questions.length,
      percentage: Math.round((correct / chapter.questions.length) * 100)
    };
  };

  const resetTest = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setTestStarted(false);
    setTimeLeft(chapter.questions.length * 120);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!testStarted && !showResults) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {chapter?.subjectTitle ? `${chapter.subjectTitle} - ${chapter.title}` : `Chapter ${parseInt(chapterIndex) + 1} - ${chapter?.title}`}
            </h2>
            <p className="text-gray-300 mb-6">Mock Test</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Questions:</span>
                <span className="text-white">{chapter?.questions?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time Limit:</span>
                <span className="text-white">{formatTime(timeLeft)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Passing Score:</span>
                <span className="text-white">60%</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={startTest}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Start Test
              </button>
              <button
                onClick={() => navigate(`/student/course/${courseId}`)}
                className="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Back to Course
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    const passed = results.percentage >= 60;
    
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                passed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                {passed ? <CheckCircle className="w-10 h-10 text-white" /> : <XCircle className="w-10 h-10 text-white" />}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h2>
              <p className="text-gray-300">
                You scored {results.score} out of {results.total} ({results.percentage}%)
              </p>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{results.score}</div>
                <div className="text-gray-400 text-sm">Correct Answers</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{results.total - results.score}</div>
                <div className="text-gray-400 text-sm">Incorrect Answers</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className={`text-2xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                  {results.percentage}%
                </div>
                <div className="text-gray-400 text-sm">Score</div>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold text-white">Review Answers</h3>
              {chapter?.questions?.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={index} className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {isCorrect ? <CheckCircle className="w-4 h-4 text-white" /> : <XCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">Q{index + 1}. {question.question}</p>
                        
                        {/* Question Image in Results */}
                        {question.questionImage && (
                          <div className="my-3">
                            <img
                              src={question.questionImage}
                              alt="Question illustration"
                              className="max-w-full h-auto rounded-lg"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-green-400">✓ Correct: {question.options[question.correctAnswer]}</p>
                          {userAnswer !== undefined && userAnswer !== question.correctAnswer && (
                            <p className="text-red-400">✗ Your answer: {question.options[userAnswer]}</p>
                          )}
                          {question.explanation && (
                            <p className="text-gray-300 mt-2">💡 {question.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetTest}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Test
              </button>
              <button
                onClick={() => navigate(`/student/course/${courseId}`)}
                className="flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Back to Course
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = chapter?.questions?.[currentQuestion];
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/student/course/${courseId}`)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-white">Mock Test</h1>
                <p className="text-gray-400 text-sm">Question {currentQuestion + 1} of {chapter?.questions?.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-full border border-red-500/30">
                <Clock className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
        >
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Question {currentQuestion + 1}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              {currentQ?.question}
            </p>
            
            {/* Question Image */}
            {currentQ?.questionImage && (
              <div className="mt-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <img
                    src={currentQ.questionImage}
                    alt="Question illustration"
                    className="max-w-full h-auto rounded-lg mx-auto"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQ?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  answers[currentQuestion] === index
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-cyan-400 bg-cyan-400'
                      : 'border-gray-400'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-white">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            
            {currentQuestion === chapter?.questions?.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(Math.min(chapter?.questions?.length - 1, currentQuestion + 1))}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Question Navigator */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {chapter?.questions?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentQuestion === index
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MockTest;