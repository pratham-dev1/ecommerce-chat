import { UsersPage } from "@/pages/UsersPage";

import type { GrantRoute } from "./routeTypes";

export const adminRoutes: GrantRoute[] = [
  {
    element: <UsersPage />,
    grant: "READ_USER",
    path: "users",
  },
];
