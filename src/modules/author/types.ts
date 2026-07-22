export interface AuthorDTO {
  readonly id: number;
  readonly name: string;
  readonly dynasty: string | null;
  readonly description: string | null;
  readonly poemCount: number | null;
}

export interface AuthorListDTO {
  readonly authors: readonly AuthorDTO[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
