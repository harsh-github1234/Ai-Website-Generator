export interface FormData {
  businessName: string;
  businessType: string;
  businessDescription: string;
  targetAudience: string;
  services: string;
  style: string;
  colorScheme: string;
}

export interface GeneratedCode {
  html: string;
  css: string;
  js: string;
}

export interface Suggestions {
  businessDescription: string;
  targetAudience: string;
  services: string;
}
