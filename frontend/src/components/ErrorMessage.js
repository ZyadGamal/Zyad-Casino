import PropTypes from 'prop-types';
import { ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

const ErrorMessage = ({ 
  title,
  message, 
  onRetry, 
  retryText = 'إعادة المحاولة',
  className = '',
  variant = 'error'
}) => {
  const variants = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: 'text-red-500',
      text: 'text-red-700',
      button: 'bg-red-100 hover:bg-red-200 text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: 'text-yellow-500',
      text: 'text-yellow-700',
      button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
    }
  };

  const currentVariant = variants[variant] || variants.error;

  return (
    <div className={`${currentVariant.bg} border-l-4 ${currentVariant.border} p-4 rounded-md ${className}`}>
      <div className="flex items-start">
        <ExclamationCircleIcon className={`h-5 w-5 ${currentVariant.icon} mr-3 mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          <p className={`text-sm ${currentVariant.text}`}>{message}</p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="ghost"
              size="sm"
              className="mt-2"
              icon={<ArrowPathIcon className="h-4 w-4 mr-1" />}
            >
              {retryText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  retryText: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['error', 'warning'])
};

export default ErrorMessage;