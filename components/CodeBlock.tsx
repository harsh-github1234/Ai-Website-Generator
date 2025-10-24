
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language: string;
  onCodeChange?: (newCode: string) => void;
}

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);


const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, onCodeChange }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCodeChange) {
      onCodeChange(e.target.value);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg relative h-full">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-mono text-xs py-1 px-3 rounded-md transition-all"
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <textarea
        value={code}
        onChange={handleChange}
        spellCheck="false"
        className="w-full h-full bg-transparent text-sm font-mono p-4 pt-10 custom-scrollbar resize-none border-none focus:outline-none focus:ring-0"
        aria-label={`${language} code editor`}
      />
    </div>
  );
};

export default CodeBlock;
