import { useCallback, useRef } from "react";
import { useNavigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import PageActions from "@/components/common/PageActions";
import { useSwipeToShuffle } from "@/components/common/useSwipeToShuffle";
import { getStrategyBySlug } from "@/js/data/obliqueStrategies";
import { cardRoute, collectCardRoutes, ogCardImageRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";
import { ogImageSizeSlug, ogImageSizes, twitterOgImageSize } from "@/js/utils/ogImageSizes";

import type { Route } from "./+types/$card";

export const handle = {
  // Required for sitemap.xml: this expands the dynamic /cards/:card route into concrete card URLs.
  // Static prerendering uses collectCardRoutes() separately in react-router.config.ts.
  sitemap(domain: string) {
    return collectCardRoutes().map((route) => ({ route: `${domain}${route}` }));
  },
};

function getSiteOrigin(request: Request): string {
  const configuredOrigin = process.env.SITEMAP_BASE_URL;

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "");
  }

  return new URL(request.url).origin;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const slug = params.card;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  const { background } = getStrategyTheme(strategy);
  const siteOrigin = getSiteOrigin(request);

  return { strategy, background, siteOrigin };
}

export default function CardPage({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { strategy, siteOrigin } = loaderData;
  const theme = getStrategyTheme(strategy);
  const accentStyle = { color: theme.accent };
  const cardRef = useRef<HTMLElement | null>(null);
  const handleShuffle = useCallback(() => {
    const randomStrategy = getRandomStrategy(strategy);
    navigate(cardRoute(randomStrategy.slug));
  }, [navigate, strategy]);
  useSwipeToShuffle(cardRef, handleShuffle);

  return (
    <>
      <title>{`Oblique Strategies - ${strategy.message}`}</title>
      <meta property="og:title" content={strategy.message} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`${siteOrigin}${ogCardImageRoute(strategy.slug, twitterOgImageSize)}`} />
      {ogImageSizes.flatMap((size) => [
        <meta key={`og:image:${ogImageSizeSlug(size)}`} property="og:image" content={`${siteOrigin}${ogCardImageRoute(strategy.slug, size)}`} />,
        <meta key={`og:image:width:${ogImageSizeSlug(size)}`} property="og:image:width" content={String(size[0])} />,
        <meta key={`og:image:height:${ogImageSizeSlug(size)}`} property="og:image:height" content={String(size[1])} />,
      ])}
      <CardLayout cardRef={cardRef}>
        <div className="strategy-kicker" style={accentStyle}>
          Oblique Strategies
        </div>
        <h1 className="strategy-message">
          <span style={{ whiteSpace: "pre-line" }}>{strategy.message}</span>
        </h1>
      </CardLayout>
      <PageActions />
    </>
  );
}
