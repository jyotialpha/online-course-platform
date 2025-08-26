import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileUp, 
  FileQuestion, 
  PlusCircle, 
  LogOut, 
  FileText, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { API_BASE_URL } from '../config/api';

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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterRole, setFilterRole] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Redirect if not authenticated as admin
  if (!user.isAuthenticated || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    // // Debug authentication state
    // console.log('Current user state:', user);
    // console.log('LocalStorage token:', localStorage.getItem('token'));
    // console.log('LocalStorage user:', localStorage.getItem('user'));
    
    // First test the API connection
    testAPIConnection();
    // Fetch courses with initial pagination
    fetchCourses(1, '', 'createdAt', 'desc');
  }, [user]);

  const testAPIConnection = async () => {
    try {
      // console.log('Testing API connection...');
      
      // Test backend health
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      const healthData = await healthResponse.json();
      // console.log('Backend health:', healthData);
      
      // Test admin routes
      const response = await fetch(`${API_BASE_URL}/api/admin/test`);
      const data = await response.json();
      // console.log('API test response:', data);
      
      // Test database status
      const dbResponse = await fetch(`${API_BASE_URL}/api/admin/db-status`);
      const dbData = await dbResponse.json();
      // console.log('Database status:', dbData);
    } catch (error) {
      // console.error('API connection test failed:', error);
    }
  };

  const fetchCourses = async (page = 1, search = searchTerm, sort = sortBy, order = sortOrder, limit = pageSize) => {
    try {
      const token = localStorage.getItem('token');
      // console.log('Token:', token ? 'Present' : 'Missing');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search || '',
        sortBy: sort || 'createdAt',
        sortOrder: order || 'desc'
      });
      
      const apiUrl = `${API_BASE_URL}/api/admin/courses?${params}`;
      // console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      // console.log('Response status:', response.status);
      // console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        // console.log('Response data:', data);
        
        setCourses(data.data.courses || []);
        setPaginationInfo(data.pagination || {});
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCourses(data.pagination?.totalCourses || 0);
        setCurrentPage(data.pagination?.currentPage || 1);
        
        // Update stats with backend data
        if (data.pagination) {
          setPaginationInfo(prev => ({
            ...prev,
            totalChapters: data.pagination.totalChapters || 0,
            totalQuestions: data.pagination.totalQuestions || 0
          }));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        // console.error('Failed to fetch courses:', errorData.message || 'Unknown error');
        // console.error('Full error response:', errorData);
        // Show error to user
        alert(`Failed to fetch courses: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      // console.error('Error fetching courses:', error);
      alert(`Error fetching courses: ${error.message}`);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.status === 204) {
        alert('Course deleted successfully!');
        // Refresh current page, but if it's empty and not first page, go to previous page
        if (courses.length === 1 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        } else {
          fetchCourses(currentPage, searchTerm, sortBy, sortOrder);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Failed to delete course');
      }
    } catch (error) {
      // console.error('Error deleting course:', error);
      alert('Error deleting course');
    }
  };

  const handleEditCourse = (courseId) => {
    navigate(`/admin/edit-course/${courseId}`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/admin/view-course/${courseId}`);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPaginationLoading(true);
    setCurrentPage(newPage);
    fetchCourses(newPage, searchTerm, sortBy, sortOrder);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPaginationLoading(true);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
    fetchCourses(1, searchTerm, sortBy, sortOrder, newPageSize);
  };

  // Search handler with debouncing
  const handleSearch = (value) => {
    setPaginationLoading(true);
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    fetchCourses(1, value, sortBy, sortOrder);
  };

  // Sort handler
  const handleSort = (field, order) => {
    setPaginationLoading(true);
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting
    fetchCourses(1, searchTerm, field, order);
  };

  // Filter and sort courses (now handled by backend)
  const filteredAndSortedCourses = courses;

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

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    setCurrentPage(1); // Reset to first page when changing sort order
    fetchCourses(1, searchTerm, sortBy, newOrder);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
          <p className="mt-2 text-gray-600">Manage your courses and content from the admin dashboard.</p>
        </div>

        {/* Debug Section - Remove this in production */}
        {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>User Authenticated:</strong> {user.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>User Role:</strong> {user.role}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Token Present:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
            <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
          </div>
          <button
            onClick={testAPIConnection}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
          >
            Test API Connection
          </button>
        </div> */}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

        {/* Course Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Course Management</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value, sortOrder)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="title">Title</option>
                  <option value="price">Price</option>
                  <option value="createdAt">Created Date</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Course List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredAndSortedCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first course.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    to="/admin/create-course"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Course
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chapters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedCourses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {course.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">₹{course.price}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{course.chapters?.length || 0} chapters</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewCourse(course._id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Course"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCourse(course._id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Edit Course"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between relative">
            {paginationLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">per page</span>
              </div>
              
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCourses)} of {totalCourses} courses
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || paginationLoading}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || paginationLoading}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

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
                  <p className="text-2xl font-semibold text-gray-900">{totalCourses}</p>
                  {totalPages > 1 && (
                    <p className="text-xs text-gray-400">Page {currentPage} of {totalPages}</p>
                  )}
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
                  <p className="text-sm font-medium text-gray-500">Total Chapters</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {paginationInfo.totalChapters || '...'}
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">Total Questions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {paginationInfo.totalQuestions || '...'}
                  </p>
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