import React from 'react';

const Label = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'block text-sm font-medium text-slate-900 dark:text-slate-100';
  
  const classes = `${baseClasses} ${className}`;
  
  return (
    <label className={classes} {...props}>
      {children}
    </label>
  );
};

export default Label;