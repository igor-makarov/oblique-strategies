import { type OgImageSize, getOgImageSize } from "#src/js/utils/ogImageSizes";
import { getOgCardLayout, renderImage, toArrayBuffer } from "#src/js/utils/renderImage";
import type { Route } from "#types/app/routes/og/+types/$size[.]png";

const title = "Oblique Strategies";

function rainbowLetters(text: string): { color: string; letter: string }[] {
  const letters = text.split("");
  const nonSpaceCount = letters.filter((letter) => letter !== " ").length;
  let idx = 0;

  return letters.map((letter) => {
    if (letter === " ") {
      return { color: "#171717", letter };
    }

    const hue = (idx * 360) / nonSpaceCount;
    idx += 1;

    return { color: `hsl(${hue} 65% 34%)`, letter };
  });
}

async function renderCard(size: OgImageSize): Promise<Uint8Array> {
  const { cardHeight, cardHeightPx, cardWidth, cardWidthPx } = getOgCardLayout(size);
  const titleFontSize = cardHeightPx * 0.11;
  const contentPadding = `${Math.min(cardWidthPx, cardHeightPx) * 0.09}px`;
  const letters = rainbowLetters(title);

  return renderImage(
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
    size,
  );
}

export async function loader({ params }: Route.LoaderArgs) {
  console.log("[route] /og/:size.png", { size: params.size });

  const size = getOgImageSize(params.size);

  if (!size) {
    throw new Response("Not Found", { status: 404 });
  }

  const png = await renderCard(size);

  return new Response(toArrayBuffer(png), {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
