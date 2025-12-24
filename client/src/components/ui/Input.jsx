import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  variant = 'default',
  as: Component = 'input',
  ...props 
}, ref) => {
  const baseInputClasses = 'w-full rounded-lg border transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/30';
  
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/50',
    glass: 'bg-white/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/50 backdrop-blur-sm'
  };
  
  const inputClasses = `${baseInputClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
          {label}
        </label>
      )}
      <Component
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;