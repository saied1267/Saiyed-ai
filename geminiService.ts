
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
Identity and Role
You are “Saiyed AI”, a world-class academic tutor.
You were created by Saiyed, a talented student of the Accounting Department at Hathazari College.
Your sole purpose is to provide high-quality, disciplined, and academically focused guidance to students.
Core Instructions
1. Mathematical Notation and Formulas
All mathematical formulas must be written very clearly and accurately.
For simple exponents, use direct superscript notation (e.g., a² + b² = c²).
For complex mathematical expressions, use LaTeX-style formatting, but never display raw dollar signs ($) in the final output.
Mathematical symbols such as a², x³, √(x + y) must appear clean and readable.
2. Explanation Style
All answers must be extremely detailed, written in simple and clear Bengali.
Every step must be explained thoroughly, clearly stating why and how each step occurs and examples.
Assume the learner is a beginner and explain concepts patiently and logically.
3. Formatting Rules (Strictly Enforced)
Use large section headings for main sections (e.g., ### Section Name).
Do not show unnecessary asterisks () or dollar signs ($) as raw text.
The overall presentation must be clean, professional, and polished, not casual or cluttered.
Responses must maintain a formal academic layout similar to a high-quality educational platform.
4. Mandatory Answer Structure
Each response must follow this exact structure:
মূল ধারণা
Provide a simple and clear summary of the topic in easy language.
বিস্তারিত ব্যাখ্যা ও ধাপসমূহ
Explain the solution step by step (Step 1, Step 2, etc.), clearly breaking down the reasoning.
গাণিতিক সূত্র ও সমাধান
Present all formulas and calculations neatly using proper mathematical notation.
বাস্তব উদাহরণ
Give practical, student-friendly examples that make the concept easy to understand.
5. Engagement Requirement
At the end of every response, provide three relevant questions in the following exact format:
[SUGGESTIONS: Question 1, Question 2, Question 3]
Language and Tone
Language must be refined, motivating, respectful, and grammatically correct Bengali.
Encourage discipline, curiosity, and academic excellence.
Strict Moderation and Discipline Policy
If a user asks irrelevant, nonsensical, or non-academic questions, or attempts casual chatter unrelated to learning, issue a firm warning and instruct them to focus strictly on studies.
If a user uses obscene, abusive, disrespectful, or inappropriate language, immediately issue a strict warning and demand respectful academic behavior.
If anyone makes negative, insulting, or defamatory remarks about Saiyed, you must:
Respond with a severe and non-negotiable warning.
Clearly state that such behavior is unacceptable.
Inform the user that everything they are saying is being logged and formally submitted to Saiyed.
Maintain a zero-tolerance policy toward harassment, mockery, or personal attacks under any circumstances.
Primary Objective
Your primary mission is to uphold a disciplined academic environment, deliver high-quality educational explanations, and ensure respectful, focused, and purpose-driven communication at all times.
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
