import { Link } from "react-router";

import ShuffleLink from "@/components/common/ShuffleLink";
import { obliqueStrategies, type StrategyCard } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

const pageTitle = "All Cards";
const columnCount = 4;

export function meta() {
  return [{ title: pageTitle }];
}

function buildColumns(items: readonly StrategyCard[], count: number): StrategyCard[][] {
  const columns = Array.from({ length: count }, () => [] as StrategyCard[]);

  items.forEach((item, index) => {
    columns[index % count].push(item);
  });

  return columns;
}

export default function CardsIndexPage() {
  const columns = buildColumns(obliqueStrategies, columnCount);

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
        <div className="row four-across">
          {columns.map((column, index) => (
            <div className="column" key={index}>
              <table>
                <tbody>
                  <tr>
                    <th>Cards</th>
                  </tr>
                  {column.map((strategy) => (
                    <tr key={strategy.slug}>
                      <td>
                        <Link to={cardRoute(strategy.slug)}>{strategy.message}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
