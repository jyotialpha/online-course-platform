import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

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

  const navItems = user.role === 'admin' ? adminNavItems : user.role === 'student' ? studentNavItems : [];

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
                  className="block p-2 rounded hover:bg-blue-700"
                >
                  {isOpen ? item.label : item.label.charAt(0)}
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left p-2 rounded hover:bg-blue-700"
              >
                {isOpen ? 'Logout' : 'L'}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Sidebar;