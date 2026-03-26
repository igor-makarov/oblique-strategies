import { Navigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";

import type { Route } from "./+types/index";

const pageTitle = "Oblique Strategies";

export function meta() {
  return [
    { title: pageTitle },
    {
      name: "description",
      content: "Oblique Strategies by Brian Eno and Peter Schmidt. Your magic 8-ball of inspiration.",
    },
  ];
}

export async function clientLoader() {
  const strategy = getRandomStrategy();
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
