import { Navigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
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
  const strategy = obliqueStrategies[randomIndex];
  return { to: cardRoute(strategy.slug) };
}

export function HydrateFallback() {
  return (
    <CardLayout>
      <div className="shuffle-spinner" />
    </CardLayout>
  );
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return <Navigate to={loaderData.to} replace />;
}
