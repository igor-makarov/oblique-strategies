import interBoldWoffDataUrl from "@fontsource/inter/files/inter-latin-700-normal.woff?inline";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import satori, { init as initSatori } from "satori/standalone";

import type { ReactNode } from "react";

import type { OgImageSize } from "#src/js/utils/ogImageSizes";

const cardWidthRatio = 0.5833333333;
const cardAspectRatio = 5 / 7;

let fontDataPromise: Promise<Uint8Array> | null = null;
let resvgInitPromise: Promise<void> | null = null;
let satoriInitPromise: Promise<void> | null = null;

async function loadBinaryAsset(assetUrl: string): Promise<Uint8Array> {
  const response = await fetch(assetUrl);

  if (!response.ok) {
    throw new Error(`Failed to load asset: ${assetUrl}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function getFontData(): Promise<Uint8Array> {
  return (fontDataPromise ??= loadBinaryAsset(interBoldWoffDataUrl));
}

async function ensureResvgInitialized(): Promise<void> {
  return (resvgInitPromise ??=
    // @ts-expect-error Vite + Cloudflare resolve this to a compiled WebAssembly.Module.
    import("@resvg/resvg-wasm/index_bg.wasm?module").then(({ default: resvgWasmModule }) => initWasm(resvgWasmModule)));
}

async function ensureSatoriInitialized(): Promise<void> {
  return (satoriInitPromise ??=
    // @ts-expect-error Vite + Cloudflare resolve this to a compiled WebAssembly.Module.
    import("satori/yoga.wasm?module").then(({ default: yogaWasmModule }) => initSatori(yogaWasmModule)));
}

export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export function getOgCardLayout([width, height]: OgImageSize) {
  const cardWidthPx = width * cardWidthRatio;
  const cardHeightPx = cardWidthPx * cardAspectRatio;

  return {
    cardHeight: `${(cardHeightPx / height) * 100}%`,
    cardHeightPx,
    cardWidth: `${cardWidthRatio * 100}%`,
    cardWidthPx,
    height,
    width,
  };
}

export async function renderImage(markup: ReactNode, size: OgImageSize): Promise<Uint8Array> {
  const interBold = await getFontData();
  await Promise.all([ensureSatoriInitialized(), ensureResvgInitialized()]);

  const [width, height] = size;
  const svg = await satori(markup, {
    fonts: [
      {
        data: toArrayBuffer(interBold),
        name: "Inter",
        style: "normal",
        weight: 700,
      },
    ],
    height,
    width,
  });

  const resvg = new Resvg(svg, {
    font: {
      defaultFontFamily: "Inter",
      fontBuffers: [interBold],
      sansSerifFamily: "Inter",
    },
  });

  try {
    const rendered = resvg.render();

    try {
      return rendered.asPng();
    } finally {
      rendered.free();
    }
  } finally {
    resvg.free();
  }
}
