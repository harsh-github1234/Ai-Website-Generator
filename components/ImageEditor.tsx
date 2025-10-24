import React, { useState, useEffect, useRef } from 'react';

// Define the structure for a parsed image
interface ParsedImage {
  id: string;
  src: string;
  alt: string;
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);


const ImageEditor: React.FC<{ html: string; onHtmlChange: (newHtml: string) => void; }> = ({ html, onHtmlChange }) => {
  const [images, setImages] = useState<ParsedImage[]>([]);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const imageNodes = doc.querySelectorAll('img[id^="ai-image-"]');
      const parsedImages: ParsedImage[] = Array.from(imageNodes).map(node => ({
        id: node.id,
        src: (node as HTMLImageElement).src,
        alt: (node as HTMLImageElement).alt,
      }));
      setImages(parsedImages);
    } catch (error) {
        console.error("Failed to parse HTML for image editing:", error);
        setImages([]);
    }
  }, [html]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, imageId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newSrc = await fileToBase64(file);
      // Use a precise regex to replace only the src attribute of the specific image tag
      const regex = new RegExp(`(<img[^>]*id="${imageId}"[^>]*src=")[^"]*(".*?>)`, 'i');
      if (regex.test(html)) {
          const newHtml = html.replace(regex, `$1${newSrc}$2`);
          onHtmlChange(newHtml);
      } else {
        console.warn(`Could not find image with id="${imageId}" to replace src.`);
      }
    } catch (error) {
      console.error("Error processing file upload:", error);
    }
  };

  const triggerFileInput = (imageId: string) => {
    fileInputRefs.current[imageId]?.click();
  };

  if (images.length === 0) {
    return (
        <div className="p-8 text-center text-gray-400">
            <h3 className="text-xl font-semibold">No Editable Images Found</h3>
            <p className="mt-2">The AI did not generate images with editable IDs in the format `id="ai-image-..."`.</p>
        </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-2">Customize Website Images</h2>
        <p className="text-gray-400 mb-6">Replace the AI-generated images with your own by uploading new files.</p>
        <div className="space-y-6">
          {images.map(image => (
            <div key={image.id} className="bg-gray-800 p-4 rounded-lg flex items-center gap-6 border border-gray-700">
              <div className="flex-shrink-0">
                <img src={image.src} alt={image.alt} className="w-40 h-24 object-cover rounded-md bg-gray-700" />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-semibold text-gray-300">Alt Text: <span className="font-normal text-gray-400">"{image.alt}"</span></p>
                <p className="text-sm font-semibold text-gray-300">ID: <span className="font-mono text-xs bg-gray-700 text-purple-300 py-0.5 px-1.5 rounded">{image.id}</span></p>
              </div>
              <div className="flex-shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  ref={el => (fileInputRefs.current[image.id] = el)}
                  onChange={(e) => handleFileChange(e, image.id)}
                  className="hidden"
                />
                <button
                  onClick={() => triggerFileInput(image.id)}
                  className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    <UploadIcon />
                    Replace
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
