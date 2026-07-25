import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api/authApi";
import { ensureActiveRoleForUser } from "../store/activeRoleStore";
import { setAuthSessionHint } from "../utils/authSession";
import { currentUserQueryKey } from "./useAuthUser";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ user }) => {
      setAuthSessionHint();
      ensureActiveRoleForUser(user);
      queryClient.setQueryData(currentUserQueryKey, user);
    },
  });
}
