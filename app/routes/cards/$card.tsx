import { useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import PageActions from "@/components/common/PageActions";
import { useSwipeToShuffle } from "@/components/common/useSwipeToShuffle";
import {
  getStrategyBySlug,
  obliqueStrategies,
} from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";
import type { SitemapHandle } from "@forge42/seo-tools/remix/sitemap";

import type { Route } from "./+types/$card";

const pageTitle = "Oblique Strategies";

export const handle: SitemapHandle<unknown> = {
  sitemap: (domain) =>
    obliqueStrategies.map((strategy) => ({
      route: `${domain}/cards/${strategy.slug}`,
    })),
};

export function meta() {
  return [{ title: pageTitle }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.card;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  const { background } = getStrategyTheme(strategy);

  return { strategy, background };
}

export default function CardPage({ loaderData }: Route.ComponentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { strategy } = loaderData;
  const theme = getStrategyTheme(strategy);
  const accentStyle = { color: theme.accent };
  const cardRef = useRef<HTMLElement | null>(null);
  const currentStrategyIndex = useMemo(
    () => obliqueStrategies.findIndex(({ slug }) => slug === strategy.slug),
    [strategy.slug],
  );
  const handleShuffle = useCallback(() => {
    if (obliqueStrategies.length <= 1 || currentStrategyIndex === -1) {
      return;
    }

    const randomIndexExcludingCurrent = Math.floor(
      Math.random() * (obliqueStrategies.length - 1),
    );
    const randomIndex =
      randomIndexExcludingCurrent >= currentStrategyIndex
        ? randomIndexExcludingCurrent + 1
        : randomIndexExcludingCurrent;

    const nextRoute = cardRoute(obliqueStrategies[randomIndex].slug);
    navigate(location.search ? `${nextRoute}${location.search}` : nextRoute);
  }, [currentStrategyIndex, location.search, navigate]);
  useSwipeToShuffle(cardRef, handleShuffle);

  return (
    <>
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
