
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
  // Randomly select one to distribute load
  return keys[Math.floor(Math.random() * keys.length)];
};

const getSystemInstruction = (user?: AppUser | null) => {
  const interests = user?.interests?.length ? user.interests.join(", ") : "সাধারণ শিক্ষা";
  
  return `

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

# User Profile
- User Name: ${user?.name || "শিক্ষার্থী"}
- Use the user's name to make the conversation feel personal.
- User Interests (General Context): ${interests}
- NOTE: This is primarily an educational app. Prioritize accurate, curriculum-based teaching (NCTB and University standards). 
- Avoid drifting into user interests unless you are using them as a specific analogy to help explain a complex academic concept.

# Knowledge & Rules
- Provide deeply analytical breakdowns for all topics.
- When writing mathematical formulas or definitions, always put them on a SEPARATE NEW LINE without extra text.
- Use Unicode symbols: a², b³, √x, ∑, ∫.

# Formatting Rules (STRICT)
- Use '###' for main titles.
- Use '**text**' to highlight keywords.
- Use '*' for bullet points.
- Do NOT use markdown code blocks or custom boxes; the UI handles this automatically.
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
    currentParts.push({ text: `Subject: ${context.subject}. Prompt: ${prompt}.` });

    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [...history, { role: 'user', parts: currentParts }],
      config: { systemInstruction: getSystemInstruction(context.user), temperature: 0.1 }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      fullText += chunk.text || "";
      let formatted = fullText.replace(/\^2/g, '²').replace(/\^3/g, '³').replace(/\$/g, '');
      onChunk(formatted);
    }
    return fullText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    onChunk("⚠️ ইঞ্জিন ওভারলোড হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।");
    return "";
  }
};

export const generateMCQs = async (subject: Subject): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate 5 high-quality MCQs for ${subject} with question, options, correctAnswer (index), and explanation.`,
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
    contents: `Create study plan for: ${topics.join(',')}`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: getSystemInstruction() + "\nReturn JSON with dailyGoals, weakTopics, nextStudy."
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn'): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Analyze: "${text}" (${direction}).`,
    config: {
      systemInstruction: getSystemInstruction() + "\nReturn JSON with overall and lines fields.",
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getRecentEvents = async (type: 'bn' | 'en'): Promise<{ text: string; groundingChunks: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: type === 'bn' ? "বাংলাদেশের আজকের প্রধান খবর।" : "Latest global news.",
    config: { tools: [{ googleSearch: {} }], systemInstruction: getSystemInstruction() },
  });
  return { 
    text: response.text || "", 
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
  };
};
            
