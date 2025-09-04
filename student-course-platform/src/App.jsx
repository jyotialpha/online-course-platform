import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import Homepage from './pages/Homepage';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourses from './pages/StudentCourses';
import MyCourses from './pages/MyCourses';
import AdminDashboard from './pages/AdminDashboard';
import CourseForm from './components/admin/CourseForm';
import CourseEditForm from './components/admin/CourseEditForm';
import CourseView from './components/admin/CourseView';
import PDFUploadForm from './components/admin/PDFUploadForm';
import MockTestForm from './components/admin/MockTestForm';
import Login from './pages/Login';
import ProtectedRoute from './components/common/ProtectedRoute';

function AppContent() {
  const { user } = useAuth();
  const { isOpen } = useSidebar();
  const location = useLocation();

  // Debug logs to check state
  // console.log('User:', user);
  // console.log('Location:', location.pathname);
  
  // Show sidebar only for authenticated users on /student/* or /admin/* routes
  const showSidebar = user.isAuthenticated && 
    (location.pathname.startsWith('/student/') || location.pathname.startsWith('/admin/'));
  // console.log('Show Sidebar:', showSidebar);

  return (
    <div className="min-h-screen bg-gray-100">
      {showSidebar && <Sidebar />}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${showSidebar ? (isOpen ? 'lg:ml-64' : 'lg:ml-16') : ''}`}>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/student/courses" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/student/my-courses" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin/create-course" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CourseForm />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/edit-course/:courseId" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CourseEditForm />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/view-course/:courseId" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CourseView />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/upload-pdf" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PDFUploadForm />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/create-test" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MockTestForm />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <AppContent />
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;