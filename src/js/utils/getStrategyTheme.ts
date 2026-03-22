export interface StrategyTheme {
  accent: string;
  background: string;
}

export function getStrategyTheme(strategyId: number): StrategyTheme {
  const hue = (strategyId * 37) % 360;
  const accent = `hsl(${hue} 65% 34%)`;
  const background = `hsl(${hue} 72% 91%)`;

  return { accent, background };
}
