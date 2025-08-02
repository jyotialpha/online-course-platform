import { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PurchasedCourseCard from '../components/student/PurchasedCourseCard';
import PDFViewer from '../components/student/PDFViewer';
import MockTestInterface from '../components/student/MockTestInterface';
import { mockCourses } from '../mockData/courses';

function StudentDashboard() {
  const { user } = useContext(AuthContext);

  // Mock purchased courses (subset of mockCourses)
  const purchasedCourses = user.isAuthenticated
    ? mockCourses.filter((course) => user.purchasedCourses.includes(course.id))
    : [];

  return (
    <div className="container mx-auto p-4">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h2 className="text-3xl font-bold mb-6 text-center">My Courses</h2>
              {user.isAuthenticated && user.role === 'student' ? (
                purchasedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedCourses.map((course) => (
                      <PurchasedCourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600">You haven't purchased any courses yet.</p>
                )
              ) : (
                <p className="text-center text-gray-600">Please sign in as a student to view your courses.</p>
              )}
            </>
          }
        />
        <Route path="/courses" element={<MyCourses />} />
        <Route path="/pdfs" element={<PDFViewer />} />
        <Route path="/tests" element={<MockTestInterface />} />
      </Routes>
    </div>
  );
}

function MyCourses() {
  const { user } = useContext(AuthContext);
  const purchasedCourses = user.isAuthenticated
    ? mockCourses.filter((course) => user.purchasedCourses.includes(course.id))
    : [];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">My Courses</h2>
      {purchasedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCourses.map((course) => (
            <PurchasedCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">You haven't purchased any courses yet.</p>
      )}
    </div>
  );
}

export default StudentDashboard;