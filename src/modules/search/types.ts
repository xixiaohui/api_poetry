import type { PoemDTO } from "@/modules/poem";

export interface SearchResultDTO {
  readonly poems: readonly PoemDTO[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly query: string;
}
