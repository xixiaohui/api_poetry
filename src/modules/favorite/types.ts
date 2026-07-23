export interface FavoriteDTO {
  readonly id: string;
  readonly poemId: string;
  readonly poemTitle: string;
  readonly poemAuthor: string | null;
  readonly poemDynasty: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FavoriteListDTO {
  readonly favorites: readonly FavoriteDTO[];
  readonly total: number;
}

export interface FavoriteSyncDTO {
  readonly favorites: readonly FavoriteDTO[];
  readonly syncToken: string;
  readonly total: number;
}
