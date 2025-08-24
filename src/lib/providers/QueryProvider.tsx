/**
 * 🔄 QUERY PROVIDER
 * ==================
 *
 * Provider de TanStack Query con configuración enterprise.
 * Incluye DevTools para desarrollo y error boundaries.
 *
 * Enterprise: 2025-01-17 - Optimal query setup
 */

"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface QueryProviderProps {
  children: React.ReactNode;
}

// 🔄 Browser Query Client (separated from server)
export default function QueryProvider({ children }: QueryProviderProps) {
  // 🚀 Create query client on mount to avoid SSR issues
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 🚀 Performance optimizations
            staleTime: 30 * 1000, // 30s fresh data
            gcTime: 5 * 60 * 1000, // 5min garbage collection
            retry: (failureCount, error: { status?: number }) => {
              // 🎯 Smart retry logic
              if (error?.status === 401 || error?.status === 403) return false;
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),

            // 🔄 Smart refetching
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMount: true,

            // 📊 Error handling
            throwOnError: false,

            // ⚡ Network mode
            networkMode: "online",
          },
          mutations: {
            retry: 1,
            networkMode: "online",
            onError: (error: unknown) => {
              // 🚨 Global mutation error handling
              console.error("Mutation failed:", error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* 🛠️ DevTools only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          toggleButtonProps={{
            style: {
              position: "fixed",
              bottom: "20px",
              right: "20px",
              zIndex: 99999,
            },
          }}
        />
      )}
    </QueryClientProvider>
  );
}
