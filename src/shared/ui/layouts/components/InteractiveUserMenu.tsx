/**
 * 👤 INTERACTIVE USER MENU - CLIENT COMPONENT
 * ============================================
 *
 * Componente cliente para mostrar información del usuario.
 * Minimo necesario para interactividad.
 *
 * Created: 2025-01-29
 */

"use client";

import React from "react";
import Image from "next/image";
import type { SessionUser } from "@/shared/types/user";

interface RoleInfo {
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface InteractiveUserMenuProps {
  user: SessionUser;
  roleInfo: RoleInfo;
}

export function InteractiveUserMenu({
  user,
  roleInfo,
}: InteractiveUserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium text-slate-700">{user.name}</p>
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
        <Image
          src={user.image}
          alt={user.name ?? "Usuario"}
          width={40}
          height={40}
          className="rounded-full border-2 border-slate-200"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
          <span className="text-slate-600 font-medium">
            {user.name?.charAt(0).toUpperCase() ?? ""}
          </span>
        </div>
      )}
    </div>
  );
}
