import CardLayout from "@/components/common/CardLayout";
import PageActions from "@/components/common/PageActions";
import { getStrategyBySlug, obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";
import type { SitemapHandle } from "@forge42/seo-tools/remix/sitemap";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import TinderCard from "react-tinder-card";

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
  const navigate = useNavigate();

  const handleCardLeftScreen = useCallback(
    (direction: string) => {
      if (direction === "left" || direction === "right") {
        const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
        navigate(cardRoute(obliqueStrategies[randomIndex].slug));
      }
    },
    [navigate],
  );

  return (
    <>
      <TinderCard key={strategy.slug} onCardLeftScreen={handleCardLeftScreen} preventSwipe={["up", "down"]}>
        <CardLayout>
          <div className="strategy-kicker" style={accentStyle}>
            Oblique Strategies
          </div>
          <h1 className="strategy-message">
            <span style={{ whiteSpace: "pre-line" }}>{strategy.message}</span>
          </h1>
        </CardLayout>
      </TinderCard>
      <PageActions />
    </>
  );
}
