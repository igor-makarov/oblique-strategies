import { href } from "react-router";

import { obliqueStrategies } from "../data/obliqueStrategies";

export function cardRoute(slug: string): string {
  return href("/cards/:card", { card: slug });
}

export function collectCardRoutes(): string[] {
  return obliqueStrategies.map((strategy) => cardRoute(strategy.slug));
}
