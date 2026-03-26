import { Links, Outlet, Scripts, ScrollRestoration, useMatches } from "react-router";

import "@/styles/style.css";

const pageDescription = "Oblique Strategies by Brian Eno and Peter Schmidt. Your magic 8-ball of inspiration.";
const siteName = "Oblique Strategies";

function useBodyBackground(): string | undefined {
  const matches = useMatches();

  for (const match of [...matches].reverse()) {
    const data = match.loaderData as { background?: string } | undefined;
    if (data?.background) {
      return data.background;
    }
  }
}

export default function Root() {
  const background = useBodyBackground();

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="description" content={pageDescription} />
        <meta property="og:site_name" content={siteName} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <Links />
      </head>
      <body style={background ? { background } : undefined}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
