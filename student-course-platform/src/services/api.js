import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import AdminLoginForm from '../components/auth/AdminLoginForm';

function Login() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-4 flex justify-center">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign In</h2>
        {user.isAuthenticated ? (
          <p className="text-center text-gray-600">You are already signed in.</p>
        ) : (
          <div className="space-y-6">
            <GoogleLoginButton />
            <div className="text-center text-gray-500">or</div>
            <AdminLoginForm />
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;