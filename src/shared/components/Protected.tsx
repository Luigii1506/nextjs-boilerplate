/**
 * 🛡️ COMPONENTES DE PROTECCIÓN SIMPLIFICADOS
 *
 * Componentes esenciales para proteger UI basándose en permisos
 */

import React from "react";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { Permission } from "@/core/auth/permissions";

// 🎯 Props base para componentes protegidos
interface BaseProtectedProps {
  /** Mensaje o componente a mostrar cuando no tiene permisos */
  fallback?: React.ReactNode;
  /** Contenido a proteger */
  children: React.ReactNode;
  /** Si debe mostrar el fallback o simplemente ocultar */
  showFallback?: boolean;
}

// 🛡️ Protección basada en permisos específicos
interface PermissionProtectedProps extends BaseProtectedProps {
  /** Permisos requeridos (formato: { recurso: ["accion1", "accion2"] }) */
  permissions: Permission;
}

// 👑 Protección basada en roles
interface RoleProtectedProps extends BaseProtectedProps {
  /** Roles permitidos */
  roles: string[];
  /** Si requiere TODOS los roles o solo UNO */
  requireAll?: boolean;
}

// 📊 Protección basada en nivel de rol
interface LevelProtectedProps extends BaseProtectedProps {
  /** Nivel mínimo requerido */
  minLevel: number;
}

/**
 * 🛡️ Protected - Componente principal de protección
 */
export const Protected: React.FC<PermissionProtectedProps> = ({
  permissions,
  fallback = null,
  showFallback = false,
  children,
}) => {
  const { canAccess } = usePermissions();

  // 🔍 Verificar permisos
  const hasAccess = canAccess(permissions);

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * 👑 RoleProtected - Protección basada en roles
 */
export const RoleProtected: React.FC<RoleProtectedProps> = ({
  roles,
  requireAll = false,
  fallback = null,
  showFallback = false,
  children,
}) => {
  const { currentRole } = usePermissions();

  // 🔍 Verificar roles
  const hasAccess = requireAll
    ? roles.every((role) => currentRole === role)
    : roles.includes(currentRole);

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * 📊 LevelProtected - Protección basada en nivel de rol
 */
export const LevelProtected: React.FC<LevelProtectedProps> = ({
  minLevel,
  fallback = null,
  showFallback = false,
  children,
}) => {
  const { currentLevel } = usePermissions();

  // 🔍 Verificar nivel
  const hasAccess = currentLevel >= minLevel;

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * 🛡️ AdminOnly - Shortcut para contenido solo de admins
 */
export const AdminOnly: React.FC<
  Omit<BaseProtectedProps, "children"> & { children: React.ReactNode }
> = ({ fallback = null, showFallback = false, children }) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * 👑 SuperAdminOnly - Shortcut para contenido solo de super admins
 */
export const SuperAdminOnly: React.FC<
  Omit<BaseProtectedProps, "children"> & { children: React.ReactNode }
> = ({ fallback = null, showFallback = false, children }) => {
  const { isSuperAdmin } = usePermissions();

  if (!isSuperAdmin) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * 🚫 NoAccess - Componente para mostrar cuando no hay acceso
 */
export const NoAccess: React.FC<{
  title?: string;
  message?: string;
  icon?: string;
}> = ({
  title = "Acceso Denegado",
  message = "No tienes permisos para ver este contenido.",
  icon = "🚫",
}) => {
  return (
    <div className="no-access-container">
      <div className="no-access-content">
        <div className="no-access-icon">{icon}</div>
        <h3 className="no-access-title">{title}</h3>
        <p className="no-access-message">{message}</p>
      </div>
    </div>
  );
};
