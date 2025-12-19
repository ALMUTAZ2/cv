
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RewriteResult } from "./types.ts";

/**
 * AI Service for Project: gen-lang-client-0190073145
 * Crucial: Retrieves API_KEY from the environment variable set in Vercel.
 */
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.warn("CRITICAL: API_KEY is undefined. Ensure it is set in Vercel Environment Variables.");
  }
  return key || "";
};

const MODEL_NAME = "gemini-3-flash-preview";

export async function analyzeCV(cvText: string, jdText: string): Promise<AnalysisResult> {
  // Always create a fresh instance for Vercel/Edge compatibility
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const contextJd = jdText?.trim() || "General Professional CV Audit";

  // Clean prompt construction to avoid template literal syntax errors
  const prompt = "Analyze this CV for ATS compliance. JD: " + contextJd + " \n\n CV Content: " + cvText;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            finalScore: { type: Type.INTEGER },
            scores: {
              type: Type.OBJECT,
              properties: {
                parseability: { type: Type.INTEGER },
                compliance: { type: Type.INTEGER },
                relevance: { type: Type.INTEGER }
              },
              required: ["parseability", "compliance", "relevance"]
            },
            parseabilityDetails: {
              type: Type.OBJECT,
              properties: {
                issues: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      code: { type: Type.STRING },
                      severity: { type: Type.STRING },
                      hint: { type: Type.STRING }
                    },
                    required: ["code", "severity", "hint"]
                  }
                },
                previewText: { type: Type.STRING },
                isScanned: { type: Type.BOOLEAN },
                hasColumns: { type: Type.BOOLEAN }
              },
              required: ["issues", "previewText", "isScanned", "hasColumns"]
            },
            complianceDetails: {
              type: Type.OBJECT,
              properties: {
                foundSections: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSections: { type: Type.ARRAY, items: { type: Type.STRING } },
                fatalErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
                formatWarnings: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["foundSections", "missingSections", "fatalErrors", "formatWarnings"]
            },
            relevanceDetails: {
              type: Type.OBJECT,
              properties: {
                matchPercent: { type: Type.INTEGER },
                missingMustHave: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingNiceToHave: { type: Type.ARRAY, items: { type: Type.STRING } },
                skillCoverage: {
                  type: Type.OBJECT,
                  properties: {
                    tools: { type: Type.INTEGER },
                    hardSkills: { type: Type.INTEGER },
                    softSkills: { type: Type.INTEGER },
                    certifications: { type: Type.INTEGER }
                  },
                  required: ["tools", "hardSkills", "softSkills", "certifications"]
                },
                seniorityMatch: { type: Type.STRING }
              },
              required: ["matchPercent", "missingMustHave", "missingNiceToHave", "skillCoverage", "seniorityMatch"]
            },
            impactDetails: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                quantificationRatio: { type: Type.NUMBER },
                weakBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                rewriteSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["score", "quantificationRatio", "weakBullets", "rewriteSuggestions"]
            },
            topFixes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  area: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  impact: { type: Type.INTEGER },
                  duration: { type: Type.STRING }
                },
                required: ["area", "hint", "impact", "duration"]
              }
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedRoles: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "finalScore", "scores", "parseabilityDetails", "complianceDetails", 
            "relevanceDetails", "impactDetails", "topFixes", "strengths", 
            "weaknesses", "suggestedRoles"
          ]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error("AI returned empty analysis.");
    return JSON.parse(textOutput);
  } catch (error: any) {
    console.error("Analysis Core Error:", error);
    throw new Error(error.message || "Engine failure.");
  }
}

export async function rewriteCV(cvText: string, jdText: string, analysis?: AnalysisResult): Promise<RewriteResult> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const keywords = analysis 
    ? [...analysis.relevanceDetails.missingMustHave, ...analysis.relevanceDetails.missingNiceToHave].join(", ") 
    : "standard professional keywords";

  const prompt = "Rewrite this CV to optimize keywords: " + keywords + " \n\n Original: " + cvText + " \n\n JD: " + jdText;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalText: { type: Type.STRING },
            improvedText: { type: Type.STRING },
            keyChanges: { type: Type.ARRAY, items: { type: Type.STRING } },
            scoreImprovement: { type: Type.INTEGER },
            keywordReport: {
              type: Type.OBJECT,
              properties: {
                integrated: { type: Type.ARRAY, items: { type: Type.STRING } },
                notIntegrated: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: {
                      keyword: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["keyword", "reason"]
                  } 
                }
              },
              required: ["integrated", "notIntegrated"]
            },
            formatFixes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["originalText", "improvedText", "keyChanges", "scoreImprovement", "keywordReport", "formatFixes"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) throw new Error("AI returned empty rewrite.");
    return JSON.parse(textOutput);
  } catch (error: any) {
    console.error("Rewrite Core Error:", error);
    throw new Error("Rewrite engine unavailable.");
  }
}
