
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RewriteResult } from "./types.ts";

/**
 * SmartATS AI Core Engine
 * Security Level: Code-level obscurity for the API Key fallback.
 * The system prioritizes process.env.API_KEY as the secure production source.
 */
const _D = (s: string) => atob(s).split('').reverse().join('');
const _E = 'QTNvX3hkeGt4cWZRVEhicmE4cHVtNUtiNmZDamdyb2FGQ3lTYVpJQQ==';
const _V = process.env.API_KEY || _D(_E);

const MODEL_NAME = "gemini-3-flash-preview";

export async function analyzeCV(cvText: string, jdText: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: _V });
  
  const prompt = `
    System Identity: Senior HR Auditor & ATS Specialist.
    Task: Execute a deep neural audit of the provided CV against the Job Description.
    
    JD: ${jdText || "General Professional CV Audit"}
    CV: ${cvText}
    
    Instructions:
    1. Score from 0-100 based on ATS parsing rules.
    2. Identify specific formatting issues (columns, tables, headers).
    3. Match skills accurately.
    4. Provide the result in strict JSON format according to the schema.
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
    if (!text) throw new Error("Terminal received empty response");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("AI Diagnostic Failure:", error);
    throw new Error(error.message || "Failed to analyze document.");
  }
}

export async function rewriteCV(cvText: string, jdText: string, analysis?: AnalysisResult): Promise<RewriteResult> {
  const ai = new GoogleGenAI({ apiKey: _V });
  const keywords = analysis 
    ? [...analysis.relevanceDetails.missingMustHave, ...analysis.relevanceDetails.missingNiceToHave].join(", ") 
    : "industry keywords";

  const prompt = `
    Task: Execute Factual Reconstruction of the CV for ATS dominance.
    Target Keywords for Integration: ${keywords}
    
    Current Content:
    ${cvText}
    
    Target Job (Context):
    ${jdText}
    
    Constraints:
    1. Optimize bullet points using the STAR method.
    2. Quantify achievements where possible.
    3. Ensure 100% ATS parser compatibility.
    4. Provide the result in strict JSON format.
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
    if (!text) throw new Error("Reconstruction process failed");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("AI Reconstruction Failure:", error);
    throw new Error("Failed to optimize text.");
  }
}
