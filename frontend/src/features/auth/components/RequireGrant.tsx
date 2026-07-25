import { Navigate, Outlet } from "react-router-dom";

import { useAuthUser } from "../hooks/useAuthUser";
import { useActiveRole } from "../hooks/useActiveRole";

type RequireGrantProps = {
  grant: string;
};

export function RequireGrant({ grant }: RequireGrantProps) {
  const { data: user } = useAuthUser();
  const { hasGrant } = useActiveRole(user);

  if (!hasGrant(grant)) {
    return <Navigate replace to="/403" />;
  }

  return <Outlet />;
}
