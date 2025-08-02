import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MockTestForm() {
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    questions: '',
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock test creation
    console.log('Mock test created:', formData);
    alert('Mock test created (mock implementation)');
    navigate('/admin/dashboard');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Mock Test</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Test Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>
        <div>
          <label htmlFor="questions" className="block text-sm font-medium text-gray-700">Questions (JSON format)</label>
          <textarea
            id="questions"
            name="questions"
            value={formData.questions}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            placeholder='[{"question": "Example?", "options": ["A", "B", "C"], "answer": "A"}]'
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Test
        </button>
      </form>
    </div>
  );
}

export default MockTestForm;