import { httpClient } from "@/services/api/httpClient";
import type { User } from "@/features/users/types/user";

import type { LoginFormValues } from "../types/login";
import type { SignupPayload } from "../types/signup";
import { ensureActiveRoleForUser } from "../store/activeRoleStore";
import { setAuthSessionHint } from "../utils/authSession";

type AuthResponse = {
  user: User;
};

export async function login(payload: LoginFormValues) {
  const { data } = await httpClient.post<AuthResponse>("/auth/login", payload);
  ensureActiveRoleForUser(data.user);
  return data;
}

export async function getCurrentSession() {
  const { data } = await httpClient.get<User>("/users/me");
  setAuthSessionHint();
  ensureActiveRoleForUser(data);
  return data;
}

export async function logout() {
  await httpClient.post("/auth/logout");
}

export async function signup(payload: SignupPayload) {
  const { data } = await httpClient.post<User>("/auth/signup", payload);
  return data;
}
