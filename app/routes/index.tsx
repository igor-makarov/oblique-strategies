import { Navigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";

import type { Route } from "./+types/index";

const pageTitle = "Oblique Strategies";

export async function clientLoader() {
  const strategy = getRandomStrategy();
  return { to: cardRoute(strategy.slug) };
}

export function HydrateFallback() {
  return (
    <>
      <title>{pageTitle}</title>
      <CardLayout>
        <div className="shuffle-spinner" />
      </CardLayout>
    </>
  );
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <title>{pageTitle}</title>
      <Navigate to={loaderData.to} replace />
    </>
  );
}
