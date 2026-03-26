import { readFile } from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";

import { getStrategyBySlug } from "@/js/data/obliqueStrategies";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";
import { type OgImageSize, getOgImageSize } from "@/js/utils/ogImageSizes";

import type { Route } from "./+types/$card[.]png";

const BASE_IMAGE_WIDTH = 1200;
const BASE_IMAGE_HEIGHT = 630;
const BASE_CARD_WIDTH = 700;
const BASE_CARD_HEIGHT = 500;
const fontDataPromise = Promise.all([
  readFile("/System/Library/Fonts/Supplemental/Arial.ttf"),
  readFile("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
]);

function getScale([width, height]: OgImageSize): number {
  return Math.min(width / BASE_IMAGE_WIDTH, height / BASE_IMAGE_HEIGHT);
}

async function renderPng(title: string, background: string, size: OgImageSize): Promise<Buffer> {
  const [arialRegular, arialBold] = await fontDataPromise;
  const [width, height] = size;
  const scale = getScale(size);
  const cardWidth = Math.round(BASE_CARD_WIDTH * scale);
  const cardHeight = Math.round(BASE_CARD_HEIGHT * scale);
  const borderRadius = `${Math.round(24 * scale)}px`;
  const borderWidth = `${Math.max(1, Math.round(scale))}px`;
  const cardPadding = `${Math.round(42 * scale)}px`;
  const shadowBlur = Math.round(60 * scale);
  const shadowOffsetY = Math.round(18 * scale);
  const titleBaseSize = title.length > 80 ? 52 : title.length > 40 ? 64 : 78;
  const titleFontSize = `${Math.max(26, Math.round(titleBaseSize * scale))}px`;

  const svg = await satori(
    <div
      style={{
        alignItems: "center",
        background,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          border: `${borderWidth} solid rgba(23, 23, 23, 0.12)`,
          borderRadius,
          boxShadow: `0 ${shadowOffsetY}px ${shadowBlur}px rgba(23, 23, 23, 0.12)`,
          color: "#171717",
          display: "flex",
          height: `${cardHeight}px`,
          justifyContent: "center",
          padding: cardPadding,
          textAlign: "center",
          width: `${cardWidth}px`,
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            fontSize: titleFontSize,
            fontWeight: 700,
            justifyContent: "center",
            lineHeight: 1.05,
            whiteSpace: "pre-wrap",
          }}
        >
          {title}
        </div>
      </div>
    </div>,
    {
      fonts: [
        {
          data: arialRegular,
          name: "Arial",
          style: "normal",
          weight: 400,
        },
        {
          data: arialBold,
          name: "Arial",
          style: "normal",
          weight: 700,
        },
      ],
      height,
      width,
    },
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}

export async function loader({ params }: Route.LoaderArgs) {
  const size = getOgImageSize(params.size);
  const strategy = getStrategyBySlug(params.card);

  if (!size || !strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  const { background } = getStrategyTheme(strategy);
  const png = await renderPng(strategy.message, background, size);

  return new Response(new Uint8Array(png), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}
