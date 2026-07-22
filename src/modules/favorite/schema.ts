import { z } from "zod";

export const addFavoriteSchema = z.object({
  poemId: z.string().min(1, "诗词 ID 不能为空"),
  poemTitle: z.string().min(1, "诗词标题不能为空"),
  poemAuthor: z.string().optional(),
  poemDynasty: z.string().optional(),
});
