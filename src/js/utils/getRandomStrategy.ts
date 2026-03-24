import {
  obliqueStrategies,
  type StrategyCard,
} from "../data/obliqueStrategies";

function getAnyRandomStrategy(): StrategyCard {
  return obliqueStrategies[
    Math.floor(Math.random() * obliqueStrategies.length)
  ];
}

export function getRandomStrategy(current?: StrategyCard): StrategyCard {
  if (!current) {
    return getAnyRandomStrategy();
  }

  const currentStrategyIndex = obliqueStrategies.findIndex(
    (strategy) => strategy.slug === current.slug,
  );

  if (currentStrategyIndex === -1) {
    return getAnyRandomStrategy();
  }

  const randomIndexExcludingCurrent = Math.floor(
    Math.random() * (obliqueStrategies.length - 1),
  );

  const randomIndex =
    randomIndexExcludingCurrent >= currentStrategyIndex
      ? randomIndexExcludingCurrent + 1
      : randomIndexExcludingCurrent;

  return obliqueStrategies[randomIndex];
}
