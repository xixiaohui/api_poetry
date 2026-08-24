import { POSTER_WIDTH, POSTER_HEIGHT } from "./renderer";

/**
 * Render an SVG poster to a PNG buffer (base64) using @napi-rs/canvas.
 * Fonts must be registered beforehand via ensureFontsRegistered().
 */
export async function renderSvgToPng(svg: string): Promise<string> {
  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
  const image = await loadImage(dataUrl);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);
  return canvas.toBuffer("image/png").toString("base64");
}

export { POSTER_WIDTH, POSTER_HEIGHT };
