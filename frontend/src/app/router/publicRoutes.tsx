import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";

import type { AppRoute } from "./routeTypes";

export const publicRoutes: AppRoute[] = [
  {
    element: <HomePage />,
    index: true,
  },
];

export const publicOnlyRoutes: AppRoute[] = [
  {
    element: <LoginPage />,
    path: "login",
  },
  {
    element: <SignupPage />,
    path: "signup",
  },
];
