import CardLayout from "@/components/common/CardLayout";
import type { StrategyCard } from "@/js/data/obliqueStrategies";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

interface Props {
  strategy: StrategyCard;
}

export default function StrategyDetail({ strategy }: Props) {
  const theme = getStrategyTheme(strategy);
  const accentStyle = { color: theme.accent };

  return (
    <CardLayout>
      <div className="strategy-kicker" style={accentStyle}>
        Oblique Strategies
      </div>
      <h1 className="strategy-message">{strategy.message}</h1>
    </CardLayout>
  );
}
