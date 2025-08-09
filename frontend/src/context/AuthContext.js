import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // جلب بيانات المستخدم عند تحميل التطبيق
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fullUser = {
            id: response.data.id,
            username: response.data.username,
            balance: response.data.balance,
            email: response.data.email,
            role: response.data.role,
            token: token
          };
          localStorage.setItem('user', JSON.stringify(fullUser));
          setUser(fullUser);
        }
      } catch (error) {
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const login = async ({ identifier, password }) => {
    try {
      const res = await authService.login(identifier, password);
      if (res?.token && res?.user) {
        const fullUser = {
          id: res.user.id,
          username: res.user.username,
          balance: res.user.balance,
          email: res.user.email,
          role: res.user.role,
          token: res.token
        };

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(fullUser));
        setUser(fullUser);
        navigate('/');
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'فشل تسجيل الدخول' 
      };
    }
    return { success: false, message: 'حدث خطأ غير متوقع' };
  };

  const register = async ({ username, email, password }) => {
    try {
      const res = await authService.register(username, email, password);
      if (res?.token && res?.user) {
        const fullUser = {
          id: res.user.id,
          username: res.user.username,
          balance: res.user.balance,
          email: res.user.email,
          role: res.user.role,
          token: res.token
        };

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(fullUser));
        setUser(fullUser);
        navigate('/');
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'فشل التسجيل'
      };
    }
    return { success: false, message: 'حدث خطأ غير متوقع' };
  };

  const logout = () => {
    clearAuthData();
    navigate('/login');
  };

  const updateBalance = (newBalance) => {
    const updatedUser = { ...user, balance: newBalance };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedUser = {
          ...user,
          ...response.data,
          token: token
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user,
        loading,
        login,
        register,
        logout,
        updateBalance,
        refreshUserData,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};