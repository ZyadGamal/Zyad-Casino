import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from './LoadingSpinner';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Input } from './Input';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'يجب إدخال اسم المستخدم';
    } else if (formData.username.length < 3) {
      newErrors.username = 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'يجب إدخال البريد الإلكتروني';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }

    if (!formData.password) {
      newErrors.password = 'يجب إدخال كلمة المرور';
    } else if (formData.password.length < 6) {
      newErrors.password = 'يجب أن تكون كلمة المرور 6 أحرف على الأقل';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      showNotification('success', 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ server: error.message || 'فشل إنشاء الحساب' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">إنشاء حساب جديد</h2>
      
      {errors.server && (
        <ErrorMessage message={errors.server} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="اسم المستخدم"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
        />

        <Input
          type="email"
          label="البريد الإلكتروني"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          type="password"
          label="كلمة المرور"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <Input
          type="password"
          label="تأكيد كلمة المرور"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          isLoading={isLoading}
        >
          إنشاء حساب
        </Button>

        <div className="text-center text-sm text-gray-600">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
            سجل الدخول
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;