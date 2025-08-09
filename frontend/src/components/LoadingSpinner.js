import PropTypes from 'prop-types';

const LoadingSpinner = ({ 
  message, 
  size = 'medium',
  fullScreen = false,
  className = '',
  color = 'green'
}) => {
  const sizes = {
    small: 'h-5 w-5 border-t-2 border-b-2',
    medium: 'h-8 w-8 border-t-2 border-b-2',
    large: 'h-12 w-12 border-t-3 border-b-3'
  };

  const colors = {
    green: 'border-green-500',
    gray: 'border-gray-400',
    white: 'border-white'
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center space-y-3 ${
        fullScreen ? 'min-h-screen' : 'py-8'
      } ${className}`}
    >
      <div 
        className={`animate-spin rounded-full ${colors[color]} ${sizes[size]}`}
        aria-label="جاري التحميل"
      ></div>
      {message && (
        <p className={`text-sm animate-pulse ${
          color === 'white' ? 'text-white' : 'text-gray-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.oneOf(['green', 'gray', 'white'])
};

export default LoadingSpinner;