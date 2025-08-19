import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FileUp, FileQuestion, PlusCircle, LogOut, FileText } from 'lucide-react';
import ErrorBoundary from '../components/common/ErrorBoundary';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
  hover: {
    y: -5,
    transition: { duration: 0.2 },
  },
};

const AdminDashboardContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated as admin
  if (!user.isAuthenticated || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const dashboardCards = [
    {
      title: 'Create Course',
      description: 'Design and publish new courses with chapters and content',
      icon: <PlusCircle className="h-8 w-8 text-indigo-600" />,
      link: '/admin/create-course',
      buttonText: 'Create Course',
    },
    {
      title: 'Upload PDF',
      description: 'Upload and manage PDF materials for your courses',
      icon: <FileUp className="h-8 w-8 text-indigo-600" />,
      link: '/admin/upload-pdf',
      buttonText: 'Upload PDF',
    },
    {
      title: 'Create Test',
      description: 'Design mock tests and quizzes for your courses',
      icon: <FileQuestion className="h-8 w-8 text-indigo-600" />,
      link: '/admin/create-test',
      buttonText: 'Create Test',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
          <p className="mt-2 text-gray-600">Manage your courses and content from the admin dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              custom={index}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={cardVariants}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 mb-4">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm mb-6">{card.description}</p>
                <Link
                  to={card.link}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  {card.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">PDFs Uploaded</p>
                  <p className="text-2xl font-semibold text-gray-900">45</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
                  <FileQuestion className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mock Tests</p>
                  <p className="text-2xl font-semibold text-gray-900">28</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const AdminDashboard = () => (
  <ErrorBoundary>
    <AdminDashboardContent />
  </ErrorBoundary>
);

export default AdminDashboard;