import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  XCircle
} from 'lucide-react';

function CourseForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isFree: true,
    thumbnail: null,
    subjects: [
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
  });
  const [expandedSubject, setExpandedSubject] = useState(0);
  const [expandedChapter, setExpandedChapter] = useState({ 0: 0 });
  const [expandedQuestions, setExpandedQuestions] = useState({ '0-0': 0 });
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

      // Process subjects with PDF uploads
      const processedSubjects = await Promise.all(
        formData.subjects.map(async (subj) => {
          const processedChapters = await Promise.all(
            subj.chapters.map(async (ch) => {
              let pdfUrl = null;
              
              // Upload PDF if exists
              if (ch.pdf) {
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
            title: subj.title,
            description: subj.description,
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

      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('Subjects count:', payload.subjects.length);
      console.log('First subject:', payload.subjects[0]);



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
      console.log('Response text:', text);
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error('JSON parse error:', err);
        throw new Error('Server returned invalid JSON');
      }
      console.log('Response data:', data);

      if (!res.ok) {
        // Show full backend error message if available
        const errorMsg = data.message || 'Failed to create course';
        let backendError = '';
        if (data.error) {
          if (typeof data.error === 'string') {
            backendError = `\nDetails: ${data.error}`;
          } else if (data.error.message) {
            backendError = `\nDetails: ${data.error.message}`;
          } else {
            backendError = `\nDetails: ${JSON.stringify(data.error)}`;
          }
        }
        throw new Error(errorMsg + backendError);
      }
      
      Swal.fire({
        title: 'Success!',
        text: 'Course created successfully!',
        icon: 'success',
        confirmButtonText: 'Great!',
        confirmButtonColor: '#10b981'
      }).then(() => {
        navigate('/admin/dashboard');
      });
    } catch (error) {
      console.error('Error creating course:', error);
      Swal.fire({
        title: 'Creation Failed',
        text: error.message || 'Failed to create course. Please try again.',
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
      
      setExpandedChapter(prev => ({
        ...prev,
        [subjectIndex]: updatedSubjects[subjectIndex].chapters.length - 1
      }));
      
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
    
    setExpandedQuestions(prev => ({
      ...prev,
      [`${subjectIndex}-${chapterIndex}`]: formData.subjects[subjectIndex].chapters[chapterIndex].questions.length
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
        updatedSubjects[subjectIndex].chapters[chapterIndex].questions = 
          updatedSubjects[subjectIndex].chapters[chapterIndex].questions.filter((_, i) => i !== questionIndex);
        return { ...prev, subjects: updatedSubjects };
      });
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

  const handleBulkUpload = (subjectIndex, chapterIndex, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsedQuestions = parseTxtContent(content);
      if (parsedQuestions.length > 0) {
        setFormData(prev => {
          const updatedSubjects = [...prev.subjects];
          updatedSubjects[subjectIndex].chapters[chapterIndex].questions = parsedQuestions;
          return { ...prev, subjects: updatedSubjects };
        });
        Swal.fire({
          title: 'Success!',
          text: `Uploaded ${parsedQuestions.length} questions from file.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No valid questions found in the file.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };
    reader.readAsText(file);
  };

  const parseTxtContent = (content) => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const questions = [];
    let i = 0;
    while (i < lines.length) {
      if (lines[i].startsWith('Question')) {
        i++; // skip Question X
        if (i >= lines.length) break;
        const questionText = lines[i];
        i++;
        const options = [];
        let correctIndex = -1;
        for (let opt = 0; opt < 4; opt++) {
          if (i >= lines.length) break;
          const optionLine = lines[i];
          if (optionLine.startsWith(String.fromCharCode(65 + opt) + '.')) {
            const optionText = optionLine.substring(2).trim();
            options.push(optionText);
            i++;
            if (i < lines.length && lines[i] === 'Correct') {
              correctIndex = opt;
              i++;
            }
          } else {
            break;
          }
        }
        let explanation = '';
        if (i < lines.length && lines[i].startsWith('Explanation')) {
          explanation = lines[i].substring(11).trim();
          i++;
        }
        if (options.length === 4 && correctIndex !== -1) {
          questions.push({
            question: questionText,
            options,
            correctAnswer: correctIndex,
            explanation
          });
        }
      } else {
        i++;
      }
    }
    return questions;
  };

  const downloadSample = () => {
    const sampleContent = `Question 1

What is 2+2?

A. 3

B. 4

Correct

C. 5

D. 6

Explanation: Basic math

Question 2

What is the capital of France?

A. London

B. Berlin

C. Paris

Correct

D. Rome

Explanation: Paris is the capital of France.

Question 3

ଭାରତର ରାଜଧାନୀ କ'ଣ?

A. ମୁମ୍ବାଇ

B. କୋଲକାତା

C. ନୂଆଦିଲ୍ଲୀ

Correct

D. ଚେନ୍ନାଇ

Explanation: ନୂଆଦିଲ୍ଲୀ ଭାରତର ରାଜଧାନୀ ଅଟେ।

Question 4

୨ + ୩ = ?

A. ୪

B. ୫

Correct

C. ୬

D. ୭

Explanation: ଦୁଇ ଯୋଗ ତିନି ସମାନ ପାଞ୍ଚ।`;
    const blob = new Blob([sampleContent], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_questions_bilingual.txt';
    a.click();
    URL.revokeObjectURL(url);
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="pricing"
                          checked={formData.isFree}
                          onChange={() => setFormData(prev => ({ ...prev, isFree: true, price: '' }))}
                          className="h-4 w-4 text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Free Course
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="pricing"
                          checked={!formData.isFree}
                          onChange={() => setFormData(prev => ({ ...prev, isFree: false }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-blue-600" />
                          Paid Course
                        </span>
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
                          required={!formData.isFree}
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
                className="flex justify-between items-center p-4 bg-blue-50 cursor-pointer hover:bg-blue-100"
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
                    <input
                      type="text"
                      value={subject.title}
                      onChange={(e) => handleSubjectChange(subjectIndex, 'title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Subject title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={subject.description}
                      onChange={(e) => handleSubjectChange(subjectIndex, 'description', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="Subject description"
                      required
                    />
                  </div>
                  
                  {/* Chapters within Subject */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-700">Chapters</h4>
                      <button
                        type="button"
                        onClick={() => addChapter(subjectIndex)}
                        className="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Chapter
                      </button>
                    </div>
                    
                    {subject.chapters.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                        <div 
                          className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => setExpandedChapter(prev => ({
                            ...prev,
                            [subjectIndex]: prev[subjectIndex] === chapterIndex ? -1 : chapterIndex
                          }))}
                        >
                          <span className="font-medium text-gray-700 text-sm">
                            Chapter {chapterIndex + 1}: {chapter.title || 'Untitled Chapter'}
                          </span>
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title</label>
                              <input
                                type="text"
                                value={chapter.title}
                                onChange={(e) => handleChapterChange(subjectIndex, chapterIndex, 'title', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Chapter title"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                value={chapter.description}
                                onChange={(e) => handleChapterChange(subjectIndex, chapterIndex, 'description', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="2"
                                placeholder="Chapter description"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter PDF</label>
                              <div className="mt-1 flex items-center">
                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50">
                                  <span>Choose file</span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="sr-only"
                                    onChange={(e) => handleFileUpload(subjectIndex, chapterIndex, e.target.files[0])}
                                  />
                                </label>
                                <span className="ml-2 text-sm text-gray-500">
                                  {chapter.pdf ? chapter.pdf.name : 'No file chosen'}
                                </span>
                              </div>
                            </div>

                            {/* Questions Section */}
                            <div className="mt-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="text-sm font-medium text-gray-700">Mock Test Questions</h5>
                                  <p className="text-xs text-gray-500 mt-1">Supports both English and Odia text</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => addQuestion(subjectIndex, chapterIndex)}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add Question
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`bulk-upload-${subjectIndex}-${chapterIndex}`).click()}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                                  >
                                    <File className="h-3 w-3 mr-1" /> Bulk Upload
                                  </button>
                                  <button
                                    type="button"
                                    onClick={downloadSample}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200"
                                  >
                                    <FileText className="h-3 w-3 mr-1" /> Template
                                  </button>
                                </div>
                              </div>

                              {chapter.questions.map((question, questionIndex) => {
                                const questionKey = `${subjectIndex}-${chapterIndex}`;
                                return (
                                  <div key={questionIndex} className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden mb-2">
                                    <div 
                                      className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100"
                                      onClick={() => toggleQuestion(subjectIndex, chapterIndex, questionIndex)}
                                    >
                                      <span className="font-medium text-gray-700 text-sm">
                                        Question {questionIndex + 1}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        {expandedQuestions[questionKey] === questionIndex ? (
                                          <ChevronUp className="h-4 w-4 text-gray-500" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4 text-gray-500" />
                                        )}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeQuestion(subjectIndex, chapterIndex, questionIndex);
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                          title="Remove question"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {expandedQuestions[questionKey] === questionIndex && (
                                      <div className="p-3 pt-0 space-y-2">
                                        <div>
                                          <input
                                            type="text"
                                            value={question.question}
                                            onChange={(e) => handleQuestionChange(subjectIndex, chapterIndex, questionIndex, 'question', e.target.value)}
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
                                                onChange={(e) => handleOptionChange(subjectIndex, chapterIndex, questionIndex, optionIndex, e.target.value)}
                                                className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                                required
                                              />
                                              <input
                                                type="radio"
                                                name={`correct-${subjectIndex}-${chapterIndex}-${questionIndex}`}
                                                checked={question.correctAnswer === optionIndex}
                                                onChange={() => handleQuestionChange(subjectIndex, chapterIndex, questionIndex, 'correctAnswer', optionIndex)}
                                                className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                              />
                                              <span className="ml-1 text-xs text-gray-500">Correct</span>
                                            </div>
                                          ))}
                                        </div>

                                        <div>
                                          <textarea
                                            value={question.explanation}
                                            onChange={(e) => handleQuestionChange(subjectIndex, chapterIndex, questionIndex, 'explanation', e.target.value)}
                                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="2"
                                            placeholder="Explanation for the correct answer"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <input
                                type="file"
                                id={`bulk-upload-${subjectIndex}-${chapterIndex}`}
                                accept=".txt"
                                style={{ display: 'none' }}
                                onChange={(e) => handleBulkUpload(subjectIndex, chapterIndex, e.target.files[0])}
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