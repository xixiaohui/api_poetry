import { cache } from "@/shared/cache";
import { deepSeekClient } from "@/clients";
import { promptBuilder } from "./prompt-builder";
import { aiFormatter } from "./formatter";
import type { AIAnalysisDTO, AIAskDTO, AITranslateDTO } from "./types";

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export const aiService = {
  async analyse(title: string, content: string, author?: string, dynasty?: string): Promise<AIAnalysisDTO> {
    const contentHash = hashContent(content);
    const cacheKey = `poetry:ai:analyse:${contentHash}`;
    const cached = await cache.get<AIAnalysisDTO>(cacheKey);
    if (cached) return cached;

    const prompt = promptBuilder.analyse(title, content, author, dynasty);
    const response = await deepSeekClient.chat([
      { role: "system", content: "你是一位中国古诗词研究专家，擅长深入浅出地赏析古诗词。请始终返回有效的JSON格式。" },
      { role: "user", content: prompt },
    ]);
    const dto = aiFormatter.parseAnalysis(response);
    await cache.set(cacheKey, dto, 86400);
    return dto;
  },

  async ask(question: string, context?: string): Promise<AIAskDTO> {
    const prompt = promptBuilder.ask(question, context);
    const response = await deepSeekClient.chat([
      { role: "system", content: "你是一位中国古诗词专家，擅长回答关于古诗词的各种问题。" },
      { role: "user", content: prompt },
    ]);
    return aiFormatter.parseAsk(response);
  },

  async translate(content: string, targetLang = "en"): Promise<AITranslateDTO> {
    const contentHash = hashContent(content + targetLang);
    const cacheKey = `poetry:ai:translate:${contentHash}`;
    const cached = await cache.get<AITranslateDTO>(cacheKey);
    if (cached) return cached;

    const prompt = promptBuilder.translate(content, targetLang);
    const response = await deepSeekClient.chat([
      { role: "system", content: "你是一位精通中英日韩翻译的古诗词专家。" },
      { role: "user", content: prompt },
    ]);
    const dto = aiFormatter.parseTranslation(response);
    await cache.set(cacheKey, dto, 86400);
    return dto;
  },
};
