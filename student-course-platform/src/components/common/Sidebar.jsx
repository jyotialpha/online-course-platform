import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BookOpen, FileText, FileQuestion, LogOut, PlusCircle, FileUp } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(true);

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
        { path: '/admin/upload-pdf', label: 'Upload PDF', icon: <FileUp className="w-5 h-5" /> },
        { path: '/admin/create-test', label: 'Create Test', icon: <FileQuestion className="w-5 h-5" /> },
      ]
    : user.role === 'student'
    ? [
        { path: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/student/courses', label: 'My Courses', icon: <BookOpen className="w-5 h-5" /> },
        { path: '/student/pdfs', label: 'PDFs', icon: <FileText className="w-5 h-5" /> },
        { path: '/student/tests', label: 'Mock Tests', icon: <FileQuestion className="w-5 h-5" /> },
      ]
    : [];

  return (
    <div
      className={`bg-blue-800 text-white h-screen flex flex-col transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } md:block hidden`}
    >
      <div className="p-4 flex items-center justify-between">
        {isOpen && <h2 className="text-xl font-bold">{user.role === 'admin' ? 'Admin Menu' : 'Student Menu'}</h2>}
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>
      {user.isAuthenticated && (
        <nav className="flex-grow p-4">
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
                  {isOpen && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center w-full p-3 rounded-lg transition-colors text-blue-100 hover:bg-blue-700/50`}
              >
                <LogOut className="w-5 h-5" />
                {isOpen && <span className="ml-3">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Sidebar;