import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    // يمكنك هنا إرسال الخطأ إلى خدمة تتبع الأخطاء مثل Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ غير متوقع</h1>
            <p className="text-gray-700 mb-6">
              نعتذر عن هذا الخطأ. تم إبلاغ الفنيين وسيتم حل المشكلة قريبًا.
            </p>
            <div className="mb-6 p-4 bg-gray-100 rounded text-left">
              <p className="font-medium text-gray-800">تفاصيل الخطأ:</p>
              <p className="text-sm text-gray-600 mt-1">
                {this.state.error?.toString() || 'خطأ غير معروف'}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="px-4 py-2"
              >
                إعادة تحميل الصفحة
              </Button>
              <Button
                onClick={() => {
                  const navigate = this.props.navigate;
                  navigate ? navigate('/') : window.location.href = '/';
                }}
                variant="secondary"
                className="px-4 py-2"
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-Order Component للوصول إلى navigate
export default function ErrorBoundaryWithNavigate(props) {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  navigate: PropTypes.func,
};