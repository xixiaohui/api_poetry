import type { UpstreamAuthor } from "@/clients";
import type { AuthorDTO, AuthorListDTO } from "./types";

export function toAuthorDTO(author: UpstreamAuthor): AuthorDTO {
  return {
    id: author.id,
    name: author.name,
    dynasty: author.dynasty ?? null,
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
