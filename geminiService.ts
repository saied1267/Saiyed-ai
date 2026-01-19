import { GoogleGenAI } from "@google/genai";
import { Subject, ClassLevel, Group, ChatMessage } from "./types";

const SYSTEM_INSTRUCTION = `
# Identity & Tone
- Your name is 'সাঈদ এআই' (Saiyed AI).
- You were built by সাঈদ (Saiyed), a brilliant student from হাটহাজারী কলেজ (Hathazari College) deperment of accounting, a computer teacher .
- Tone: Extremely helpful, polite, and like a friendly elder brother or tutor.
- Always answer in Bangla unless specifically asked for English.
# Knowledge & Explaination style
-never give one line or short answer
# Knowledge & Rules
- Provide "Deep Breakdowns, core cocept, examples" for every academic question. Never give one-word answers.
- Use Unicode characters for math: a², b³, x⁴, √x.
- If a student asks about Hathazari College, mention it with pride.
- Always encourage students to study hard and stay curious.
# Strict Focus & Rejection Rule
- **CRITICAL:** You are an EDUCATIONAL AI. 
- If the user asks non-academic or abusive questions, refuse politely and suggest focusing on {subject}.
- For Math and Accounting, always show step-by-step solutions in Bangla.
- if a students ask about 18+ or adult content then warning him very hard and don't answer this kind of question.
- if user asks or comment abusive about Saiyed then warning the user.
# Structure of Output
- Use bold text and large font size for headings.
- Use beautiful bullet list example.
- do not use $ and * symbol for define bulet list and after evry bullet list keep line break.  
- Use bullet points for steps.
- If the answer is long, provide a "Summary" at the end.
`;

const MODEL_NAME = 'gemini-3-flash-preview';

let currentKeyIndex = 0;

const getAvailableKeys = (): string[] => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4
    
  ].filter((k): k is string => !!k && k !== "undefined" && k !== "null" && k !== "");
  return keys;
};

// Helper to create a new instance with rotation support
const getAIInstance = (offset: number = 0): GoogleGenAI => {
  const keys = getAvailableKeys();
  if (keys.length === 0) throw new Error("API_KEY_MISSING");
  const index = (currentKeyIndex + offset) % keys.length;
  return new GoogleGenAI({ apiKey: keys[index] });
};

const callWithRetry = async (fn: (ai: GoogleGenAI) => Promise<any>, retryCount: number = 0): Promise<any> => {
  const availableKeys = getAvailableKeys();
  try {
    const ai = getAIInstance(retryCount);
    return await fn(ai);
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429");
    if (isRateLimit && retryCount < availableKeys.length - 1) {
      currentKeyIndex = (currentKeyIndex + 1) % availableKeys.length;
      return callWithRetry(fn, retryCount + 1);
    }
    throw error;
  }
};

export const getTutorResponseStream = async (
  prompt: string, 
  context: { classLevel?: ClassLevel, group?: Group, subject?: Subject },
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  image: string | undefined,
  onChunk: (text: string) => void,
  retryCount: number = 0
): Promise<string> => {
  const availableKeys = getAvailableKeys();
  try {
    const ai = getAIInstance(retryCount);
    const currentParts: any[] = [];
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }
    currentParts.push({ text: `Subject: ${context.subject}. Prompt: ${prompt}.` });

    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [...history, { role: 'user', parts: currentParts }],
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.1 }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      fullText += chunk.text || "";
      let formatted = fullText
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/\$/g, '');
      onChunk(formatted);
    }
    return fullText;
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || error?.message?.includes("429");
    if (isRateLimit && retryCount < availableKeys.length - 1) {
      currentKeyIndex = (currentKeyIndex + 1) % availableKeys.length;
      return getTutorResponseStream(prompt, context, history, image, onChunk, retryCount + 1);
    }
    onChunk("⚠️ দুঃখিত, ইঞ্জিন ওভারলোড হয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
    return "";
  }
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn'): Promise<any> => {
  return callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Translate and analyze: "${text}" (${direction}).`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\nReturn JSON only with 'overall' (literal, contextual, professional) and 'lines' (original, translated, explanation) fields.",
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  }).catch(() => ({ overall: {}, lines: [] }));
};

export const generateMCQs = async (subject: Subject): Promise<any[]> => {
  return callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate 5 high-quality MCQs for ${subject} with question, options, correctAnswer (index), and explanation.`,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION + "\nAlways return a JSON array of MCQ objects."
      }
    });
    return JSON.parse(response.text || "[]");
  }).catch(() => []);
};

export const getStudyPlan = async (topics: string[]): Promise<any> => {
  return callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a study plan for: ${topics.join(',')}`,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTION + "\nReturn JSON with dailyGoals (array), weakTopics (array), and nextStudy (string)."
      }
    });
    return JSON.parse(response.text || "{}");
  }).catch(() => ({ dailyGoals: [], weakTopics: [], nextStudy: "" }));
};

export const getRecentEvents = async (type: 'bn' | 'en'): Promise<{ text: string; groundingChunks: any[] }> => {
  return callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: type === 'bn' ? "বাংলাদেশের আজকের প্রধান খবরগুলো বিস্তারিত লিখুন।" : "Write latest global news updates.",
      config: { 
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION
      },
    });
    return { 
      text: response.text || "", 
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  }).catch(() => ({ text: "Error loading news", groundingChunks: [] }));
};
