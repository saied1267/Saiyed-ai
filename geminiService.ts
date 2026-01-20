
import { GoogleGenAI } from "@google/genai";
import { Subject, ClassLevel, Group, ChatMessage, AppUser, TutorContext } from "./types";

// API Key rotation helper
const getApiKey = () => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4
  ].filter(key => key && key.length > 10);
  
  if (keys.length === 0) return "";
  return keys[Math.floor(Math.random() * keys.length)];
};

const getSystemInstruction = (user?: AppUser | null) => {
  const interests = user?.interests?.length ? user.interests.join(", ") : "সাধারণ শিক্ষা";
  
  return `
# Identity & Tone
- Your name is 'সাঈদ এআই' (Saiyed AI).
- Creator: সাঈদ (Saiyed), a student of হাটহাজারী কলেজ (Hathazari College).
- Persona: An expert academic tutor who is incredibly supportive, clear, and analytical.
- Language: ALWAYS use Bangla for explanations unless specifically asked for English translation.
- Student Name: ${user?.name || "শিক্ষার্থী"}

# Mission
- Provide the best possible educational support for Bangladeshi students.
- Follow the NCTB curriculum where applicable.

# Structured Response Rules
1. Start with a warm greeting using the student's name if it's a new topic.
2. Break down complex topics into "ধাপ" (Steps) or "পয়েন্ট" (Points).
3. For Math/Science:
   - Always put formulas on a NEW LINE.
   - Use clear formatting like "সূত্র:", "সমাধান:".
4. Formatting:
   - Use '###' for Topic Titles.
   - Use '**text**' for highlighting crucial terms.
   - No markdown code blocks for normal text.

# Context
- User Interests: ${interests}. Use these sparingly for metaphors only.
- Focus exclusively on: ${user?.interests?.length ? "Academic learning balanced with interests" : "Academic Excellence"}.
`;
};

const MODEL_NAME = 'gemini-3-flash-preview';

export const getTutorResponseStream = async (
  prompt: string, 
  context: TutorContext,
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  image: string | undefined,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const currentParts: any[] = [];
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }
    currentParts.push({ text: `Subject: ${context.subject}. Level: ${context.classLevel}. Prompt: ${prompt}.` });

    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [...history, { role: 'user', parts: currentParts }],
      config: { systemInstruction: getSystemInstruction(context.user), temperature: 0.1 }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      fullText += chunk.text || "";
      // Clean up symbols for mobile readability
      let formatted = fullText.replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\$/g, '');
      onChunk(formatted);
    }
    return fullText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    onChunk("⚠️ ইঞ্জিন ওভারলোড হয়েছে। কিছুক্ষণ পর চেষ্টা করুন অথবা অন্য এপিআই কী ব্যবহার করুন।");
    return "";
  }
};

export const generateMCQs = async (subject: Subject): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate 5 high-quality MCQs for ${subject} based on NCTB standards with question, options, correctAnswer (index), and explanation in Bangla.`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: getSystemInstruction() + "\nReturn a JSON array."
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getStudyPlan = async (topics: string[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Create a professional study plan for: ${topics.join(',')}`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: getSystemInstruction() + "\nReturn JSON with dailyGoals, weakTopics, nextStudy in Bangla."
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn'): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Deep analyze translation for: "${text}" direction ${direction}.`,
    config: {
      systemInstruction: getSystemInstruction() + "\nReturn JSON with overall (literal, contextual, professional fields) and lines (original, translated, explanation fields) in Bangla.",
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getRecentEvents = async (type: 'bn' | 'en'): Promise<{ text: string; groundingChunks: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: type === 'bn' ? "বাংলাদেশের আজকের প্রধান খবরগুলোর সারসংক্ষেপ দিন।" : "Provide a summary of today's top global news.",
    config: { tools: [{ googleSearch: {} }], systemInstruction: getSystemInstruction() },
  });
  return { 
    text: response.text || "", 
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
  };
};
