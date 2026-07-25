import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthUser } from "../hooks/useAuthUser";

export function ProtectedRoute() {
  const location = useLocation();
  const { data: user, isError, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", minHeight: 320, placeItems: "center" }}>
        <CircularProgress aria-label="Loading account" />
      </Box>
    );
  }

  if (isError || !user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
