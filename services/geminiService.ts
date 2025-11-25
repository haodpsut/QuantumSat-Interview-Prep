import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InterviewQuestion, RoleType, Topic } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
          answer: { type: Type.STRING, description: "Comprehensive answer key" },
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

export const generateQuestionBatch = async (
  role: RoleType,
  batchSize: number,
  batchIndex: number
): Promise<InterviewQuestion[]> => {
  const prompt = `
    Generate ${batchSize} interview questions for a candidate applying for a ${role} position.
    
    This is Batch #${batchIndex + 1}.

    **Distribution Strategy:**
    - 70% Technical questions focused on: 
        1. Quantum AI (QML, Federated Learning, GNN).
        2. Satellite Networks (6G, SAGINs, NTN).
    - 30% General Communication & Behavioral questions (e.g., "Tell me about yourself", "How do you handle conflict?", "Explain a complex concept to a layman").

    **Technical Depth:**
    - Ask about integrating GNNs with satellite topology constraints.
    - Challenges of Federated Learning in high-latency NTN.
    - Quantum security in 6G.

    **Language Requirement:**
    - Provide accurate English (en) content.
    - Provide accurate Vietnamese (vi) translations for both question and answer.

    Output must be a valid JSON array matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.85, // High temperature for variety
      },
    });

    const rawData = response.text;
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    
    // Add unique IDs
    return parsedData.map((item: any, index: number) => ({
      ...item,
      id: `batch-${batchIndex}-q-${index}-${Date.now()}`,
    }));
  } catch (error) {
    console.error("Error generating batch:", error);
    throw error;
  }
};