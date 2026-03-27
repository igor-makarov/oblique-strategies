import { useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../root";

export function useRootLoaderData() {
  return useRouteLoaderData<typeof rootLoader>("root")!;
}
