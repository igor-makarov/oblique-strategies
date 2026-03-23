import { useEffect, useRef } from "react";

import CardLayout from "@/components/common/CardLayout";
import PageActions from "@/components/common/PageActions";
import { useSwipeToShuffle } from "@/components/common/useSwipeToShuffle";
import {
  getStrategyBySlug,
  obliqueStrategies,
} from "@/js/data/obliqueStrategies";
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
  const { strategy } = loaderData;
  const theme = getStrategyTheme(strategy);
  const accentStyle = { color: theme.accent };
  const cardRef = useRef<HTMLElement | null>(null);
  const { didShuffle } = useSwipeToShuffle(cardRef);

  useEffect(() => {
    didShuffle();
  }, [didShuffle, strategy.slug]);

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
