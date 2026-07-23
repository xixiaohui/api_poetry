import type { UpstreamPoem } from "@/clients";
import type { PoemDTO, PoemListDTO } from "./types";

function normalizeContent(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.join("\n");
  if (raw == null) return "";
  return String(raw);
}

function normalizeStringField(raw: unknown): string | null {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "name" in raw && typeof (raw as Record<string, unknown>).name === "string") {
    return (raw as Record<string, unknown>).name as string;
  }
  if (raw == null) return null;
  return String(raw);
}

export function toPoemDTO(poem: UpstreamPoem): PoemDTO {
  return {
    id: poem.id,
    title: poem.title,
    content: normalizeContent(poem.content),
    author: normalizeStringField(poem.author),
    dynasty: normalizeStringField(poem.dynasty),
    type: normalizeStringField(poem.type),
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
