import React from 'react';

const DoctorTrustBadge = ({ 
  rating = 0, 
  totalReviews = 0, 
  specialization = '', 
  experienceYears = 0, 
  isVerified = false 
}) => {
  // Round rating to 1 decimal place
  const roundedRating = Math.round(rating * 10) / 10;
  
  return (
    <div className="space-y-2">
      {/* Rating and Reviews */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <span className="text-yellow-500">⭐</span>
          <span className="ml-1 font-medium text-slate-900 dark:text-slate-100">
            {roundedRating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          ({totalReviews} reviews)
        </span>
      </div>
      
      {/* Specialization Badge */}
      {specialization && (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          <span>🏥</span>
          <span className="ml-1">{specialization}</span>
        </div>
      )}
      
      {/* Experience Badge */}
      {experienceYears > 0 && (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <span>🕒</span>
          <span className="ml-1">{experienceYears}+ years experience</span>
        </div>
      )}
      
      {/* Verified Badge */}
      {isVerified && (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-sm">
          <span>✔️</span>
          <span className="ml-1">Verified Doctor</span>
        </div>
      )}
    </div>
  );
};

export default DoctorTrustBadge;