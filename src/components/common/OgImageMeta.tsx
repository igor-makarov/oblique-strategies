import { ogImageRoute } from "#src/js/utils/collectStrategyRoutes";
import { ogImageSizeSlug, ogImageSizes, twitterOgImageSize } from "#src/js/utils/ogImageSizes";

type Props = {
  siteOrigin: string;
  routePath: string;
};

export default function OgImageMeta({ siteOrigin, routePath }: Props) {
  return (
    <>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`${siteOrigin}${ogImageRoute(routePath, twitterOgImageSize)}`} />
      {ogImageSizes.flatMap((size) => [
        <meta key={`og:image:${ogImageSizeSlug(size)}`} property="og:image" content={`${siteOrigin}${ogImageRoute(routePath, size)}`} />,
        <meta key={`og:image:width:${ogImageSizeSlug(size)}`} property="og:image:width" content={String(size[0])} />,
        <meta key={`og:image:height:${ogImageSizeSlug(size)}`} property="og:image:height" content={String(size[1])} />,
      ])}
    </>
  );
}
