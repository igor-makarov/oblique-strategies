import { useNavigate } from "react-router";

import { obliqueStrategies } from "@/js/data/obliqueStrategies";
import { cardRoute } from "@/js/utils/collectStrategyRoutes";

export default function ShuffleLink({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
    navigate(cardRoute(obliqueStrategies[randomIndex].slug));
  }

  return (
    <a href="/" onClick={handleClick}>
      {children}
    </a>
  );
}
