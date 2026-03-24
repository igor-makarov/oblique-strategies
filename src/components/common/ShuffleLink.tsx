import { Link, useNavigate } from "react-router";

import { cardRoute } from "@/js/utils/collectStrategyRoutes";
import { getRandomStrategy } from "@/js/utils/getRandomStrategy";

export default function ShuffleLink({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  function handleClick(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const strategy = getRandomStrategy();
    navigate(cardRoute(strategy.slug));
  }

  return (
    <Link to="/" onClick={handleClick}>
      {children}
    </Link>
  );
}
