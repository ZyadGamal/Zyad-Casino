import axios from 'axios';
import { getToken, clearToken, storeToken } from './auth';

// 1. التهيئة الأساسية
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  withCredentials: true, // للتعامل مع الكوكيز الآمنة
});

// 2. معالجة الطلبات
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. معالجة الاستجابات
apiClient.interceptors.response.use(
  (response) => {
    // تجديد التوكن إذا كان موجودًا في الاستجابة
    if (response.data?.token) {
      storeToken(response.data.token);
    }
    return response.data;
  },
  async (error) => {
    // معالجة خاصة لأخطاء 401 (غير مصرح)
    if (error.response?.status === 401) {
      try {
        // محاولة تجديد التوكن تلقائيًا
        const { token } = await refreshToken();
        error.config.headers.Authorization = `Bearer ${token}`;
        return apiClient(error.config);
      } catch (refreshError) {
        clearToken();
        window.location.href = '/login?session_expired=true';
        return Promise.reject(new Error("انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى"));
      }
    }
    
    // معالجة الأخطاء العامة
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "حدث خطأ غير متوقع";
    return Promise.reject(new Error(errorMessage));
  }
);

// 4. الدوال الأساسية
const refreshToken = () => apiClient.post('/auth/refresh-token');

export default {
  // ===== المصادقة =====
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    register: (data) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
  },

  // ===== المستخدمون =====
  users: {
    getMe: () => apiClient.get('/users/me'),
    updateMe: (data) => apiClient.patch('/users/me', data),
  },

  // ===== المنتجات =====
  products: {
    list: (params) => apiClient.get('/products', { params }),
    create: (data) => apiClient.post('/products', data),
    details: (id) => apiClient.get(`/products/${id}`),
    update: (id, data) => apiClient.patch(`/products/${id}`, data),
    delete: (id) => apiClient.delete(`/products/${id}`),
  },

  // ===== الأدوات المساعدة =====
  setLanguage: (lang) => {
    apiClient.defaults.headers['Accept-Language'] = lang;
  }
};