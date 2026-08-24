import { existsSync } from "node:fs";

/** Alias used by the SVG so resvg / browser both render CJK glyphs. */
export const FONT_ALIAS = "poster-serif";

/** Font discovery order — first existing path wins. */
const FONT_CANDIDATES: readonly string[] = [
  // Windows
  "C:\\Windows\\Fonts\\simsun.ttc",
  "C:\\Windows\\Fonts\\simfang.ttf",
  "C:\\Windows\\Fonts\\simkai.ttf",
  "C:\\Windows\\Fonts\\msyh.ttc",
  "C:\\Windows\\Fonts\\msyhbd.ttc",
  "C:\\Windows\\Fonts\\simhei.ttf",
  // macOS
  "/System/Library/Fonts/PingFang.ttc",
  "/System/Library/Fonts/Supplemental/Songti.ttc",
  "/System/Library/Fonts/STHeiti Medium.ttc",
  "/System/Library/Fonts/STSong.ttc",
  // Linux (Debian/Ubuntu)
  "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
  "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
  "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
  "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
  // Alpine / font-noto-cjk package
  "/usr/share/fonts/noto-cjk/NotoSerifCJK-Regular.ttc",
  "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc",
  // Generic Linux fallbacks
  "/usr/share/fonts/noto-cjk/NotoSerifCJKsc-Regular.otf",
  "/usr/share/fonts/google-noto-cjk/NotoSerifCJK-Regular.ttc",
];

let checked = false;
let available = false;
let registeredPath: string | null = null;

export async function ensureFontsRegistered(): Promise<boolean> {
  if (checked) return available;
  checked = true;
  try {
    const { GlobalFonts } = await import("@napi-rs/canvas");
    for (const candidate of FONT_CANDIDATES) {
      if (!existsSync(candidate)) continue;
      try {
        GlobalFonts.registerFromPath(candidate, FONT_ALIAS);
        available = true;
        registeredPath = candidate;
        console.log(`[poster] registered CJK font: ${candidate}`);
        break;
      } catch (err) {
        console.warn(
          `[poster] failed to register ${candidate}: ${(err as Error).message}`,
        );
      }
    }
  } catch (err) {
    console.warn(`[poster] @napi-rs/canvas unavailable: ${(err as Error).message}`);
  }
  if (!available) {
    console.warn(
      "[poster] no CJK font discovered — server PNG will be skipped (SVG still returned)",
    );
  }
  return available;
}

export function getRegisteredFontPath(): string | null {
  return registeredPath;
}
