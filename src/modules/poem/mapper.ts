import type { UpstreamPoem } from "@/clients";
import type { PoemDTO, PoemListDTO } from "./types";

export function toPoemDTO(poem: UpstreamPoem): PoemDTO {
  return {
    id: poem.id,
    title: poem.title,
    content: poem.content,
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
