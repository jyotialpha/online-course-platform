import { useAuth } from '../context/AuthContext';
import { getStudentData } from '../services/api';
import { useEffect, useState } from 'react';

function StudentDashboard() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await getStudentData();
        setStudentData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user.isAuthenticated && user.role === 'student') {
      fetchStudentData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h2>
        <p className="text-gray-600 mb-4">Hi {user.name}, welcome to your student dashboard!</p>
        {studentData && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-700">✅ Successfully connected to backend API!</p>
            <p className="text-sm text-green-600 mt-2">{studentData.message}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">My Courses</h3>
          <p className="text-gray-600">You haven't purchased any courses yet.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Mock Tests</h3>
          <p className="text-gray-600">No mock tests available yet.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Progress</h3>
          <p className="text-gray-600">Start learning to see your progress!</p>
        </div>
      </div>
    </div>
  );
}



export default StudentDashboard;