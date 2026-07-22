export interface FavoriteDTO {
  readonly id: string;
  readonly poemId: string;
  readonly poemTitle: string;
  readonly poemAuthor: string | null;
  readonly poemDynasty: string | null;
  readonly createdAt: string;
}

export interface FavoriteListDTO {
  readonly favorites: readonly FavoriteDTO[];
  readonly total: number;
}
