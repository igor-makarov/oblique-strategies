import { Navigate } from "react-router";

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

export default function HomePage() {
  const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
  const strategy = obliqueStrategies[randomIndex];

  return <Navigate to={cardRoute(strategy.slug)} replace />;
}
