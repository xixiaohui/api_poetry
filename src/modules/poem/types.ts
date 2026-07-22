export interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

export interface PoemListDTO {
  readonly poems: readonly PoemDTO[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export type RandomPoemDTO = PoemDTO;

export interface PoemListParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly dynasty?: string;
  readonly type?: string;
  readonly author?: string;
}

export interface RandomPoemParams {
  readonly author?: string;
  readonly type?: string;
  readonly dynasty?: string;
  readonly char?: string;
}
