
import { GoogleGenAI, Type } from "@google/genai";
import { StrategyResult, Trade } from "./types";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeStrategy = async (userId: string, strategy: string): Promise<StrategyResult> => {
  const prompt = `
    Act as a professional algorithmic trading backtester. 
    Analyze the following trading strategy and simulate 10 representative trades that would result from it.
    Provide a detailed analysis of why the strategy works or fails.
    
    Strategy: "${strategy}"
    
    Return a JSON object with the following structure:
    {
      "resultText": "A professional qualitative analysis of the strategy",
      "trades": [
        {
          "ticker": "AAPL",
          "type": "LONG",
          "entryPrice": 150.25,
          "exitPrice": 155.50,
          "profitPercentage": 3.5,
          "profitAmount": 350.00,
          "timestamp": "2023-10-01T10:00:00Z",
          "status": "WIN"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resultText: { type: Type.STRING },
            trades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticker: { type: Type.STRING },
                  type: { type: Type.STRING },
                  entryPrice: { type: Type.NUMBER },
                  exitPrice: { type: Type.NUMBER },
                  profitPercentage: { type: Type.NUMBER },
                  profitAmount: { type: Type.NUMBER },
                  timestamp: { type: Type.STRING },
                  status: { type: Type.STRING }
                },
                required: ["ticker", "type", "entryPrice", "exitPrice", "profitPercentage", "profitAmount", "timestamp", "status"]
              }
            }
          },
          required: ["resultText", "trades"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    const trades: Trade[] = data.trades.map((t: any, index: number) => ({
      ...t,
      id: `trade-${Date.now()}-${index}`
    }));

    const wins = trades.filter(t => t.status === 'WIN').length;
    const winRate = (wins / trades.length) * 100;
    const totalProfit = trades.reduce((acc, t) => acc + t.profitAmount, 0);

    return {
      id: `strat-${Date.now()}`,
      userId,
      strategyText: strategy,
      resultText: data.resultText,
      trades,
      winRate,
      // Fixed: totalProfit is now included in StrategyResult type
      totalProfit,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error analyzing strategy:", error);
    throw new Error("Failed to process strategy analysis.");
  }
};
