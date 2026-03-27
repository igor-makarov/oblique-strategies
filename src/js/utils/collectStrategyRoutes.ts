import { href } from "react-router";

import { obliqueStrategies } from "../data/obliqueStrategies";
import { type OgImageSize, ogImageSizeSlug, ogImageSizes } from "./ogImageSizes";

export function cardRoute(slug: string): string {
  return href("/cards/:card", { card: slug }) + "/";
}

export function ogCardImageRoute(slug: string, size: OgImageSize): string {
  return href("/og/:size/cards/:card.png", { card: slug, size: ogImageSizeSlug(size) });
}

export function collectCardRoutes(): string[] {
  return obliqueStrategies.map((strategy) => cardRoute(strategy.slug));
}

export function collectOgCardRoutes(): string[] {
  return obliqueStrategies.flatMap((strategy) => ogImageSizes.map((size) => ogCardImageRoute(strategy.slug, size)));
}
