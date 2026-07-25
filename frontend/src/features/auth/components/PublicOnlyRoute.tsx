import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthUser } from "../hooks/useAuthUser";
import { hasAuthSessionHint } from "../utils/authSession";

export function PublicOnlyRoute() {
  const shouldCheckAuth = hasAuthSessionHint();
  const { data: user, isLoading } = useAuthUser({ enabled: shouldCheckAuth });

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", minHeight: 320, placeItems: "center" }}>
        <CircularProgress aria-label="Loading account" />
      </Box>
    );
  }

  if (user) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
