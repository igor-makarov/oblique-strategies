import { Link } from "react-router";

import ShuffleLink from "@/components/common/ShuffleLink";
import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getStrategyTheme } from "@/js/utils/getStrategyTheme";

const pageTitle = "All Cards";

export function meta() {
  return [{ title: pageTitle }];
}

export default function CardsIndexPage() {
  return (
    <div className="page-shell page-shell-wide page-shell-neutral">
      <div className="browse-layout">
        <div className="browse-header">
          <h1>{pageTitle}</h1>
          <p>
            All {obliqueStrategies.length} cards are available as pre-generated static pages.
            <span className="browse-header-links">
              <ShuffleLink>Shuffle a card</ShuffleLink>
            </span>
          </p>
        </div>
        <div className="strategy-grid">
          {obliqueStrategies.map((strategy) => {
            const theme = getStrategyTheme(strategy);

            return (
              <div className="strategy-grid-item" key={strategy.slug} style={{ backgroundColor: theme.background }}>
                <Link to={cardRoute(strategy.slug)}>{strategy.message}</Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
