
import React from 'react';

const GeneratingStep: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 text-center flex flex-col items-center justify-center space-y-6">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full bg-purple-500 opacity-75 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-purple-600 opacity-75 animate-pulse delay-200"></div>
        <div className="absolute inset-4 rounded-full bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300 animate-spin duration-[3000ms]"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white">Crafting Your Website...</h2>
      <p className="text-purple-300">Our DigitalBloom AI is designing, coding, and bringing your vision to life. This might take a moment.</p>
    </div>
  );
};

export default GeneratingStep;
