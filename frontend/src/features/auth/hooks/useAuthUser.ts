import { useQuery } from "@tanstack/react-query";

import { getCurrentSession } from "../api/authApi";

export const currentUserQueryKey = ["current-user"] as const;

type UseAuthUserOptions = {
  enabled?: boolean;
};

export function useAuthUser(options: UseAuthUserOptions = {}) {
  return useQuery({
    enabled: options.enabled ?? true,
    queryFn: getCurrentSession,
    queryKey: currentUserQueryKey,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
