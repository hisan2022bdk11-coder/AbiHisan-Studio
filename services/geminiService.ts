
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UploadedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fungsi pembungkus untuk menangani retry dengan Exponential Backoff
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || "";
      const isQuotaError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');
      
      if (isQuotaError && i < maxRetries - 1) {
        // Jeda meningkat: 1s, 2s, 4s (+ random jitter)
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Quota exceeded. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const callGeminiAI = async (
  prompt: string, 
  images: UploadedImage[], 
  modelName: string = 'gemini-2.5-flash-image'
): Promise<string> => {
  return withRetry(async () => {
    const imageParts = images.map(img => ({
      inlineData: {
        mimeType: img.file.type,
        data: img.base64,
      },
    }));

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: prompt },
          ...imageParts,
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("AI tidak memberikan respon (Candidate kosong).");
    
    // Safety check for content and parts
    if (!candidate.content || !candidate.content.parts) {
      const finishReason = (candidate as any).finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error("Respon diblokir oleh filter keamanan AI.");
      }
      throw new Error("Respon AI tidak mengandung data konten yang valid.");
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("AI tidak mengembalikan bagian gambar dalam respon.");
  });
};

/**
 * Menggunakan Gemini 3 Flash untuk memperbaiki dan memperluas prompt pengguna
 * agar menghasilkan gambar yang lebih berkualitas tinggi.
 */
export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
  if (!originalPrompt.trim()) return originalPrompt;

  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Transform this image generation prompt into a professional, highly detailed, and artistic version. 
        Keep the core intent but add details about lighting, texture, camera angle, and artistic style. 
        Respond ONLY with the enhanced prompt text, no explanations.
        
        Original Prompt: ${originalPrompt}`,
      });

      // text property handles content.parts internally in the SDK
      const enhancedText = response.text;
      return enhancedText?.trim() || originalPrompt;
    } catch (error) {
      console.error("Failed to enhance prompt:", error);
      return originalPrompt;
    }
  });
};
