import { Links, Meta, Outlet, Scripts, ScrollRestoration, useMatches } from "react-router";

import "@/styles/style.css";

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <Meta />
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
