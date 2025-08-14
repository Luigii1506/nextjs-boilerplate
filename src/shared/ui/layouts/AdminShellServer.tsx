/**
 * 🏢 ENTERPRISE ADMIN SHELL - SERVER COMPONENTS
 * =============================================
 *
 * Version empresarial del AdminShell usando Server Components.
 * Elimina completamente los errores de hidratación.
 *
 * Patterns utilizados por:
 * - Vercel Dashboard
 * - GitHub Admin Panel
 * - Shopify Admin
 * - Linear App
 *
 * Benefits:
 * - Zero hydration errors
 * - Ultra-fast initial render
 * - SEO optimizado
 * - Zero client-side feature flag requests
 * - Progressive enhancement ready
 *
 * Created: 2025-01-29 - Enterprise Implementation
 */

import React, { Suspense } from "react";
import { Shield } from "lucide-react";
import { LogoutButton } from "./components/LogoutButton";
import { InteractiveUserMenu } from "./components/InteractiveUserMenu";
import DynamicNavigation from "./components/DynamicNavigation";
import type { SessionUser } from "@/shared/types/user";

interface RoleInfo {
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface AdminShellServerProps {
  children: React.ReactNode;
  user: SessionUser;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roleInfo: RoleInfo;
  currentPath: string;
}

// 🎨 Static styles (no hydration needed)
const navStyles = {
  base: "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors",
  active: "bg-slate-100 text-slate-800 font-medium",
  idle: "text-slate-600 hover:text-slate-800 hover:bg-slate-50",
} as const;

// Navigation configuration moved to DynamicNavigation component

/**
 * 🏠 Current page label resolver (Server-side)
 */
function getCurrentLabel(pathname: string): string {
  if (pathname.startsWith("/users")) return "Usuarios";
  if (pathname.startsWith("/files")) return "📁 Gestión de Archivos";
  if (pathname.startsWith("/feature-flags")) return "🎛️ Feature Flags";
  return "Dashboard";
}

/**
 * 💀 Loading skeleton for interactive components
 */
function InteractiveSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="w-24 h-4 bg-slate-200 rounded animate-pulse mb-1"></div>
        <div className="w-32 h-3 bg-slate-200 rounded animate-pulse"></div>
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
      <div className="w-16 h-8 bg-slate-200 rounded animate-pulse"></div>
    </div>
  );
}

/**
 * 🏢 MAIN ENTERPRISE ADMIN SHELL COMPONENT
 */
export default async function AdminShellServer({
  children,
  user,
  isAdmin,
  isSuperAdmin,
  roleInfo,
  currentPath,
}: AdminShellServerProps) {
  // 📍 Get current section label
  const currentLabel = getCurrentLabel(currentPath);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 📱 Header fijo - Mayormente estático */}
      <header className="bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-600">Vista: {currentLabel}</p>
            </div>

            {/* 🎯 Progressive enhancement - Solo las partes interactivas necesitan hidratación */}
            <Suspense fallback={<InteractiveSkeleton />}>
              <div className="flex items-center gap-4">
                <InteractiveUserMenu user={user} roleInfo={roleInfo} />
                <LogoutButton />
              </div>
            </Suspense>
          </div>
        </div>
      </header>

      {/* 🏢 Sidebar - Completamente estático */}
      <aside className="fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200 z-20">
        <div className="p-6">
          {/* 🛡️ Logo section - estático */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Admin</h2>
              <p className="text-xs text-slate-500">Panel de Control</p>
            </div>
          </div>

          {/* 🧭 Navigation - dinámica con actualizaciones inmediatas */}
          <DynamicNavigation isAdmin={isAdmin} />

          {/* 📊 Access info - estático */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Tu Acceso
            </h4>
            <div className="space-y-1 text-xs text-slate-600">
              <div>✓ Gestión de usuarios</div>
              {isSuperAdmin && <div>✓ Acceso completo al sistema</div>}
            </div>
          </div>
        </div>
      </aside>

      {/* 📄 Contenido principal */}
      <main className="ml-64 pt-24 p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

/**
 * 🎯 TYPED PROPS HELPER
 * Export helper types for consumers
 */
export type { AdminShellServerProps };
export { navStyles };
