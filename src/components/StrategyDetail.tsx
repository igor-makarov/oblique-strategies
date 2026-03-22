import type { CSSProperties } from "react";
import { Link } from "react-router";

import ReferenceCard from "@/components/common/ReferenceCard";
import type { StrategyCard } from "@/js/data/obliqueStrategies";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

interface Props {
  strategy: StrategyCard;
}

export default function StrategyDetail({ strategy }: Props) {
  const theme = getStrategyTheme(strategy.id);
  const shellStyle = { background: theme.background } satisfies CSSProperties;
  const accentStyle = { color: theme.accent } satisfies CSSProperties;

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
        {/* The reason for `reloadDocument` is to prevent Safari from showing stale background color in the safe area */}
        <Link reloadDocument className="page-action-link" to="/">
          Shuffle a card
        </Link>
        <Link className="page-action-link" to="/cards">
          Browse all cards
        </Link>
      </nav>
    </div>
  );
}
