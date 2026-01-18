
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, ClassLevel, Group } from "./types";

const SYSTEM_INSTRUCTION = `
# Identity (ULTRA-STRICT)
- You are ONLY 'সাঈদ এআই' (Saiyed AI). 
- If someone asks "Who made you?", "Who are you?", or "What model are you?", you MUST answer: "আমি সাঈদ এআই, আপনার পার্সোনাল লার্নিং টিউটর। আমাকে তৈরি করেছে সাঈদ (হাটহাজারী কলেজ)।"
- NEVER mention: Google, Gemini, OpenAI, or ChatGPT.
- Your technology: "সাঈদ এআই-এর নিজস্ব ল্যাঙ্গুয়েজ ইঞ্জিন।"

# Teaching Rules
- First response must be: "সালাম/নমস্কার! {Subject} এর ক্লাসে আপনাকে স্বাগতম। আমি সাঈদ এআই।"
- Explain like a teacher from Bangladesh using simple Bangla.
- For Math/Science, use step-by-step logic.
- End long messages with an encouraging quote.
`;

const MODEL_NAME = 'gemini-3-flash-preview';

// Netlify-তে এপিআই কি ব্যবহারের জন্য ফাংশন
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please set it in Netlify Environment Variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getTutorResponseStream = async (
  prompt: string, 
  context: { classLevel?: ClassLevel, group?: Group, subject?: Subject },
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  image: string | undefined,
  onChunk: (text: string) => void
) => {
  try {
    const ai = getAIInstance();
    const currentParts: any[] = [];
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }
    
    currentParts.push({ text: `[Context: ${context.subject}, ${context.classLevel}] ${prompt} \n\n[FOOTER] Add 3 topics after [SUGGESTIONS] using | separator.` });

    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [...history, { role: 'user', parts: currentParts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      fullText += chunk.text;
      onChunk(fullText);
    }
    return fullText;
  } catch (error: any) {
    onChunk(`সার্ভার সংযোগে সমস্যা হচ্ছে। আপনার নেটলিফাই সেটিংস-এ API_KEY ঠিকমতো সেট করা আছে কি না চেক করুন। - সাঈদ এআই`);
    return "";
  }
};

export const generateMCQs = async (subject: Subject) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate 5 MCQs for ${subject}.`,
    config: { 
      systemInstruction: "You are 'সাঈদ এআই প্রশ্নকর্তা'. Generate JSON MCQs for Bangladeshi curriculum.", 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn') => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Translate and analyze line-by-line: "${text}" (${direction}).`,
    config: {
      systemInstruction: "You are 'সাঈদ এআই ট্রান্সলেটর'. Return line-by-line analysis in JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                translated: { type: Type.STRING },
                explanation: { type: Type.STRING },
                grammarAnalysis: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { word: { type: Type.STRING }, pos: { type: Type.STRING }, explanation: { type: Type.STRING } } 
                  } 
                }
              }
            }
          },
          relatedSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getStudyPlan = async (topics: string[]) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Study plan for: ${topics.join(',')}`,
    config: { 
      systemInstruction: "You are 'সাঈদ এআই মেন্টর'. Create a study routine in JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
          weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextStudy: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getRecentEvents = async (type: 'bn' | 'en') => {
  const ai = getAIInstance();
  const prompt = type === 'bn' ? "আজকের সর্বশেষ সংবাদ রিপোর্ট করুন।" : "Report latest news from Bangladesh.";
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return {
    text: response.text || "",
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
