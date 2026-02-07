import { GoogleGenAI, Type } from "@google/genai";
import { PlayerStats, Scenario, GameLog } from "./types";

/**
 * Utility to extract and clean JSON from a model's response.
 * Handles markdown code blocks and stray text.
 */
const cleanJsonResponse = (text: string): string => {
  if (!text) return "{}";
  
  // Attempt to find the first '{' and the last '}' to extract the core JSON object
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  
  if (start !== -1 && end !== -1 && end >= start) {
    const jsonCandidate = text.substring(start, end + 1);
    // Basic validation to check if it's at least potentially valid JSON
    if (jsonCandidate.startsWith('{') && jsonCandidate.endsWith('}')) {
      return jsonCandidate;
    }
  }
  
  // Fallback: simple stripping of markdown markers
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

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
    3. MINIMAL SURVIVAL: Focus on strategic choices rather than just basic food/transport unless relevant to macro-economic shifts like fuel subsidy changes.
    4. NO MONTHLY BULK: All costs/gains are for ONE week only. 
    5. CHOICE STRUCTURE (5-6 total): 
       - One major Investment (investmentId: 'mtn-ng', 'zenith', 'dangote-cem', or 'stanbic-fund').
       - Two strategic business/career growth moves.
       - One "Social Flex" vs "Wealth Building" dilemma.
       - One risk-reward "Side Hustle" or "Networking" opportunity.
    6. TONE: Intelligent, street-smart, and authentic. Use ${stats.narrationLanguage}.

    RESPONSE: MUST BE VALID JSON ONLY.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
                  sentiment: { type: Type.STRING }
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
                  category: { type: Type.STRING },
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
        systemInstruction: "You are NairaWise, a financial simulation expert specializing in the Nigerian economy. Your goal is to teach financial literacy through engaging roleplay. Always return strictly valid JSON."
      }
    });

    const cleanedText = cleanJsonResponse(response.text || "{}");
    const scenario = JSON.parse(cleanedText) as Scenario;
    
    // Ensure we have at least 1 choice to prevent UI break
    if (!scenario.choices || scenario.choices.length === 0) {
      throw new Error("Model returned no choices for the scenario.");
    }

    return scenario;
  } catch (error) {
    console.error("Critical error generating next scenario:", error);
    throw error;
  }
};

export const getEndGameAnalysis = async (stats: PlayerStats, h: GameLog[], reason: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Post-mortem for ${stats.name} (${stats.job}) who finished at Week ${stats.currentWeek}. Reason: ${reason}. Analyze their financial decisions. Provide Grade (A-F), Verdict, and 3 Street Wisdom points in ${stats.narrationLanguage}.`;
  
  try {
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
          },
          required: ["grade", "verdict", "points"]
        }
      }
    });
    return JSON.parse(cleanJsonResponse(response.text || "{}"));
  } catch (error) {
    console.error("Error generating end game analysis:", error);
    return {
      grade: "C",
      verdict: "You survived the streets, but your financial record was lost in the chaos.",
      points: ["Always keep a backup of your records.", "Consistency is the key to wealth.", "Keep pushing!"]
    };
  }
};