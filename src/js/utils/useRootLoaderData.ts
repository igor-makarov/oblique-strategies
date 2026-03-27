import { useRouteLoaderData } from "react-router";

import type { loader as rootLoader } from "../../../app/root";

export function useRootLoaderData() {
  return useRouteLoaderData<typeof rootLoader>("root")!;
}
