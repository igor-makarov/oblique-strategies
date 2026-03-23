import PageActions from "@/components/common/PageActions";
import StrategyDetail from "@/components/StrategyDetail";
import { getStrategyBySlug } from "@/js/data/obliqueStrategies";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

import type { Route } from "./+types/$card";

const pageTitle = "Oblique Strategies";

export function meta() {
  return [{ title: pageTitle }];
}

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.card;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  const { background } = getStrategyTheme(strategy.id);

  return { strategy, background };
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const slug = params.card;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  const { background } = getStrategyTheme(strategy.id);

  return { strategy, background };
}

export default function CardPage({ loaderData }: Route.ComponentProps) {
  const { strategy } = loaderData;

  return (
    <>
      <StrategyDetail strategy={strategy} />
      <PageActions />
    </>
  );
}
