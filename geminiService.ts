import { GoogleGenAI, Type } from "@google/genai";
import { Subject, ClassLevel, Group } from "./types";

const SYSTEM_INSTRUCTION = `
# Identity & Tone
- Your name is 'সাঈদ এআই' (Saiyed AI).
- You were built by সাঈদ (Saiyed), a student from হাটহাজারী কলেজ (Hathazari College).
- Be honest: You are a learning assistant project created by সাঈদ to help students study more effectively. Do not claim to be human or an all-powerful being. 
- Tone: Grounded, helpful, respectful, and realistic. 
- Always answer in Bangla unless specifically asked for English.

# Knowledge & Explanation Style
- NEVER give one-line or short answers. 
- For every question, perform a "Deep Breakdown":
  1. Core Concept (মূল ধারণা)
  2. Step-by-Step Logic (ধাপে ধাপে ব্যাখ্যা)
  3. Practical Example (বাস্তব উদাহরণ)
  4. Common Mistakes (সাধারণ ভুলসমূহ)

# Formatting Rules
- Do NOT use '$' signs.
- Use Unicode for math: a², b³, x⁴, √x.
- Formulas: Start with "> " on a new line.
- Use bullet points for clear readability.
- Every response MUST end with "[SUGGESTIONS] Topic 1 | Topic 2 | Topic 3" related to the context.
- Mention "সাঈদ এর বাস্তব পরামর্শ:" at the very end for educational advice.
`;

const MODEL_NAME = 'gemini-3-flash-preview';

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
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
    onChunk(`দুঃখিত, বর্তমানে সার্ভারে সমস্যা হচ্ছে। দয়া করে সাঈদ-কে জানান।`);
    return "";
  }
};

export const getTranslationExtended = async (text: string, direction: 'bn-en' | 'en-bn') => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Translate and analyze: "${text}" (${direction}). 
      Provide: 1. Literal, 2. Contextual, 3. Professional versions. 
      Also provide a deep line-by-line breakdown.`,
      config: {
        systemInstruction: "You are a linguistics professor. Return JSON with 'overall' (literal, contextual, professional) and 'lines' (original, translated, explanation).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall: {
              type: Type.OBJECT,
              properties: {
                literal: { type: Type.STRING },
                contextual: { type: Type.STRING },
                professional: { type: Type.STRING }
              }
            },
            lines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  translated: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) { return { overall: {}, lines: [] }; }
};

export const generateMCQs = async (subject: Subject) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate 5 challenging MCQs for ${subject}. Explain why the correct answer is right based on standard textbooks.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (err) { return []; }
};

export const getStudyPlan = async (topics: string[]) => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a realistic study plan for: ${topics.join(',')}. Be honest and practical about timing.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) { return { dailyGoals: [], weakTopics: [], nextStudy: "" }; }
};

export const getRecentEvents = async (type: 'bn' | 'en') => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: "What are the latest important news updates? Provide neutral and verified information.",
      config: { tools: [{ googleSearch: {} }] },
    });
    return { text: response.text || "", groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (err) { return { text: "Error news", groundingChunks: [] }; }
        }
