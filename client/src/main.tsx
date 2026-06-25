import { trpc } from "@/lib/trpc";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@shared/const";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient();

const getCookieValue = (cookieName: string): string | null => {
  if (typeof document === "undefined") return null;
  const encodedName = encodeURIComponent(cookieName);
  const target = document.cookie
    .split("; ")
    .find(row => row.startsWith(`${encodedName}=`));
  if (!target) return null;
  return decodeURIComponent(target.slice(encodedName.length + 1));
};

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
        const headers = new Headers(init?.headers ?? undefined);
        if (csrfToken) {
          headers.set(CSRF_HEADER_NAME, csrfToken);
        }
        return globalThis.fetch(input, {
          ...(init ?? {}),
          headers,
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors />
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </HelmetProvider>
);
