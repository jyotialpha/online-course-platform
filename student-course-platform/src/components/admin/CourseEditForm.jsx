import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import OdiaInputField, { OdiaSidebar } from '../common/OdiaInputField';
import { 
  Plus, 
  Trash2, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Image as ImageIcon,
  DollarSign,
  File,
  PlusCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save
} from 'lucide-react';

function CourseEditForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: null,
    chapters: []
  });
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({ 0: 0 });
  const [isCourseInfoExpanded, setIsCourseInfoExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const course = data.data.course;
        
        setFormData({
          title: course.title || '',
          description: course.description || '',
          price: course.price || '',
          thumbnail: null,
          chapters: course.chapters || []
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Get current course data to preserve existing files
      const currentCourseRes = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const currentCourse = currentCourseRes.ok ? (await currentCourseRes.json()).data.course : null;

      // Upload new thumbnail if exists, otherwise keep existing
      let thumbnailUrl = currentCourse?.thumbnail;
      if (formData.thumbnail) {
        // Delete old thumbnail if exists
        if (currentCourse?.thumbnail) {
          try {
            await fetch(`${API_BASE_URL}/api/upload/delete-file`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fileUrl: currentCourse.thumbnail })
            });
          } catch (error) {
            console.log('Failed to delete old thumbnail:', error);
          }
        }
        
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('thumbnail', formData.thumbnail);
        
        const thumbnailRes = await fetch(`${API_BASE_URL}/api/upload/thumbnail`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: thumbnailFormData
        });
        
        if (thumbnailRes.ok) {
          const thumbnailData = await thumbnailRes.json();
          thumbnailUrl = thumbnailData.data.url;
        }
      }

      // Upload new PDFs and prepare chapters
      const processedChapters = await Promise.all(
        formData.chapters.map(async (ch, index) => {
          // Keep existing PDF URL if no new file uploaded
          let pdfUrl = currentCourse?.chapters?.[index]?.pdf || null;
          
          // If it's a new file (File object), upload it
          if (ch.pdf && typeof ch.pdf === 'object' && ch.pdf.name) {
            // Delete old PDF if exists
            if (currentCourse?.chapters?.[index]?.pdf) {
              try {
                await fetch(`${API_BASE_URL}/api/upload/delete-file`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ fileUrl: currentCourse.chapters[index].pdf })
                });
              } catch (error) {
                console.log('Failed to delete old PDF:', error);
              }
            }
            
            const pdfFormData = new FormData();
            pdfFormData.append('pdf', ch.pdf);
            
            const pdfRes = await fetch(`${API_BASE_URL}/api/upload/pdf`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: pdfFormData
            });
            
            if (pdfRes.ok) {
              const pdfData = await pdfRes.json();
              pdfUrl = pdfData.data.url;
            }
          }
          
          return {
            title: ch.title,
            description: ch.description,
            pdf: pdfUrl,
            questions: ch.questions.map(q => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            }))
          };
        })
      );

      // Prepare final payload
      const payload = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        thumbnail: thumbnailUrl,
        chapters: processedChapters
      };

      console.log('Update Payload:', payload);

      const res = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        throw new Error('Server returned invalid JSON');
      }

      if (!res.ok) {
        const errorMsg = data.message || 'Failed to update course';
        const backendError = data.error ? `\nDetails: ${data.error}` : '';
        throw new Error(errorMsg + backendError);
      }
      
      alert('Course updated successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error updating course:', error);
      alert(error.message || 'Failed to update course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChapterChange = (chapterIndex, field, value) => {
    setFormData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex][field] = value;
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleQuestionChange = (chapterIndex, questionIndex, field, value) => {
    setFormData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex].questions[questionIndex][field] = value;
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleOptionChange = (chapterIndex, questionIndex, optionIndex, value) => {
    setFormData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex].questions[questionIndex].options[optionIndex] = value;
      return { ...prev, chapters: updatedChapters };
    });
  };

  const addChapter = () => {
    setFormData(prev => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        {
          title: '',
          description: '',
          pdf: null,
          questions: [
            {
              question: '',
              options: ['', '', '', ''],
              correctAnswer: 0,
              explanation: ''
            }
          ]
        }
      ]
    }));
    setExpandedChapter(prev => prev + 1);
  };

  const removeChapter = (index) => {
    if (window.confirm('Are you sure you want to remove this chapter and all its questions?')) {
      setFormData(prev => ({
        ...prev,
        chapters: prev.chapters.filter((_, i) => i !== index)
      }));
      setExpandedChapter(prev => (prev === index ? Math.max(0, index - 1) : prev));
    }
  };

  const addQuestion = (chapterIndex) => {
    setFormData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex].questions.push({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
      return { ...prev, chapters: updatedChapters };
    });
    
    setExpandedQuestions(prev => ({
      ...prev,
      [chapterIndex]: formData.chapters[chapterIndex].questions.length
    }));
  };

  const removeQuestion = (chapterIndex, questionIndex) => {
    if (window.confirm('Are you sure you want to remove this question?')) {
      setFormData(prev => {
        const updatedChapters = [...prev.chapters];
        updatedChapters[chapterIndex].questions = updatedChapters[chapterIndex].questions.filter(
          (_, i) => i !== questionIndex
        );
        return { ...prev, chapters: updatedChapters };
      });
      
      setExpandedQuestions(prev => ({
        ...prev,
        [chapterIndex]: Math.max(0, (prev[chapterIndex] || 0) - 1)
      }));
    }
  };

  const toggleQuestion = (chapterIndex, questionIndex) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [chapterIndex]: prev[chapterIndex] === questionIndex ? -1 : questionIndex
    }));
  };

  const handleFileUpload = (chapterIndex, file) => {
    setFormData(prev => {
      const updatedChapters = [...prev.chapters];
      updatedChapters[chapterIndex].pdf = file;
      return { ...prev, chapters: updatedChapters };
    });
  };

  const handleThumbnailUpload = (file) => {
    setFormData(prev => ({
      ...prev,
      thumbnail: file
    }));
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
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
    <>
      <OdiaSidebar />
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-xl mx-auto max-w-4xl border border-gray-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Edit Course
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Update course details, chapters, and questions
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Basic Info */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div 
            className="flex justify-between items-center p-6 cursor-pointer select-none"
            onClick={() => setIsCourseInfoExpanded((prev) => !prev)}
          >
            <h3 className="text-lg font-semibold text-gray-700">Course Information</h3>
            <button
              type="button"
              className="focus:outline-none"
              aria-label={isCourseInfoExpanded ? 'Collapse section' : 'Expand section'}
            >
              {isCourseInfoExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>
          {isCourseInfoExpanded && (
            <div className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                    Course Title
                  </label>
                  <div className="relative">
                    <OdiaInputField
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Enter course title"
                      required
                    />
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="relative">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-blue-600" />
                    Price (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-blue-200"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Description
                  </label>
                  <div className="relative">
                    <OdiaInputField
                      as="textarea"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="pl-10"
                      rows={3}
                      placeholder="A detailed description of the course content and objectives"
                      required
                    />
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
                    Course Thumbnail
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-white py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                        <span className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Choose New Image
                        </span>
                        <input
                          type="file"
                          id="thumbnail"
                          name="thumbnail"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                        />
                      </label>
                      {formData.thumbnail && (
                        <span className="text-sm text-gray-600">
                          {formData.thumbnail.name} ({(formData.thumbnail.size / 1024).toFixed(2)} KB)
                        </span>
                      )}
                    </div>
                    
                    {formData.thumbnail && (
                      <div className="flex items-center space-x-3">
                        <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(formData.thumbnail)}
                            alt="Course thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            <strong>New File:</strong> {formData.thumbnail.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Size:</strong> {(formData.thumbnail.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleThumbnailUpload(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove new thumbnail"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chapters Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Course Chapters</h3>
            <button
              type="button"
              onClick={addChapter}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Chapter
            </button>
          </div>

          {formData.chapters.map((chapter, chapterIndex) => (
            <div key={chapterIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedChapter(expandedChapter === chapterIndex ? -1 : chapterIndex)}
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">
                    Chapter {chapterIndex + 1}: {chapter.title || 'Untitled Chapter'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {expandedChapter === chapterIndex ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChapter(chapterIndex);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Remove chapter"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedChapter === chapterIndex && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
                    <OdiaInputField
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(chapterIndex, 'title', e.target.value)}
                      placeholder="Chapter title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <OdiaInputField
                      as="textarea"
                      value={chapter.description}
                      onChange={(e) => handleChapterChange(chapterIndex, 'description', e.target.value)}
                      rows={2}
                      placeholder="Chapter description"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter PDF</label>
                    <div className="space-y-3">
                      {chapter.pdf && typeof chapter.pdf === 'string' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-6 w-6 text-red-600 mr-2" />
                              <span className="text-sm text-gray-700">Current PDF</span>
                            </div>
                            <a
                              href={chapter.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Current
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <span>Choose New PDF</span>
                          <input
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={(e) => handleFileUpload(chapterIndex, e.target.files[0])}
                          />
                        </label>
                        {chapter.pdf && typeof chapter.pdf === 'object' && (
                          <span className="text-sm text-gray-600">
                            New: {chapter.pdf.name} ({(chapter.pdf.size / 1024).toFixed(2)} KB)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">Mock Test Questions</h4>
                      <button
                        type="button"
                        onClick={() => addQuestion(chapterIndex)}
                        className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Question
                      </button>
                    </div>

                    {chapter.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden mb-3">
                        <div 
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleQuestion(chapterIndex, questionIndex)}
                        >
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">
                              Question {questionIndex + 1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expandedQuestions[chapterIndex] === questionIndex ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeQuestion(chapterIndex, questionIndex);
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="Remove question"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {expandedQuestions[chapterIndex] === questionIndex && (
                          <div className="p-4 pt-0 space-y-3">
                            <div>
                              <OdiaInputField
                                as="textarea"
                                value={question.question}
                                onChange={(e) => handleQuestionChange(chapterIndex, questionIndex, 'question', e.target.value)}
                                placeholder="Enter question text"
                                rows={2}
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center">
                                  <span className="mr-2 text-sm font-medium text-gray-700 w-5">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <OdiaInputField
                                    value={option}
                                    onChange={(e) => handleOptionChange(chapterIndex, questionIndex, optionIndex, e.target.value)}
                                    className="flex-1"
                                    placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                    required
                                  />
                                  <input
                                    type="radio"
                                    name={`correct-${chapterIndex}-${questionIndex}`}
                                    checked={question.correctAnswer === optionIndex}
                                    onChange={() => handleQuestionChange(chapterIndex, questionIndex, 'correctAnswer', optionIndex)}
                                    className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-1 text-xs text-gray-500">Correct</span>
                                </div>
                              ))}
                            </div>

                            <div>
                              <OdiaInputField
                                as="textarea"
                                value={question.explanation}
                                onChange={(e) => handleQuestionChange(chapterIndex, questionIndex, 'explanation', e.target.value)}
                                placeholder="Explanation for the correct answer"
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Course...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Update Course
                </div>
              )}
            </button>
          </div>
        </div>
      </form>
      </div>
    </>
  );
}

export default CourseEditForm;
