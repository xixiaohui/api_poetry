import { z } from "zod";

export const addHistorySchema = z.object({
  poemId: z.string().min(1),
  poemTitle: z.string().min(1),
  poemAuthor: z.string().optional(),
  poemDynasty: z.string().optional(),
});
