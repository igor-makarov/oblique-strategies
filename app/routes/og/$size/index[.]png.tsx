import { readFile } from "node:fs/promises";
import satori from "satori";
import sharp from "sharp";

import { type OgImageSize, getOgImageSize } from "@/js/utils/ogImageSizes";

import type { Route } from "./+types/index[.]png";

const fontDataPromise = readFile("node_modules/@fontsource/inter/files/inter-latin-700-normal.woff");

const title = "Oblique Strategies";

function rainbowLetters(text: string): { letter: string; color: string }[] {
  const letters = text.split("");
  const nonSpaceCount = letters.filter((letter) => letter !== " ").length;
  let idx = 0;

  return letters.map((letter) => {
    if (letter === " ") {
      return { letter, color: "#171717" };
    }

    const hue = (idx * 360) / nonSpaceCount;
    idx += 1;

    return { letter, color: `hsl(${hue} 65% 34%)` };
  });
}

async function renderPng([width, height]: OgImageSize): Promise<Buffer> {
  const interBold = await fontDataPromise;
  const cardWidthPx = width * 0.5833333333;
  const cardHeightPx = (cardWidthPx * 5) / 7;
  const titleFontSize = cardHeightPx * 0.11;
  const cardWidth = "58.333333%";
  const cardHeight = `${(cardHeightPx / height) * 100}%`;
  const contentPadding = `${Math.min(cardWidthPx, cardHeightPx) * 0.09}px`;
  const letters = rainbowLetters(title);

  const svg = await satori(
    <div
      style={{
        alignItems: "center",
        background: "#f6f3ea",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.92)",
          border: "1px solid rgba(23, 23, 23, 0.12)",
          borderRadius: "3.43%",
          boxShadow: "0 18px 60px rgba(23, 23, 23, 0.12)",
          color: "#171717",
          display: "flex",
          fontFamily: "Inter",
          height: cardHeight,
          width: cardWidth,
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            height: "100%",
            justifyContent: "center",
            padding: contentPadding,
            textAlign: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              justifyContent: "center",
              lineHeight: 1.05,
            }}
          >
            {letters.map((item, index) => (
              <span key={index} style={{ color: item.color }}>
                {item.letter === " " ? "\u00A0" : item.letter}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>,
    {
      fonts: [
        {
          data: interBold,
          name: "Inter",
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

  if (!size) {
    throw new Response("Not Found", { status: 404 });
  }

  const png = await renderPng(size);

  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
