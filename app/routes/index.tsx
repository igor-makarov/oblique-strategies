import { redirect } from "react-router";

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

export async function clientLoader() {
  const randomIndex = Math.floor(Math.random() * obliqueStrategies.length);
  const strategy = obliqueStrategies[randomIndex];
  return redirect(cardRoute(strategy.slug));
}

const SpinnerCard = () => (
  <div className="reference-layout">
    <ReferenceCard>
      <div className="spinner-layout">
        <div className="shuffle-spinner" />
      </div>
    </ReferenceCard>
  </div>
);

export function HydrateFallback() {
  return <SpinnerCard />;
}

export default function HomePage() {
  return <SpinnerCard />;
}
