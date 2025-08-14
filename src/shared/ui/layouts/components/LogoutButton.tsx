/**
 * 🚪 LOGOUT BUTTON - CLIENT COMPONENT
 * ===================================
 *
 * Componente cliente enfocado solo en la funcionalidad de logout.
 * Siguiendo el patrón de "Islands Architecture".
 *
 * Created: 2025-01-29
 */

"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/core/auth/auth-client";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => router.push("/login"),
        },
      });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Salir
    </button>
  );
}
