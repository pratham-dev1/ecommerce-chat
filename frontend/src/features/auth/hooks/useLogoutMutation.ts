import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logout } from "../api/authApi";
import { useActiveRoleStore } from "../store/activeRoleStore";
import { clearAuthSessionHint } from "../utils/authSession";
import { currentUserQueryKey } from "./useAuthUser";

export function useLogoutMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearActiveRole = useActiveRoleStore((state) => state.clearActiveRole);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuthSessionHint();
      clearActiveRole();
      queryClient.removeQueries({ queryKey: currentUserQueryKey });
      navigate("/login", { replace: true });
    },
  });
}
