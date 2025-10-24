
import React, { useState } from 'react';
import QuestionnaireStep from './components/QuestionnaireStep';
import GeneratingStep from './components/GeneratingStep';
import ResultStep from './components/ResultStep';
import { generateWebsiteCode } from './services/geminiService';
import type { FormData, GeneratedCode } from './types';

type AppStep = 'questionnaire' | 'generating' | 'result';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('questionnaire');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    setStep('generating');
    setError(null);
    try {
      const code = await generateWebsiteCode(data);
      if (code && code.html && code.css) {
        setGeneratedCode(code);
        setStep('result');
      } else {
        throw new Error("Received incomplete code from AI. Please try again.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(err);
      setError(`An error occurred while generating the website: ${errorMessage}. Please try again.`);
      setStep('questionnaire');
    }
  };

  const handleStartOver = () => {
    setStep('questionnaire');
    // Keep formData to pre-fill the form for easier editing
    setGeneratedCode(null);
    setError(null);
  };

  const renderStep = () => {
    switch (step) {
      case 'generating':
        return <GeneratingStep />;
      case 'result':
        return generatedCode ? (
          <ResultStep code={generatedCode} onStartOver={handleStartOver} />
        ) : (
          <QuestionnaireStep onSubmit={handleFormSubmit} initialData={formData} error="Something went wrong, please try again." />
        );
      case 'questionnaire':
      default:
        return <QuestionnaireStep onSubmit={handleFormSubmit} initialData={formData} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center justify-center p-4">
      {renderStep()}
    </div>
  );
};

export default App;
