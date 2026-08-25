import type { PosterFilter, PosterSource, PosterTheme } from "./types";
import { FONT_ALIAS } from "./fonts";

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1440;

/** 3:4 竖版，适配小红书等社媒渠道 */

// 注意: 属性值内使用单引号包裹含空格的字族名，避免破坏 XML 双引号属性
const FONT_FAMILY = `${FONT_ALIAS}, 'Noto Serif CJK SC', 'Noto Serif SC', 'Songti SC', STSong, SimSun, serif`;

/**
 * 印章字体链：KaiTi（楷体书法感，GlobalFonts 注册）优先；fallback 到 FONT_FAMILY（已验证可命中）。
 * 关键：必须把已注册的别名（poster-serif）放到 fallback 链中，否则 resvg 在系统未装楷体时
 * 会一路 fallback 到通用 serif，通用 serif 不含 CJK 字形，印章"诗""词"会渲染成 tofu（豆腐块）。
 * KaiTi 不加引号（作为 family name 字面查找），避免 resvg 在长链首项处理上整链失效。
 */
const SEAL_FONT_FAMILY = `KaiTi, ${FONT_FAMILY}`;

/**
 * 滤镜包（feColorMatrix 实现，resvg 与浏览器均支持，预览/下载渲染一致）：
 * none 原片 / sepia 复古 / warm 暖阳 / cool 清冷 / gray 黑白 / vivid 明艳
 */
const POSTER_SVG_FILTERS: Readonly<Record<PosterFilter, string | undefined>> = {
  none: undefined,
  sepia: `<filter id="poster-fx" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.393 0.769 0.189 0 0 0.349 0.686 0.168 0 0 0.272 0.534 0.131 0 0 0 0 0 1 0"/></filter>`,
  warm: `<filter id="poster-fx" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.08 0 0 0 0.02 0 1.03 0 0 0.01 0 0 0.92 0 0 0 0 0 1 0"/></filter>`,
  cool: `<filter id="poster-fx" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.95 0 0 0 0 0 0.98 0 0 0 0 0 1.08 0 0.03 0 0 0 1 0"/></filter>`,
  gray: `<filter id="poster-fx" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter>`,
  vivid: `<filter id="poster-fx" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.15 0 0 0 -0.06 0 1.15 0 0 -0.06 0 0 1.15 0 -0.06 0 0 0 1 0"/></filter>`,
};

interface ThemeConfig {
  readonly bgFrom: string;
  readonly bgTo: string;
  readonly text: string;
  readonly sub: string;
  readonly accent: string;
  readonly frame: string;
  readonly deco: "mountains" | "plum" | "moon";
  readonly footer: string;
  /** 文字描边色（接近纸色），给正文/标题加 halo，保证压在装饰图案上仍清晰可读 */
  readonly halo: string;
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
    halo: "#F4EDDC",
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
    halo: "#F8E9D5",
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
    halo: "#1C2338",
  },
};

const CONTENT_AREA_TOP = 280;
const CONTENT_AREA_BOTTOM = 1150;
const CONTENT_RIGHT = 738;
const CONTENT_LEFT = 172;
const BASE_FONT = 72;
const TITLE_X = 876;
/**
 * 列间距 = 字号 × COL_STEP_RATIO。
 * 1.4 倍：列间距 0.4 倍字号 ≈ 16px @ 39px 字号，避免列与列视觉粘连；
 * 同时绝句 4 列仍可达满字号 72。
 */
const COL_STEP_RATIO = 1.4;
/**
 * 行高 = 字号 × LINE_HEIGHT_RATIO（竖排正文行距）。
 * 1.3 倍：CJK 字形 ascent+descent 约 1.1-1.2em，留出 0.1-0.2em 纯空白（合理疏密）。
 * 注：之前用 1.55-1.7 倍是错误做法（实际是 resvg 的 tspan dy 定位 bug 导致字与字重叠，
 * 加大行距只是掩盖 bug。改为独立 <text> + 绝对 y 后，1.3 倍即可正常显示）。
 */
const LINE_HEIGHT_RATIO = 1.3;

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

  // 列数是字号的单调函数（字号越大列越多）。二分查找满足布局约束的最大字号，
  // 避免"从高到低一锤子砸到底"导致的过小字号（长词也不会低于 32，保证可读）。
  let lo = 32;
  let hi = BASE_FONT;
  let fontSize = lo;
  let columns: string[][] = [];

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const lineHeight = Math.max(1, Math.round(mid * LINE_HEIGHT_RATIO));
    const colStep = Math.max(1, Math.round(mid * COL_STEP_RATIO));
    const maxCharsPerCol = Math.max(3, Math.floor(availH / lineHeight));
    const maxColsTotal = Math.max(2, Math.floor(availW / colStep));
    const maxCols = Math.max(1, maxColsTotal - authorCols);
    const cols = splitColumns(content, maxCharsPerCol, maxCols);
    const totalCols = cols.length + authorCols;
    if (totalCols <= maxColsTotal) {
      fontSize = mid;
      columns = cols;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const lineHeight = Math.max(1, Math.round(fontSize * LINE_HEIGHT_RATIO));
  const colStep = Math.max(1, Math.round(fontSize * COL_STEP_RATIO));
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
  let fontSize = 104;
  // 标题描边 5px（每字上下各扩 2.5px），行距 1.1 倍
  let lineHeight = Math.round(fontSize * 1.1);
  let totalHeight = chars.length * lineHeight;
  while (totalHeight > (CONTENT_AREA_BOTTOM - CONTENT_AREA_TOP) - 40 && fontSize > 48) {
    fontSize -= 4;
    lineHeight = Math.round(fontSize * 1.1);
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
  halo: string,
  opacity = 1,
  // 描边随字号自适应：正文 72 号≈3.5px，小字号 1.5px 收窄。
  // 描边过宽在竖排行距受限时向外扩展吞噬字间空隙。
  strokeWidth = Math.max(1.5, Math.min(3.5, Math.round(fontSize * 0.045))),
): string {
  // 每个字用独立 <text> + 绝对 y 定位，而非 tspan dy。
  // resvg 对 tspan dy 的累加定位有 bug：后续字的基线未从上一字正确累加，
  // 导致竖排时"第 1/2 字视觉重叠"。绝对 y 坐标则渲染完全正确。
  const common = `x="${x}" font-size="${fontSize}" font-family="${FONT_FAMILY}" text-anchor="middle"`;
  const haloTexts: string[] = [];
  const fillTexts: string[] = [];
  column.forEach((ch, i) => {
    const yy = y + i * lineHeight;
    haloTexts.push(`<text ${common} y="${yy}" fill="none" stroke="${halo}" stroke-width="${strokeWidth}" stroke-linejoin="round" opacity="${opacity}">${escapeXml(ch)}</text>`);
    fillTexts.push(`<text ${common} y="${yy}" fill="${fill}" opacity="${opacity}">${escapeXml(ch)}</text>`);
  });
  return `${haloTexts.join("")}${fillTexts.join("")}`;
}

function renderSeal(): string {
  // 经典方形朱文印："回"字边框 + "诗词"两字同字号同字体上下均分（白文），整体缩小一倍
  return `<g transform="translate(912,158)">
    <rect width="60" height="60" rx="6" fill="#B23B2E" opacity="0.85"/>
    <rect x="3" y="3" width="54" height="54" rx="4" fill="none" stroke="#FDF6EA" stroke-width="1.5" opacity="0.8"/>
    <text x="30" y="25" font-size="26" font-family="${SEAL_FONT_FAMILY}" text-anchor="middle" fill="#FDF6EA" opacity="0.96">诗</text>
    <text x="30" y="54" font-size="26" font-family="${SEAL_FONT_FAMILY}" text-anchor="middle" fill="#FDF6EA" opacity="0.96">词</text>
  </g>`;
}

/**
 * 内容结尾"天地"长方形朱文印（白文竖排）：竖长印面，两字上下均分。
 * 放在正文最后一列（最左）末尾字下方，与作者列错开。
 */
function renderEndSeal(cx: number, topY: number, accent: string): string {
  return `<g transform="translate(${cx},${topY})">
    <rect x="0" y="0" width="44" height="64" rx="5" fill="${accent}" opacity="0.85"/>
    <rect x="2.5" y="2.5" width="39" height="59" rx="3.5" fill="none" stroke="#FDF6EA" stroke-width="1.2" opacity="0.8"/>
    <text x="22" y="24" font-size="22" font-family="${SEAL_FONT_FAMILY}" text-anchor="middle" fill="#FDF6EA" opacity="0.96">天</text>
    <text x="22" y="51" font-size="22" font-family="${SEAL_FONT_FAMILY}" text-anchor="middle" fill="#FDF6EA" opacity="0.96">地</text>
  </g>`;
}

function renderMountains(): string {
  // 山体峰值压在 1140px 以下，不侵入正文区（y<1150）；透明度调淡避免抢眼
  return `<g opacity="0.38">
    <path d="M0 1440 L0 1330 L170 1160 L345 1340 L530 1140 L710 1365 L890 1190 L1080 1345 L1080 1440 Z" fill="#D8C9AD"/>
    <path d="M0 1440 L0 1390 L235 1270 L435 1420 L645 1245 L865 1400 L1080 1290 L1080 1440 Z" fill="#C9B48F" opacity="0.7"/>
  </g>
  <ellipse cx="540" cy="1285" rx="470" ry="52" fill="#F2EAD8" opacity="0.6"/>`;
}

function plumBlossom(cx: number, cy: number, r: number): string {
  const petals: string[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 * Math.PI) / 180 - Math.PI / 2;
    const px = cx + r * 0.58 * Math.cos(angle);
    const py = cy + r * 0.58 * Math.sin(angle);
    petals.push(
      `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="#F3C6B0" opacity="0.82"/>`,
    );
  }
  return `<g>${petals.join("")}<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.36).toFixed(1)}" fill="#B2453A"/></g>`;
}

function renderPlum(): string {
  // 整体上移到顶部留白区（y<280），避开正文区；枝干/花朵透明度调淡
  return `<g>
    <path d="M60 200 C 150 170, 230 130, 310 80" stroke="#6B4A2F" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.5"/>
    <path d="M210 140 C 250 120, 290 110, 340 120" stroke="#6B4A2F" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.4"/>
    <path d="M150 170 C 180 155, 215 152, 248 165" stroke="#6B4A2F" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.38"/>
    ${plumBlossom(310, 80, 14)}
    ${plumBlossom(340, 120, 10)}
    ${plumBlossom(248, 165, 12)}
    ${plumBlossom(170, 185, 11)}
    ${plumBlossom(90, 230, 10)}
  </g>`;
}

function renderMoon(): string {
  // 月亮移到右上角，避开正文区（x≤738）与标题主体；星星仅分布在边缘留白区
  const stars = [
    [120, 90], [200, 150], [330, 90], [150, 200], [430, 70],
    [640, 70], [90, 260], [300, 160], [500, 150], [760, 90],
    [980, 120], [940, 70], [1010, 260], [80, 320],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#EDE6D6" opacity="0.4"/>`)
    .join("");
  return `<g>
    <circle cx="870" cy="210" r="92" fill="#EDE6D6" opacity="0.09"/>
    <circle cx="870" cy="210" r="65" fill="#F3E7C4" opacity="0.8"/>
    <circle cx="858" cy="197" r="7" fill="#E6D6AC" opacity="0.5"/>
    <circle cx="883" cy="231" r="4.5" fill="#E6D6AC" opacity="0.42"/>
    <circle cx="866" cy="230" r="3" fill="#E6D6AC" opacity="0.48"/>
    ${stars}
  </g>`;
}

function renderFrame(frame: string): string {
  return `<rect x="46" y="46" width="988" height="1348" rx="18" fill="none" stroke="${frame}" stroke-width="2" opacity="0.55"/>
  <rect x="58" y="58" width="964" height="1324" rx="14" fill="none" stroke="${frame}" stroke-width="1" opacity="0.3"/>`;
}

function renderFooter(theme: ThemeConfig): string {
  const line1 = `x="540" y="1320" text-anchor="middle" font-size="27" font-family="${FONT_FAMILY}"`;
  const line2 = `x="540" y="1362" text-anchor="middle" font-size="22" font-family="${FONT_FAMILY}"`;
  return `<text ${line1} fill="none" stroke="${theme.halo}" stroke-width="3" stroke-linejoin="round" opacity="0.9">每日一诗 · 静水深流</text>
  <text ${line1} fill="${theme.footer}" opacity="0.9">每日一诗 · 静水深流</text>
  <text ${line2} fill="none" stroke="${theme.halo}" stroke-width="2.5" stroke-linejoin="round" opacity="0.6">古诗词分享 · 传承经典</text>
  <text ${line2} fill="${theme.footer}" opacity="0.6">古诗词分享 · 传承经典</text>`;
}

function renderHeader(theme: ThemeConfig): string {
  const deco = theme.deco === "mountains" ? renderMountains() : theme.deco === "plum" ? renderPlum() : renderMoon();
  return `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#poster-bg)"/>
  <rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" filter="url(#poster-grain)"/>
  ${deco}
  ${renderFrame(theme.frame)}`;
}

export function buildPosterSvg(
  source: PosterSource,
  theme: PosterTheme,
  filter: PosterFilter = "none",
): string {
  const t = THEMES[theme];
  const fx = POSTER_SVG_FILTERS[filter];
  const title = computeTitleLayout(source.title);
  const authorText = [source.dynasty ?? "", source.author ?? ""]
    .filter(Boolean)
    .join("·")
    .replace(/\s+/g, "");
  const layout = computeContentLayout(source.content, authorText.length > 0);

  // 单列实际高度（末字符 baseline + 字号补正），用于垂直居中
  const colActualHeight = (n: number) => (n - 1) * layout.lineHeight + layout.fontSize;
  const longestCount = Math.max(...layout.columns.map((c) => c.length));
  // 将标题 + 正文作为一个视觉整体在画布上垂直居中
  // contentHeight 必须等于最长列实际占高（而非 lineHeight × 字数，后者会多算一个 lineHeight 导致整体偏高）
  const contentHeight = colActualHeight(longestCount);
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
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.03 0"/>
    </filter>
    ${fx ?? ""}
  </defs>`;

  // Title (vertical, right side, vertically centered with content)
  // 同正文：独立 <text> + 绝对 y，规避 resvg 的 tspan dy 定位 bug
  const titleCommon = `x="${TITLE_X}" font-size="${title.fontSize}" font-family="${FONT_FAMILY}" text-anchor="middle"`;
  const titleHalo: string[] = [];
  const titleFill: string[] = [];
  title.chars.forEach((ch, i) => {
    const yy = titleTopY + i * title.lineHeight;
    titleHalo.push(`<text ${titleCommon} y="${yy}" fill="none" stroke="${t.halo}" stroke-width="5" stroke-linejoin="round">${escapeXml(ch)}</text>`);
    titleFill.push(`<text ${titleCommon} y="${yy}" fill="${t.text}">${escapeXml(ch)}</text>`);
  });
  const titleEl = `${titleHalo.join("")}${titleFill.join("")}`;

  // Content columns, right → left
  const xStart = layout.xStart;
  const contentEls = layout.columns.map((column, i) => {
    // 每列按自己字数垂直居中（短列向下偏移，使其字位置接近长列中部，避免顶部/底部留白不均）
    const colTopY = groupTopY + Math.max(0, (contentHeight - colActualHeight(column.length)) / 2);
    return renderColumn(
      column,
      xStart - i * layout.colStep,
      colTopY,
      layout.fontSize,
      layout.lineHeight,
      t.text,
      t.halo,
    );
  });

  // Author column (leftmost, smaller, vertically centered with content)
  const authorFontSize = Math.round(layout.fontSize * 0.5);
  const authorLineHeight = Math.round(layout.lineHeight * 0.78);
  const authorLen = Math.max([...authorText].length, 1);
  // 作者列实际高度（末字符字号 + 行距），用于精确垂直居中
  const authorColHeight = (authorLen - 1) * authorLineHeight + authorFontSize;
  const authorTopY = groupTopY + Math.max(0, (contentHeight - authorColHeight) / 2);
  const authorEls =
    authorText.length > 0
      ? renderColumn(
          [...authorText],
          xStart - layout.columns.length * layout.colStep,
          authorTopY,
          authorFontSize,
          authorLineHeight,
          t.sub,
          t.halo,
          1,
        )
      : "";

  // "天地"印：放在全部诗文的最后。
  // 竖排从右往左读，作者列（最左）是诗文最后读到的内容，故印放在作者列末尾字下方；
  // 无作者时，放在最长正文列（内容最深点）末尾字下方。
  let sealAnchorX: number;
  let sealAnchorBottomY: number;
  if (authorText.length > 0) {
    // 作者列末尾字 y = authorTopY + (authorLen - 1) * authorLineHeight + 字号补正
    const authorX = xStart - layout.columns.length * layout.colStep;
    const authorBottomY = authorTopY + (authorLen - 1) * authorLineHeight;
    sealAnchorX = authorX;
    sealAnchorBottomY = authorBottomY;
  } else {
    let longestIdx = 0;
    for (let i = 1; i < layout.columns.length; i++) {
      if (layout.columns[i].length > layout.columns[longestIdx].length) longestIdx = i;
    }
    const longestCol = layout.columns[longestIdx];
    sealAnchorX = xStart - longestIdx * layout.colStep;
    sealAnchorBottomY = groupTopY + (longestCol.length - 1) * layout.lineHeight;
  }
  const endSealTopY = sealAnchorBottomY + layout.lineHeight * 0.5;
  const endSealEl = renderEndSeal(sealAnchorX - 22, endSealTopY, t.accent);

  // 滤镜只作用于背景/装饰/框架层，文字、印章保持原色 —— 无论选哪种滤镜，正文都清晰可读
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" viewBox="0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}" preserveAspectRatio="xMidYMid meet">
${defs}
${fx ? '<g filter="url(#poster-fx)">' : ""}
${renderHeader(t)}
${fx ? "</g>" : ""}
${renderSeal()}
${titleEl}
${contentEls.join("\n")}
${authorEls}
${endSealEl}
${renderFooter(t)}
</svg>`;
  return svg;
}
