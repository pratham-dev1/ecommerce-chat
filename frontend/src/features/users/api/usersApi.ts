import { httpClient } from "@/services/api/httpClient";
import { getCurrentSession } from "@/features/auth/api/authApi";

import type {
  AssignableRole,
  UpdateUserPayload,
  User,
  UserPayload,
  UsersQueryParams,
  UsersResponse,
} from "../types/user";

export async function createUser(payload: UserPayload) {
  const { data } = await httpClient.post<User>("/auth/signup", payload);
  return data;
}

export async function getUsers(params: UsersQueryParams) {
  const { data } = await httpClient.get<UsersResponse>("/users", {
    params,
  });

  return data;
}

export async function getUser(userId: number) {
  const { data } = await httpClient.get<User>(`/users/${userId}`);
  return data;
}

export async function getCurrentUser() {
  return getCurrentSession();
}

export async function getRoles() {
  const { data } = await httpClient.get<AssignableRole[]>("/roles");
  return data;
}

export async function updateUser(userId: number, payload: UpdateUserPayload) {
  const { data } = await httpClient.patch<User>(`/users/${userId}`, payload);
  return data;
}

export async function deleteUser(userId: number) {
  await httpClient.delete(`/users/${userId}`);
}
