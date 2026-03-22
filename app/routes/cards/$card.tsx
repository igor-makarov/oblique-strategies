import PageActions from "@/components/common/PageActions";
import StrategyDetail from "@/components/StrategyDetail";
import { getStrategyBySlug } from "@/js/data/obliqueStrategies";

import type { Route } from "./+types/$card";

const pageTitle = "Oblique Strategies";

interface LoaderData {
  strategy: NonNullable<ReturnType<typeof getStrategyBySlug>>;
}

export function meta() {
  return [{ title: pageTitle }];
}

export async function loader({ params }: Route.LoaderArgs): Promise<LoaderData> {
  const slug = params.card;
  const strategy = getStrategyBySlug(slug);

  if (!strategy) {
    throw new Response("Not Found", { status: 404 });
  }

  return { strategy };
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
