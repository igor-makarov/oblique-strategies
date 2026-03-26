import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const outputWidth = 1200;
const outputHeight = 630;
const cardWidth = 700;
const cardHeight = 500;
const cardPagesDir = fileURLToPath(new URL("../build/client/cards", import.meta.url));
const imageOutputDir = fileURLToPath(new URL("../build/client/og/cards", import.meta.url));

const namedHtmlEntities = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
};

function decodeHtmlEntities(value) {
  return value.replace(/&(#x[0-9A-Fa-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (entity, token) => {
    if (token[0] === "#") {
      const isHex = token[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(token.slice(isHex ? 2 : 1), isHex ? 16 : 10);

      return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
    }

    return namedHtmlEntities[token.toLowerCase()] ?? entity;
  });
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function readCardPageData(pageHtml) {
  // Read the specific prerendered card markup emitted by the static build so og images stay aligned with the page content.
  const background = pageHtml.match(/<body[^>]*style="background:([^"]+)"/)?.[1];
  const accent = pageHtml.match(/<div[^>]*class="strategy-kicker"[^>]*style="color:([^"]+)"[^>]*>/)?.[1];
  const message = pageHtml.match(/<h1[^>]*class="strategy-message"[^>]*>\s*<span[^>]*white-space:pre-line[^>]*>([\s\S]*?)<\/span>\s*<\/h1>/)?.[1];

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

function renderCardSvg({ accent, background, message }) {
  const messageFontSize = getMessageFontSize(message);
  const escapedMessage = escapeHtml(message);

  return `
    <svg width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${outputWidth}" height="${outputHeight}" fill="${background}" />
      <foreignObject x="${(outputWidth - cardWidth) / 2}" y="${(outputHeight - cardHeight) / 2}" width="${cardWidth}" height="${cardHeight}">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style="
            width:${cardWidth}px;
            height:${cardHeight}px;
            box-sizing:border-box;
            background:rgba(255,255,255,0.92);
            border:1px solid rgba(23,23,23,0.12);
            border-radius:24px;
            box-shadow:0 18px 60px rgba(23,23,23,0.12);
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:20px;
            padding:48px;
            text-align:center;
            color:#171717;
            font-family:Georgia, 'Times New Roman', serif;
          "
        >
          <div
            style="
              color:${accent};
              font-size:14px;
              font-weight:600;
              letter-spacing:0.12em;
              text-transform:uppercase;
              white-space:nowrap;
            "
          >
            Oblique Strategies
          </div>
          <div
            style="
              font-size:${messageFontSize}px;
              font-weight:700;
              line-height:1.05;
              white-space:pre-line;
              overflow-wrap:anywhere;
            "
          >
            ${escapedMessage}
          </div>
        </div>
      </foreignObject>
    </svg>
  `;
}

async function main() {
  const entries = await readdir(cardPagesDir, { withFileTypes: true });
  const cardDirectories = entries.filter((entry) => entry.isDirectory());

  await rm(imageOutputDir, { recursive: true, force: true });
  await mkdir(imageOutputDir, { recursive: true });

  await Promise.all(
    cardDirectories.map(async (entry) => {
      const slug = entry.name;
      const pageHtml = await readFile(path.join(cardPagesDir, slug, "index.html"), "utf8");
      const imageData = readCardPageData(pageHtml);
      const outputFile = path.join(imageOutputDir, `${slug}.png`);

      await sharp(Buffer.from(renderCardSvg(imageData)))
        .png()
        .toFile(outputFile);
    }),
  );

  console.log(`Generated ${cardDirectories.length} card og:image files in ${imageOutputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
