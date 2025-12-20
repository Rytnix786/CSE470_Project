import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 dark:focus:ring-offset-gray-950';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white dark:bg-gray-700 dark:hover:bg-gray-600 shadow hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/30',
    outline: 'border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 dark:border-blue-400 dark:text-blue-300 hover:shadow-md',
    ghost: 'text-gray-300 hover:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-800'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none' 
    : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;