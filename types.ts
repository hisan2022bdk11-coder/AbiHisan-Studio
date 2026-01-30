
export interface UploadedImage {
  file: File;
  preview: string;
  base64: string;
}

export type TabType = 'product' | 'merge';

export interface GeminiResponse {
  imageUrl?: string;
  text?: string;
  error?: string;
}
