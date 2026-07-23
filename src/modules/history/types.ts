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

export interface ReadingStatsDTO {
  readonly totalReads: number;
  readonly totalPoems: number;
  readonly topPoems: readonly { poemId: string; poemTitle: string; count: number }[];
  readonly topAuthors: readonly { author: string; count: number }[];
  readonly readsByDay: readonly { date: string; count: number }[];
}
