import { createHash } from "node:crypto";
import { cache } from "@/shared/cache";
import { poemService } from "@/modules/poem/service";
import type { PosterInput } from "./schema";
import type { PosterResult, PosterSource } from "./types";
import { buildPosterSvg, POSTER_WIDTH, POSTER_HEIGHT } from "./renderer";
import { ensureFontsRegistered } from "./fonts";
import { renderSvgToPng } from "./png";

const CACHE_TTL = 60 * 60 * 24; // 1 day

function sourceCacheKey(source: PosterSource, theme: string): string {
  const hash = createHash("sha1")
    .update(`${source.poemId ?? ""}|${source.title}|${source.content}|${source.author ?? ""}|${source.dynasty ?? ""}`)
    .digest("hex")
    .slice(0, 16);
  return `poetry:poster:${hash}:${theme}`;
}

function toFilename(value: string): string {
  const safe = value.replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 24);
  return safe || "poem";
}

async function resolveSource(input: PosterInput): Promise<PosterSource> {
  if (input.poemId) {
    const poem = await poemService.getById(input.poemId);
    return {
      poemId: poem.id,
      title: poem.title,
      content: poem.content,
      author: poem.author,
      dynasty: poem.dynasty,
    };
  }
  return {
    title: input.title!,
    content: input.content!,
    author: input.author ?? null,
    dynasty: input.dynasty ?? null,
  };
}

export const posterService = {
  async generate(input: PosterInput): Promise<PosterResult> {
    const source = await resolveSource(input);
    const key = sourceCacheKey(source, input.theme);

    // SVG is small and cacheable; PNG is generated on demand so fresh fonts are always used.
    const cached = await cache.get<{ svg: string }>(key);
    const svg = cached?.svg ?? buildPosterSvg(source, input.theme);
    if (!cached) {
      await cache.set(key, { svg }, CACHE_TTL);
    }

    let pngBase64: string | undefined;
    if (input.format !== "svg" && (await ensureFontsRegistered())) {
      pngBase64 = await renderSvgToPng(svg).catch((err) => {
        console.warn("[poster] PNG render failed, returning SVG only:", (err as Error).message);
        return undefined;
      });
    }

    const filename = `${toFilename(source.title)}_${input.theme}.png`;
    return {
      svg,
      pngBase64,
      width: POSTER_WIDTH,
      height: POSTER_HEIGHT,
      theme: input.theme,
      filename,
      title: source.title,
      author: source.author,
      dynasty: source.dynasty,
    };
  },
};
