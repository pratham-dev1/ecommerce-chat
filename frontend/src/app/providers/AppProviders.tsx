import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";

import { SocketConnectionProvider } from "@/services/socket/SocketConnectionProvider";

import { ColorModeProvider } from "../theme/ColorModeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        <SocketConnectionProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </SocketConnectionProvider>
      </QueryClientProvider>
    </ColorModeProvider>
  );
}
