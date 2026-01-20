
import { GoogleGenAI } from "@google/genai";
import { Subject, ClassLevel, Group, ChatMessage, AppUser, TutorContext } from "./types";

/**
 * এপিআই কী রোটেশন লজিক
 * এটি ৪টি কী থেকে একটি সক্রিয় কী খুঁজে বের করবে যাতে একটির লিমিট শেষ হলে অন্যটি কাজ করে।
 */
const getActiveApiKey = () => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4
  ].filter(k => k && k.length > 10);

  if (keys.length === 0) return "";

  //  (Load Balancing)
  const index = Math.floor(Date.now() / 60000) % keys.length;
  return keys[index];
};

const getSystemInstruction = (user?: AppUser | null) => {
  return `
# Identity
- Your name is 'সাঈদ এআই' (Saiyed AI).
- Creator: সাঈদ (Saiyed), student of Hathazari College, Department of accounting and a computer teacher.

- Persona: Expert academic tutor for Bangladeshi students (NCTB curriculum).
- Language: ALWAYS explain in Bangla unless asked for English.
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
- if user asks or comment abusive about Saiyed then warning the user and say your all activities are sending to saiyed.
# Structure of Output
- Use bold text and large font size for headings.
- Use beautiful bullet list example.
- do not use $ and * symbol for define bulet list and after evry bullet list keep line break.  
- Use bullet points for steps.
- If the answer is long, provide a "Summary" at the end.

# Guidelines
- Follow NCTB standards for Class 5 to University levels.
- For Science/Math: Use step-by-step logic.
- For Business/Arts: Use analytical and case-based explanations.

# Formatting
- For Math/Formulas: ALWAYS wrap in double dollar signs: $$ E = mc^2 $$.
- Keep the tone helpful, encouraging, and highly academic yet easy to understand.
`;
};

// সাধারণ এরর মেসেজ হ্যান্ডলার
const handleGenericError = (error: any): string => {
  const msg = error?.message?.toLowerCase() || "";
  if (msg.includes("quota") || msg.includes("429") || msg.includes("exhausted")) {
    return "⚠️ ইঞ্জিন একটু বেশি গরম হয়ে গেছে! ১ মিনিট বিশ্রাম নিয়ে আবার ট্রাই করুন।";
  }
  if (msg.includes("key") || msg.includes("auth") || msg.includes("invalid")) {
    return "⚠️ সার্ভারে সংযোগ পেতে সমস্যা হচ্ছে। এডমিনকে জানান।";
  }
  return "⚠️ সার্ভারে কিছুটা সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
};

export const getTutorResponseStream = async (
  prompt: string, 
  context: TutorContext,
  history: {role: 'user' | 'model', parts: {text: string}[]}[],
  image: string | undefined,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const key = getActiveApiKey();
    if (!key) {
      onChunk("⚠️ সার্ভার কানেকশন পাওয়া যাচ্ছে না।");
      return "";
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    const currentParts: any[] = [];
    if (image) {
      const base64Data = image.includes(',') ? image.split(',')[1] : image;
      currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }
    
    const contextPrompt = `
Context: Subject: ${context.subject}, Level: ${context.classLevel}, Group: ${context.group}.
User Name: ${context.user?.name || 'শিক্ষার্থী'}.
Question: ${prompt}
`;
    currentParts.push({ text: contextPrompt });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: currentParts }],
      config: { 
        systemInstruction: getSystemInstruction(context.user),
        temperature: 0.15,
        topP: 0.95,
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      const chunkText = chunk.text || "";
      fullText += chunkText;
      onChunk(fullText);
    }
    return fullText;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    onChunk(handleGenericError(error));
    return "";
  }
};

export const generateMCQs = async (subject: Subject): Promise<any[]> => {
  try {
    const key = getActiveApiKey();
    if (!key) return [];
    
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 high-quality MCQs for ${subject} based on NCTB curriculum. Return as JSON array with: question, options (4 strings), correctAnswer (index 0-3), explanation (Bangla), topic.`,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: getSystemInstruction()
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("MCQ Error", e);
    return [];
  }
};

export const getStudyPlan = async (topics: string[]): Promise<any> => {
  try {
    const key = getActiveApiKey();
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a professional study plan for these topics: ${topics.join(',')}. Focus on weak areas.`,
      config: { 
        responseMimeType: "application/json",
        systemInstruction: getSystemInstruction() + "\nReturn JSON: {dailyGoals: [], weakTopics: [], nextStudy: ''}. All in Bangla."
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn'): Promise<any> => {
  try {
    const key = getActiveApiKey();
    if (!key) return null;

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate and analyze: "${text}" (${direction}).`,
      config: {
        systemInstruction: "You are a language expert. Return JSON: {overall: {literal: '', contextual: '', professional: ''}, lines: [{original: '', translated: '', explanation: ''}]}. Everything in Bangla.",
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};

export const getRecentEvents = async (type: 'bn' | 'en'): Promise<{ text: string; groundingChunks: any[] }> => {
  try {
    const key = getActiveApiKey();
    if (!key) return { text: "সার্ভার সমস্যা।", groundingChunks: [] };

    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: type === 'bn' ? "আজকের বাংলাদেশের প্রধান ৫টি সংবাদ দিন।" : "Give me top 5 world news for today.",
      config: { 
        tools: [{ googleSearch: {} }],
        systemInstruction: getSystemInstruction() 
      },
    });
    return { 
      text: response.text || "", 
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  } catch (e) {
    return { text: "খবর লোড করা যাচ্ছে না, ইঞ্জিন একটু গরম হয়ে গেছে!", groundingChunks: [] };
  }
};
