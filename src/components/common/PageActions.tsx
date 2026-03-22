import { Link } from "react-router";

export default function PageActions() {
  return (
    <nav className="page-actions">
      <Link reloadDocument className="page-action-link" to="/">
        Shuffle a card
      </Link>
      <Link className="page-action-link" to="/cards">
        Browse all cards
      </Link>
    </nav>
  );
}
