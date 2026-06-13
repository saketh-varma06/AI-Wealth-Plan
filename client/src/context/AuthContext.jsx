import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const saveAuth = useCallback((token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) { setLoading(false); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    saveAuth(data.token, data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    saveAuth(data.token, data.user);
    return data.user;
  };

  const googleLogin = async (googleData) => {
    const { data } = await authAPI.googleAuth(googleData);
    saveAuth(data.token, data.user);
    return data.user;
  };

  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, googleLogin, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
