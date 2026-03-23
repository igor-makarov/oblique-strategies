import { getStrategyIndex, type StrategyCard } from "../data/obliqueStrategies";

export interface StrategyTheme {
  accent: string;
  background: string;
}

export function getStrategyTheme(strategy: StrategyCard): StrategyTheme {
  const index = getStrategyIndex(strategy.slug);
  const hue = (index * 29) % 360;
  const accent = `hsl(${hue} 65% 34%)`;
  const background = `hsl(${hue} 72% 91%)`;

  return { accent, background };
}
