import axios, { AxiosHeaders, isAxiosError, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/config/env";
import {
  clearActiveRole,
  ensureActiveRoleForUser,
  getActiveRoleId,
} from "@/features/auth/store/activeRoleStore";
import {
  clearAuthSessionHint,
  setAuthSessionHint,
} from "@/features/auth/utils/authSession";
import type { User } from "@/features/users/types/user";

type AuthResponse = {
  user: User;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshRequest: Promise<void> | null = null;

httpClient.interceptors.request.use((config) => {
  const activeRoleId = getActiveRoleId();
  const headers = AxiosHeaders.from(config.headers);

  if (activeRoleId) {
    headers.set("X-Active-Role-Id", String(activeRoleId));
  } else {
    headers.delete("X-Active-Role-Id");
  }

  config.headers = headers;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || error.response?.status !== 401) {
      throw error;
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest(originalRequest.url)
    ) {
      throw error;
    }

    originalRequest._retry = true;

    try {
      await refreshAccessToken();
      return httpClient(originalRequest);
    } catch (refreshError) {
      clearAuthSessionHint();
      clearActiveRole();
      throw refreshError;
    }
  },
);

async function refreshAccessToken() {
  refreshRequest ??= refreshClient
    .post<AuthResponse>("/auth/refresh")
    .then(({ data }) => {
      setAuthSessionHint();
      ensureActiveRoleForUser(data.user);
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

function isAuthRequest(url: string | undefined) {
  return Boolean(url?.includes("/auth/"));
}
