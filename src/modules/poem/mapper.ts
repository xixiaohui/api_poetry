import type { UpstreamPoem } from "@/clients";
import type { PoemDTO, PoemListDTO } from "./types";

function normalizeContent(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.join("\n");
  if (raw == null) return "";
  return String(raw);
}

export function toPoemDTO(poem: UpstreamPoem): PoemDTO {
  return {
    id: poem.id,
    title: poem.title,
    content: normalizeContent(poem.content),
    author: poem.author ?? null,
    dynasty: poem.dynasty ?? null,
    type: poem.type ?? null,
  };
}

export function toPoemListDTO(
  poems: UpstreamPoem[],
  total: number,
  page: number,
  pageSize: number
): PoemListDTO {
  return {
    poems: poems.map(toPoemDTO),
    total,
    page,
    pageSize,
  };
}
