export type OgImageSize = readonly [width: number, height: number];

export const ogImageSizes: readonly OgImageSize[] = [
  [1200, 630],
  [1200, 675],
  [600, 315],
];

export const twitterOgImageSize = ogImageSizes.find(([width, height]) => width === 1200 && height === 675)!;

export function ogImageSizeSlug([width, height]: OgImageSize): string {
  return `${width}x${height}`;
}

const ogImageSizeBySlug = new Map(ogImageSizes.map((size) => [ogImageSizeSlug(size), size]));

export function getOgImageSize(slug: string): OgImageSize | null {
  return ogImageSizeBySlug.get(slug) ?? null;
}
