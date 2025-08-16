
import React, { useState } from 'react';
import { ClipboardDocumentCheckIcon, ClipboardIcon, ArrowPathIcon } from './Icons';

interface ExtractedTextViewProps {
  text: string;
  onReset: () => void;
}

export const ExtractedTextView: React.FC<ExtractedTextViewProps> = ({ text, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <h3 className="text-2xl font-bold text-base-content mb-4">Extracted Text</h3>
      <div className="w-full bg-base-100 rounded-lg p-4 relative shadow-inner">
        <pre className="text-gray-300 whitespace-pre-wrap font-sans text-left h-48 overflow-y-auto">{text}</pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-base-300 hover:bg-brand-primary text-gray-300 hover:text-white transition-colors"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? <ClipboardDocumentCheckIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
        </button>
      </div>
      <button
        onClick={onReset}
        className="mt-6 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"
      >
        <ArrowPathIcon className="w-5 h-5 mr-2"/>
        Start Over
      </button>
    </div>
  );
};
