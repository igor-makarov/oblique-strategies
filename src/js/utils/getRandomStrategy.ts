import type { StrategyCard, StrategyList } from "../data/obliqueStrategies";

export function getRandomStrategy(
  strategies: StrategyList,
  current?: StrategyCard,
): StrategyCard {
  if (!current) {
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  const currentStrategyIndex = strategies.findIndex(
    (strategy) => strategy.slug === current.slug,
  );

  if (currentStrategyIndex === -1) {
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  const randomIndexExcludingCurrent = Math.floor(
    Math.random() * (strategies.length - 1),
  );

  const randomIndex =
    randomIndexExcludingCurrent >= currentStrategyIndex
      ? randomIndexExcludingCurrent + 1
      : randomIndexExcludingCurrent;

  return strategies[randomIndex];
}
