import type { SitemapHandle } from "@forge42/seo-tools/remix/sitemap";

import { useCallback, useRef } from "react";
import { useNavigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import PageActions from "@/components/common/PageActions";
import { useSwipeToShuffle } from "@/components/common/useSwipeToShuffle";
import { getStrategyBySlug, obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

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
  const navigate = useNavigate();
  const { strategy } = loaderData;
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
