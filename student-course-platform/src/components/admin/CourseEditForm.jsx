import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import OdiaInputField, { OdiaSidebar } from '../common/OdiaInputField';
import Swal from 'sweetalert2';
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
    isFree: true,
    thumbnail: null,
    subjects: []
  });
  const [currentCourse, setCurrentCourse] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(0);
  const [expandedChapter, setExpandedChapter] = useState({ 0: 0 });
  const [expandedQuestions, setExpandedQuestions] = useState({ '0-0': 0 });
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
        
        setCurrentCourse(course);
        setFormData({
          title: course.title || '',
          description: course.description || '',
          price: course.price || '',
          isFree: course.isFree !== undefined ? course.isFree : (course.price === 0),
          thumbnail: null,
          subjects: course.subjects || []
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

      // Handle thumbnail upload/removal
      let thumbnailUrl = currentCourse?.thumbnail;
      
      // If thumbnail was removed from currentCourse, set to null
      if (currentCourse && !currentCourse.thumbnail) {
        thumbnailUrl = null;
      }
      
      // If new thumbnail uploaded
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

      // Process subjects with chapters and PDFs
      const processedSubjects = await Promise.all(
        formData.subjects.map(async (subject, subjectIndex) => {
          const processedChapters = await Promise.all(
            subject.chapters.map(async (ch, chapterIndex) => {
              // Handle PDF - check if it was removed or if new file uploaded
              let pdfUrl = null;
              
              // If chapter has existing PDF string, use it
              if (ch.pdf && typeof ch.pdf === 'string') {
                pdfUrl = ch.pdf;
              }
              // If no PDF in chapter but exists in current course, use current
              else if (!ch.pdf && currentCourse?.subjects?.[subjectIndex]?.chapters?.[chapterIndex]?.pdf) {
                pdfUrl = currentCourse.subjects[subjectIndex].chapters[chapterIndex].pdf;
              }
              
              // If it's a new file (File object), upload it
              if (ch.pdf && typeof ch.pdf === 'object' && ch.pdf.name) {
                // Delete old PDF if exists
                if (currentCourse?.subjects?.[subjectIndex]?.chapters?.[chapterIndex]?.pdf) {
                  try {
                    await fetch(`${API_BASE_URL}/api/upload/delete-file`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ fileUrl: currentCourse.subjects[subjectIndex].chapters[chapterIndex].pdf })
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
          
          return {
            title: subject.title,
            description: subject.description,
            chapters: processedChapters
          };
        })
      );

      // Prepare final payload
      const payload = {
        title: formData.title,
        description: formData.description,
        price: formData.isFree ? 0 : Number(formData.price),
        isFree: formData.isFree,
        thumbnail: thumbnailUrl,
        subjects: processedSubjects
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
      
      Swal.fire({
        title: 'Success!',
        text: 'Course updated successfully!',
        icon: 'success',
        confirmButtonText: 'Great!',
        confirmButtonColor: '#10b981'
      }).then(() => {
        navigate('/admin/dashboard');
      });
    } catch (error) {
      console.error('Error updating course:', error);
      Swal.fire({
        title: 'Update Failed',
        text: error.message || 'Failed to update course. Please try again.',
        icon: 'error',
        confirmButtonText: 'Try Again',
        confirmButtonColor: '#ef4444'
      });
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

  const handleSubjectChange = (subjectIndex, field, value) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex][field] = value;
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleChapterChange = (subjectIndex, chapterIndex, field, value) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex].chapters[chapterIndex][field] = value;
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleQuestionChange = (subjectIndex, chapterIndex, questionIndex, field, value) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex].chapters[chapterIndex].questions[questionIndex][field] = value;
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleOptionChange = (subjectIndex, chapterIndex, questionIndex, optionIndex, value) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex].chapters[chapterIndex].questions[questionIndex].options[optionIndex] = value;
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [
        ...prev.subjects,
        {
          title: '',
          description: '',
          chapters: [
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
        }
      ]
    }));
    setExpandedSubject(prev => prev + 1);
  };

  const addChapter = (subjectIndex) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex].chapters.push({
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
      });
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const removeSubject = async (index) => {
    const result = await Swal.fire({
      title: 'Remove Subject?',
      text: 'This will remove the subject and all its chapters permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter((_, i) => i !== index)
      }));
      setExpandedSubject(prev => (prev === index ? Math.max(0, index - 1) : prev));
    }
  };

  const removeChapter = async (subjectIndex, chapterIndex) => {
    const result = await Swal.fire({
      title: 'Remove Chapter?',
      text: 'This will remove the chapter and all its questions permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setFormData(prev => {
        const updatedSubjects = [...prev.subjects];
        updatedSubjects[subjectIndex].chapters = updatedSubjects[subjectIndex].chapters.filter((_, i) => i !== chapterIndex);
        return { ...prev, subjects: updatedSubjects };
      });
    }
  };

  const addQuestion = (subjectIndex, chapterIndex) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex].chapters[chapterIndex].questions.push({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
      return { ...prev, subjects: updatedSubjects };
    });
    
    const key = `${subjectIndex}-${chapterIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: formData.subjects[subjectIndex].chapters[chapterIndex].questions.length
    }));
  };

  const removeQuestion = async (subjectIndex, chapterIndex, questionIndex) => {
    const result = await Swal.fire({
      title: 'Remove Question?',
      text: 'This question will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setFormData(prev => {
        const updatedSubjects = [...prev.subjects];
        updatedSubjects[subjectIndex].chapters[chapterIndex].questions = updatedSubjects[subjectIndex].chapters[chapterIndex].questions.filter(
          (_, i) => i !== questionIndex
        );
        return { ...prev, subjects: updatedSubjects };
      });
      
      const key = `${subjectIndex}-${chapterIndex}`;
      setExpandedQuestions(prev => ({
        ...prev,
        [key]: Math.max(0, (prev[key] || 0) - 1)
      }));
    }
  };

  const toggleQuestion = (subjectIndex, chapterIndex, questionIndex) => {
    const key = `${subjectIndex}-${chapterIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: prev[key] === questionIndex ? -1 : questionIndex
    }));
  };

  const handleFileUpload = (subjectIndex, chapterIndex, file) => {
    setFormData(prev => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[subjectIndex].chapters[chapterIndex].pdf = file;
      return { ...prev, subjects: updatedSubjects };
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Course Pricing
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="courseType"
                          checked={formData.isFree}
                          onChange={() => setFormData(prev => ({ ...prev, isFree: true, price: '0' }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Free Course</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="courseType"
                          checked={!formData.isFree}
                          onChange={() => setFormData(prev => ({ ...prev, isFree: false, price: prev.price || '' }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Paid Course</span>
                      </label>
                    </div>
                    {!formData.isFree && (
                      <div className="relative">
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-blue-200"
                          placeholder="Enter price in ₹"
                          min="1"
                          step="0.01"
                          required
                        />
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    )}
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
                    {/* Show current thumbnail from database */}
                    {!formData.thumbnail && currentCourse?.thumbnail && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Current Thumbnail</span>
                          <button
                            type="button"
                            onClick={() => setCurrentCourse(prev => ({ ...prev, thumbnail: null }))}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Remove current thumbnail"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <img
                              src={currentCourse.thumbnail}
                              alt="Current thumbnail"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: 'none'}}>
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Current course thumbnail</p>
                            <a
                              href={currentCourse.thumbnail}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              View Full Size
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-white py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                        <span className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {formData.thumbnail ? 'Change Image' : 'Choose Image'}
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
                    </div>
                    
                    {/* Show new thumbnail preview */}
                    {formData.thumbnail && (
                      <div className="flex items-center space-x-3">
                        <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(formData.thumbnail)}
                            alt="New thumbnail preview"
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
                          onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
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

        {/* Subjects Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Course Subjects</h3>
            <button
              type="button"
              onClick={addSubject}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Subject
            </button>
          </div>

          {formData.subjects.map((subject, subjectIndex) => (
            <div key={subjectIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => setExpandedSubject(expandedSubject === subjectIndex ? -1 : subjectIndex)}
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">
                    Subject {subjectIndex + 1}: {subject.title || 'Untitled Subject'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {expandedSubject === subjectIndex ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSubject(subjectIndex);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Remove subject"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedSubject === subjectIndex && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Title</label>
                    <OdiaInputField
                      value={subject.title}
                      onChange={(e) => handleSubjectChange(subjectIndex, 'title', e.target.value)}
                      placeholder="Subject title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <OdiaInputField
                      as="textarea"
                      value={subject.description}
                      onChange={(e) => handleSubjectChange(subjectIndex, 'description', e.target.value)}
                      rows={2}
                      placeholder="Subject description"
                      required
                    />
                  </div>
                  
                  {/* Chapters Section */}
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">Chapters</h4>
                      <button
                        type="button"
                        onClick={() => addChapter(subjectIndex)}
                        className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Chapter
                      </button>
                    </div>

                    {subject.chapters?.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                        <div 
                          className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            const key = `${subjectIndex}-${chapterIndex}`;
                            setExpandedChapter(prev => ({ ...prev, [subjectIndex]: prev[subjectIndex] === chapterIndex ? -1 : chapterIndex }));
                          }}
                        >
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700">
                              Chapter {chapterIndex + 1}: {chapter.title || 'Untitled Chapter'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {expandedChapter[subjectIndex] === chapterIndex ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeChapter(subjectIndex, chapterIndex);
                              }}
                              className="text-red-500 hover:text-red-700"
                              title="Remove chapter"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {expandedChapter[subjectIndex] === chapterIndex && (
                          <div className="p-3 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Chapter Title</label>
                              <OdiaInputField
                                value={chapter.title}
                                onChange={(e) => handleChapterChange(subjectIndex, chapterIndex, 'title', e.target.value)}
                                placeholder="Chapter title"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                              <OdiaInputField
                                as="textarea"
                                value={chapter.description}
                                onChange={(e) => handleChapterChange(subjectIndex, chapterIndex, 'description', e.target.value)}
                                rows={2}
                                placeholder="Chapter description"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Chapter PDF</label>
                              <div className="space-y-2">
                                {/* Show current PDF if exists and no new file selected */}
                                {!chapter.pdf && currentCourse?.subjects?.[subjectIndex]?.chapters?.[chapterIndex]?.pdf && (
                                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 text-red-600 mr-2" />
                                        <span className="text-xs text-gray-700">Current PDF</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <a
                                          href={currentCourse.subjects[subjectIndex].chapters[chapterIndex].pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-xs"
                                        >
                                          View
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updatedCourse = { ...currentCourse };
                                            updatedCourse.subjects[subjectIndex].chapters[chapterIndex].pdf = null;
                                            setCurrentCourse(updatedCourse);
                                          }}
                                          className="text-red-500 hover:text-red-700 text-xs"
                                          title="Remove current PDF"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Show current PDF if it's a string (existing) */}
                                {chapter.pdf && typeof chapter.pdf === 'string' && (
                                  <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <FileText className="h-4 w-4 text-red-600 mr-2" />
                                        <span className="text-xs text-gray-700">Current PDF</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <a
                                          href={chapter.pdf}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 text-xs"
                                        >
                                          View
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => handleChapterChange(subjectIndex, chapterIndex, 'pdf', null)}
                                          className="text-red-500 hover:text-red-700 text-xs"
                                          title="Remove PDF"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-2">
                                  <label className="cursor-pointer bg-white py-1 px-2 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50">
                                    <span>{chapter.pdf ? 'Change PDF' : 'Choose PDF'}</span>
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      className="sr-only"
                                      onChange={(e) => handleFileUpload(subjectIndex, chapterIndex, e.target.files[0])}
                                    />
                                  </label>
                                  {chapter.pdf && typeof chapter.pdf === 'object' && (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-600">
                                        New: {chapter.pdf.name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleChapterChange(subjectIndex, chapterIndex, 'pdf', null)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Remove new PDF"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Questions Section */}
                            <div className="mt-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h5 className="text-xs font-medium text-gray-700">Questions</h5>
                                <button
                                  type="button"
                                  onClick={() => addQuestion(subjectIndex, chapterIndex)}
                                  className="inline-flex items-center px-2 py-0.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                                >
                                  <Plus className="h-3 w-3 mr-1" /> Add Question
                                </button>
                              </div>

                              {chapter.questions?.map((question, questionIndex) => {
                                const key = `${subjectIndex}-${chapterIndex}`;
                                return (
                                  <div key={questionIndex} className="bg-gray-50 rounded border border-gray-200 overflow-hidden">
                                    <div 
                                      className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100"
                                      onClick={() => toggleQuestion(subjectIndex, chapterIndex, questionIndex)}
                                    >
                                      <span className="text-xs font-medium text-gray-700">
                                        Q{questionIndex + 1}
                                      </span>
                                      <div className="flex items-center space-x-1">
                                        {expandedQuestions[key] === questionIndex ? (
                                          <ChevronUp className="h-3 w-3 text-gray-500" />
                                        ) : (
                                          <ChevronDown className="h-3 w-3 text-gray-500" />
                                        )}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeQuestion(subjectIndex, chapterIndex, questionIndex);
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {expandedQuestions[key] === questionIndex && (
                                      <div className="p-2 space-y-2">
                                        <OdiaInputField
                                          as="textarea"
                                          value={question.question}
                                          onChange={(e) => handleQuestionChange(subjectIndex, chapterIndex, questionIndex, 'question', e.target.value)}
                                          placeholder="Question text"
                                          rows={2}
                                          required
                                        />
                                        
                                        <div className="grid grid-cols-2 gap-1">
                                          {question.options?.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center space-x-1">
                                              <span className="text-xs font-medium text-gray-700 w-4">
                                                {String.fromCharCode(65 + optionIndex)}.
                                              </span>
                                              <OdiaInputField
                                                value={option}
                                                onChange={(e) => handleOptionChange(subjectIndex, chapterIndex, questionIndex, optionIndex, e.target.value)}
                                                className="flex-1 text-xs"
                                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                required
                                              />
                                              <input
                                                type="radio"
                                                name={`correct-${subjectIndex}-${chapterIndex}-${questionIndex}`}
                                                checked={question.correctAnswer === optionIndex}
                                                onChange={() => handleQuestionChange(subjectIndex, chapterIndex, questionIndex, 'correctAnswer', optionIndex)}
                                                className="h-3 w-3 text-blue-600"
                                              />
                                            </div>
                                          ))}
                                        </div>

                                        <OdiaInputField
                                          as="textarea"
                                          value={question.explanation}
                                          onChange={(e) => handleQuestionChange(subjectIndex, chapterIndex, questionIndex, 'explanation', e.target.value)}
                                          placeholder="Explanation"
                                          rows={2}
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
