import { useEffect } from "react";

import StrategyDetail from "@/components/StrategyDetail";
import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

import type { Route } from "./+types/index";

const pageTitle = "Oblique Strategies";

export function meta() {
  return [
    { title: pageTitle },
    {
      name: "description",
      content: "A static React Router edition of Oblique Strategies with a pre-generated page for every card.",
    },
  ];
}

export async function clientLoader() {
  const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
  return { strategy: obliqueStrategies[randomIndex] };
}

export function HydrateFallback() {
  return <div className="page-shell page-shell-viewport" />;
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { strategy } = loaderData;

  console.log("slug", strategy.slug);

  useEffect(() => {
    window.history.replaceState(null, "", cardRoute(strategy.slug));
  }, [strategy.slug]);

  return <StrategyDetail strategy={strategy} />;
}
