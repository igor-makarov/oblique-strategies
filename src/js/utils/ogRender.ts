import { Resvg, initWasm as initResvg } from "@resvg/resvg-wasm";
// @ts-expect-error -- WASM module import handled by @cloudflare/vite-plugin
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import satoriImpl, { init as initSatori } from "satori/standalone";
import type { SatoriOptions } from "satori/standalone";
// @ts-expect-error -- WASM module import handled by @cloudflare/vite-plugin
import yogaWasm from "satori/yoga.wasm";

let initialized = false;

async function ensureInitialized(): Promise<void> {
  if (initialized) return;
  await Promise.all([initSatori(yogaWasm), initResvg(resvgWasm)]);
  initialized = true;
}

export async function satori(element: React.ReactNode, options: SatoriOptions): Promise<string> {
  await ensureInitialized();
  return satoriImpl(element, options);
}

export async function svgToPng(svg: string): Promise<Uint8Array> {
  await ensureInitialized();
  const resvg = new Resvg(svg);
  const rendered = resvg.render();
  const png = rendered.asPng();
  rendered.free();
  return png;
}

let fontDataCache: ArrayBuffer | null = null;

export async function getInterBoldFont(requestUrl: string): Promise<ArrayBuffer> {
  if (fontDataCache) return fontDataCache;
  const fontUrl = new URL("/fonts/inter-latin-700-normal.woff", requestUrl);
  const data = await fetch(fontUrl).then((r) => r.arrayBuffer());
  fontDataCache = data;
  return data;
}
