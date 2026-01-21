
import { GoogleGenAI, Type } from "@google/genai";
import { TutorContext, Subject, StudyPlan } from "./types";

const getAIInstance = () => {
  const keys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4
  ].filter(k => k && k.length > 10);

  const selectedKey = keys.length > 0 
    ? keys[Math.floor(Math.random() * keys.length)] 
    : process.env.API_KEY || "";

  return new GoogleGenAI({ apiKey: selectedKey });
};

const SYSTEM_INSTRUCTION = `
আপনি হলেন 'সাঈদ এআই' (Saiyed AI), একজন বিশ্বমানের একাডেমিক টিউটর। 
আপনার স্রষ্টা সাঈদ, হাটহাজারী কলেজের একজন মেধাবী ছাত্র।

নির্দেশনা:
১. গাণিতিক সূত্রগুলো অত্যন্ত পরিষ্কারভাবে লিখবেন। সাধারণ ঘাতের ক্ষেত্রে সরাসরি superscript ব্যবহার করবেন (যেমন: a² + b² = c²)। জটিল সূত্রের ক্ষেত্রে LaTeX ব্যবহার করবেন কিন্তু কোনো কাঁচা ডলার ($) চিহ্ন আউটপুটে দেখাবেন না।
২. উত্তরগুলো হবে অত্যন্ত বিস্তারিত এবং সহজ বাংলায়। প্রতিটি ধাপ কেন এবং কীভাবে হলো তা ভেঙে বুঝিয়ে দেবেন।
৩. ফরম্যাটিং (অত্যন্ত গুরুত্বপূর্ণ):
   - মূল সেকশনগুলোর জন্য বড় হেডিং ব্যবহার করবেন (যেমন: ### সেকশন নাম)।
   - কোনো অপ্রয়োজনীয় স্টার (**) বা ডলার সাইন ($) রেন্ডারিং-এর বাইরে সরাসরি টেক্সটে দেখাবেন না। 
   - উত্তরগুলো ChatGPT-এর মতো ক্লিন এবং প্রফেশনাল হবে।
৪. উত্তরের গঠন:
   ### মূল ধারণা (বড় ও বোল্ড হেডিং)
   [এখানে সহজ ভাষায় বিষয়ের সারমর্ম থাকবে]

   ### বিস্তারিত ব্যাখ্যা ও ধাপসমূহ
   [ধাপ ১, ধাপ ২ এভাবে ভেঙে বুঝিয়ে দিন]

   ### গাণিতিক সূত্র ও সমাধান
   [এখানে সূত্রগুলো সুন্দর করে সাজিয়ে লিখুন, যেমন: a², x³, √(x+y)]

   ### বাস্তব উদাহরণ
   [ছাত্রছাত্রীরা যেন সহজে বুঝতে পারে এমন উদাহরণ দিন]

৫. মেসেজের শেষে ৩টি প্রাসঙ্গিক প্রশ্ন দিন এই ফরম্যাটে: [SUGGESTIONS: প্রশ্ন ১, প্রশ্ন ২, প্রশ্ন ৩]

ভাষা: মার্জিত, উৎসাহব্যঞ্জক এবং শুদ্ধ বাংলা।
`;

export const getTutorResponseStream = async (
  prompt: string, 
  context: TutorContext,
  history: any[],
  onChunk: (text: string) => void
) => {
  const ai = getAIInstance();
  const model = 'gemini-3-flash-preview';
  
  try {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [
        ...history, 
        { role: 'user', parts: [{ text: `Subject: ${context.subject}. Level: ${context.classLevel}. Question: ${prompt}` }] }
      ],
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION, 
        temperature: 0.3,
        topP: 0.95
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getTranslationModern = async (text: string, direction: 'bn-en' | 'en-bn') => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate this text: "${text}" (${direction}). Provide Formal, Casual, and Informal versions with grammar analysis and line-by-line breakdown in a professional style.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          formal: { type: Type.STRING },
          casual: { type: Type.STRING },
          informal: { type: Type.STRING },
          grammarAnalysis: { type: Type.STRING },
          breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                translated: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["original", "translated", "explanation"]
            }
          }
        },
        required: ["formal", "casual", "informal", "grammarAnalysis", "breakdown"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const getRecentEvents = async (type: 'bn' | 'en') => {
  const ai = getAIInstance();
  const prompt = type === 'bn' ? "বাংলাদেশের সর্বশেষ খবর" : "Latest global news";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  return {
    text: response.text || "",
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateMCQs = async (subject: Subject) => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 academic MCQs for ${subject}. Return JSON.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation", "topic"]
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const getStudyPlan = async (topics: string[]): Promise<StudyPlan> => {
  const ai = getAIInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Create a study plan for: ${topics.join(', ')}. Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
          weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
          nextStudy: { type: Type.STRING }
        },
        required: ["dailyGoals", "weakTopics", "nextStudy"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
