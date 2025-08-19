import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

function CourseForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
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
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock course creation
    console.log('Course created:', formData);
    alert('Course created (mock implementation)');
    navigate('/admin/dashboard');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChapterChange = (chapterIndex, field, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex][field] = value;
    setFormData({ ...formData, chapters: updatedChapters });
  };

  const handleQuestionChange = (chapterIndex, questionIndex, field, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].questions[questionIndex][field] = value;
    setFormData({ ...formData, chapters: updatedChapters });
  };

  const handleOptionChange = (chapterIndex, questionIndex, optionIndex, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].questions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, chapters: updatedChapters });
  };

  const addChapter = () => {
    setFormData({
      ...formData,
      chapters: [
        ...formData.chapters,
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
    setExpandedChapter(formData.chapters.length);
  };

  const removeChapter = (index) => {
    const updatedChapters = formData.chapters.filter((_, i) => i !== index);
    setFormData({ ...formData, chapters: updatedChapters });
    if (expandedChapter >= updatedChapters.length) {
      setExpandedChapter(updatedChapters.length - 1);
    }
  };

  const addQuestion = (chapterIndex) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setFormData({ ...formData, chapters: updatedChapters });
  };

  const removeQuestion = (chapterIndex, questionIndex) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].questions = updatedChapters[chapterIndex].questions.filter(
      (_, i) => i !== questionIndex
    );
    setFormData({ ...formData, chapters: updatedChapters });
  };

  const handleFileUpload = (chapterIndex, file) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[chapterIndex].pdf = file;
    setFormData({ ...formData, chapters: updatedChapters });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create New Course</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Basic Info */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Course Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Introduction to Web Development"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="A brief description of the course"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/thumbnail.jpg"
                required
              />
            </div>
          </div>
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
                      <div key={questionIndex} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Question {questionIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(chapterIndex, questionIndex)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
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
            className="w-full md:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Course
          </button>
        </div>
      </form>
    </div>
  );
}

export default CourseForm;