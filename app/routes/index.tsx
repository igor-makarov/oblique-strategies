import { Navigate } from "react-router";

import CardLayout from "#src/components/common/CardLayout";
import OgImageMeta from "#src/components/common/OgImageMeta";
import { cardRoute } from "#src/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "#src/js/utils/getRandomStrategy";
import { useRootLoaderData } from "#src/js/utils/useRootLoaderData";
import type { Route } from "#types/app/routes/+types/index";

const pageTitle = "Oblique Strategies";

function HomeMeta({ siteOrigin }: { siteOrigin: string }) {
  return (
    <>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} />
      <OgImageMeta siteOrigin={siteOrigin} routePath="/" />
    </>
  );
}

export function clientLoader() {
  console.log("[route] /");

  return {
    to: cardRoute(getRandomStrategy().slug),
  };
}

clientLoader.hydrate = true as const;

export function HydrateFallback() {
  const { siteOrigin } = useRootLoaderData();

  return (
    <>
      <HomeMeta siteOrigin={siteOrigin} />
      <CardLayout>
        <div className="shuffle-spinner" />
      </CardLayout>
    </>
  );
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { siteOrigin } = useRootLoaderData();

  return (
    <>
      <HomeMeta siteOrigin={siteOrigin} />
      <Navigate to={loaderData.to} replace />
    </>
  );
}
