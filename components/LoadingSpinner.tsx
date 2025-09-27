
import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'جاري التحميل...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      <p className="text-lg text-gray-300">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
