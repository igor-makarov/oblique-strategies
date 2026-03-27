import { type StrategyCard, obliqueStrategies } from "#src/js/data/obliqueStrategies";

export function getRandomStrategy(current?: StrategyCard): StrategyCard {
  if (!current) {
    return obliqueStrategies[Math.floor(Math.random() * obliqueStrategies.length)];
  }

  const currentStrategyIndex = obliqueStrategies.findIndex((strategy) => strategy.slug === current.slug);

  if (currentStrategyIndex === -1) {
    return obliqueStrategies[Math.floor(Math.random() * obliqueStrategies.length)];
  }

  const randomIndexExcludingCurrent = Math.floor(Math.random() * (obliqueStrategies.length - 1));

  const randomIndex = randomIndexExcludingCurrent >= currentStrategyIndex ? randomIndexExcludingCurrent + 1 : randomIndexExcludingCurrent;

  return obliqueStrategies[randomIndex];
}
