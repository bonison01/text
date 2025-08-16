
import React from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon } from './Icons';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-md bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-center animate-fade-in" role="alert">
        <div className="flex flex-col items-center">
            <ExclamationTriangleIcon className="w-8 h-8 mb-2" />
            <strong className="font-bold">An Error Occurred</strong>
            <span className="block sm:inline mt-1 px-4">{message}</span>
            <button
                onClick={onRetry}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
            >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Try Again
            </button>
        </div>
    </div>
  );
};
