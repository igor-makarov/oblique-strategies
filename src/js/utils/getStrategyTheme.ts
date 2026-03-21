export interface StrategyTheme {
  accent: string;
  background: string;
}

export function getStrategyTheme(strategyId: number): StrategyTheme {
  const hue = (strategyId * 37) % 360;
  const accent = `hsl(${hue} 65% 34%)`;
  const background = `linear-gradient(135deg, hsl(${hue} 80% 95%), hsl(${(hue + 40) % 360} 85% 88%))`;

  return { accent, background };
}
