import { Link } from "react-router";

import ShuffleLink from "@/components/common/ShuffleLink";

export default function PageActions() {
  return (
    <nav className="page-actions">
      <ShuffleLink>Shuffle a card</ShuffleLink>
      <Link to="/cards">Browse all cards</Link>
    </nav>
  );
}
