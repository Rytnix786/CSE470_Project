import React from 'react';

const GlowContainer = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const baseClasses = 'relative rounded-2xl p-px transition-all duration-300 ease-in-out hover:shadow-lg';
  
  const variantClasses = {
    default: 'bg-gradient-to-br from-blue-500/30 to-indigo-600/30 dark:from-blue-500/40 dark:to-indigo-600/40',
    blue: 'bg-gradient-to-br from-blue-500/40 to-cyan-500/40 dark:from-blue-500/50 dark:to-cyan-500/50',
    purple: 'bg-gradient-to-br from-purple-500/40 to-pink-500/40 dark:from-purple-500/50 dark:to-pink-500/50',
    teal: 'bg-gradient-to-br from-teal-500/40 to-emerald-500/40 dark:from-teal-500/50 dark:to-emerald-500/50'
  };
  
  const innerClasses = {
    default: 'bg-gray-900 rounded-2xl dark:bg-gray-950',
    blue: 'bg-gray-900 rounded-2xl dark:bg-gray-950',
    purple: 'bg-gray-900 rounded-2xl dark:bg-gray-950',
    teal: 'bg-gray-900 rounded-2xl dark:bg-gray-950'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      <div className={`${innerClasses[variant]} w-full h-full p-6`}>
        {children}
      </div>
    </div>
  );
};

export default GlowContainer;