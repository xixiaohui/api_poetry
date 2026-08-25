import { z } from "zod";
import { POSTER_FILTERS, POSTER_THEMES } from "./types";

export const posterSchema = z
  .object({
    poemId: z.number().int().positive().optional(),
    title: z.string().trim().min(1).max(64).optional(),
    content: z.string().trim().min(1).max(5000).optional(),
    author: z.string().trim().max(32).nullable().optional(),
    dynasty: z.string().trim().max(16).nullable().optional(),
    theme: z.enum(POSTER_THEMES).optional().default("ink"),
    filter: z.enum(POSTER_FILTERS).optional().default("none"),
    format: z.enum(["svg", "png", "both"]).optional().default("both"),
  })
  .refine((d) => Boolean(d.poemId) || Boolean(d.title && d.content), {
    message: "请提供 poemId，或同时提供 title 和 content",
  });

export type PosterInput = z.infer<typeof posterSchema>;
