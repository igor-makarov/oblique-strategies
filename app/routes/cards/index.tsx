import { Link } from "react-router";

import ShuffleLink from "#src/components/common/ShuffleLink";
import { obliqueStrategies } from "#src/js/data/obliqueStrategies";
import { cardRoute } from "#src/js/utils/collectStrategyRoutes";
import { getStrategyTheme } from "#src/js/utils/getStrategyTheme";

const pageTitle = "All Cards";

export default function CardsIndexPage() {
  console.log("[route] /cards/");

  return (
    <>
      <title>Oblique Strategies - All Cards</title>
      <meta property="og:title" content="Oblique Strategies - All Cards" />
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
    </>
  );
}
