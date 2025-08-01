"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export function useAuth(requireAuth: boolean = false): AuthState {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();

        if (session.data?.user) {
          setIsAuthenticated(true);
          setUser(session.data.user as User);

          // Si está en una página de auth y ya está logueado, redirigir
          const authPages = ["/login", "/register", "/forgot-password"];
          if (authPages.includes(window.location.pathname)) {
            const urlParams = new URLSearchParams(window.location.search);
            const callbackUrl = urlParams.get("callbackUrl") || "/";
            router.replace(callbackUrl);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);

          // Si requiere auth y no está logueado, redirigir a login
          if (requireAuth) {
            const currentPath = window.location.pathname;
            router.replace(
              `/login?callbackUrl=${encodeURIComponent(currentPath)}`
            );
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsAuthenticated(false);
        setUser(null);

        if (requireAuth) {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, router]);

  return { isLoading, isAuthenticated, user };
}

// Hook específico para páginas protegidas
export function useProtectedPage(): AuthState {
  return useAuth(true);
}

// Hook específico para páginas públicas
export function usePublicPage(): AuthState {
  return useAuth(false);
}

// Hook para refrescar el estado de autenticación
export function useRefreshAuth() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAuth = async () => {
    setIsRefreshing(true);
    try {
      // Forzar una nueva verificación de sesión
      const session = await authClient.getSession();
      return !!session.data?.user;
    } catch (error) {
      console.error("Error refreshing auth:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  return { refreshAuth, isRefreshing };
}
