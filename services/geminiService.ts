import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ParsedTransaction } from "../types";

const parseTransactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    amount: { type: Type.NUMBER, description: "The numeric value of the transaction." },
    currency: { type: Type.STRING, description: "The currency code, e.g., USD, EUR." },
    category: { type: Type.STRING, description: "A short category name (e.g., Food, Transport, Salary)." },
    merchant: { type: Type.STRING, description: "Name of the merchant or payer." },
    date: { type: Type.STRING, description: "ISO 8601 date string (YYYY-MM-DD). Use today's date if not specified." },
    notes: { type: Type.STRING, description: "A brief summary or note about the transaction." },
    type: { type: Type.STRING, description: "Either 'EXPENSE' or 'INCOME'." }
  },
  required: ["amount", "category", "type", "date"]
};

export const parseTransactionInput = async (input: string): Promise<ParsedTransaction | null> => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const today = new Date().toISOString().split('T')[0];
    const systemPrompt = `
      You are an expert financial bookkeeper. 
      Analyze the user's natural language input and extract transaction details.
      Assume the current date is ${today} if no date is mentioned.
      If the user types something vague like "coffee 5", assume it is an EXPENSE, merchant is unknown (or infer from category), and category is Food/Drink.
      Be smart about categorizing.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: input,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: parseTransactionSchema,
        temperature: 0.1, // Low temperature for deterministic extraction
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    return JSON.parse(jsonText) as ParsedTransaction;

  } catch (error) {
    console.error("Gemini parsing error:", error);
    return null;
  }
};

export const generateFinancialAdvice = async (transactions: any[]): Promise<string> => {
    if (!process.env.API_KEY) return "Please provide an API Key to get insights.";

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const summary = JSON.stringify(transactions.slice(0, 20)); // Limit to last 20 for context

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Here are the user's recent transactions: ${summary}. Give a 1-sentence friendly tip or insight about their spending habits.`,
        });
        
        return response.text || "Keep tracking your expenses!";
    } catch (e) {
        return "Keep tracking to see insights!";
    }
}