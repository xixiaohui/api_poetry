import type { PosterSource, PosterTheme } from "./types";
import { FONT_ALIAS } from "./fonts";

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1440;

/** 3:4 竖版，适配小红书等社媒渠道 */

// 注意: 属性值内使用单引号包裹含空格的字族名，避免破坏 XML 双引号属性
const FONT_FAMILY = `${FONT_ALIAS}, 'Noto Serif CJK SC', 'Noto Serif SC', 'Songti SC', STSong, SimSun, serif`;

interface ThemeConfig {
  readonly bgFrom: string;
  readonly bgTo: string;
  readonly text: string;
  readonly sub: string;
  readonly accent: string;
  readonly frame: string;
  readonly deco: "mountains" | "plum" | "moon";
  readonly footer: string;
}

const THEMES: Record<PosterTheme, ThemeConfig> = {
  ink: {
    bgFrom: "#F7F1E4",
    bgTo: "#E9DEC7",
    text: "#3B3A36",
    sub: "#6E6757",
    accent: "#B23B2E",
    frame: "#8C7B5E",
    deco: "mountains",
    footer: "#8C7B5E",
  },
  sunset: {
    bgFrom: "#F9EAD9",
    bgTo: "#EBC9A2",
    text: "#5A4632",
    sub: "#8A6E4D",
    accent: "#C2452F",
    frame: "#A97B4A",
    deco: "plum",
    footer: "#A97B4A",
  },
  night: {
    bgFrom: "#20273A",
    bgTo: "#2E3650",
    text: "#EDE6D6",
    sub: "#A9B2C6",
    accent: "#C9A05C",
    frame: "#8E9BB0",
    deco: "moon",
    footer: "#8E9BB0",
  },
};

const CONTENT_AREA_TOP = 280;
const CONTENT_AREA_BOTTOM = 1080;
const CONTENT_RIGHT = 738;
const CONTENT_LEFT = 172;
const BASE_FONT = 62;
const TITLE_X = 876;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function splitColumns(
  content: string,
  maxCharsPerCol: number,
  maxCols: number,
): string[][] {
  const lines = content
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, ""))
    .filter((l) => l.length > 0);

  // 行数 ≤ 允许列数: 逐行排成竖列 (绝句/律诗, 保留行结构)
  if (lines.length > 0 && lines.length <= maxCols) {
    const cols: string[][] = [];
    for (const line of lines) {
      const chars = [...line];
      for (let i = 0; i < chars.length; i += maxCharsPerCol) {
        cols.push(chars.slice(i, i + maxCharsPerCol));
      }
    }
    return cols;
  }
  // 行数过多 (如长词): 拍平文本后按容量填入列
  const flat = [...content.replace(/\s+/g, "")];
  const cols: string[][] = [];
  for (let i = 0; i < flat.length; i += maxCharsPerCol) {
    cols.push(flat.slice(i, i + maxCharsPerCol));
  }
  return cols;
}

interface ContentLayout {
  readonly columns: string[][];
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly colStep: number;
  readonly xStart: number;
}

function computeContentLayout(
  content: string,
  hasAuthor: boolean,
): ContentLayout {
  const availW = CONTENT_RIGHT - CONTENT_LEFT;
  const availH = CONTENT_AREA_BOTTOM - CONTENT_AREA_TOP;
  const authorCols = hasAuthor ? 1 : 0;

  let fontSize = BASE_FONT;
  let columns: string[][] = [];

  for (let i = 0; i < 40; i++) {
    const lineHeight = Math.max(1, Math.round(fontSize * 1.18));
    const colStep = Math.max(1, Math.round(fontSize * 1.85));
    const maxCharsPerCol = Math.max(3, Math.floor(availH / lineHeight));
    const maxColsTotal = Math.max(2, Math.floor(availW / colStep));
    const maxCols = Math.max(1, maxColsTotal - authorCols);
    columns = splitColumns(content, maxCharsPerCol, maxCols);
    const totalCols = columns.length + authorCols;
    if (totalCols <= maxColsTotal || fontSize <= 24) break;
    fontSize = Math.max(24, Math.floor(availW / (totalCols * 1.85)));
  }

  const lineHeight = Math.max(1, Math.round(fontSize * 1.18));
  const colStep = Math.max(1, Math.round(fontSize * 1.85));
  const xStart = CONTENT_RIGHT;
  return { columns, fontSize, lineHeight, colStep, xStart };
}

interface TitleLayout {
  readonly chars: string[];
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly height: number;
}

function computeTitleLayout(title: string): TitleLayout {
  const chars = [...title.replace(/\s+/g, "")].slice(0, 16);
  if (chars.length === 0) chars.push("诗");
  let fontSize = 96;
  let lineHeight = Math.round(fontSize * 1.12);
  let totalHeight = chars.length * lineHeight;
  while (totalHeight > (CONTENT_AREA_BOTTOM - CONTENT_AREA_TOP) - 40 && fontSize > 48) {
    fontSize -= 4;
    lineHeight = Math.round(fontSize * 1.12);
    totalHeight = chars.length * lineHeight;
  }
  return { chars, fontSize, lineHeight, height: totalHeight };
}

function renderColumn(
  column: string[],
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  fill: string,
  opacity = 1,
): string {
  const tspans = column
    .map(
      (ch, i) =>
        `<tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(ch)}</tspan>`,
    )
    .join("");
  return `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="${FONT_FAMILY}" text-anchor="middle" fill="${fill}" opacity="${opacity}">${tspans}</text>`;
}

function renderSeal(): string {
  return `<g transform="translate(916,132)">
    <rect width="112" height="112" rx="10" fill="#B23B2E" opacity="0.92"/>
    <rect x="8" y="8" width="96" height="96" rx="6" fill="none" stroke="#F7F1E4" stroke-width="2" opacity="0.85"/>
    <text x="56" y="66" font-size="44" font-family="${FONT_FAMILY}" text-anchor="middle" fill="#FDF6EA" opacity="0.95">诗</text>
    <text x="56" y="104" font-size="30" font-family="${FONT_FAMILY}" text-anchor="middle" fill="#FDF6EA" opacity="0.95">词</text>
  </g>`;
}

function renderMountains(): string {
  return `<g opacity="0.55">
    <path d="M0 1440 L0 1220 L170 1050 L345 1230 L530 1030 L710 1255 L890 1080 L1080 1235 L1080 1440 Z" fill="#D8C9AD"/>
    <path d="M0 1440 L0 1330 L235 1185 L435 1350 L645 1160 L865 1345 L1080 1220 L1080 1440 Z" fill="#C9B48F" opacity="0.75"/>
  </g>
  <ellipse cx="540" cy="1170" rx="470" ry="52" fill="#F2EAD8" opacity="0.85"/>`;
}

function plumBlossom(cx: number, cy: number, r: number): string {
  const petals: string[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 * Math.PI) / 180 - Math.PI / 2;
    const px = cx + r * 0.58 * Math.cos(angle);
    const py = cy + r * 0.58 * Math.sin(angle);
    petals.push(
      `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="#F3C6B0" opacity="0.92"/>`,
    );
  }
  return `<g>${petals.join("")}<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.36).toFixed(1)}" fill="#C2452F"/></g>`;
}

function renderPlum(): string {
  return `<g>
    <path d="M60 440 C 150 410, 230 370, 310 320" stroke="#6B4A2F" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.7"/>
    <path d="M210 380 C 250 360, 290 350, 340 360" stroke="#6B4A2F" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.55"/>
    <path d="M150 410 C 180 395, 215 392, 248 405" stroke="#6B4A2F" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5"/>
    ${plumBlossom(310, 320, 14)}
    ${plumBlossom(340, 360, 10)}
    ${plumBlossom(248, 405, 12)}
    ${plumBlossom(170, 425, 11)}
    ${plumBlossom(90, 470, 10)}
  </g>`;
}

function renderMoon(): string {
  const stars = [
    [120, 240], [220, 160], [330, 260], [150, 420], [420, 120],
    [620, 90], [90, 560], [300, 480], [520, 240], [760, 140],
    [250, 620], [460, 380], [100, 700], [700, 320],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#EDE6D6" opacity="0.55"/>`)
    .join("");
  return `<g>
    <circle cx="700" cy="360" r="220" fill="#EDE6D6" opacity="0.08"/>
    <circle cx="700" cy="360" r="170" fill="#F3E7C4" opacity="0.95"/>
    <circle cx="672" cy="326" r="18" fill="#E6D6AC" opacity="0.6"/>
    <circle cx="722" cy="402" r="11" fill="#E6D6AC" opacity="0.5"/>
    <circle cx="688" cy="398" r="7" fill="#E6D6AC" opacity="0.55"/>
    ${stars}
  </g>`;
}

function renderFrame(frame: string): string {
  return `<rect x="46" y="46" width="988" height="1348" rx="18" fill="none" stroke="${frame}" stroke-width="2" opacity="0.55"/>
  <rect x="58" y="58" width="964" height="1324" rx="14" fill="none" stroke="${frame}" stroke-width="1" opacity="0.3"/>`;
}

function renderFooter(theme: ThemeConfig): string {
  return `<text x="540" y="1320" text-anchor="middle" font-size="27" font-family="${FONT_FAMILY}" fill="${theme.footer}" opacity="0.9">每日一诗 · 静水深流</text>
  <text x="540" y="1362" text-anchor="middle" font-size="22" font-family="${FONT_FAMILY}" fill="${theme.footer}" opacity="0.6">古诗词分享 · 传承经典</text>`;
}

function renderHeader(theme: ThemeConfig): string {
  const deco = theme.deco === "mountains" ? renderMountains() : theme.deco === "plum" ? renderPlum() : renderMoon();
  return `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#poster-bg)"/>
  <rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" filter="url(#poster-grain)"/>
  ${deco}
  ${renderFrame(theme.frame)}`;
}

export function buildPosterSvg(source: PosterSource, theme: PosterTheme): string {
  const t = THEMES[theme];
  const title = computeTitleLayout(source.title);
  const authorText = [source.dynasty ?? "", source.author ?? ""]
    .filter(Boolean)
    .join("·")
    .replace(/\s+/g, "");
  const layout = computeContentLayout(source.content, authorText.length > 0);

  // 将标题 + 正文作为一个视觉整体在画布上垂直居中
  const contentHeight = layout.lineHeight * Math.max(...layout.columns.map((c) => c.length));
  const groupHeight = Math.max(contentHeight, title.height);
  const groupTopY = CONTENT_AREA_TOP + Math.max(20, (CONTENT_AREA_BOTTOM - CONTENT_AREA_TOP - groupHeight) / 2);
  const titleTopY = groupTopY + Math.max(0, (contentHeight - title.height) / 2);

  const defs = `<defs>
    <linearGradient id="poster-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.bgFrom}"/>
      <stop offset="1" stop-color="${t.bgTo}"/>
    </linearGradient>
    <filter id="poster-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.07 0"/>
    </filter>
  </defs>`;

  // Title (vertical, right side, vertically centered with content)
  const titleTspans = title.chars
    .map(
      (ch, i) =>
        `<tspan x="${TITLE_X}" dy="${i === 0 ? 0 : title.lineHeight}">${escapeXml(ch)}</tspan>`,
    )
    .join("");
  const titleEl = `<text x="${TITLE_X}" y="${titleTopY}" font-size="${title.fontSize}" font-family="${FONT_FAMILY}" text-anchor="middle" fill="${t.text}">${titleTspans}</text>`;

  // Content columns, right → left
  const xStart = layout.xStart;
  const contentEls = layout.columns.map((column, i) =>
    renderColumn(
      column,
      xStart - i * layout.colStep,
      groupTopY,
      layout.fontSize,
      layout.lineHeight,
      t.text,
    ),
  );

  // Author column (leftmost, smaller, vertically centered with content)
  const authorEls =
    authorText.length > 0
      ? renderColumn(
          [...authorText],
          xStart - layout.columns.length * layout.colStep,
          groupTopY + (contentHeight - layout.fontSize * Math.max([...authorText].length, 1)) / 2,
          Math.round(layout.fontSize * 0.5),
          Math.round(layout.lineHeight * 0.78),
          t.sub,
        )
      : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" preserveAspectRatio="xMidYMid meet">
${defs}
${renderHeader(t)}
${renderSeal()}
${titleEl}
${contentEls.join("\n")}
${authorEls}
${renderFooter(t)}
</svg>`;
  return svg;
}
