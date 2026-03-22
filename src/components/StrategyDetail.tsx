import { useEffect } from "react";

import ReferenceCard from "@/components/common/ReferenceCard";
import type { StrategyCard } from "@/js/data/obliqueStrategies";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

interface Props {
  strategy: StrategyCard;
}

export default function StrategyDetail({ strategy }: Props) {
  const theme = getStrategyTheme(strategy.id);
  const accentStyle = { color: theme.accent };

  useEffect(() => {
    document.body.style.background = theme.background;
    return () => {
      document.body.style.background = "";
    };
  }, [theme.background]);

  return (
    <div className="reference-layout">
      <ReferenceCard>
        <div className="strategy-kicker" style={accentStyle}>
          Oblique Strategies
        </div>
        <h1 className="strategy-message">{strategy.message}</h1>
      </ReferenceCard>
    </div>
  );
}
