import { z } from "zod";

export const analyseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  author: z.string().optional(),
  dynasty: z.string().optional(),
});

export const askSchema = z.object({
  question: z.string().min(1, "问题不能为空"),
  context: z.string().optional(),
});

export const translateSchema = z.object({
  content: z.string().min(1),
  targetLang: z.enum(["en", "ja", "ko"]).optional().default("en"),
});
