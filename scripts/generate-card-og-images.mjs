import { Resvg } from "@resvg/resvg-js";
import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { html } from "satori-html";

const outputWidth = 1200;
const outputHeight = 630;
const cardWidth = 700;
const cardHeight = 500;
const cardPagesDir = fileURLToPath(new URL("../build/client/cards", import.meta.url));
const imageOutputDir = fileURLToPath(new URL("../build/client/og/cards", import.meta.url));

const regularFontCandidates = [
  process.env.SATORI_FONT_REGULAR_PATH,
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  "C:\\Windows\\Fonts\\arial.ttf",
].filter(Boolean);

const boldFontCandidates = [
  process.env.SATORI_FONT_BOLD_PATH,
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "/Library/Fonts/Arial Bold.ttf",
  "C:\\Windows\\Fonts\\arialbd.ttf",
].filter(Boolean);

const namedHtmlEntities = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
};

function decodeHtmlEntities(value) {
  return value.replace(/(&#x[0-9A-Fa-f]+|&#\d+|&(?:amp|apos|gt|lt|quot);)/gi, (entity) => {
    if (entity.startsWith("&#")) {
      const isHex = entity[2] === "x";
      const codePoint = Number.parseInt(entity.slice(isHex ? 3 : 2, -1), isHex ? 16 : 10);

      return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
    }

    return namedHtmlEntities[entity.slice(1, -1).toLowerCase()] ?? entity;
  });
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function readStyleValue(tagMarkup, property) {
  const styleMarkup = tagMarkup?.match(/style=["']([^"']*)["']/)?.[1];
  const value = styleMarkup?.match(new RegExp(`${property}\\s*:\\s*([^;]+)`, "i"))?.[1];
  return value?.trim();
}

function readCardPageData(pageHtml) {
  const bodyTag = pageHtml.match(/<body[^>]*>/)?.[0];
  const strategyKickerTag = pageHtml.match(/<div[^>]*\bclass=['"][^'"]*\bstrategy-kicker\b[^'"]*['"][^>]*>/)?.[0];
  const background = readStyleValue(bodyTag, "background");
  const accent = readStyleValue(strategyKickerTag, "color");
  const message = pageHtml.match(/<h1[^>]*\bclass=['"][^'"]*\bstrategy-message\b[^'"]*['"][^>]*>\s*<span[^>]*>([\s\S]*?)<\/span>\s*<\/h1>/)?.[1];

  if (!background || !accent || !message) {
    throw new Error("Unable to read prerendered card data from HTML");
  }

  return {
    accent,
    background,
    message: decodeHtmlEntities(message),
  };
}

function getMessageFontSize(message) {
  const longestLine = Math.max(...message.split("\n").map((line) => line.trim().length));

  if (longestLine > 45) return 44;
  if (longestLine > 34) return 52;
  if (longestLine > 24) return 60;
  if (longestLine > 16) return 68;

  return 76;
}

function renderCardHtml({ accent, background, message }) {
  const messageFontSize = getMessageFontSize(message);
  const messageMarkup = escapeHtml(message).replaceAll("\n", "<br />");

  return html(`
    <div
      style="
        width: ${outputWidth}px;
        height: ${outputHeight}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${background};
        color: #171717;
        font-family: 'DejaVu Sans';
      "
    >
      <div
        style="
          width: ${cardWidth}px;
          height: ${cardHeight}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(23,23,23,0.12);
          border-radius: 24px;
          box-shadow: 0 18px 60px rgba(23,23,23,0.12);
          padding: 48px;
          text-align: center;
        "
      >
        <div
          style="
            color: ${accent};
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: nowrap;
            margin: 0 0 20px;
          "
        >
          Oblique Strategies
        </div>
        <div
          style="
            font-size: ${messageFontSize}px;
            font-weight: 700;
            line-height: 1.05;
            text-align: center;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          ${messageMarkup}
        </div>
      </div>
    </div>
  `);
}

async function findFontPath(candidates, label) {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }

  const envVar = label === "regular" ? "SATORI_FONT_REGULAR_PATH" : "SATORI_FONT_BOLD_PATH";
  throw new Error(`Unable to locate ${label} font. Set ${envVar} to a local font file.`);
}

async function loadFonts() {
  const [regularFontPath, boldFontPath] = await Promise.all([
    findFontPath(regularFontCandidates, "regular"),
    findFontPath(boldFontCandidates, "bold"),
  ]);
  const [regularFont, boldFont] = await Promise.all([readFile(regularFontPath), readFile(boldFontPath)]);

  return [
    { name: "DejaVu Sans", data: regularFont, path: regularFontPath, style: "normal", weight: 400 },
    { name: "DejaVu Sans", data: boldFont, path: boldFontPath, style: "normal", weight: 700 },
  ];
}

async function main() {
  const entries = await readdir(cardPagesDir, { withFileTypes: true });
  const cardDirectories = entries.filter((entry) => entry.isDirectory());
  const fonts = await loadFonts();

  await rm(imageOutputDir, { recursive: true, force: true });
  await mkdir(imageOutputDir, { recursive: true });

  await Promise.all(
    cardDirectories.map(async (entry) => {
      const slug = entry.name;
      const pageHtml = await readFile(path.join(cardPagesDir, slug, "index.html"), "utf8");
      const cardData = readCardPageData(pageHtml);
      const svg = await satori(renderCardHtml(cardData), {
        width: outputWidth,
        height: outputHeight,
        fonts,
      });
      const pngBuffer = new Resvg(svg, {
        font: {
          fontFiles: fonts.map((font) => font.path),
          loadSystemFonts: false,
        },
      })
        .render()
        .asPng();

      await writeFile(path.join(imageOutputDir, `${slug}.png`), pngBuffer);
    }),
  );

  console.log(`Generated ${cardDirectories.length} card og:image files in ${imageOutputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
