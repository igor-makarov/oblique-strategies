import type { CSSProperties, ReactNode } from "react";

import ReferenceCard from "@/components/common/ReferenceCard";
import type { StrategyCard } from "@/js/data/obliqueStrategies";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

interface Props {
  strategy: StrategyCard;
  actions?: ReactNode;
}

export default function StrategyDetail({ strategy, actions }: Props) {
  const theme = getStrategyTheme(strategy.id);
  const shellStyle = { background: theme.background } satisfies CSSProperties;
  const accentStyle = { color: theme.accent } satisfies CSSProperties;

  return (
    <div className="page-shell" style={shellStyle}>
      <div className="reference-layout">
        <ReferenceCard>
          <div className="strategy-detail">
            <div className="strategy-kicker" style={accentStyle}>
              Oblique Strategies
            </div>
            <h1 className="strategy-message">{strategy.message}</h1>
            {actions ? <div className="button-row">{actions}</div> : null}
          </div>
        </ReferenceCard>
      </div>
    </div>
  );
}
