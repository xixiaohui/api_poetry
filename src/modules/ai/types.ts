export interface AIAnalysisDTO {
  readonly background: string;
  readonly appreciation: string;
  readonly keywords: readonly string[];
  readonly emotions: readonly string[];
}

export interface AIAskDTO {
  readonly answer: string;
}

export interface AITranslateDTO {
  readonly original: string;
  readonly translation: string;
  readonly notes: readonly string[];
}
