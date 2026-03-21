import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";

import ReferenceCard from "@/components/common/ReferenceCard";
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
  const navigate = useNavigate();
  const randomCardPath = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
    return cardRoute(obliqueStrategies[randomIndex].slug);
  }, []);

  useEffect(() => {
    navigate(randomCardPath, { replace: true });
  }, [navigate, randomCardPath]);

  return (
    <div className="page-shell page-shell-neutral">
      <div className="reference-layout">
        <ReferenceCard>
          <div className="strategy-copy">
            <div className="strategy-kicker">Oblique Strategies</div>
            <h1 className="strategy-message">Choosing a card…</h1>
          </div>
        </ReferenceCard>
      </div>
      <nav className="page-actions">
        <Link className="page-action-link" to="/cards">
          Browse all cards
        </Link>
      </nav>
    </div>
  );
}
