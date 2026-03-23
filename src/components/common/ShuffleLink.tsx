import { Link, useNavigate } from "react-router";

import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

export default function ShuffleLink({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  function handleClick(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
    navigate(cardRoute(obliqueStrategies[randomIndex].slug));
  }

  return (
    <Link to="/" onClick={handleClick}>
      {children}
    </Link>
  );
}
