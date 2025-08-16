
import React from 'react';

interface LoadingSpinnerProps {
    text: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="w-12 h-12 border-4 border-t-brand-primary border-base-300 rounded-full animate-spin mb-4"></div>
      <p className="text-lg font-semibold text-base-content animate-pulse-fast">{text}</p>
    </div>
  );
};
