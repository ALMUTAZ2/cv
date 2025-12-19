
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RewriteResult } from "./types.ts";

// استخدام النسخة الاحترافية لضمان تحليل أعمق واستقرار في معالجة البيانات المعقدة
const MODEL_NAME = "gemini-3-pro-preview";

export async function analyzeCV(cvText: string, jdText: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contextJd = jdText.trim() || "General Professional Role";

  const prompt = `
    ACT AS A SENIOR TECHNICAL RECRUITER & ATS ARCHITECT.
    Perform a "Deep ATS Analysis" on the CV provided against the Job Description (JD).
    
    LAYERS TO ANALYZE:
    1. PARSEABILITY (35% weight): Check for columns, scanned images, machine-readability.
    2. COMPLIANCE (35% weight): Structure check (Contact, Experience, Education, Skills).
    3. RELEVANCE (30% weight): Match keywords, tools, and seniority.

    JD: ${contextJd}
    CV: ${cvText}
    
    IMPORTANT: Respond ONLY with a valid JSON object following the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
        // إضافة ميزانية تفكير بسيطة لضمان جودة التحليل
        thinkingConfig: { thinkingBudget: 1000 },
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
          required: ["finalScore", "scores", "parseabilityDetails", "complianceDetails", "relevanceDetails", "impactDetails", "topFixes", "strengths", "weaknesses"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from AI engine");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function rewriteCV(cvText: string, jdText: string, analysis?: AnalysisResult): Promise<RewriteResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const jobKeywords = analysis 
    ? [...analysis.relevanceDetails.missingMustHave, ...analysis.relevanceDetails.missingNiceToHave] 
    : [];

  const prompt = `
    You are an ATS-Driven CV Optimization Engine.
    Your task is to improve ONLY the existing content of the user's CV.
    STRICT RULE: Do NOT add any new certifications, degrees, job titles, tools, or skills that are not explicitly present in the original CV text.

    RECONSTRUCTION RULES:
    1. ZERO FABRICATION: Do NOT invent dates, companies, or credentials.
    2. STAR ENHANCEMENT: Rephrase existing achievements into the Situation-Task-Action-Result format using ONLY provided facts.
    3. VERBAL POWER: Use elite action verbs (Spearheaded, Orchestrated, Engineered).
    4. ATS HYGIENE: Standard ASCII formatting, no columns, no tables.

    Original CV:
    ${cvText}

    Targeting Keywords:
    ${jobKeywords.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 1000 },
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Rewrite Error:", error);
    throw error;
  }
}
