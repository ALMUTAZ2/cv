
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RewriteResult } from "./types.ts";

// استخدام Flash لأنه الأفضل حالياً في التعامل مع الـ JSON المعقد والسرعة العالية
const MODEL_NAME = "gemini-3-flash-preview";

export async function analyzeCV(cvText: string, jdText: string): Promise<AnalysisResult> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY_MISSING: تأكد من إضافة المفتاح في إعدادات Vercel بشكل صحيح باسم API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contextJd = jdText.trim() || "General Professional Role";

  const prompt = `
    You are an expert ATS (Applicant Tracking System) Analyzer. 
    Perform a deep technical audit of the following CV against the provided Job Description.
    
    JOB DESCRIPTION:
    ${contextJd}
    
    CURRICULUM VITAE:
    ${cvText}
    
    Return the analysis in strict JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1, // درجة حرارة منخفضة لضمان دقة البيانات
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
          required: ["finalScore", "scores", "parseabilityDetails", "complianceDetails", "relevanceDetails", "impactDetails", "topFixes", "strengths", "weaknesses", "suggestedRoles"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("AI_EMPTY_RESPONSE: لم يرجع النموذج أي بيانات.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // استخراج رسالة الخطأ الأصلية لتسهيل التشخيص
    const errorMessage = error?.message || "Internal AI Error";
    throw new Error(`${errorMessage}`);
  }
}

export async function rewriteCV(cvText: string, jdText: string, analysis?: AnalysisResult): Promise<RewriteResult> {
  if (!process.env.API_KEY) throw new Error("API_KEY is missing");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const jobKeywords = analysis 
    ? [...analysis.relevanceDetails.missingMustHave, ...analysis.relevanceDetails.missingNiceToHave] 
    : [];

  const prompt = `
    You are an AI CV Architect. Rewrite the CV to optimize it for ATS.
    Use high-impact action verbs. Focus on: ${jobKeywords.join(', ')}.
    CV: ${cvText}
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
    if (!text) throw new Error("AI_REWRITE_EMPTY");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini Rewrite Error:", error);
    throw new Error(error?.message || "Rewrite failed");
  }
}
