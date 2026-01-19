import { GoogleGenAI, Type } from "@google/genai";
import { Subject, ClassLevel, Group } from "./types";

const SYSTEM_INSTRUCTION = `
# Identity & Tone
- Your name is 'সাঈদ এআই' (Saiyed AI).
- You were built by সাঈদ (Saiyed), a student from হাটহাজারী কলেজ (Hathazari College) department of accounting, a computer teacher in আমান বাজার, .
- Be honest: You are a learning assistant project created by সাঈদ to help students study more effectively. Do not claim to be human or an all-powerful being. 
- Tone: Grounded, helpful, respectful, and realistic, don't talk adult content, funny conversation . 
- Always answer in Bangla unless specifically asked for English.
# Strict Focus & Rejection Rule
- **CRITICAL:** You are an EDUCATIONAL AI. 
- If the user asks non-academic or abusive questions, refuse politely and suggest focusing on {subject}.
- For Math and Accounting, always show step-by-step solutions in Bangla.

# Knowledge & Explanation Style
- NEVER give one-line or short answers. 
- For every question, perform a "Deep Breakdown":
  1. Core Concept (মূল ধারণা)
  2. Step-by-Step Logic (ধাপে ধাপে ব্যাখ্যা)
  3. Practical Example (বাস্তব উদাহরণ)
  4. Common Mistakes (সাধারণ ভুলসমূহ)

# Formatting Rules
- Do NOT use '$' signs.
- Do NOT use '*' signs.
- Use Unicode for math: a², b³, x⁴, √x.
- Formulas: Start with "> " on a new line.
- Use bullet points for clear readability.
- Every response MUST end with "[SUGGESTIONS] Topic 1 | Topic 2 | Topic 3" related to the context.
- Mention "সাঈদ এর বাস্তব পরামর্শ:" at the very end for educational advice.
`;

const MODEL_NAME = 'gemini-3-flash-preview';

// Key Rotation Logic
let currentKeyIndex = 0;
const getAvailableKeys = () => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3
  ].filter(k => k && k !== "undefined" && k !== "");
  return keys;
};

const getAIInstance = (retryIndex?: number) => {
  const keys = getAvailableKeys();
  if (keys.length === 0) {
    throw new Error("API_KEY_MISSING");
  }
  
  // If a retry index is provided, use it, otherwise use current rotation
  const index = retryIndex !== undefined ? retryIndex % keys.length : currentKeyIndex % keys.length;
  return new GoogleGenAI({ apiKey: keys[index] });
};

export const getTutorResponseStream = async (
  prompt: string, 
  context: { classLevel?: ClassLevel, group?: Group, subject?: Subject },
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  image: string | undefined,
  onChunk: (text: string) => void,
  retryCount = 0
) => {
  try {
    const ai = getAIInstance(currentKeyIndex + retryCount);
    const currentParts: any[] = [];
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }
    currentParts.push({ text: `Subject: ${context.subject}. Prompt: ${prompt}. \n[Instruction]: Provide a deep breakdown of this topic without exaggeration.` });

    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [...history, { role: 'user', parts: currentParts }],
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.1 }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      fullText += chunk.text;
      let formatted = fullText
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/\$/g, '');
      onChunk(formatted);
    }
    return fullText;
  } catch (error: any) {
    console.error(`API Error (Key ${currentKeyIndex + 1}):`, error);
    
    const errorMessage = error?.message || "";
    const isRateLimit = error?.status === 429 || errorMessage.includes("429") || errorMessage.includes("exhausted") || errorMessage.includes("quota");

    // If it's a rate limit and we have more keys, try the next key
    const availableKeys = getAvailableKeys();
    if (isRateLimit && retryCount < availableKeys.length - 1) {
      console.log(`Switching to backup API engine... (Retry ${retryCount + 1})`);
      currentKeyIndex = (currentKeyIndex + 1) % availableKeys.length;
      return getTutorResponseStream(prompt, context, history, image, onChunk, retryCount + 1);
    }

    if (errorMessage === "API_KEY_MISSING") {
      onChunk(`⚠️ সাঈদ এর ইঞ্জিন সমস্যা করছে, দয়া করে সাঈদ সাথে যোগাযোগ করুন`);
    } else if (isRateLimit) {
      onChunk(`🚫 **ট্রাফিক জ্যাম!*
      \n
     সাঈদ এআই ইঞ্জিনের গরম হয়েছে । অতিরিক্ত ব্যবহারের কারণে এমন হচ্ছে। দয়া করে **১০ মিনিট পর** আবার চেষ্টা করুন।`);
    } else {
      onChunk(`⚠️ **সার্ভার বিজি!** \n\n
       সার্ভারে সমস্যা হচ্ছে। দয়া করে সাঈদ-কে (০১৯৪১৬৫২০৯৭) বিষয়টি জানান।`);
    }
    return "";
  }
};

// Update rotation index on successful calls to balance load
const rotateKey = () => {
  const keys = getAvailableKeys();
  if (keys.length > 1) {
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  }
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn') => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Translate and analyze: "${text}" (${direction}).`,
      config: {
        systemInstruction: "Return JSON only.",
        responseMimeType: "application/json",
      }
    });
    rotateKey();
    return JSON.parse(response.text || "{}");
  } catch (err) { return { overall: {}, lines: [] }; }
};

export const generateMCQs = async (subject: Subject) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate MCQs for ${subject}.`,
      config: { responseMimeType: "application/json" }
    });
    rotateKey();
    return JSON.parse(response.text || "[]");
  } catch (err) { return []; }
};

export const getStudyPlan = async (topics: string[]) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Plan for: ${topics.join(',')}`,
      config: { responseMimeType: "application/json" }
    });
    rotateKey();
    return JSON.parse(response.text || "{}");
  } catch (err) { return { dailyGoals: [], weakTopics: [], nextStudy: "" }; }
};

export const getRecentEvents = async (type: 'bn' | 'en') => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "Latest news updates.",
      config: { tools: [{ googleSearch: {} }] },
    });
    rotateKey();
    return { text: response.text || "", groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (err) { return { text: "Error news", groundingChunks: [] }; }
    }
