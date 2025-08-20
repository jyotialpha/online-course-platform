import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext({
  user: { isAuthenticated: false, role: 'guest', username: '' },
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ isAuthenticated: false, role: 'guest', username: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      // Ensure all required fields exist
      const userState = {
        isAuthenticated: true,
        role: userData.role || 'guest',
        name: userData.name || userData.googleProfile?.name || '',
        email: userData.email || userData.googleProfile?.email || '',
        username: userData.username || userData.googleProfile?.name || '',
        googleProfile: {
          name: userData.googleProfile?.name || userData.name || '',
          photoUrl: userData.googleProfile?.photoUrl || '',
          email: userData.googleProfile?.email || userData.email || ''
        },
        purchasedCourses: userData.purchasedCourses || []
      };
      setUser(userState);
    } else {
      // Clear any stale user data
      localStorage.removeItem('user');
    }
  }, []);

  const login = (token, userData) => {
    // Store token
    localStorage.setItem('token', token);
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store user data in state with proper structure
    setUser({
      isAuthenticated: true,
      role: userData.role,
      name: userData.googleProfile?.name || userData.username || '',
      email: userData.googleProfile?.email || userData.email || '',
      username: userData.username || userData.googleProfile?.name || '',
      googleProfile: userData.googleProfile || {
        name: userData.name || userData.username || '',
        photoUrl: userData.photoUrl || '',
        email: userData.email || ''
      },
      purchasedCourses: userData.purchasedCourses || []
    });
  };

  const logout = () => {
    setUser({
      isAuthenticated: false,
      role: 'guest',
      name: '',
      email: '',
      username: '',
      googleProfile: null,
      purchasedCourses: []
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
