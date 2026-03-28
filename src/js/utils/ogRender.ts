import type { Resvg as ResvgType } from "@resvg/resvg-wasm";

let ResvgClass: typeof ResvgType | null = null;

async function ensureWasmInitialized(): Promise<typeof ResvgType> {
  if (ResvgClass) return ResvgClass;
  const [resvgModule, wasmModule] = await Promise.all([
    import("@resvg/resvg-wasm"),
    // @ts-expect-error -- WASM module import handled by @cloudflare/vite-plugin
    import("@resvg/resvg-wasm/index_bg.wasm"),
  ]);
  await resvgModule.initWasm(wasmModule.default);
  ResvgClass = resvgModule.Resvg;
  return ResvgClass;
}

export async function svgToPng(svg: string): Promise<Uint8Array> {
  const Resvg = await ensureWasmInitialized();
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
