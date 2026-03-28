import { getStrategyBySlug } from "#src/js/data/obliqueStrategies";
import { getStrategyTheme } from "#src/js/utils/getStrategyTheme";
import { type OgImageSize, getOgImageSize } from "#src/js/utils/ogImageSizes";
import type { Route } from "#types/app/routes/og/cards/$card/+types/$size[.]png";

async function renderPng(requestUrl: string, title: string, background: string, [width, height]: OgImageSize): Promise<Uint8Array> {
  const { satori, getInterBoldFont, svgToPng } = await import("#src/js/utils/ogRender");
  const interBold = await getInterBoldFont(requestUrl);
  const cardWidthPx = width * 0.5833333333;
  const cardHeightPx = (cardWidthPx * 5) / 7;
  const titleFontSize = `${cardHeightPx * 0.144}px`;
  const cardWidth = "58.333333%";
  const cardHeight = `${(cardHeightPx / height) * 100}%`;

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
            padding: "3vw",
            textAlign: "center",
            width: "100%",
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

  return svgToPng(svg);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const size = getOgImageSize(params.size);
  const strategy = getStrategyBySlug(params.card);

  if (!size || !strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  const { background } = getStrategyTheme(strategy);
  const png = await renderPng(request.url, strategy.message, background, size);

  return new Response(png.buffer as ArrayBuffer, { headers: { "Content-Type": "image/png" } });
}
