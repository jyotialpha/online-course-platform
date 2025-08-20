import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { googleSignIn } from '../../services/api';

function GoogleLoginButton() {
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = async () => {
    if (!googleScriptLoaded) return;
    
    setIsLoading(true);
    setError('');

    // Initialize Google Identity Services
    if (window.google?.accounts?.oauth2) {
      // Request OAuth token
      const response = await window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse) => {
          if (tokenResponse.access_token) {
            try {
              // Get user profile
              const profileResponse = await fetch(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                }
              );
              const profile = await profileResponse.json();

              // Send to backend using the API service
              const backendResponse = await googleSignIn({
                googleId: profile.sub,
                name: profile.name,
                photoUrl: profile.picture,
                email: profile.email,
              });

              const data = backendResponse.data;
              
              // Handle response
              if (data.token && data.user) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify({
                  ...data.user,
                  role: 'student',
                  purchasedCourses: []
                }));
                
                // Login with token and user data
                login(data.token, {
                  ...data.user,
                  role: 'student',
                  purchasedCourses: []
                });
                
                // Redirect to student dashboard
                navigate('/student/dashboard');
              } else {
                console.error('Login failed:', data.message);
                setError(data.message || 'Google login failed. Please try again.');
              }
            } catch (error) {
              console.error('Error during Google login:', error);
              setError('Google login failed. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        },
      });

      // Request authorization
      response.requestAccessToken();
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!googleScriptLoaded || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Signing in...
          </div>
        ) : (
          <>
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.24 10.493v2.808h4.633c-.186 1.226-.715 2.26-1.507 3.075l2.446 1.89c1.43-1.32 2.257-3.208 2.257-5.965 0-.536-.047-1.057-.135-1.556h-7.694z"
              />
              <path
                fill="currentColor"
                d="M12 20c2.86 0 5.255-1.02 7-2.757l-2.446-1.89c-.96.645-2.185 1.027-3.554 1.027-2.73 0-5.054-1.84-5.886-4.31H4.76v1.92C6.496 17.36 9.13 20 12 20z"
              />
              <path
                fill="currentColor"
                d="M6.114 13.69c-.21-.645-.33-1.34-.33-2.065s.12-1.42.33-2.065V7.64H4.76c-.614 1.26-.964 2.69-.964 4.31s.35 3.05.964 4.31l1.354-1.6z"
              />
              <path
                fill="currentColor"
                d="M12 4c1.616 0 3.07.496 4.24 1.465L18.48 3.22C16.755 1.48 14.36 0 12 0 9.13 0 6.496 2.64 4.76 6.01l1.354-1.6C7.946 5.84 10.27 4 12 4z"
              />
            </svg>
            Sign in with Google
          </>
        )}
      </button>
    </div>
  );
}

export default GoogleLoginButton;