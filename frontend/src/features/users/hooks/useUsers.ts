import { useQuery } from "@tanstack/react-query";

import { getRoles, getUser, getUsers } from "../api/usersApi";
import type { UsersQueryParams } from "../types/user";

export const usersQueryKey = ["users"] as const;
export const rolesQueryKey = ["roles"] as const;
export const userQueryKey = (userId: number) => [...usersQueryKey, "detail", userId] as const;
const usersCacheFreshTime = 5 * 60 * 1000;

export function useUsers(params: UsersQueryParams) {
  return useQuery({
    placeholderData: (previousData) => previousData,
    queryFn: () => getUsers(params),
    queryKey: [...usersQueryKey, params],
    staleTime: usersCacheFreshTime,
  });
}

export function useUser(userId: number | null, enabled = true) {
  return useQuery({
    enabled: enabled && userId !== null,
    queryFn: () => getUser(Number(userId)),
    queryKey: userId === null ? [...usersQueryKey, "detail"] : userQueryKey(userId),
    retry: false,
    staleTime: usersCacheFreshTime,
  });
}

export function useRoles(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getRoles,
    queryKey: rolesQueryKey,
    staleTime: usersCacheFreshTime,
  });
}
