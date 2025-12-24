import React from 'react';

const Select = ({ children, className = '', ...props }) => {
  return (
    <select
      className={`w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;