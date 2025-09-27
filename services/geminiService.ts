import { GoogleGenAI, Type } from "@google/genai";
import { LyricLine } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const parseJsonWithFixes = (jsonString: string): any => {
    try {
        // First attempt to parse directly
        return JSON.parse(jsonString);
    } catch (e) {
        // If it fails, try to clean up the string
        console.warn("Initial JSON parsing failed, attempting to clean string.", e);
        // Remove markdown backticks and "json" label
        const cleanedString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleanedString);
        } catch (finalError) {
            console.error("Failed to parse JSON even after cleaning:", finalError);
            throw new Error("Invalid JSON response from API.");
        }
    }
};

export const generateLyricsFromMedia = async (mediaFile: File): Promise<LyricLine[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const audioPart = await fileToGenerativePart(mediaFile);

    const prompt = "Analyze the provided audio or video file. Transcribe the lyrics and provide timestamps for each line. Return the result as a JSON array where each object has 'id', 'text', 'startTime', and 'endTime' properties.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: prompt },
                    audioPart
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            text: { type: Type.STRING },
                            startTime: { type: Type.NUMBER },
                            endTime: { type: Type.NUMBER },
                        },
                        required: ["id", "text", "startTime", "endTime"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsedLyrics = parseJsonWithFixes(jsonText);

        if (!Array.isArray(parsedLyrics)) {
             throw new Error("Parsed response is not an array.");
        }

        return parsedLyrics.map((item: any, index: number) => ({
            id: item.id || index + 1,
            text: item.text || '',
            startTime: item.startTime || 0,
            endTime: item.endTime || 0,
        }));
    } catch (error) {
        console.error("Error generating lyrics with Gemini:", error);
        throw error;
    }
};

export const generateCreativeLyrics = async (prompt: string): Promise<LyricLine[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are a world-class songwriter. Write a complete song based on the provided theme. The song should have a clear structure, like verses and a chorus.
Respond with ONLY a valid JSON array of objects.
Each object must represent a line of lyrics and must have these properties: 'id' (a unique number), 'text' (the lyric line as a string), 'startTime' (number), and 'endTime' (number).
Calculate start and end times sequentially. Assume each line is displayed for around 4 seconds, with a 0.5-second gap between lines. Start the first line at time 0.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Theme: "${prompt}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            text: { type: Type.STRING },
                            startTime: { type: Type.NUMBER },
                            endTime: { type: Type.NUMBER },
                        },
                        required: ["id", "text", "startTime", "endTime"],
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        const parsedLyrics = parseJsonWithFixes(jsonText);

        if (!Array.isArray(parsedLyrics)) {
             throw new Error("Parsed response is not an array.");
        }

        return parsedLyrics.map((item: any, index: number) => ({
            id: item.id || index + 1,
            text: item.text || '',
            startTime: item.startTime || 0,
            endTime: item.endTime || 0,
        }));
    } catch (error) {
        console.error("Error generating creative lyrics with Gemini:", error);
        throw error;
    }
};
