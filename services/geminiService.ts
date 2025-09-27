import { GoogleGenAI, GenerateContentResponse, Chat, Modality, Type, FunctionDeclaration, Part } from "@google/genai";
import { Message } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Image Generation
export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Video Generation
export const generateVideo = async (prompt: string): Promise<string> => {
    try {
        const fullPromptWithAudio = `${prompt}, with sound effects and audio`;
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: fullPromptWithAudio,
            config: {
                numberOfVideos: 1,
            },
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }
        
        // The API key must be appended to the download link
        const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }
        
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error("Error generating video:", error);
        throw error;
    }
};


// Image Editing
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<{imageUrl: string, text: string}> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

    let imageUrl = '';
    let text = '';
    
    if(response.candidates && response.candidates[0].content.parts){
      for (const part of response.candidates[0].content.parts) {
          if (part.text) {
              text = part.text;
          } else if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              const imageMimeType = part.inlineData.mimeType;
              imageUrl = `data:${imageMimeType};base64,${base64ImageBytes}`;
          }
      }
    }

    if(!imageUrl) throw new Error("No image was returned from the editor.");
    
    return { imageUrl, text };
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

// FIX: Add and export the missing `generateImageVariations` function to resolve an import error in `pages/VariationsGeneratorPage.tsx`.
export const generateImageVariations = async (base64ImageData: string, mimeType: string, prompt: string, count: number): Promise<string[]> => {
    try {
        const fullPrompt = prompt ? `Generate a variation of this image with these changes: ${prompt}` : 'Generate a variation of this image.';
        const promises: Promise<GenerateContentResponse>[] = [];

        for (let i = 0; i < count; i++) {
            promises.push(ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: {
                    parts: [
                        { inlineData: { data: base64ImageData, mimeType } },
                        { text: fullPrompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            }));
        }

        const responses = await Promise.all(promises);

        const imageUrls = responses.map(response => {
            if (response.candidates && response.candidates[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes: string = part.inlineData.data;
                        const imageMimeType = part.inlineData.mimeType;
                        return `data:${imageMimeType};base64,${base64ImageBytes}`;
                    }
                }
            }
            return null;
        }).filter((url): url is string => url !== null);

        if (imageUrls.length === 0) {
            throw new Error("No image variations were generated.");
        }

        return imageUrls;
    } catch (error) {
        console.error("Error generating image variations:", error);
        throw error;
    }
};

// Web App Generation
export const generateWebAppCode = async (prompt: string, generationInstruction: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${generationInstruction}: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        html: { type: Type.STRING },
                    },
                    required: ["html"],
                },
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        return result.html;
    } catch (error) {
        console.error("Error generating web app code:", error);
        throw error;
    }
};

// AI Chat
let chat: Chat | null = null;

export const startChat = (systemInstruction: string) => {
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const sendMessageToChat = async (message: string, onChunk: (chunk: string) => void): Promise<void> => {
  if (!chat) {
    // Fallback in case chat is not initialized
    startChat('You are a helpful AI assistant.');
  }
  if (chat) {
    try {
        const responseStream = await chat.sendMessageStream({ message });
        for await (const chunk of responseStream) {
            if (chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error) {
        console.error("Error sending message to chat:", error);
        throw error;
    }
  }
};