import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/index.tsx"),
  route("/cards/", "routes/cards/index.tsx"),
  route("/cards/:card/", "routes/cards/$card.tsx"),
  route("/og/:size/index.png", "routes/og/$size/index[.]png.tsx"),
  route("/og/:size/cards/:card.png", "routes/og/$size/cards/$card[.]png.tsx"),
  route("/sitemap.xml", "routes/sitemap[.]xml.ts"),
];
