import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from './LoadingSpinner';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Input } from './Input';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'يجب إدخال البريد الإلكتروني أو اسم المستخدم';
    }
    if (!formData.password) {
      newErrors.password = 'يجب إدخال كلمة المرور';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.identifier, formData.password, formData.remember);
      showNotification('success', 'تم تسجيل الدخول بنجاح');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ server: error.message || 'فشل تسجيل الدخول' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">تسجيل الدخول</h2>
      
      {errors.server && (
        <ErrorMessage message={errors.server} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="البريد الإلكتروني / اسم المستخدم"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          error={errors.identifier}
          autoComplete="username"
        />

        <Input
          type="password"
          label="كلمة المرور"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="mr-2 block text-sm text-gray-700">
              تذكرني
            </label>
          </div>

          <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-800">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          isLoading={isLoading}
        >
          تسجيل الدخول
        </Button>

        <div className="text-center text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
            سجل الآن
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;