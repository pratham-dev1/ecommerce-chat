import type { ReactElement } from "react";

export type AppRoute = {
  element: ReactElement;
  index?: boolean;
  path?: string;
};

export type GrantRoute = AppRoute & {
  grant: string;
};
