import type { AIAnalysisDTO, AIAskDTO, AITranslateDTO } from "./types";

export const aiFormatter = {
  parseAnalysis(raw: string): AIAnalysisDTO {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        return {
          background: String(parsed.background ?? ""),
          appreciation: String(parsed.appreciation ?? ""),
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
          emotions: Array.isArray(parsed.emotions) ? parsed.emotions.map(String) : [],
        };
      }
    } catch {
      // Fall through to text parsing
    }
    return {
      background: "",
      appreciation: raw,
      keywords: [],
      emotions: [],
    };
  },

  parseAsk(raw: string): AIAskDTO {
    return { answer: raw };
  },

  parseTranslation(raw: string): AITranslateDTO {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        return {
          original: "",
          translation: String(parsed.translation ?? raw),
          notes: Array.isArray(parsed.notes) ? parsed.notes.map(String) : [],
        };
      }
    } catch {
      // Fall through
    }
    return { original: "", translation: raw, notes: [] };
  },
};
