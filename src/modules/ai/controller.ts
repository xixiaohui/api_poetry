import { ValidationError } from "@/shared/errors";
import { aiService } from "./service";
import { analyseSchema, askSchema, translateSchema } from "./schema";

export const aiController = {
  async analyse(body: unknown) {
    const result = analyseSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { title, content, author, dynasty } = result.data;
    return aiService.analyse(title, content, author, dynasty);
  },

  async ask(body: unknown) {
    const result = askSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { question, context } = result.data;
    return aiService.ask(question, context);
  },

  async translate(body: unknown) {
    const result = translateSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { content, targetLang } = result.data;
    return aiService.translate(content, targetLang);
  },
};
