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
      const username = localStorage.getItem('username') || '';
      setUser({ isAuthenticated: true, role: 'admin', username });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('username', userData.username);
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
