import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { 
  BookOpen, 
  FileText, 
  DollarSign,
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCourse(data.data.course);
      } else {
        setError('Failed to fetch course');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Error fetching course');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectIndex) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectIndex]: !prev[subjectIndex]
    }));
  };

  const toggleChapter = (subjectIndex, chapterIndex) => {
    const key = `${subjectIndex}-${chapterIndex}`;
    setExpandedChapters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEditCourse = () => {
    navigate(`/admin/edit-course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="mt-2 text-gray-600">{course.description}</p>
            </div>
            <button
              onClick={handleEditCourse}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Course
            </button>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="text-2xl font-bold text-gray-900">₹{course.price}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Subjects</p>
                  <p className="text-2xl font-bold text-gray-900">{course.subjects?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {course.subjects?.reduce((total, subject) => 
                      total + (subject.chapters?.reduce((chTotal, chapter) => 
                        chTotal + (chapter.questions?.length || 0), 0) || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <p className="text-gray-900">{course.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <p className="text-gray-900">₹{course.price}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-gray-900">{course.description}</p>
            </div>
            {course.thumbnail && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                <div className="mt-2">
                  <img
                    src={course.thumbnail}
                    alt="Course thumbnail"
                    className="w-48 h-36 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Subjects</h2>
          
          {course.subjects && course.subjects.length > 0 ? (
            <div className="space-y-4">
              {course.subjects.map((subject, subjectIndex) => (
                <div key={subjectIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 bg-blue-50 cursor-pointer hover:bg-blue-100"
                    onClick={() => toggleSubject(subjectIndex)}
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Subject {subjectIndex + 1}: {subject.title}
                        </h3>
                        <p className="text-sm text-gray-600">{subject.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {subject.chapters?.length || 0} chapters
                      </span>
                      {expandedSubjects[subjectIndex] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedSubjects[subjectIndex] && (
                    <div className="p-4 border-t border-gray-200">
                      {/* Chapters within Subject */}
                      {subject.chapters && subject.chapters.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900 mb-3">Chapters</h4>
                          {subject.chapters.map((chapter, chapterIndex) => {
                            const chapterKey = `${subjectIndex}-${chapterIndex}`;
                            return (
                              <div key={chapterIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div 
                                  className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                  onClick={() => toggleChapter(subjectIndex, chapterIndex)}
                                >
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                                    <div>
                                      <h5 className="font-medium text-gray-900 text-sm">
                                        Chapter {chapterIndex + 1}: {chapter.title}
                                      </h5>
                                      <p className="text-xs text-gray-600">{chapter.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">
                                      {chapter.questions?.length || 0} questions
                                    </span>
                                    {expandedChapters[chapterKey] ? (
                                      <ChevronUp className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    )}
                                  </div>
                                </div>

                                {expandedChapters[chapterKey] && (
                                  <div className="p-3 border-t border-gray-200">
                                    {/* Chapter PDF */}
                                    {chapter.pdf && (
                                      <div className="mb-4">
                                        <h6 className="font-medium text-gray-900 mb-2 text-sm">Chapter PDF</h6>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                              <FileText className="h-6 w-6 text-red-600 mr-2" />
                                              <div>
                                                <p className="font-medium text-gray-900 text-sm">Chapter PDF</p>
                                                <p className="text-xs text-gray-600">Click to view or download</p>
                                              </div>
                                            </div>
                                            <a
                                              href={chapter.pdf}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                            >
                                              View PDF
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Chapter Questions */}
                                    <div className="space-y-3">
                                      <h6 className="font-medium text-gray-900 text-sm">Questions</h6>
                                      {chapter.questions && chapter.questions.length > 0 ? (
                                        chapter.questions.map((question, questionIndex) => (
                                          <div key={questionIndex} className="bg-gray-50 rounded-lg p-3">
                                            <div className="mb-2">
                                              <h6 className="font-medium text-gray-900 mb-1 text-sm">
                                                Question {questionIndex + 1}
                                              </h6>
                                              <p className="text-gray-700 text-sm">{question.question}</p>
                                            </div>
                                            
                                            <div className="space-y-1 mb-2">
                                              <p className="text-xs font-medium text-gray-700">Options:</p>
                                              {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center">
                                                  <span className="mr-2 text-xs font-medium text-gray-700 w-4">
                                                    {String.fromCharCode(65 + optionIndex)}.
                                                  </span>
                                                  <span className={`text-xs ${
                                                    optionIndex === question.correctAnswer 
                                                      ? 'text-green-700 font-semibold' 
                                                      : 'text-gray-700'
                                                  }`}>
                                                    {option}
                                                  </span>
                                                  {optionIndex === question.correctAnswer && (
                                                    <CheckCircle className="h-3 w-3 text-green-600 ml-1" />
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                            
                                            {question.explanation && (
                                              <div>
                                                <p className="text-xs font-medium text-gray-700 mb-1">Explanation:</p>
                                                <p className="text-xs text-gray-600">{question.explanation}</p>
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-gray-500 text-xs">No questions in this chapter</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No chapters in this subject</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No subjects added to this course yet.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleEditCourse}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="h-4 w-4 mr-2 inline" />
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseView;
