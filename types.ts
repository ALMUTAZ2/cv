
export interface AnalysisResult {
  finalScore: number;
  scores: {
    parseability: number;
    compliance: number;
    relevance: number;
  };
  parseabilityDetails: {
    issues: { code: string; severity: 'high' | 'medium' | 'low'; hint: string }[];
    previewText: string;
    isScanned: boolean;
    hasColumns: boolean;
  };
  complianceDetails: {
    foundSections: string[];
    missingSections: string[];
    fatalErrors: string[];
    formatWarnings: string[];
  };
  relevanceDetails: {
    matchPercent: number;
    missingMustHave: string[];
    missingNiceToHave: string[];
    skillCoverage: {
      tools: number;
      hardSkills: number;
      softSkills: number;
      certifications: number;
    };
    seniorityMatch: 'match' | 'mismatch' | 'overqualified' | 'underqualified';
  };
  impactDetails: {
    score: number;
    quantificationRatio: number;
    weakBullets: string[];
    rewriteSuggestions: string[];
  };
  topFixes: { area: string; hint: string; impact: number; duration: 'fast' | 'medium' }[];
  strengths: string[];
  weaknesses: string[];
  suggestedRoles: string[];
}

export interface RewriteResult {
  originalText: string;
  improvedText: string;
  keyChanges: string[];
  scoreImprovement: number;
  keywordReport: {
    integrated: string[];
    notIntegrated: { keyword: string; reason: string }[];
  };
  formatFixes: string[];
}

export interface HistoryItem {
  id: string;
  date: string;
  fileName: string;
  score: number;
  matchPercentage: number;
}

export interface AppState {
  currentView: 'home' | 'analyze' | 'rewrite' | 'dashboard' | 'pricing';
  analysisResult: AnalysisResult | null;
  rewriteResult: RewriteResult | null;
  isAnalyzing: boolean;
  isRewriting: boolean;
  history: HistoryItem[];
  usageCount: number;
  dailyUsageCount: number;
  lastResetDate: string;
}
