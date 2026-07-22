import { z } from "zod";

export const poemListParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  dynasty: z.string().optional(),
  type: z.string().optional(),
  author: z.string().optional(),
});

export const randomPoemParamsSchema = z.object({
  author: z.string().optional(),
  type: z.string().optional(),
  dynasty: z.string().optional(),
  char: z.string().max(1).optional(),
});
