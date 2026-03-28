import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/index.tsx"),
  route("/cards/", "routes/cards/index.tsx"),
  route("/cards/:card/", "routes/cards/$card.tsx"),
  // route("/og/:size.png", "routes/og/$size[.]png.tsx"),
  // route("/og/cards/:card/:size.png", "routes/og/cards/$card/$size[.]png.tsx"),
  route("/sitemap.xml", "routes/sitemap[.]xml.ts"),
];
