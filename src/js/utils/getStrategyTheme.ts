import type { StrategyCard } from "../data/obliqueStrategies";

import { hashCode } from "./hashCode";

export interface StrategyTheme {
  accent: string;
  background: string;
}

export function getStrategyTheme(strategy: StrategyCard): StrategyTheme {
  const hue = hashCode(strategy.message) % 360;
  const accent = `hsl(${hue} 65% 34%)`;
  const background = `hsl(${hue} 72% 91%)`;

  return { accent, background };
}
