import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  XCircle
} from 'lucide-react';

function CourseForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isFree: true,
    thumbnail: null,
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
  });
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({ 0: 0 });
  const [isCourseInfoExpanded, setIsCourseInfoExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Upload thumbnail if exists
      let thumbnailUrl = null;
      if (formData.thumbnail) {
        console.log('Uploading thumbnail:', formData.thumbnail.name);
        const thumbnailFormData = new FormData();
        thumbnailFormData.append('thumbnail', formData.thumbnail);
        
        const thumbnailRes = await fetch(`${API_BASE_URL}/api/upload/thumbnail`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: thumbnailFormData
        });
        
        console.log('Thumbnail response status:', thumbnailRes.status);
        if (thumbnailRes.ok) {
          const thumbnailData = await thumbnailRes.json();
          thumbnailUrl = thumbnailData.data.url;
          console.log('Thumbnail uploaded to:', thumbnailUrl);
        } else {
          const errorData = await thumbnailRes.json();
          console.error('Thumbnail upload failed:', errorData);
        }
      }

      // Upload PDFs and prepare chapters
      const processedChapters = await Promise.all(
        formData.chapters.map(async (ch) => {
          let pdfUrl = null;
          if (ch.pdf) {
            console.log('Uploading PDF:', ch.pdf.name);
            const pdfFormData = new FormData();
            pdfFormData.append('pdf', ch.pdf);
            
            const pdfRes = await fetch(`${API_BASE_URL}/api/upload/pdf`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: pdfFormData
            });
            
            console.log('PDF response status:', pdfRes.status);
            if (pdfRes.ok) {
              const pdfData = await pdfRes.json();
              pdfUrl = pdfData.data.url;
              console.log('PDF uploaded to:', pdfUrl);
            } else {
              const errorData = await pdfRes.json();
              console.error('PDF upload failed:', errorData);
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
        price: formData.isFree ? 0 : Number(formData.price),
        isFree: formData.isFree,
        thumbnail: thumbnailUrl,
        chapters: processedChapters
      };

      console.log('Payload:', payload);

      const res = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        method: 'POST',
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
        // Show full backend error message if available
        const errorMsg = data.message || 'Failed to create course';
        const backendError = data.error ? `\nDetails: ${data.error}` : '';
        throw new Error(errorMsg + backendError);
      }
      alert('Course created successfully!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error creating course:', error);
      alert(error.message || 'Failed to create course. Please try again.');
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

  return (
    <>
      <OdiaSidebar />
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-xl mx-auto max-w-4xl border border-gray-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Create New Course
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Fill in the details below to create a new course with chapters and questions
        </p>
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
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-blue-200"
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
                          onChange={() => setFormData(prev => ({ ...prev, isFree: false, price: '' }))}
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
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-blue-200"
                      rows="3"
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
                          Choose Image
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
                            <strong>File:</strong> {formData.thumbnail.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Size:</strong> {(formData.thumbnail.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Type:</strong> {formData.thumbnail.type}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleThumbnailUpload(null)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove thumbnail"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Recommended: Square image (800x800px or larger), JPG, PNG, or WebP format
                    </p>
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
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(chapterIndex, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Chapter title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={chapter.description}
                      onChange={(e) => handleChapterChange(chapterIndex, 'description', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="Chapter description"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chapter PDF</label>
                    <div className="mt-1 flex items-center">
                      <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span>Choose file</span>
                        <input
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={(e) => handleFileUpload(chapterIndex, e.target.files[0])}
                        />
                      </label>
                      <span className="ml-2 text-sm text-gray-500">
                        {chapter.pdf ? chapter.pdf.name : 'No file chosen'}
                      </span>
                    </div>
                    {chapter.pdf && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{chapter.pdf.name} ({(chapter.pdf.size / 1024).toFixed(2)} KB)</span>
                      </div>
                    )}
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
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => handleQuestionChange(chapterIndex, questionIndex, 'question', e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter question text"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center">
                                  <span className="mr-2 text-sm font-medium text-gray-700 w-5">
                                    {String.fromCharCode(65 + optionIndex)}.
                                  </span>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(chapterIndex, questionIndex, optionIndex, e.target.value)}
                                    className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                              <textarea
                                value={question.explanation}
                                onChange={(e) => handleQuestionChange(chapterIndex, questionIndex, 'explanation', e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                placeholder="Explanation for the correct answer"
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Course...
              </div>
            ) : (
              'Create Course'
            )}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}

export default CourseForm;