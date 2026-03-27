import { Navigate, useRouteLoaderData } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";

import type { Route } from "./+types/index";

const pageTitle = "Oblique Strategies";

export async function loader() {
  return { pageTitle };
}

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  const strategy = getRandomStrategy();
  const serverData = await serverLoader();

  return {
    ...serverData,
    to: cardRoute(strategy.slug),
  };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  const rootLoaderData = useRouteLoaderData("root") as { siteName: string } | undefined;
  const title = rootLoaderData?.siteName ?? pageTitle;

  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <CardLayout>
        <div className="shuffle-spinner" />
      </CardLayout>
    </>
  );
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <title>{loaderData.pageTitle}</title>
      <meta property="og:title" content={loaderData.pageTitle} />
      <Navigate to={loaderData.to} replace />
    </>
  );
}
