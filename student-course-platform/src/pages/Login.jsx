import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import AdminLoginForm from '../components/auth/AdminLoginForm';

function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMockStudentLogin = () => {
    login({
      role: 'student',
      name: 'Test Student',
      email: 'student@example.com',
      purchasedCourses: [1, 2], // Mock purchased courses
    });
    navigate('/student/dashboard');
  };

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
        {user.isAuthenticated ? (
          <p className="text-center text-gray-600">You are already signed in.</p>
        ) : (
          <div className="space-y-6">
            <GoogleLoginButton />
            <button
              onClick={handleMockStudentLogin}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Mock Student Login
            </button>
            <div className="text-center text-gray-500">or</div>
            <AdminLoginForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;