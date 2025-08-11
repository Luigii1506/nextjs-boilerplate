"use client";

import React from "react";
import { Users, Shield, LogOut, Home, Upload, Sliders } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/core/auth/auth-client";
import type { SessionUser } from "@/shared/types/user";

interface RoleInfo {
  name: string;
  description: string;
  color: string; // ej. "red" | "orange" | "green"
  icon: string; // emoji/string
}

interface AdminLayoutProps {
  children: React.ReactNode;
  user: SessionUser;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roleInfo: RoleInfo;
  fileUploadEnabled: boolean;
}

const navBase =
  "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors";
const navActive = "bg-slate-100 text-slate-800 font-medium";
const navIdle = "text-slate-600 hover:text-slate-800 hover:bg-slate-50";

export default function AdminLayout({
  children,
  user,
  isAdmin,
  isSuperAdmin,
  roleInfo,
  fileUploadEnabled,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const currentLabel = (() => {
    if (isActive("/dashboard/users")) return "Usuarios";
    if (isActive("/dashboard/files")) return "📁 Gestión de Archivos";
    if (isActive("/dashboard/feature-flags")) return "🎛️ Feature Flags";
    return "Dashboard";
  })();

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
    <div className="min-h-screen bg-slate-50">
      {/* Header fijo */}
      <header className="bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                Panel de Administración
              </h1>
              <p className="text-sm text-slate-600">Vista: {currentLabel}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{user.email}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}
                    >
                      <span>{roleInfo.icon}</span>
                      {roleInfo.name}
                    </span>
                  </div>
                </div>

                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name ?? ""}
                    className="w-10 h-10 rounded-full border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-600 font-medium">
                      {user.name?.charAt(0).toUpperCase() ?? ""}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar fijo */}
      <aside className="fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200 z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Admin</h2>
              <p className="text-xs text-slate-500">Panel de Control</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            <Link
              href="/dashboard"
              className={`${navBase} ${
                isActive("/dashboard") ? navActive : navIdle
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/users"
              className={`${navBase} ${
                isActive("/dashboard/users") ? navActive : navIdle
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios</span>
            </Link>

            {fileUploadEnabled && (
              <Link
                href="/dashboard/files"
                className={`${navBase} ${
                  isActive("/dashboard/files") ? navActive : navIdle
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>📁 Gestión de Archivos</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/dashboard/feature-flags"
                className={`${navBase} ${
                  isActive("/dashboard/feature-flags") ? navActive : navIdle
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>🎛️ Feature Flags</span>
              </Link>
            )}
          </nav>

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

      {/* Contenido principal */}
      <main className="ml-64 pt-24 p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
