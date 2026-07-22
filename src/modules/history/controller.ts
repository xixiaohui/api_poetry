import { ValidationError } from "@/shared/errors";
import { historyService } from "./service";
import { addHistorySchema } from "./schema";

export const historyController = {
  async list(userId: string) {
    return historyService.list(userId);
  },

  async record(userId: string, body: unknown) {
    const result = addHistorySchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { poemId, poemTitle, poemAuthor, poemDynasty } = result.data;
    return historyService.record(userId, poemId, poemTitle, poemAuthor, poemDynasty);
  },
};
