import type { UpstreamAuthor } from "@/clients";
import type { AuthorDTO, AuthorListDTO } from "./types";

function normalizeStringField(raw: unknown): string | null {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "name" in raw && typeof (raw as Record<string, unknown>).name === "string") {
    return (raw as Record<string, unknown>).name as string;
  }
  if (raw == null) return null;
  return String(raw);
}

export function toAuthorDTO(author: UpstreamAuthor): AuthorDTO {
  return {
    id: author.id,
    name: author.name,
    dynasty: normalizeStringField(author.dynasty),
    description: author.description ?? null,
    poemCount: author.poemCount ?? null,
  };
}

export function toAuthorListDTO(
  authors: UpstreamAuthor[],
  total: number,
  page: number,
  pageSize: number
): AuthorListDTO {
  return {
    authors: authors.map(toAuthorDTO),
    total,
    page,
    pageSize,
  };
}
