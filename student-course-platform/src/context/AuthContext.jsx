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
      setUser({
        isAuthenticated: true,
        role: userData.role || 'guest',
        name: userData.name || userData.username || '',
        email: userData.email || '',
        username: userData.username || '',
        googleProfile: userData.googleProfile || {
          name: userData.name || '',
          photoUrl: userData.photoUrl || '',
          email: userData.email || ''
        }
      });
    }
  }, []);

  const login = (token, userData) => {
    // Store token
    localStorage.setItem('token', token);
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store user data in state
    setUser({
      isAuthenticated: true,
      role: userData.role,
      name: userData.name || userData.username || '',
      email: userData.email || '',
      username: userData.username || '',
      googleProfile: userData.googleProfile || {
        name: userData.name || '',
        photoUrl: userData.photoUrl || '',
        email: userData.email || ''
      }
    });
  };

  const logout = () => {
    setUser({ isAuthenticated: false, role: 'guest', username: '' });
    localStorage.removeItem('token');
    localStorage.removeItem('username');
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
