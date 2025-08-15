/**
 * 🏛️ ADMIN SHELL PURE - SERVER ACTIONS ONLY
 * ===========================================
 *
 * Layout principal usando 100% Server Actions.
 * Zero API routes, máximo performance Next.js 15.
 *
 * Created: 2025-01-29 - Pure implementation
 */

import React from "react";
import { Settings, Bell, Search } from "lucide-react";
import DynamicNavigationPure from "./components/DynamicNavigationPure";
import { InteractiveUserMenu } from "./components/InteractiveUserMenu";
import { LogoutButton } from "./components/LogoutButton";
import type { SessionUser } from "@/shared/types/user";
import Image from "next/image";

// 🎯 Role info mapping
const ROLE_INFO = {
  user: { label: "Usuario", color: "bg-blue-100 text-blue-800", icon: "👤" },
  admin: { label: "Admin", color: "bg-green-100 text-green-800", icon: "🛡️" },
  super_admin: {
    label: "Super Admin",
    color: "bg-purple-100 text-purple-800",
    icon: "⚡",
  },
} as const;

interface AdminShellPureProps {
  user: SessionUser;
  children: React.ReactNode;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * 🚀 PURE ADMIN SHELL
 * Uses Server Actions Provider for zero API routes
 */
export default function AdminShellPure({
  user,
  children,
  isAdmin,
}: AdminShellPureProps) {
  const roleInfo =
    ROLE_INFO[user.role as keyof typeof ROLE_INFO] || ROLE_INFO.user;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 📱 Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-slate-600">
                  Next.js 15 + Server Actions Pure
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* Settings */}
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* User Menu */}
              <InteractiveUserMenu
                user={user}
                roleInfo={{
                  name: roleInfo.label,
                  description: "",
                  ...roleInfo,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 📋 Sidebar */}
        <aside className="fixed top-0 left-0 z-30 w-64 h-screen pt-20 transition-transform bg-white border-r border-slate-200 translate-x-0">
          <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
            {/* User Info */}
            <div className="p-4 mb-6 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || "User"
                  )}&background=3b82f6&color=ffffff&size=40`}
                  alt={user.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}
                    >
                      {roleInfo.icon} {roleInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ⚡ Pure Server Actions Navigation */}
            <DynamicNavigationPure isAdmin={isAdmin} />

            {/* Logout */}
            <div className="mt-8 pt-4 border-t border-slate-200">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* 📄 Main Content */}
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
