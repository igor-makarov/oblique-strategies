import { Navigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import { cardRoute, ogIndexImageRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";
import { ogImageSizeSlug, ogImageSizes, twitterOgImageSize } from "@/js/utils/ogImageSizes";

import { useRootLoaderData } from "../hooks/useRootLoaderData";
import type { Route } from "./+types/index";

const pageTitle = "Oblique Strategies";

function HomeMeta({ siteOrigin }: { siteOrigin: string }) {
  return (
    <>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`${siteOrigin}${ogIndexImageRoute(twitterOgImageSize)}`} />
      {ogImageSizes.flatMap((size) => [
        <meta key={`og:image:${ogImageSizeSlug(size)}`} property="og:image" content={`${siteOrigin}${ogIndexImageRoute(size)}`} />,
        <meta key={`og:image:width:${ogImageSizeSlug(size)}`} property="og:image:width" content={String(size[0])} />,
        <meta key={`og:image:height:${ogImageSizeSlug(size)}`} property="og:image:height" content={String(size[1])} />,
      ])}
    </>
  );
}

export function clientLoader() {
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
