import { href } from "react-router";

import { obliqueStrategies } from "../data/obliqueStrategies";
import { type OgImageSize, ogImageSizeSlug, ogImageSizes } from "./ogImageSizes";

export function cardRoute(slug: string): string {
  return href("/cards/:card", { card: slug }) + "/";
}

export function ogImageRoute(routePath: string, size: OgImageSize): string {
  return `/og${routePath}${ogImageSizeSlug(size)}.png`;
}

export function collectCardRoutes(): string[] {
  return obliqueStrategies.map((strategy) => cardRoute(strategy.slug));
}

export function collectOgImageRoutes(): string[] {
  return ["/", ...collectCardRoutes()].flatMap((routePath) => ogImageSizes.map((size) => ogImageRoute(routePath, size)));
}
