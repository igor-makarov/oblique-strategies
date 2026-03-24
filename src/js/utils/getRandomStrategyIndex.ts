import type { StrategyCard } from "../data/obliqueStrategies";

export function getRandomStrategyIndex(
  strategies: readonly StrategyCard[],
  currentStrategyIndex?: number,
): number {
  if (strategies.length <= 1) {
    return 0;
  }

  if (
    currentStrategyIndex === undefined ||
    currentStrategyIndex < 0 ||
    currentStrategyIndex >= strategies.length
  ) {
    return Math.floor(Math.random() * strategies.length);
  }

  const randomIndexExcludingCurrent = Math.floor(
    Math.random() * (strategies.length - 1),
  );

  return randomIndexExcludingCurrent >= currentStrategyIndex
    ? randomIndexExcludingCurrent + 1
    : randomIndexExcludingCurrent;
}
