import { ValidationError } from "@/shared/errors";
import { favoriteService } from "./service";
import { addFavoriteSchema } from "./schema";

export const favoriteController = {
  async list(userId: string) {
    return favoriteService.list(userId);
  },

  async add(userId: string, body: unknown) {
    const result = addFavoriteSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { poemId, poemTitle, poemAuthor, poemDynasty } = result.data;
    return favoriteService.add(userId, poemId, poemTitle, poemAuthor, poemDynasty);
  },

  async remove(userId: string, poemId: string) {
    if (!poemId) throw new ValidationError("诗词 ID 不能为空");
    return favoriteService.remove(userId, poemId);
  },
};
