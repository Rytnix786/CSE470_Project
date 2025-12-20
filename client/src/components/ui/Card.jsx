import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  hoverable = true,
  ...props 
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-300 ease-in-out';
  
  const variantClasses = {
    default: 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm',
    glass: 'bg-white/20 dark:bg-slate-900/60 border border-white/10 dark:border-slate-800 backdrop-blur-md shadow-lg',
    elevated: 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-lg'
  };
  
  const hoverClasses = hoverable 
    ? 'hover:shadow-lg hover:-translate-y-0.5 dark:hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20' 
    : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;