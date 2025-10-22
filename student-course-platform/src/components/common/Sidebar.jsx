import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { LayoutDashboard, BookOpen, FileText, FileQuestion, LogOut, PlusCircle, FileUp, GraduationCap, User, BarChart3, Users } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isOpen, setIsOpen, isMobileOpen, setIsMobileOpen } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Define role-based navigation items
  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/create-course', label: 'Create Course' },
    { path: '/admin/upload-pdf', label: 'Upload PDF' },
    { path: '/admin/create-test', label: 'Create Mock Test' },
  ];

  const studentNavItems = [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/courses', label: 'My Courses' },
    { path: '/student/pdfs', label: 'PDFs' },
    { path: '/student/tests', label: 'Mock Tests' },
  ];

  const location = useLocation();
  
  const navItems = user.role === 'admin' 
    ? [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/admin/create-course', label: 'Create Course', icon: <PlusCircle className="w-5 h-5" /> },
        { path: '/admin/students', label: 'Student Details', icon: <Users className="w-5 h-5" /> },
        { path: '/admin/upload-pdf', label: 'Upload PDF', icon: <FileUp className="w-5 h-5" /> },
        { path: '/admin/create-test', label: 'Create Test', icon: <FileQuestion className="w-5 h-5" /> },
      ]
    : user.role === 'student'
    ? [
        { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/student/courses', label: 'All Courses', icon: <BookOpen className="w-5 h-5" /> },
        { path: '/student/my-courses', label: 'My Courses', icon: <FileText className="w-5 h-5" /> },
        { path: '/student/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
      ]
    : [];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-6 left-4 z-50 p-2 bg-blue-800 text-white rounded-md shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 bg-blue-800 text-white h-screen flex flex-col transition-all duration-300 w-64 lg:block ${
          isMobileOpen ? 'block' : 'hidden'
        }`}
      >
      <div className="p-4">
        <div className="flex justify-end mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-700">
            {user.role === 'student' ? (
              <GraduationCap className="w-6 h-6 text-white" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {user.role === 'admin' ? 'Admin Panel' : 'Student Portal'}
          </h2>
          <p className="text-xs text-blue-200">
            {user.googleProfile?.name || user.email}
          </p>
        </div>
      </div>
      {user.isAuthenticated && (
        <nav className="flex-grow p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    location.pathname === item.path 
                      ? 'bg-blue-700 text-white' 
                      : 'text-blue-100 hover:bg-blue-700/50'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full p-3 rounded-lg transition-colors text-blue-100 hover:bg-blue-700/50`}
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;