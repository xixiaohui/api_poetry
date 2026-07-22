export interface HistoryDTO {
  readonly id: string;
  readonly poemId: string;
  readonly poemTitle: string;
  readonly poemAuthor: string | null;
  readonly poemDynasty: string | null;
  readonly readAt: string;
}

export interface HistoryListDTO {
  readonly records: readonly HistoryDTO[];
  readonly total: number;
}
