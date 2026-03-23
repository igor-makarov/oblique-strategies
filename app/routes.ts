import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/index.tsx"),
  route("/cards", "routes/cards/index.tsx"),
  route("/cards/:card", "routes/cards/$card.tsx"),
  route("/sitemap.xml", "routes/sitemap[.]xml.ts"),
];
