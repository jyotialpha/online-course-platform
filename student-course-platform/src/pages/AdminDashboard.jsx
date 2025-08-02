import { useContext } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CourseForm from '../components/admin/CourseForm';
import PDFUploadForm from '../components/admin/PDFUploadForm';
import MockTestForm from '../components/admin/MockTestForm';

function AdminDashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h2 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h2>
              {user.isAuthenticated && user.role === 'admin' ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      <Link to="/admin/create-course" className="hover:underline">Create New Course</Link>
                    </h3>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      <Link to="/admin/upload-pdf" className="hover:underline">Upload Course PDF</Link>
                    </h3>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      <Link to="/admin/create-test" className="hover:underline">Create Mock Test</Link>
                    </h3>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600">
                  Please <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> as an admin to access this page.
                </p>
              )}
            </>
          }
        />
        <Route path="/create-course" element={<CourseForm />} />
        <Route path="/upload-pdf" element={<PDFUploadForm />} />
        <Route path="/create-test" element={<MockTestForm />} />
      </Routes>
    </div>
  );
}

export default AdminDashboard;