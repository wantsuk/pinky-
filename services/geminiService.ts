
import { GoogleGenAI, Type } from "@google/genai";

export const getFortune = async (reels: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player just spun the slot machine and got these emojis: ${reels.join(', ')}. Give them a cute, sassy, or mystical fortune prediction in one or two short sentences.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: {
              type: Type.STRING,
              description: 'A cute or sassy fortune telling message based on the slot results.'
            },
            luckyNumber: {
              type: Type.INTEGER,
              description: 'A random lucky number for the user.'
            }
          },
          propertyOrdering: ["prediction", "luckyNumber"],
          required: ["prediction", "luckyNumber"]
        }
      }
    });

    const text = response.text?.trim();
    if (!text) {
      return { prediction: "The stars are fuzzy today.", luckyNumber: 7 };
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { prediction: "My crystal ball is pink and blurry right now!", luckyNumber: Math.floor(Math.random() * 100) };
  }
};
