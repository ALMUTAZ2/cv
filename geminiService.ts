
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RewriteResult } from "./types.ts";

// CV auditing is a complex text task requiring advanced reasoning, so we use gemini-3-pro-preview.
const MODEL_NAME = "gemini-3-pro-preview";

export async function analyzeCV(cvText: string, jdText: string): Promise<AnalysisResult> {
  // Always create a new GoogleGenAI instance right before making an API call to use the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    System Identity: Senior HR Auditor & ATS Specialist.
    Task: Execute a deep neural audit of the provided CV against the Job Description.
    
    JD: ${jdText || "General Professional CV Audit"}
    CV: ${cvText}
    
    Instructions:
    1. Score from 0-100 based on ATS parsing rules.
    2. Provide results in strict JSON format.
  `;

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

    const text = response.text;
    if (!text) throw new Error("AI returned empty content");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    // Detect API key or project-related errors to trigger re-selection dialog.
    if (error.message?.includes("API key") || error.message?.includes("Requested entity was not found")) {
      throw new Error("API Connection Lost. Please re-connect your Google Cloud Key.");
    }
    throw error;
  }
}

export async function rewriteCV(cvText: string, jdText: string, analysis?: AnalysisResult): Promise<RewriteResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const keywords = analysis 
    ? [...analysis.relevanceDetails.missingMustHave, ...analysis.relevanceDetails.missingNiceToHave].join(", ") 
    : "professional industry keywords";

  const prompt = `
    Task: Optimize CV.
    Keywords: ${keywords}
    CV: ${cvText}
    JD: ${jdText}
  `;

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

    const text = response.text;
    if (!text) throw new Error("Rewrite failed");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Rewrite Error:", error);
    if (error.message?.includes("API key") || error.message?.includes("Requested entity was not found")) {
      throw new Error("API Connection Lost. Please re-connect your Google Cloud Key.");
    }
    throw error;
  }
}
