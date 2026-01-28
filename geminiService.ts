
import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types.ts";

export const generateStrategies = async (student: Student): Promise<string[]> => {
  // Initialize AI client with required named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 3-5 specific, engaging classroom strategies for a student with the following profile:
    Name: ${student.name}
    Grade: ${student.grade}
    Interests: ${student.interests.join(', ')}
    Recent Test Scores: ${JSON.stringify(student.assessments)}
    
    The strategies should leverage their interests and help improve any weak areas while keeping them engaged.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strategies: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["strategies"]
      },
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  try {
    // Accessing .text property directly as it is a getter, not a method.
    const text = response.text;
    const data = JSON.parse(text || '{}');
    return data.strategies || [];
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return ["Incorporate personal interests into math problems", "Allow for choice-based projects"];
  }
};
