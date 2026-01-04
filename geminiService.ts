
import { GoogleGenAI, Type } from "@google/genai";
import { PlayerStats, Scenario, GameLog } from "./types";

export const getNextScenario = async (
  stats: PlayerStats,
  history: GameLog[]
): Promise<Scenario> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isInterval = [6, 12, 18, 24].includes(stats.currentWeek);
  let difficulty = "NORMAL";
  if (isInterval) difficulty = "HARD (The Sapa Surge)";

  const prompt = `
    Create a highly personalized financial scenario for a Nigerian named ${stats.name}.
    
    PLAYER PROFILE:
    - JOB: ${stats.job} (If 'Market Trader', emphasize inventory, bulk buying, and market volatility).
    - CITY: ${stats.city}
    - MARITAL STATUS: ${stats.maritalStatus} (${stats.numberOfKids} kids)
    - BALANCE: ₦${stats.balance.toLocaleString()}
    - WEEK: ${stats.currentWeek} of 24
    - DIFFICULTY: ${difficulty}

    REQUIREMENTS:
    1. A MAIN SCENARIO: A realistic Nigerian dilemma (e.g. Fuel hike, family wedding, school fees, side-hustle).
    2. 5 CHOICES: Each with balance/savings/debt/happiness impact. 
    3. INVESTMENT: One choice MUST be an "Investment Deal" where they buy units of a stock/fund/inventory. Set 'investmentId' to one of: 'mtn-ng', 'zenith', 'dangote-cem', 'stanbic-fund'.
    4. THE OGA LESSON: A pithy financial lesson in Pidgin.
    5. NAIJA TRENDS: 4 witty social posts.

    RESPONSE FORMAT: JSON only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          lesson: { type: Type.STRING },
          imageTheme: { type: Type.STRING },
          socialFeed: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                handle: { type: Type.STRING },
                name: { type: Type.STRING },
                content: { type: Type.STRING },
                likes: { type: Type.STRING },
                retweets: { type: Type.STRING },
                isVerified: { type: Type.BOOLEAN },
                sentiment: { type: Type.STRING, enum: ['bullish', 'bearish', 'funny', 'advice'] }
              },
              required: ["handle", "name", "content", "likes", "retweets", "isVerified", "sentiment"]
            }
          },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                consequence: { type: Type.STRING },
                investmentId: { type: Type.STRING },
                impact: {
                  type: Type.OBJECT,
                  properties: {
                    balance: { type: Type.NUMBER },
                    savings: { type: Type.NUMBER },
                    debt: { type: Type.NUMBER },
                    happiness: { type: Type.NUMBER },
                  },
                  required: ["balance", "savings", "debt", "happiness"]
                }
              },
              required: ["text", "consequence", "impact"]
            }
          }
        },
        required: ["title", "description", "lesson", "choices", "socialFeed", "imageTheme"]
      },
      systemInstruction: "You are NairaWise, a witty Nigerian financial sim engine. You teach literacy through survival. Use authentic Pidgin."
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getEndGameAnalysis = async (stats: PlayerStats, h: GameLog[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Post-mortem for ${stats.name} (${stats.job}) who went broke at Week ${stats.currentWeek}. Analyze their path to Sapa and give 3 educational points in Pidgin.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });
  return response.text || "Sapa catch you. Game Over.";
};

export const getVictoryAnalysis = async (stats: PlayerStats, netAssets: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Victory report for ${stats.name} survived 24 weeks with ₦${netAssets.toLocaleString()} total net worth. Career: ${stats.job}. Grade them in Pidgin.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt
  });
  return response.text || "Oga! You win.";
};
