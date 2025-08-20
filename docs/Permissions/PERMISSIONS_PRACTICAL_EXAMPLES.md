---
title: Ejemplo
slug: /permisos/ejemplo
---

# 💡 **EJEMPLOS PRÁCTICOS DEL SISTEMA DE PERMISOS**

## 📚 **ÍNDICE DE EJEMPLOS**

- [🚀 Ejemplos Básicos](#-ejemplos-básicos)
- [🛡️ Protección de Componentes](#-protección-de-componentes)
- [👥 Gestión de Usuarios Avanzada](#-gestión-de-usuarios-avanzada)
- [📁 Sistema de Archivos](#-sistema-de-archivos)
- [🔐 Dashboard de Administración](#-dashboard-de-administración)
- [🎯 Casos de Uso Complejos](#-casos-de-uso-complejos)
- [🧪 Testing de Permisos](#-testing-de-permisos)

---

## 🚀 **EJEMPLOS BÁSICOS**

### **🔍 Ejemplo 1: Verificación Simple de Permisos**

```typescript
// components/users/UserActions.tsx
import { usePermissions } from "@/shared/hooks/usePermissions";

const UserActions = ({ user }) => {
  const { canEditUsers, canDeleteUsers, canBanUsers, canManageUserRole } =
    usePermissions();

  return (
    <div className="user-actions">
      <h3>Acciones para {user.name}</h3>

      {/* ✅ Solo mostrar si puede editar */}
      {canEditUsers() && (
        <button className="btn btn-primary">✏️ Editar Usuario</button>
      )}

      {/* ✅ Solo mostrar si puede banear */}
      {canBanUsers() && (
        <button className="btn btn-warning">🚫 Banear Usuario</button>
      )}

      {/* ✅ Solo mostrar si puede cambiar roles */}
      {canManageUserRole(user.role) && (
        <select>
          <option>Cambiar rol...</option>
          <option value="user">Usuario</option>
          <option value="admin">Admin</option>
        </select>
      )}

      {/* ✅ Solo mostrar si puede eliminar */}
      {canDeleteUsers() && (
        <button className="btn btn-danger">🗑️ Eliminar Usuario</button>
      )}
    </div>
  );
};
```

### **📊 Ejemplo 2: Dashboard con Verificaciones Múltiples**

```typescript
// components/dashboard/AdminDashboard.tsx
import { usePermissions } from "@/shared/hooks/usePermissions";

const AdminDashboard = () => {
  const { isAdmin, isSuperAdmin, canAccess, currentRole, getPermissionStats } =
    usePermissions();

  // 📊 Verificar múltiples permisos a la vez
  const canManageSystem = canAccess({
    user: ["create", "update", "delete"],
    session: ["list", "revoke"],
    files: ["read", "upload"],
  });

  const stats = getPermissionStats();

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
        <div className="user-info">
          <span className={`role-badge role-${currentRole}`}>
            {currentRole}
          </span>
        </div>
      </header>

      {/* 🎯 Sección para todos los admins */}
      {isAdmin() && (
        <section className="admin-section">
          <h2>🛡️ Herramientas de Administración</h2>

          <div className="admin-grid">
            {/* 👥 Gestión de usuarios */}
            {canAccess({ user: ["list", "create"] }) && (
              <div className="admin-card">
                <h3>👥 Usuarios</h3>
                <p>Gestionar usuarios del sistema</p>
                <button>Ver Usuarios</button>
              </div>
            )}

            {/* 🔐 Gestión de sesiones */}
            {canAccess({ session: ["list"] }) && (
              <div className="admin-card">
                <h3>🔐 Sesiones</h3>
                <p>Monitorear sesiones activas</p>
                <button>Ver Sesiones</button>
              </div>
            )}

            {/* 📁 Gestión de archivos */}
            {canAccess({ files: ["read", "upload"] }) && (
              <div className="admin-card">
                <h3>📁 Archivos</h3>
                <p>Administrar archivos del sistema</p>
                <button>Ver Archivos</button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 👑 Sección solo para super admins */}
      {isSuperAdmin() && (
        <section className="super-admin-section">
          <h2>👑 Super Administrador</h2>

          <div className="super-admin-grid">
            <div className="admin-card dangerous">
              <h3>🔧 Configuración del Sistema</h3>
              <p>Modificar configuraciones críticas</p>
              <button className="btn-danger">Configurar</button>
            </div>

            <div className="admin-card">
              <h3>📊 Analytics Avanzados</h3>
              <p>Ver métricas detalladas del sistema</p>
              <button>Ver Analytics</button>
            </div>

            <div className="admin-card">
              <h3>🔄 Impersonar Usuario</h3>
              <p>Iniciar sesión como otro usuario</p>
              <button>Impersonar</button>
            </div>
          </div>
        </section>
      )}

      {/* 📊 Estadísticas de permisos (desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <section className="debug-section">
          <h3>🔍 Debug de Permisos</h3>
          <pre>{JSON.stringify(stats, null, 2)}</pre>
        </section>
      )}

      {/* 🚫 Sin permisos */}
      {!isAdmin() && (
        <div className="no-access">
          <h2>🚫 Acceso Denegado</h2>
          <p>No tienes permisos de administrador.</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🛡️ **PROTECCIÓN DE COMPONENTES**

### **🎯 Ejemplo 3: Usando Componentes Declarativos**

```typescript
// components/users/UserManagement.tsx
import {
  Protected,
  AdminOnly,
  SuperAdminOnly,
  RoleProtected,
  LevelProtected,
  NoAccess,
} from "@/shared/components/Protected";

const UserManagement = () => {
  return (
    <div className="user-management">
      <h1>Gestión de Usuarios</h1>

      {/* 🛡️ Proteger sección completa con permisos específicos */}
      <Protected
        permissions={{ user: ["list", "read"] }}
        fallback={<NoAccess message="No puedes ver la lista de usuarios" />}
        showFallback={true}
      >
        <UsersList />
      </Protected>

      {/* 🛡️ Proteger creación de usuarios */}
      <Protected
        permissions={{ user: ["create"] }}
        fallback={
          <div className="info-message">
            💡 Necesitas permisos de creación para añadir usuarios
          </div>
        }
        showFallback={true}
      >
        <section className="create-section">
          <h2>➕ Crear Nuevo Usuario</h2>
          <CreateUserForm />
        </section>
      </Protected>

      {/* 👑 Solo para admins */}
      <AdminOnly
        fallback={<div>🛡️ Funciones de admin no disponibles</div>}
        showFallback={true}
      >
        <section className="admin-functions">
          <h2>🛡️ Funciones de Administrador</h2>

          {/* 🎯 Dentro del AdminOnly, más protecciones específicas */}
          <Protected permissions={{ user: ["ban"] }}>
            <button className="btn btn-warning">
              🚫 Banear Usuario Seleccionado
            </button>
          </Protected>

          <Protected permissions={{ user: ["set-role"] }}>
            <BulkRoleChanger />
          </Protected>
        </section>
      </AdminOnly>

      {/* 👑 Solo para super admins */}
      <SuperAdminOnly>
        <section className="danger-zone">
          <h2>⚠️ Zona Peligrosa</h2>
          <button className="btn btn-danger">
            🗑️ Eliminar Todos los Usuarios
          </button>
          <button className="btn btn-danger">🔄 Resetear Sistema</button>
        </section>
      </SuperAdminOnly>

      {/* 📊 Protección por nivel de rol */}
      <LevelProtected
        minLevel={80}
        fallback={<div>Requiere nivel de admin (80+)</div>}
        showFallback={true}
      >
        <AdvancedUserStats />
      </LevelProtected>

      {/* 🎯 Protección por roles específicos */}
      <RoleProtected
        roles={["admin", "super_admin"]}
        requireAll={false} // Solo necesita UNO de los roles
      >
        <AdminToolbar />
      </RoleProtected>
    </div>
  );
};
```

### **🔄 Ejemplo 4: HOCs (Higher Order Components)**

```typescript
// components/forms/CreateUserForm.tsx
import { withPermissions, withAdminOnly } from "@/shared/components/Protected";

// 🛡️ Componente base
const CreateUserFormBase = () => {
  return (
    <form className="create-user-form">
      <h2>➕ Crear Usuario</h2>
      <input type="text" placeholder="Nombre" />
      <input type="email" placeholder="Email" />
      <select>
        <option>Seleccionar rol...</option>
        <option value="user">Usuario</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Crear Usuario</button>
    </form>
  );
};

// 🛡️ Envolver con protección de permisos
export const CreateUserForm = withPermissions(
  CreateUserFormBase,
  { user: ["create"] },
  <div>No tienes permisos para crear usuarios</div>
);

// 🛡️ Versión alternativa: solo para admins
export const AdminCreateUserForm = withAdminOnly(
  CreateUserFormBase,
  <div>Solo administradores pueden crear usuarios</div>
);
```

---

## 👥 **GESTIÓN DE USUARIOS AVANZADA**

### **🔍 Ejemplo 5: Lista de Usuarios con Permisos Contextuales**

```typescript
// components/users/UsersList.tsx
import {
  usePermissions,
  useUserManagement,
} from "@/shared/hooks/usePermissions";
import { CustomProtected } from "@/shared/components/Protected";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const { currentRole, canManageUserRole, getManageableRoles } =
    usePermissions();

  const { canEditUsers, canDeleteUsers, canBanUsers, canSetUserRoles } =
    useUserManagement();

  return (
    <div className="users-list">
      <header className="list-header">
        <h2>👥 Lista de Usuarios</h2>

        {/* 📊 Estadísticas basadas en permisos */}
        <div className="user-stats">
          <span>Total: {users.length}</span>
          {canAccess({ user: ["read"] }) && (
            <span>Activos: {users.filter((u) => !u.banned).length}</span>
          )}
        </div>
      </header>

      <div className="users-grid">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            currentUserRole={currentRole}
            onEdit={canEditUsers() ? handleEditUser : undefined}
            onDelete={canDeleteUsers() ? handleDeleteUser : undefined}
            onBan={canBanUsers() ? handleBanUser : undefined}
            onRoleChange={canSetUserRoles() ? handleRoleChange : undefined}
            canManageRole={canManageUserRole}
            assignableRoles={getManageableRoles()}
          />
        ))}
      </div>
    </div>
  );
};

const UserCard = ({
  user,
  currentUserRole,
  onEdit,
  onDelete,
  onBan,
  onRoleChange,
  canManageRole,
  assignableRoles,
}) => {
  // 🎯 Verificación contextual: no puede gestionarse a sí mismo para cosas críticas
  const canManageThisUser = user.id !== getCurrentUserId();

  // 🔍 Verificar si puede cambiar el rol de este usuario específico
  const canChangeThisUserRole = canManageRole(user.role);

  return (
    <div className={`user-card ${user.banned ? "banned" : ""}`}>
      <div className="user-avatar">
        {user.image ? (
          <img src={user.image} alt={user.name} />
        ) : (
          <div className="avatar-placeholder">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>

        <div className="user-meta">
          <span className={`role-badge role-${user.role}`}>{user.role}</span>

          {user.banned && <span className="banned-badge">🚫 Baneado</span>}
        </div>
      </div>

      <div className="user-actions">
        {/* ✏️ Editar - siempre permitido si tiene permiso */}
        {onEdit && (
          <button
            onClick={() => onEdit(user)}
            className="btn btn-sm btn-primary"
          >
            ✏️ Editar
          </button>
        )}

        {/* 👑 Cambiar rol - solo si puede gestionar este rol específico */}
        {onRoleChange && canChangeThisUserRole && (
          <select
            value={user.role}
            onChange={(e) => onRoleChange(user.id, e.target.value)}
            className="role-select"
          >
            <option value={user.role}>{user.role}</option>
            {assignableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        )}

        {/* 🚫 Banear - solo otros usuarios */}
        <CustomProtected
          condition={() => onBan && canManageThisUser && !user.banned}
        >
          <button
            onClick={() => onBan(user)}
            className="btn btn-sm btn-warning"
          >
            🚫 Banear
          </button>
        </CustomProtected>

        {/* ✅ Desbanear */}
        <CustomProtected
          condition={() => onBan && canManageThisUser && user.banned}
        >
          <button
            onClick={() => onUnban(user)}
            className="btn btn-sm btn-success"
          >
            ✅ Desbanear
          </button>
        </CustomProtected>

        {/* 🗑️ Eliminar - solo otros usuarios y con confirmación extra para admins */}
        <CustomProtected
          condition={() => {
            if (!onDelete || !canManageThisUser) return false;

            // Protección extra: super admin no puede ser eliminado fácilmente
            if (
              user.role === "super_admin" &&
              currentUserRole !== "super_admin"
            ) {
              return false;
            }

            return true;
          }}
        >
          <button
            onClick={() => {
              if (user.role === "admin" || user.role === "super_admin") {
                if (
                  confirm(
                    `¿Estás SEGURO de eliminar al ${user.role} ${user.name}?`
                  )
                ) {
                  onDelete(user);
                }
              } else {
                onDelete(user);
              }
            }}
            className="btn btn-sm btn-danger"
          >
            🗑️ Eliminar
          </button>
        </CustomProtected>
      </div>
    </div>
  );
};
```

---

## 📁 **SISTEMA DE ARCHIVOS**

### **📤 Ejemplo 6: Gestión de Archivos con Permisos**

```typescript
// components/files/FileManager.tsx
import { useFileManagement } from "@/shared/hooks/usePermissions";
import { Protected, PermissionGate } from "@/shared/components/Protected";

const FileManager = () => {
  const {
    canViewFiles,
    canUploadFiles,
    canDeleteFiles,
    hasFileReadPermission,
    hasFileUploadPermission,
  } = useFileManagement();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 🔍 Verificación async al cargar
  useEffect(() => {
    const checkAndLoadFiles = async () => {
      const canRead = await hasFileReadPermission();
      if (canRead) {
        loadFiles();
      }
    };

    checkAndLoadFiles();
  }, [hasFileReadPermission]);

  const handleFileUpload = async (files: FileList) => {
    // 🔍 Verificar permiso antes de subir
    const canUpload = await hasFileUploadPermission();
    if (!canUpload) {
      alert("No tienes permisos para subir archivos");
      return;
    }

    setUploading(true);
    try {
      await uploadFiles(files);
      loadFiles(); // Recargar lista
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-manager">
      <header className="file-manager-header">
        <h1>📁 Gestor de Archivos</h1>

        {/* 📊 Mostrar info solo si puede ver archivos */}
        {canViewFiles() && (
          <div className="file-stats">
            <span>Total: {files.length} archivos</span>
          </div>
        )}
      </header>

      {/* 📤 Zona de subida - solo si tiene permisos */}
      <Protected
        permissions={{ files: ["upload"] }}
        fallback={
          <div className="upload-disabled">
            🚫 No tienes permisos para subir archivos
          </div>
        }
        showFallback={true}
      >
        <section className="upload-section">
          <h2>📤 Subir Archivos</h2>
          <FileDropZone
            onFilesSelected={handleFileUpload}
            disabled={uploading}
          />
          {uploading && (
            <div className="upload-progress">🔄 Subiendo archivos...</div>
          )}
        </section>
      </Protected>

      {/* 📋 Lista de archivos con gate de permisos */}
      <PermissionGate
        permissions={{ files: ["read"] }}
        loading={<div>🔄 Cargando archivos...</div>}
        fallback={
          <div className="no-file-access">
            🚫 No tienes permisos para ver archivos
          </div>
        }
      >
        <section className="files-section">
          <h2>📋 Archivos del Sistema</h2>

          <div className="files-grid">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                canDelete={canDeleteFiles()}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        </section>
      </PermissionGate>
    </div>
  );
};

const FileCard = ({ file, canDelete, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!canDelete) return;

    if (!confirm(`¿Eliminar ${file.name}?`)) return;

    setDeleting(true);
    try {
      await onDelete(file.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(file.type)}</div>

      <div className="file-info">
        <h4>{file.name}</h4>
        <p>{formatFileSize(file.size)}</p>
        <p>{formatDate(file.createdAt)}</p>
      </div>

      <div className="file-actions">
        {/* 👁️ Ver - siempre disponible si puede leer */}
        <button
          onClick={() => openFile(file)}
          className="btn btn-sm btn-primary"
        >
          👁️ Ver
        </button>

        {/* 📥 Descargar */}
        <button
          onClick={() => downloadFile(file)}
          className="btn btn-sm btn-secondary"
        >
          📥 Descargar
        </button>

        {/* 🗑️ Eliminar - solo con permisos */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-sm btn-danger"
          >
            {deleting ? "🔄" : "🗑️"} Eliminar
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 🔐 **DASHBOARD DE ADMINISTRACIÓN**

### **📊 Ejemplo 7: Dashboard Completo con Múltiples Permisos**

```typescript
// components/admin/CompleteDashboard.tsx
import {
  usePermissions,
  useUserManagement,
  useFileManagement,
  useSessionManagement,
  usePermissionValidator,
} from "@/shared/hooks/usePermissions";

const CompleteDashboard = () => {
  const { isAdmin, isSuperAdmin, currentRole, canAccess } = usePermissions();

  const userPerms = useUserManagement();
  const filePerms = useFileManagement();
  const sessionPerms = useSessionManagement();

  // 🔍 Validar múltiples permisos complejos
  const { results, canProceed } = usePermissionValidator([
    {
      name: "user_management",
      permissions: { user: ["list", "create", "update"] },
      required: true,
    },
    {
      name: "file_management",
      permissions: { files: ["read", "upload"] },
      required: false,
    },
    {
      name: "session_management",
      permissions: { session: ["list", "revoke"] },
      required: false,
    },
  ]);

  // 📊 Datos del dashboard
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, banned: 0 },
    files: { total: 0, size: 0 },
    sessions: { active: 0, total: 0 },
  });

  // 📊 Widgets disponibles basados en permisos
  const availableWidgets = useMemo(() => {
    const widgets = [];

    if (userPerms.canEditUsers()) {
      widgets.push({
        id: "users",
        title: "👥 Gestión de Usuarios",
        component: <UsersWidget data={dashboardData.users} />,
        permissions: ["user:list", "user:create"],
      });
    }

    if (filePerms.canViewFiles()) {
      widgets.push({
        id: "files",
        title: "📁 Archivos del Sistema",
        component: <FilesWidget data={dashboardData.files} />,
        permissions: ["files:read"],
      });
    }

    if (sessionPerms.canViewSessions()) {
      widgets.push({
        id: "sessions",
        title: "🔐 Sesiones Activas",
        component: <SessionsWidget data={dashboardData.sessions} />,
        permissions: ["session:list"],
      });
    }

    return widgets;
  }, [userPerms, filePerms, sessionPerms, dashboardData]);

  if (!canProceed) {
    return (
      <div className="access-denied">
        <h1>🚫 Acceso Denegado</h1>
        <p>No tienes los permisos mínimos para acceder al dashboard.</p>

        <div className="permission-details">
          <h3>Verificación de Permisos:</h3>
          {results.map((result) => (
            <div
              key={result.name}
              className={`permission-result ${
                result.hasAccess ? "allowed" : "denied"
              }`}
            >
              <span>{result.hasAccess ? "✅" : "❌"}</span>
              <span>{result.name}</span>
              {result.required && <span className="required">(Requerido)</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="complete-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📊 Dashboard de Administración</h1>
          <div className="user-badge">
            <span className={`role-badge role-${currentRole}`}>
              {currentRole}
            </span>
          </div>
        </div>

        {/* 📊 Estadísticas rápidas */}
        <div className="quick-stats">
          {availableWidgets.map((widget) => (
            <QuickStat
              key={widget.id}
              title={widget.title}
              data={dashboardData[widget.id]}
            />
          ))}
        </div>
      </header>

      <main className="dashboard-content">
        {/* 📊 Widgets principales */}
        <div className="widgets-grid">
          {availableWidgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              title={widget.title}
              permissions={widget.permissions}
            >
              {widget.component}
            </DashboardWidget>
          ))}
        </div>

        {/* 🎯 Sección de acciones rápidas */}
        <aside className="quick-actions">
          <h2>⚡ Acciones Rápidas</h2>

          <div className="action-grid">
            {/* 👥 Crear usuario */}
            <Protected permissions={{ user: ["create"] }}>
              <QuickAction
                icon="➕"
                title="Crear Usuario"
                description="Añadir nuevo usuario al sistema"
                onClick={() => openCreateUserModal()}
              />
            </Protected>

            {/* 📁 Subir archivo */}
            <Protected permissions={{ files: ["upload"] }}>
              <QuickAction
                icon="📤"
                title="Subir Archivo"
                description="Añadir archivo al sistema"
                onClick={() => openFileUploader()}
              />
            </Protected>

            {/* 🔐 Ver sesiones */}
            <Protected permissions={{ session: ["list"] }}>
              <QuickAction
                icon="🔐"
                title="Sesiones Activas"
                description="Monitorear sesiones de usuarios"
                onClick={() => openSessionsPanel()}
              />
            </Protected>

            {/* 👑 Super admin actions */}
            <SuperAdminOnly>
              <QuickAction
                icon="⚙️"
                title="Configuración"
                description="Ajustes del sistema"
                onClick={() => openSystemConfig()}
                className="super-admin-action"
              />
            </SuperAdminOnly>
          </div>
        </aside>

        {/* 📊 Analytics avanzados para super admin */}
        <SuperAdminOnly>
          <section className="advanced-analytics">
            <h2>📈 Analytics Avanzados</h2>
            <AdvancedAnalytics />
          </section>
        </SuperAdminOnly>
      </main>
    </div>
  );
};

// 📊 Widget de dashboard con protección
const DashboardWidget = ({ title, permissions, children }) => {
  return (
    <PermissionGate
      permissions={parsePermissions(permissions)}
      loading={<WidgetSkeleton />}
      fallback={
        <div className="widget-no-access">
          <h3>{title}</h3>
          <p>🚫 Sin permisos suficientes</p>
        </div>
      }
    >
      <div className="dashboard-widget">
        <header className="widget-header">
          <h3>{title}</h3>
          <div className="widget-actions">
            <button className="widget-refresh">🔄</button>
            <button className="widget-settings">⚙️</button>
          </div>
        </header>
        <div className="widget-content">{children}</div>
      </div>
    </PermissionGate>
  );
};

// ⚡ Acción rápida con protección
const QuickAction = ({ icon, title, description, onClick, className = "" }) => {
  return (
    <button onClick={onClick} className={`quick-action ${className}`}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </button>
  );
};
```

---

## 🎯 **CASOS DE USO COMPLEJOS**

### **🔄 Ejemplo 8: Sistema de Workflow con Permisos Dinámicos**

```typescript
// components/workflow/WorkflowManager.tsx
import { usePermissions } from "@/shared/hooks/usePermissions";
import { CustomProtected } from "@/shared/components/Protected";

interface WorkflowStep {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  assignedTo: string[];
  requiredPermissions: Permission;
  canEdit: (user: any) => boolean;
  canApprove: (user: any) => boolean;
}

const WorkflowManager = ({ workflow }) => {
  const { currentRole, canAccess, user } = usePermissions();

  // 🎯 Lógica de permisos contextual para workflow
  const getStepPermissions = (step: WorkflowStep) => {
    const basePermissions = {
      canView: canAccess(step.requiredPermissions),
      canEdit: step.canEdit(user) && canAccess(step.requiredPermissions),
      canApprove: step.canApprove(user),
      isAssigned: step.assignedTo.includes(user?.id),
    };

    return basePermissions;
  };

  return (
    <div className="workflow-manager">
      <header className="workflow-header">
        <h1>🔄 Workflow: {workflow.name}</h1>
        <div className="workflow-status">Status: {workflow.status}</div>
      </header>

      <div className="workflow-steps">
        {workflow.steps.map((step, index) => {
          const permissions = getStepPermissions(step);

          return (
            <CustomProtected
              key={step.id}
              condition={() => permissions.canView}
              fallback={
                <div className="step-hidden">
                  <span>🔒 Paso {index + 1} - Acceso restringido</span>
                </div>
              }
              showFallback={true}
            >
              <WorkflowStep
                step={step}
                permissions={permissions}
                onEdit={permissions.canEdit ? handleEditStep : undefined}
                onApprove={
                  permissions.canApprove ? handleApproveStep : undefined
                }
              />
            </CustomProtected>
          );
        })}
      </div>

      {/* 🎯 Acciones globales del workflow */}
      <footer className="workflow-actions">
        <CustomProtected
          condition={() =>
            canAccess({ workflow: ["manage"] }) ||
            workflow.createdBy === user?.id
          }
        >
          <button className="btn btn-primary">✏️ Editar Workflow</button>
        </CustomProtected>

        <CustomProtected
          condition={() =>
            canAccess({ workflow: ["approve"] }) &&
            workflow.status === "pending_approval"
          }
        >
          <button className="btn btn-success">✅ Aprobar Workflow</button>
        </CustomProtected>

        <CustomProtected
          condition={() =>
            canAccess({ workflow: ["delete"] }) ||
            (workflow.createdBy === user?.id && workflow.status === "draft")
          }
        >
          <button className="btn btn-danger">🗑️ Eliminar Workflow</button>
        </CustomProtected>
      </footer>
    </div>
  );
};

const WorkflowStep = ({ step, permissions, onEdit, onApprove }) => {
  return (
    <div className={`workflow-step ${step.status}`}>
      <div className="step-header">
        <h3>{step.name}</h3>
        <span className={`status-badge ${step.status}`}>{step.status}</span>
      </div>

      <div className="step-content">
        {/* 📝 Contenido del paso */}
        <div className="step-description">{step.description}</div>

        {/* 👥 Usuarios asignados */}
        {permissions.canView && (
          <div className="step-assignees">
            <h4>👥 Asignado a:</h4>
            {step.assignedTo.map((userId) => (
              <UserBadge key={userId} userId={userId} />
            ))}
          </div>
        )}

        {/* 🔍 Información de permisos */}
        {permissions.isAssigned && (
          <div className="assignment-indicator">
            ⭐ Estás asignado a este paso
          </div>
        )}
      </div>

      <div className="step-actions">
        {/* ✏️ Editar */}
        {onEdit && (
          <button
            onClick={() => onEdit(step)}
            className="btn btn-sm btn-primary"
          >
            ✏️ Editar
          </button>
        )}

        {/* ✅ Aprobar */}
        {onApprove && step.status === "in_progress" && (
          <button
            onClick={() => onApprove(step)}
            className="btn btn-sm btn-success"
          >
            ✅ Aprobar
          </button>
        )}

        {/* 📊 Ver detalles */}
        {permissions.canView && (
          <button className="btn btn-sm btn-secondary">👁️ Ver Detalles</button>
        )}
      </div>
    </div>
  );
};
```

---

## 🧪 **TESTING DE PERMISOS**

### **🔬 Ejemplo 9: Testing Completo del Sistema de Permisos**

```typescript
// __tests__/permissions/usePermissions.test.tsx
import { renderHook } from "@testing-library/react";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { AuthProvider } from "@/shared/contexts/AuthContext";

// 🏗️ Mock del usuario para tests
const createMockUser = (role: string, permissions: string[] = []) => ({
  id: "test-user-123",
  email: "test@example.com",
  name: "Test User",
  role,
  permissions,
});

// 🎯 Wrapper para tests con contexto
const createWrapper =
  (user: any) =>
  ({ children }: { children: React.ReactNode }) =>
    <AuthProvider value={{ user, isLoading: false }}>{children}</AuthProvider>;

describe("usePermissions", () => {
  describe("Role-based permissions", () => {
    it("should grant super_admin full access", () => {
      const user = createMockUser("super_admin");
      const wrapper = createWrapper(user);

      const { result } = renderHook(() => usePermissions(), {
        wrapper,
      });

      // ✅ Super admin puede hacer todo
      expect(result.current.canAccess({ user: ["create", "delete"] })).toBe(
        true
      );
      expect(result.current.canAccess({ files: ["upload", "delete"] })).toBe(
        true
      );
      expect(result.current.isSuperAdmin()).toBe(true);
      expect(result.current.isAdmin()).toBe(true);
    });

    it("should grant admin limited access", () => {
      const user = createMockUser("admin");
      const wrapper = createWrapper(user);

      const { result } = renderHook(() => usePermissions(), {
        wrapper,
      });

      // ✅ Admin puede gestionar usuarios pero no impersonar
      expect(
        result.current.canAccess({ user: ["create", "update", "delete"] })
      ).toBe(true);
      expect(result.current.canAccess({ user: ["impersonate"] })).toBe(false);
      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.isSuperAdmin()).toBe(false);
    });

    it("should restrict user access", () => {
      const user = createMockUser("user");
      const wrapper = createWrapper(user);

      const { result } = renderHook(() => usePermissions(), {
        wrapper,
      });

      // ❌ Usuario normal no puede gestionar otros usuarios
      expect(result.current.canAccess({ user: ["create", "delete"] })).toBe(
        false
      );
      expect(result.current.canAccess({ files: ["upload"] })).toBe(false);
      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.isSuperAdmin()).toBe(false);
    });
  });

  describe("Permission management utilities", () => {
    it("should correctly identify manageable roles", () => {
      const superAdmin = createMockUser("super_admin");
      const wrapper = createWrapper(superAdmin);

      const { result } = renderHook(() => usePermissions(), {
        wrapper,
      });

      // 👑 Super admin puede gestionar todos los roles
      expect(result.current.canManageUserRole("admin")).toBe(true);
      expect(result.current.canManageUserRole("user")).toBe(true);
      expect(result.current.getManageableRoles()).toContain("admin");
      expect(result.current.getManageableRoles()).toContain("user");
    });

    it("should restrict role management for admin", () => {
      const admin = createMockUser("admin");
      const wrapper = createWrapper(admin);

      const { result } = renderHook(() => usePermissions(), {
        wrapper,
      });

      // 🛡️ Admin puede gestionar users pero no super_admin
      expect(result.current.canManageUserRole("user")).toBe(true);
      expect(result.current.canManageUserRole("super_admin")).toBe(false);
      expect(result.current.getManageableRoles()).toContain("user");
      expect(result.current.getManageableRoles()).not.toContain("super_admin");
    });
  });

  describe("Common permission checks", () => {
    it("should provide correct user management permissions", () => {
      const admin = createMockUser("admin");
      const wrapper = createWrapper(admin);

      const { result } = renderHook(() => usePermissions(), {
        wrapper,
      });

      // 👥 Verificar permisos de gestión de usuarios
      expect(result.current.canCreateUsers()).toBe(true);
      expect(result.current.canEditUsers()).toBe(true);
      expect(result.current.canDeleteUsers()).toBe(true);
      expect(result.current.canBanUsers()).toBe(true);
      expect(result.current.canSetUserRoles()).toBe(true);
      expect(result.current.canImpersonateUsers()).toBe(false); // Solo super_admin
    });

    it("should provide correct file management permissions", () => {
      const admin = createMockUser("admin");
      const wrapper = createWrapper(admin);

      const { result } = renderHook(() => usePermissions(), {
        wrapper,
      });

      // 📁 Verificar permisos de archivos
      expect(result.current.canViewFiles()).toBe(true);
      expect(result.current.canUploadFiles()).toBe(true);
      expect(result.current.canDeleteFiles()).toBe(false); // Solo super_admin
    });
  });

  describe("Permission caching", () => {
    it("should cache permission results", () => {
      const user = createMockUser("admin");
      const wrapper = createWrapper(user);

      const { result } = renderHook(
        () => usePermissions({ cacheEnabled: true }),
        { wrapper }
      );

      // 🎯 Primera verificación
      const start = performance.now();
      result.current.canAccess({ user: ["create"] });
      const firstCheck = performance.now() - start;

      // 🎯 Segunda verificación (debería usar cache)
      const start2 = performance.now();
      result.current.canAccess({ user: ["create"] });
      const secondCheck = performance.now() - start2;

      // ⚡ La segunda verificación debería ser más rápida
      expect(secondCheck).toBeLessThan(firstCheck);
    });

    it("should clear cache when user changes", () => {
      const admin = createMockUser("admin");
      const wrapper = createWrapper(admin);

      const { result, rerender } = renderHook(
        () => usePermissions({ cacheEnabled: true }),
        { wrapper }
      );

      // 📊 Verificar cache inicial
      result.current.canAccess({ user: ["create"] });
      const initialStats = result.current.getPermissionStats();

      // 🔄 Cambiar usuario
      const superAdmin = createMockUser("super_admin");
      const newWrapper = createWrapper(superAdmin);
      rerender();

      // ✅ Cache debería estar limpio para nuevo usuario
      const newStats = result.current.getPermissionStats();
      expect(newStats.cacheSize).toBeLessThanOrEqual(initialStats.cacheSize);
    });
  });
});

// 🧪 Tests para componentes Protected
describe("Protected Components", () => {
  it("should render children when user has permission", () => {
    const user = createMockUser("admin");
    const wrapper = createWrapper(user);

    const { getByText } = render(
      <Protected permissions={{ user: ["create"] }}>
        <div>Protected Content</div>
      </Protected>,
      { wrapper }
    );

    expect(getByText("Protected Content")).toBeInTheDocument();
  });

  it("should render fallback when user lacks permission", () => {
    const user = createMockUser("user");
    const wrapper = createWrapper(user);

    const { getByText } = render(
      <Protected
        permissions={{ user: ["create"] }}
        fallback={<div>Access Denied</div>}
        showFallback={true}
      >
        <div>Protected Content</div>
      </Protected>,
      { wrapper }
    );

    expect(getByText("Access Denied")).toBeInTheDocument();
    expect(() => getByText("Protected Content")).toThrow();
  });

  it("should hide content when showFallback is false", () => {
    const user = createMockUser("user");
    const wrapper = createWrapper(user);

    const { container } = render(
      <Protected
        permissions={{ user: ["create"] }}
        fallback={<div>Access Denied</div>}
        showFallback={false}
      >
        <div>Protected Content</div>
      </Protected>,
      { wrapper }
    );

    expect(container.firstChild).toBeNull();
  });
});

// 🧪 Tests de integración completos
describe("Permission Integration Tests", () => {
  it("should handle complex permission workflows", async () => {
    const admin = createMockUser("admin");
    const wrapper = createWrapper(admin);

    const { result } = renderHook(
      () => {
        const permissions = usePermissions();
        const userMgmt = useUserManagement();
        const fileMgmt = useFileManagement();

        return { permissions, userMgmt, fileMgmt };
      },
      { wrapper }
    );

    // 🎯 Workflow de creación de usuario con archivo
    expect(result.current.userMgmt.canCreateUsers()).toBe(true);
    expect(result.current.fileMgmt.canUploadFiles()).toBe(true);

    // ✅ Debería poder realizar el workflow completo
    const canCompleteWorkflow =
      result.current.userMgmt.canCreateUsers() &&
      result.current.fileMgmt.canUploadFiles();

    expect(canCompleteWorkflow).toBe(true);
  });
});
```

---

## 🎯 **RESUMEN Y MEJORES PRÁCTICAS**

### **✅ Patrones Recomendados**

1. **🛡️ Usar componentes declarativos**

   ```typescript
   <Protected permissions={{ user: ["create"] }}>
     <CreateUserForm />
   </Protected>
   ```

2. **🔍 Verificar permisos en hooks específicos**

   ```typescript
   const { canCreateUsers, canDeleteUsers } = useUserManagement();
   ```

3. **🎯 Combinar verificaciones para workflows complejos**

   ```typescript
   const canCompleteAction = canAccess({
     user: ["update"],
     files: ["upload"],
   });
   ```

4. **📊 Usar validadores para múltiples permisos**
   ```typescript
   const { canProceed } = usePermissionValidator([...]);
   ```

### **🚀 Beneficios de Este Sistema**

- **🔐 Seguridad robusta** - Verificación en cliente y servidor
- **🎯 Granularidad** - Control preciso sobre cada acción
- **📊 Escalabilidad** - Fácil añadir nuevos permisos y roles
- **🧪 Testeable** - Hooks y componentes fáciles de probar
- **🛠️ Mantenible** - Código declarativo y reutilizable

Con estos ejemplos tienes todo lo necesario para implementar un sistema de permisos profesional y fácil de usar! 🎉
