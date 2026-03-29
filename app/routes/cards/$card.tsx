import { useCallback, useRef } from "react";
import { useNavigate } from "react-router";

import CardLayout from "#src/components/common/CardLayout";
import OgImageMeta from "#src/components/common/OgImageMeta";
import PageActions from "#src/components/common/PageActions";
import { useSwipeToShuffle } from "#src/components/common/useSwipeToShuffle";
import { getStrategyBySlug } from "#src/js/data/obliqueStrategies";
import { cardRoute, collectCardRoutes } from "#src/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "#src/js/utils/getRandomStrategy";
import { getStrategyTheme } from "#src/js/utils/getStrategyTheme";
import { getSiteOrigin } from "#src/js/utils/siteUrl";
import type { Route } from "#types/app/routes/cards/+types/$card";

export const handle = {
  // Required for sitemap.xml: this expands the dynamic /cards/:card route into concrete card URLs.
  // Static prerendering uses collectCardRoutes() separately in react-router.config.ts.
  sitemap(domain: string) {
    return collectCardRoutes().map((route) => ({ route: `${domain}${route}` }));
  },
};

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.card;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  const { background } = getStrategyTheme(strategy);
  const siteOrigin = getSiteOrigin();

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
      <OgImageMeta siteOrigin={siteOrigin} routePath={cardRoute(strategy.slug)} />
      <CardLayout cardRef={cardRef}>
        <div className="strategy-stack">
          <div className="strategy-kicker" style={accentStyle}>
            Oblique Strategies
          </div>
          <h1 className="strategy-message">
            <span style={{ whiteSpace: "pre-line" }}>{strategy.message}</span>
          </h1>
        </div>
      </CardLayout>
      <PageActions />
    </>
  );
}
