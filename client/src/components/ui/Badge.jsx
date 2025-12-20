import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-all duration-300 ease-in-out shadow-sm';
  
  const variantClasses = {
    default: 'bg-blue-900/50 text-blue-300 border border-blue-700/50 dark:bg-blue-900/60 dark:border-blue-600/50',
    success: 'bg-green-900/50 text-green-300 border border-green-700/50 dark:bg-green-900/60 dark:border-green-600/50',
    warning: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50 dark:bg-yellow-900/60 dark:border-yellow-600/50',
    danger: 'bg-red-900/50 text-red-300 border border-red-700/50 dark:bg-red-900/60 dark:border-red-600/50',
    info: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 dark:bg-indigo-900/60 dark:border-indigo-600/50',
    secondary: 'bg-gray-700 text-gray-300 border border-gray-600 dark:bg-gray-700 dark:border-gray-600'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;