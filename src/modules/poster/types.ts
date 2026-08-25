export type PosterTheme = "ink" | "sunset" | "night";

export const POSTER_THEMES = ["ink", "sunset", "night"] as const satisfies readonly PosterTheme[];

export type PosterFilter = "none" | "sepia" | "warm" | "cool" | "gray" | "vivid";

export const POSTER_FILTERS = ["none", "sepia", "warm", "cool", "gray", "vivid"] as const satisfies readonly PosterFilter[];

export interface PosterSource {
  readonly poemId?: number;
  readonly title: string;
  readonly content: string;
  readonly author?: string | null;
  readonly dynasty?: string | null;
}

export interface PosterResult {
  /** Stylized SVG source, renderable in browsers and XHS automation scripts. */
  readonly svg: string;
  /** Server-rendered PNG as base64. Available when a CJK font is found on the server. */
  readonly pngBase64?: string;
  readonly width: number;
  readonly height: number;
  readonly theme: PosterTheme;
  readonly filter: PosterFilter;
  readonly filename: string;
  readonly title: string;
  readonly author?: string | null;
  readonly dynasty?: string | null;
}

export type PosterFormat = "svg" | "png" | "both";

export interface PosterThemeMeta {
  readonly id: PosterTheme;
  readonly label: string;
  readonly description: string;
}

export interface PosterFilterMeta {
  readonly id: PosterFilter;
  readonly label: string;
  readonly description: string;
}
