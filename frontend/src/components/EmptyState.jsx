import React from 'react';
import PropTypes from 'prop-types';
import { Button } from './Button';

const EmptyState = ({ 
  title,
  description, 
  actionText, 
  onAction, 
  icon = 'ℹ️',
  className = ''
}) => (
  <div className={`text-center py-10 ${className}`}>
    <div className="text-gray-500 mb-3 flex justify-center">
      <span className="text-4xl">{icon}</span>
    </div>
    {title && <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>}
    <div className="text-gray-500 mb-4 max-w-md mx-auto">{description}</div>
    {onAction && (
      <Button 
        onClick={onAction}
        variant="outline"
        size="sm"
      >
        {actionText}
      </Button>
    )}
  </div>
);

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.string,
  className: PropTypes.string
};

export default EmptyState;