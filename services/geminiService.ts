import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { FormData, GeneratedCode, Suggestions } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Schema for the main website generation
const websiteSchema = {
  type: Type.OBJECT,
  properties: {
    html: {
      type: Type.STRING,
      description: "The complete HTML structure for the website as a single string, including a hero, about, services, and contact section. Use AI Image Prompts in the format `src=\"[AI_IMAGE_PROMPT: descriptive prompt]\"` for all images.",
    },
    css: {
      type: Type.STRING,
      description: "All the CSS code to be placed in a <style> tag, as a single string. It must be modern, responsive, and visually appealing.",
    },
    js: {
      type: Type.STRING,
      description: "All the JavaScript code for interactivity (like mobile menu, smooth scroll) to be placed in a <script> tag, as a single string.",
    },
  },
  required: ['html', 'css', 'js'],
};

// Schema for the AI-powered suggestions
const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        businessDescription: { type: Type.STRING, description: 'A compelling 1-2 sentence description of the business.' },
        targetAudience: { type: Type.STRING, description: 'A description of the ideal customer or target market.' },
        services: { type: Type.STRING, description: 'A comma-separated list of 3-5 key services or products offered.' },
    },
    required: ['businessDescription', 'targetAudience', 'services'],
};


export const generateSuggestions = async (businessName: string, businessType: string): Promise<Suggestions> => {
    const prompt = `
        You are an expert business consultant and marketing copywriter.
        Based on the provided business name and type, generate concise and professional suggestions for the business description, target audience, and key services.

        Business Name: "${businessName}"
        Business Type: "${businessType}"

        Provide a compelling 1-2 sentence description.
        Describe the specific target audience.
        List 3-5 key services or products as a comma-separated string.

        Return the response as a single JSON object matching the required schema.
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
                temperature: 0.7,
            },
        });
        
        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);

        if (parsed && typeof parsed.businessDescription === 'string' && typeof parsed.targetAudience === 'string' && typeof parsed.services === 'string') {
            return parsed as Suggestions;
        } else {
            throw new Error("AI suggestion response did not match the expected format.");
        }

    } catch (error) {
        console.error("Error generating suggestions:", error);
        throw new Error("Failed to generate suggestions from Gemini API.");
    }
};

const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
        return imageUrl;
      }
    }
    throw new Error('Image data not found in AI response.');
  } catch (error) {
    console.error(`Error generating image for prompt "${prompt}":`, error);
    // Return a fallback placeholder image URL on error. This is better than breaking the whole site.
    return `https://placehold.co/1600x900/1f2937/7f8ea3?text=Image+Generation+Failed`;
  }
};


export const generateWebsiteCode = async (formData: FormData): Promise<GeneratedCode> => {
  const prompt = `
    You are an elite full-stack web developer and a world-class UI/UX designer. Your mission is to generate a complete, single-file, professional, and visually stunning website that is **highly tailored** to the business details provided. The result should look like a high-end, custom-designed website.

    **Business Details:**
    - **Name:** ${formData.businessName}
    - **Type:** ${formData.businessType}
    - **Description:** ${formData.businessDescription}
    - **Target Audience:** ${formData.targetAudience}
    - **Key Services/Products:** ${formData.services}
    - **Desired Tone/Style:** ${formData.style}
    - **Color Scheme Preference:** ${formData.colorScheme}

    **CRITICAL REQUIREMENTS:**

    1.  **Content Specificity:**
        - The website's text (headings, paragraphs, CTAs) must be **deeply personalized** based on the business details. Do not use generic placeholder text.
        - Act as a professional copywriter. Weave the business name, services, and target audience into compelling marketing copy throughout the site.

    2.  **AI-Generated Imagery (VERY IMPORTANT):**
        - You **MUST** generate descriptive prompts for AI image generation and place them inside the 'src' attribute of image tags using a specific placeholder format.
        - The format is: \`src="[AI_IMAGE_PROMPT: Your descriptive image prompt here]"\`.
        - The image prompt inside the placeholder **MUST** be highly descriptive and directly relevant to the business section (e.g., hero, about, services).
        - **Example:** For a 'Tech Startup' hero image, a valid placeholder would be \`<img src="[AI_IMAGE_PROMPT: a vibrant, abstract visualization of neural networks and data streams, in shades of blue and purple]" alt="AI Solutions">\`.
        - **DO NOT** use any other image URLs or sources. Every \`<img>\` tag must use this placeholder format in its \`src\` attribute. Create at least 3 distinct images for different sections.
        - Additionally, you **MUST** add a unique ID to each of these image tags, in the format \`id="ai-image-0"\`, \`id="ai-image-1"\`, etc. This allows the user to replace them later.

    3.  **No Maps:**
        - The "Contact Us" section **MUST NOT** include an embedded map or a physical address.
        - It should contain a functional contact form (with fields for Name, Email, Message) and placeholder contact details like \`(123) 456-7890\` and \`contact@${formData.businessName.toLowerCase().replace(/\s+/g, '')}.com\`.

    4.  **Structure & Code:**
        - Generate a single HTML file's content.
        - All CSS must be inside a \`<style>\` tag in the \`<head>\`. The design must be modern, fully responsive (mobile, tablet, desktop), and adhere to the requested style and color scheme. Use modern CSS like Flexbox and Grid. Pay attention to typography, spacing, and visual hierarchy.
        - All JavaScript for interactivity (e.g., mobile menu, smooth scrolling) must be inside a \`<script>\` tag before the closing \`</body>\` tag.
        - The website must include: Navigation Bar, Hero Section (with a strong call-to-action), About Us, Services/Products, Contact Form, and Footer.

    5.  **Final Output:**
        - The output must be a single, clean JSON object matching the provided schema.
        - Ensure there are no markdown backticks (\`\`\`) within the JSON string values.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Using a more powerful model for better quality
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: websiteSchema,
        temperature: 0.7,
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    if (parsed && typeof parsed.html === 'string' && typeof parsed.css === 'string' && typeof parsed.js === 'string') {
        let htmlContent = parsed.html;
        // Regex to find all image prompt placeholders
        const imagePromptRegex = /src="\[AI_IMAGE_PROMPT: (.*?)]"/g;
        const matches = [...htmlContent.matchAll(imagePromptRegex)];

        if (matches.length > 0) {
            // Generate all images concurrently
            const imagePromises = matches.map(match => {
                const imagePromptText = match[1];
                return generateImage(imagePromptText);
            });

            const generatedImageUrls = await Promise.all(imagePromises);

            // Replace each placeholder with the corresponding generated image URL
            let imageIndex = 0;
            htmlContent = htmlContent.replace(imagePromptRegex, () => {
                const imageUrl = generatedImageUrls[imageIndex];
                imageIndex++;
                return `src="${imageUrl}"`;
            });
        }
        
        // Return the final code with embedded images
        return {
            html: htmlContent,
            css: parsed.css,
            js: parsed.js,
        };
    } else {
        throw new Error("AI response did not match the expected format.");
    }

  } catch (error) {
    console.error("Error generating website code:", error);
    throw new Error("Failed to generate website code from Gemini API.");
  }
};