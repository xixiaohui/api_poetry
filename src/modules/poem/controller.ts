import type { PoemListParams, RandomPoemParams } from "./types";
import { poemService } from "./service";
import { poemListParamsSchema, randomPoemParamsSchema } from "./schema";
import { ValidationError } from "@/shared/errors";

export const poemController = {
  async list(rawParams: Record<string, string | undefined>) {
    const result = poemListParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    return poemService.list(result.data as PoemListParams);
  },

  async getById(id: number) {
    if (Number.isNaN(id) || id <= 0) {
      throw new ValidationError("无效的诗词 ID");
    }
    return poemService.getById(id);
  },

  async random(rawParams: Record<string, string | undefined>) {
    const result = randomPoemParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    return poemService.random(result.data as RandomPoemParams);
  },
};
