import { createContext, useState } from 'react';
import { mockUser } from '../mockData/user';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(mockUser);

  const login = (userData) => {
    setUser({ ...userData, isAuthenticated: true });
  };

  const logout = () => {
    setUser(mockUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}