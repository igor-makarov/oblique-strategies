import { useCallback } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router";

import ReferenceCard from "@/components/common/ReferenceCard";
import { obliqueStrategies, type StrategyCard } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

interface Props {
  strategy: StrategyCard;
}

function randomCardRoute(): string {
  const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
  return cardRoute(obliqueStrategies[randomIndex].slug);
}

export default function StrategyDetail({ strategy }: Props) {
  const theme = getStrategyTheme(strategy.id);
  const shellStyle = { background: theme.background } satisfies CSSProperties;
  const accentStyle = { color: theme.accent } satisfies CSSProperties;

  const handleShuffle = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = randomCardRoute();
  }, []);

  return (
    <div className="page-shell page-shell-viewport" style={shellStyle}>
      <div className="reference-layout">
        <ReferenceCard>
          <div className="strategy-copy">
            <div className="strategy-kicker" style={accentStyle}>
              Oblique Strategies
            </div>
            <h1 className="strategy-message">{strategy.message}</h1>
          </div>
        </ReferenceCard>
      </div>
      <nav className="page-actions">
        <Link className="page-action-link" to="/" onClick={handleShuffle}>
          Shuffle a card
        </Link>
        <Link className="page-action-link" to="/cards">
          Browse all cards
        </Link>
      </nav>
    </div>
  );
}
