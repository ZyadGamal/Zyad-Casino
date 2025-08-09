import React from 'react';
import PropTypes from 'prop-types';
import Footer from './Footer';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header سيتم إضافته عبر Navbar بشكل منفصل */}
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <Footer />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;