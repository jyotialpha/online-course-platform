import { useState } from 'react';

function PDFUploadForm() {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock PDF upload
    if (file) {
      console.log('PDF uploaded:', file.name);
      alert('PDF uploaded (mock implementation)');
    } else {
      alert('Please select a file');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload PDF</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pdf" className="block text-sm font-medium text-gray-700">Select PDF</label>
          <input
            type="file"
            id="pdf"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload PDF
        </button>
      </form>
    </div>
  );
}

export default PDFUploadForm;