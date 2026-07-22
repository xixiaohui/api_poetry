import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().min(1, "搜索词不能为空"),
  type: z.enum(["all", "title", "content", "author"]).optional().default("all"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
