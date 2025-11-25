import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InterviewQuestion, RoleType, Topic } from "../types";

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, description: "Category of the question (e.g., Technical, Behavioral, Research Vision)" },
      topic: { type: Type.STRING, description: "Specific topic (e.g., GNN, 6G, Leadership, Conflict Resolution)" },
      difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
      en: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          answer: { type: Type.STRING, description: "Concise yet comprehensive answer key" },
        },
        required: ["question", "answer"],
      },
      vi: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "Vietnamese translation of the question" },
          answer: { type: Type.STRING, description: "Vietnamese translation of the answer" },
        },
        required: ["question", "answer"],
      },
    },
    required: ["category", "topic", "difficulty", "en", "vi"],
  },
};

// Helper to safely get API Key from various build tool conventions
const getApiKey = (): string | undefined => {
  // Check standard Node/CRA
  if (process.env.API_KEY) return process.env.API_KEY;
  if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
  
  // Check Vite (import.meta.env)
  try {
    // @ts-ignore
    if (import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore error if import.meta is not supported
  }

  return undefined;
};

export const generateQuestionBatch = async (
  role: RoleType,
  batchSize: number,
  batchIndex: number
): Promise<InterviewQuestion[]> => {
  
  // LAZY INITIALIZATION: Only create the client when needed.
  // This prevents the "White Screen of Death" if the key is missing on app load.
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API Key is missing. Checked: API_KEY, REACT_APP_API_KEY, VITE_API_KEY");
    throw new Error("AUTHENTICATION_FAILED");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Using a very direct prompt to ensure speed.
  const prompt = `
    Generate ${batchSize} interview questions for a ${role} candidate.
    Batch #${batchIndex + 1}.

    **Topics:**
    - Mix of Technical (Quantum AI, GNN, 6G, SAGINs) and Behavioral.
    - If Technical: focus on integration of AI in Satellite networks or Quantum security.
    
    **Requirements:**
    - English (en) and Vietnamese (vi) translations.
    - Answers must be **concise** but accurate (approx 2-3 sentences max).
    - Output pure JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8, // Slightly lower temperature for faster, more deterministic output
      },
    });

    const rawData = response.text;
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    
    // Add unique IDs
    return parsedData.map((item: any, index: number) => ({
      ...item,
      id: `batch-${batchIndex}-q-${index}-${Date.now()}-${Math.random()}`,
    }));
  } catch (error: any) {
    console.error("Error generating batch:", error);
    
    // Check for specific API Key errors to give better feedback
    const errorMessage = error?.message || "";
    if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("API key")) {
      throw new Error("AUTHENTICATION_FAILED");
    }

    // Return empty array instead of throwing generic errors to allow other workers to continue
    return [];
  }
};