import { useMutation, useQueryClient } from "@tanstack/react-query";

import { currentUserQueryKey } from "@/features/auth/hooks/useAuthUser";

import { createUser, deleteUser, updateUser } from "../api/usersApi";
import type { UpdateUserPayload, User, UserPayload } from "../types/user";
import { userQueryKey, usersQueryKey } from "./useUsers";

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, userId }: { payload: UpdateUserPayload; userId: number }) =>
      updateUser(userId, payload),
    onSuccess: (user: User) => {
      queryClient.setQueryData(userQueryKey(user.id), user);
      const currentUser = queryClient.getQueryData<User>(currentUserQueryKey);

      if (currentUser?.id === user.id) {
        queryClient.setQueryData(currentUserQueryKey, user);
      }

      void queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_data, userId) => {
      queryClient.removeQueries({ queryKey: userQueryKey(userId) });
      void queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });
}
