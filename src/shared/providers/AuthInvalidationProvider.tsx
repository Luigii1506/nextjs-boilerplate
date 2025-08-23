/**
 * 🔔 AUTH INVALIDATION PROVIDER
 * =============================
 *
 * Provider que configura listeners globales para invalidación de cache de auth.
 * Se monta una sola vez a nivel de app para escuchar cambios en tiempo real.
 *
 * Enterprise: 2025-01-17 - Real-time auth invalidation
 */

"use client";

import { useAuthInvalidationListener } from "@/shared/hooks/useAuth";

interface AuthInvalidationProviderProps {
  children: React.ReactNode;
}

export function AuthInvalidationProvider({
  children,
}: AuthInvalidationProviderProps) {
  // 🎧 Auto-start listeners para invalidación en tiempo real
  useAuthInvalidationListener();

  // Este provider no renderiza nada - solo configura listeners
  return <>{children}</>;
}
