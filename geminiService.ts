
import { GoogleGenAI, Type } from "@google/genai";
import { PlayerStats, Scenario, GameLog } from "./types";

export const getNextScenario = async (
  stats: PlayerStats,
  history: GameLog[]
): Promise<Scenario> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const previousTitles = history.map(h => h.title).slice(-5).join(", ");

  const prompt = `
    Generate a high-stakes Nigerian financial strategy scenario for ${stats.name}, who is a ${stats.job} in ${stats.city}.
    
    PLAYER CONTEXT:
    - Household: ${stats.maritalStatus === 'married' ? `Married with ${stats.numberOfKids} children` : 'Single'}.
    - Career: ${stats.job}.
    - Cash: ₦${stats.balance.toLocaleString()}.
    - Happiness: ${stats.happiness}%.
    - PREFERRED LANGUAGE: ${stats.narrationLanguage}.

    STRICT GENERATION RULES:
    1. NO REPEATS: Do not repeat scenario titles or plots: ${previousTitles}.
    2. STRATEGIC FOCUS: Prioritize business expansion, investment opportunities (MTN, Zenith, Dangote), family legacy, or high-level career growth.
    3. MINIMAL SURVIVAL: Do NOT force food or transport dilemmas unless they are part of a larger economic narrative. Focus on choice and strategy.
    4. NO MONTHLY BULK: All costs/gains are for ONE week only. 
    5. CHOICE STRUCTURE (5-6 total): 
       - One major Investment (investmentId: 'mtn-ng', 'zenith', 'dangote-cem', or 'stanbic-fund').
       - Two strategic business/career growth moves.
       - One "Social Flex" vs "Wealth Building" dilemma.
       - One risk-reward "Side Hustle" or "Networking" opportunity.
    6. TONE: Intelligent, street-smart, and authentic. Use ${stats.narrationLanguage}.

    RESPONSE: JSON ONLY.
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
              }
            }
          },
          choices: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                consequence: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['Essential', 'NonEssential', 'Investment', 'Asset', 'Repairs', 'BlackTax', 'Family', 'Saving', 'Transport'] },
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
      systemInstruction: "You are NairaWise, an AI mentor for the Nigerian hustle. Focus on wealth generation and strategic economic moves."
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getEndGameAnalysis = async (stats: PlayerStats, h: GameLog[], reason: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Post-mortem for ${stats.name} (${stats.job}) who finished at Week ${stats.currentWeek}. Reason: ${reason}. Analyze their path. Provide Grade (A-F), Verdict, and 3 Street Wisdom points in ${stats.narrationLanguage}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grade: { type: Type.STRING },
          verdict: { type: Type.STRING },
          points: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
