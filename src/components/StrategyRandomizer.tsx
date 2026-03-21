import { useState } from "react";
import { Link } from "react-router";

import StrategyDetail from "@/components/StrategyDetail";
import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import type { StrategyCard } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

interface Props {
  initialStrategy: StrategyCard;
}

export default function StrategyRandomizer({ initialStrategy }: Props) {
  const [currentStrategy, setCurrentStrategy] = useState(initialStrategy);

  function showAnotherStrategy() {
    if (obliqueStrategies.length <= 1) {
      return;
    }

    let nextStrategy = currentStrategy;

    while (nextStrategy.slug === currentStrategy.slug) {
      const nextIndex = Math.floor(Math.random() * obliqueStrategies.length);
      nextStrategy = obliqueStrategies[nextIndex];
    }

    setCurrentStrategy(nextStrategy);
  }

  return (
    <StrategyDetail
      strategy={currentStrategy}
      actions={
        <>
          <button className="action-link" onClick={showAnotherStrategy} type="button">
            Show another card
          </button>
          <Link className="action-link" to={cardRoute(currentStrategy.slug)}>
            Open card page
          </Link>
          <Link className="action-link" to="/cards">
            Browse all cards
          </Link>
        </>
      }
    />
  );
}
