import { useEffect, useMemo } from "react";
import { Link } from "react-router";

import StrategyDetail from "@/components/StrategyDetail";
import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

const pageTitle = "Oblique Strategies";

export function meta() {
  return [
    { title: pageTitle },
    {
      name: "description",
      content: "A static React Router edition of Oblique Strategies with a pre-generated page for every card.",
    },
  ];
}

export default function HomePage() {
  const randomStrategy = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
    return obliqueStrategies[randomIndex];
  }, []);

  useEffect(() => {
    window.history.replaceState(null, "", cardRoute(randomStrategy.slug));
  }, [randomStrategy.slug]);

  return (
    <StrategyDetail
      strategy={randomStrategy}
      actions={
        <>
          <Link reloadDocument className="page-action-link" to="/">
            Shuffle a card
          </Link>
          <Link className="page-action-link" to="/cards">
            Browse all cards
          </Link>
        </>
      }
    />
  );
}
