import { redirect } from "react-router";

import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

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
  const strategy = obliqueStrategies[randomIndex];
  return redirect(cardRoute(strategy.slug));
}

export function HydrateFallback() {
  return (
    <div className="page-shell page-shell-viewport">
      <div className="shuffle-spinner" />
    </div>
  );
}

export default function HomePage() {
  // clientLoader always redirects, so this never renders
  return null;
}
