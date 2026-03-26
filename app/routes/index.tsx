import { Navigate } from "react-router";

import CardLayout from "@/components/common/CardLayout";
import { cardRoute, ogIndexImageRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";
import { ogImageSizeSlug, ogImageSizes, twitterOgImageSize } from "@/js/utils/ogImageSizes";
import { getSiteOrigin } from "@/js/utils/siteUrl";

import type { Route } from "./+types/index";

const pageTitle = "Oblique Strategies";

export async function loader({ request }: Route.LoaderArgs) {
  const siteOrigin = getSiteOrigin(request);
  return { siteOrigin };
}

export async function clientLoader() {
  const strategy = getRandomStrategy();
  return { to: cardRoute(strategy.slug) };
}

export function HydrateFallback({ loaderData }: Route.HydrateFallbackProps) {
  if (!loaderData || !("siteOrigin" in loaderData)) return null;

  return (
    <>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`${loaderData.siteOrigin}${ogIndexImageRoute(twitterOgImageSize)}`} />
      {ogImageSizes.flatMap((size) => [
        <meta key={`og:image:${ogImageSizeSlug(size)}`} property="og:image" content={`${loaderData.siteOrigin}${ogIndexImageRoute(size)}`} />,
        <meta key={`og:image:width:${ogImageSizeSlug(size)}`} property="og:image:width" content={String(size[0])} />,
        <meta key={`og:image:height:${ogImageSizeSlug(size)}`} property="og:image:height" content={String(size[1])} />,
      ])}
      <CardLayout>
        <div className="shuffle-spinner" />
      </CardLayout>
    </>
  );
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  if (!("to" in loaderData)) return null;
  return <Navigate to={loaderData.to} replace />;
}
