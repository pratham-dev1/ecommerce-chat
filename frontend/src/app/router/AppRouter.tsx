import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute, PublicOnlyRoute, RequireGrant } from "@/features/auth";

import { adminRoutes } from "./adminRoutes";
import { protectedRoutes } from "./protectedRoutes";
import { publicOnlyRoutes, publicRoutes } from "./publicRoutes";
import type { AppRoute } from "./routeTypes";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {publicRoutes.map(renderRoute)}
        <Route element={<PublicOnlyRoute />}>
          {publicOnlyRoutes.map(renderRoute)}
        </Route>
        <Route element={<ProtectedRoute />}>
          {protectedRoutes.map(renderRoute)}
          {adminRoutes.map((route) => (
            <Route element={<RequireGrant grant={route.grant} />} key={route.path}>
              {renderRoute(route)}
            </Route>
          ))}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function renderRoute(route: AppRoute) {
  if (route.index) {
    return <Route element={route.element} index key="index" />;
  }

  return <Route element={route.element} key={route.path} path={route.path} />;
}
