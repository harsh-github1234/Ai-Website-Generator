import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedCode } from '../types';
import CodeBlock from './CodeBlock';
import ImageEditor from './ImageEditor';

interface ResultStepProps {
  code: GeneratedCode;
  onStartOver: () => void;
}

type ActiveTab = 'preview' | 'html' | 'css' | 'js' | 'images';

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

const ResultStep: React.FC<ResultStepProps> = ({ code, onStartOver }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview');
  const [editableCode, setEditableCode] = useState<GeneratedCode>(code);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCodeChange = (language: keyof GeneratedCode, newCode: string) => {
    setEditableCode(prev => ({ ...prev, [language]: newCode }));
  };
  
  const websiteSource = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Generated Website</title>
      <style>${editableCode.css}</style>
    </head>
    <body>
      ${editableCode.html}
      <script>${editableCode.js}</script>
    </body>
    </html>
  `;

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (fileType: 'html' | 'css' | 'js') => {
    setIsDownloadOpen(false);
    switch (fileType) {
      case 'html':
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${code.html.match(/<title>(.*?)<\/title>/)?.[1] || 'Generated Website'}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  ${editableCode.html}
  <script src="script.js"></script>
</body>
</html>`;
        downloadFile('index.html', fullHtml.trim(), 'text/html');
        break;
      case 'css':
        downloadFile('style.css', editableCode.css, 'text/css');
        break;
      case 'js':
        downloadFile('script.js', editableCode.js, 'text/javascript');
        break;
    }
  };


  const TabButton: React.FC<{ tabName: ActiveTab; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        activeTab === tabName
          ? 'bg-purple-600 text-white'
          : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto h-[90vh] flex flex-col bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-gray-900/50 border-b border-gray-700">
        <h2 className="text-xl font-bold">Your Generated Website</h2>
        <div className="flex items-center space-x-4">
          <div className="relative" ref={downloadRef}>
            <button
              onClick={() => setIsDownloadOpen(prev => !prev)}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              <DownloadIcon />
              Download Code
            </button>
            {isDownloadOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-20 overflow-hidden">
                <ul className="text-gray-200 text-sm">
                  <li onClick={() => handleDownload('html')} className="px-4 py-2 hover:bg-gray-600 cursor-pointer">index.html</li>
                  <li onClick={() => handleDownload('css')} className="px-4 py-2 hover:bg-gray-600 cursor-pointer">style.css</li>
                  <li onClick={() => handleDownload('js')} className="px-4 py-2 hover:bg-gray-600 cursor-pointer">script.js</li>
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={onStartOver}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Start Over
          </button>
        </div>
      </header>

      <div className="p-4 border-b border-gray-700 flex space-x-2">
        <TabButton tabName="preview" label="Preview" />
        <TabButton tabName="images" label="Images" />
        <TabButton tabName="html" label="HTML" />
        <TabButton tabName="css" label="CSS" />
        <TabButton tabName="js" label="JavaScript" />
      </div>

      <main className="flex-grow overflow-auto">
        {activeTab === 'preview' && (
          <iframe
            srcDoc={websiteSource}
            title="Generated Website Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        {activeTab === 'images' && <ImageEditor html={editableCode.html} onHtmlChange={(newHtml) => handleCodeChange('html', newHtml)} />}
        {activeTab === 'html' && <CodeBlock code={editableCode.html} language="html" onCodeChange={(newCode) => handleCodeChange('html', newCode)} />}
        {activeTab === 'css' && <CodeBlock code={editableCode.css} language="css" onCodeChange={(newCode) => handleCodeChange('css', newCode)} />}
        {activeTab === 'js' && <CodeBlock code={editableCode.js} language="javascript" onCodeChange={(newCode) => handleCodeChange('js', newCode)} />}
      </main>
    </div>
  );
};

export default ResultStep;