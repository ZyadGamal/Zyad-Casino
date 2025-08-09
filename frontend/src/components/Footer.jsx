import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className={`py-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border-t'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              © {new Date().getFullYear()} Z-Casino. جميع الحقوق محفوظة.
            </p>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              aria-label="تبديل السمة"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            <a href="/terms" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              الشروط والأحكام
            </a>
            <a href="/privacy" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              الخصوصية
            </a>
            <a href="/contact" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              اتصل بنا
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;