import { Link, useNavigate } from "react-router";

import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategyIndex } from "@/js/utils/getRandomStrategyIndex";

export default function ShuffleLink({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  function handleClick(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    const randomIndex = getRandomStrategyIndex(obliqueStrategies);
    navigate(cardRoute(obliqueStrategies[randomIndex].slug));
  }

  return (
    <Link to="/" onClick={handleClick}>
      {children}
    </Link>
  );
}
