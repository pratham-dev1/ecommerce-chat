type ClientEnv = {
  apiBaseUrl: string;
  socketBaseUrl: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export const env: ClientEnv = {
  apiBaseUrl,
  socketBaseUrl:
    import.meta.env.VITE_SOCKET_BASE_URL ?? apiBaseUrl.replace(/\/api\/v1\/?$/, ""),
};
