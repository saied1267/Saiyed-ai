
import { GoogleGenAI } from "@google/genai";
import { Subject, ClassLevel, Group, ChatMessage, AppUser, TutorContext } from "./types";

const getApiKey = () => process.env.API_KEY || "";

const getSystemInstruction = (user?: AppUser | null) => {
  return `
# Identity
- Your name is 'সাঈদ এআই' (Saiyed AI).
- Creator: সাঈদ (Saiyed), student of Hathazari College.
- Persona: expert academic tutor for Bangladeshi students.
- Language: ALWAYS use Bangla for explanations.
- Follow NCTB (National Curriculum and Textbook Board) standards.

# Formatting Rules
- Use clear bullet points for steps.
- Use '###' for Topic Titles.
- **Bold** key academic terms.
- For Mathematics/Science:
  - ALWAYS put math formulas inside double dollar signs for display mode like $$ E = mc^2 $$ or single dollar sign for inline mode like $ x + y $.
  - Ensure complex steps are on separate lines.
- Keep responses encouraging, analytical, and easy to understand.
`;
};

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
    currentParts.push({ text: `Student Context: Subject=${context.subject}, Level=${context.classLevel}, Group=${context.group}. User Name: ${context.user?.name || 'শিক্ষার্থী'}. Question: ${prompt}.` });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: currentParts }],
      config: { 
        systemInstruction: getSystemInstruction(context.user),
        temperature: 0.2,
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
    console.error("Gemini Stream Error:", error);
    onChunk("⚠️ দুঃখিত, ইঞ্জিন কাজ করছে না। আপনার ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।");
    return "";
  }
};

export const generateMCQs = async (subject: Subject): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 high-quality MCQs for ${subject} based on NCTB curriculum. Use JSON array format with keys: question, options (array), correctAnswer (index), explanation (in Bangla), topic.`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: getSystemInstruction()
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getStudyPlan = async (topics: string[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a professional study plan for the following weak topics: ${topics.join(',')}`,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: getSystemInstruction() + "\nReturn a JSON object with: dailyGoals (array), weakTopics (array), nextStudy (string). All values in Bangla."
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn'): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate and provide deep linguistic analysis for: "${text}" with direction ${direction}.`,
    config: {
      systemInstruction: "You are a professional translator. Return JSON with 'overall' (containing literal, contextual, professional versions) and 'lines' (array with original, translated, and explanation for each line). Everything in Bangla.",
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getRecentEvents = async (type: 'bn' | 'en'): Promise<{ text: string; groundingChunks: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: type === 'bn' ? "আজকের বাংলাদেশের প্রধান ৫টি সংবাদ ও আপডেট দিন।" : "Give me the top 5 global news headlines for today.",
    config: { 
      tools: [{ googleSearch: {} }], 
      systemInstruction: getSystemInstruction() 
    },
  });
  return { 
    text: response.text || "", 
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
  };
};
