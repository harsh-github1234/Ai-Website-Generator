import React, { useState } from 'react';
import type { FormData } from '../types';
import { generateSuggestions } from '../services/geminiService';

interface QuestionnaireStepProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData: FormData | null;
  error: string | null;
}

const AiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const QuestionnaireStep: React.FC<QuestionnaireStepProps> = ({ onSubmit, initialData, error }) => {
  const [formData, setFormData] = useState<FormData>(initialData || {
    businessName: '',
    businessType: '',
    businessDescription: '',
    targetAudience: '',
    services: '',
    style: 'Modern & Clean',
    colorScheme: 'Blue & White',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAiSuggest = async () => {
    if (!formData.businessName || !formData.businessType) {
        setSuggestionError("Please fill in Business Name and Type first.");
        return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    try {
        const suggestions = await generateSuggestions(formData.businessName, formData.businessType);
        setFormData(prev => ({
            ...prev,
            businessDescription: suggestions.businessDescription,
            targetAudience: suggestions.targetAudience,
            services: suggestions.services,
        }));
    } catch (err) {
        setSuggestionError("Could not get AI suggestions. Please try again.");
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit(formData);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-lg p-8 transition-all duration-500">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">DigitalBloom AI Website Generator</h1>
        <p className="text-purple-300 mt-2">Tell us about your business, and we'll craft a website for you.</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g., Creative Solutions Inc." />
          <InputField label="Business Type" name="businessType" value={formData.businessType} onChange={handleChange} placeholder="e.g., Tech Startup, Restaurant" />
        </div>
        
        <div className="p-4 bg-gray-900/50 rounded-lg space-y-4 border border-gray-700">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-200">AI Content Suggestions</h3>
                <button type="button" onClick={handleAiSuggest} disabled={isSuggesting || !formData.businessName || !formData.businessType} className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300">
                   {isSuggesting ? <Spinner /> : <><AiIcon /> Suggest Content</>}
                </button>
            </div>
             {suggestionError && (
                <p className="text-sm text-red-400">{suggestionError}</p>
            )}
            <TextAreaField label="Business Description" name="businessDescription" value={formData.businessDescription} onChange={handleChange} placeholder="What does your business do? Click Suggest Content." />
            <InputField label="Target Audience" name="targetAudience" value={formData.targetAudience} onChange={handleChange} placeholder="e.g., Small business owners" />
            <TextAreaField label="Key Services or Products" name="services" value={formData.services} onChange={handleChange} placeholder="List your main offerings, separated by commas." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Website Style" name="style" value={formData.style} onChange={handleChange} options={['Modern & Clean', 'Elegant & Professional', 'Playful & Creative', 'Minimalist & Simple']} />
          <InputField label="Preferred Color Scheme" name="colorScheme" value={formData.colorScheme} onChange={handleChange} placeholder="e.g., Dark Green & Gold" />
        </div>
        <div>
          <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : 'Generate My Website'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper components for form fields to reduce repetition
const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }> = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
    <input type="text" id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5" />
  </div>
);

const TextAreaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string }> = ({ label, name, value, onChange, placeholder }) => (
    <div>
      <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} required rows={3} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"></textarea>
    </div>
);

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }> = ({ label, name, value, onChange, options }) => (
    <div>
      <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      <select id={name} name={name} value={value} onChange={onChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5">
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
);

export default QuestionnaireStep;
