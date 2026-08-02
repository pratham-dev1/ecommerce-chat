import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";

import { getRoles, getUser, getUsers } from "../api/usersApi";
import type { UsersQueryParams, UsersResponse } from "../types/user";

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

export function useInfiniteUsers(
  params: Omit<UsersQueryParams, "page" | "pageSize"> & {
    pageSize: number;
  },
) {
  return useInfiniteQuery<
    UsersResponse,
    Error,
    InfiniteData<UsersResponse>,
    QueryKey,
    number
  >({
    initialPageParam: 1,
    placeholderData: (previousData) => previousData,
    queryFn: ({ pageParam }) =>
      getUsers({
        ...params,
        page: pageParam,
      }),
    queryKey: [...usersQueryKey, "infinite", params],
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
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
