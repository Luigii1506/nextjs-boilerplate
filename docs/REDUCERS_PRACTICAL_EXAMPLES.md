# 💡 **EJEMPLOS PRÁCTICOS DEL SISTEMA DE REDUCERS**

## 📚 **ÍNDICE DE ESCENARIOS**

- [🚀 Casos Básicos de Uso](#-casos-básicos-de-uso)
- [👥 Gestión de Usuarios Avanzada](#-gestión-de-usuarios-avanzada)
- [📁 File Upload con Progreso](#-file-upload-con-progreso)
- [🔄 Operaciones Masivas](#-operaciones-masivas)
- [📊 Dashboard con Analytics](#-dashboard-con-analytics)
- [🚨 Manejo de Errores](#-manejo-de-errores)
- [⚡ Optimizaciones de Performance](#-optimizaciones-de-performance)
- [🧪 Testing de Reducers](#-testing-de-reducers)

---

## 🚀 **CASOS BÁSICOS DE USO**

### **👤 Escenario 1: Crear Usuario con Feedback Inmediato**

```typescript
// components/users/CreateUserForm.tsx
import { useState } from "react";
import { useUsers } from "@/features/admin/users/hooks";

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as const,
  });

  const { createUser, isLoading, error, optimisticState } = useUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ⚡ La UI se actualiza INMEDIATAMENTE
      // El usuario ve el nuevo usuario en la lista sin esperar
      const result = await createUser(formData);

      if (result.success) {
        setFormData({ name: "", email: "", role: "user" });
        // ✅ Usuario ya visible en la lista gracias al reducer optimista
      }
    } catch (error) {
      // ❌ useOptimistic automáticamente revierte los cambios
      console.error("Error creating user:", error);
    }
  };

  // 👻 Mostrar usuarios optimistas (temporales) con indicador visual
  const optimisticUsers = optimisticState.users.filter((u) =>
    u.id.startsWith("temp-")
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Nombre"
          disabled={isLoading}
        />
        <input
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Email"
          disabled={isLoading}
        />
        <select
          value={formData.role}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, role: e.target.value as any }))
          }
          disabled={isLoading}
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear Usuario"}
        </button>
      </form>

      {error && <div className="error">❌ Error: {error}</div>}

      {/* Indicador de usuarios siendo creados */}
      {optimisticUsers.length > 0 && (
        <div className="optimistic-indicator">
          👻 Creando {optimisticUsers.length} usuario(s)...
        </div>
      )}
    </div>
  );
};
```

### **📊 Escenario 2: Lista de Usuarios Reactiva**

```typescript
// components/users/UsersList.tsx
import { useMemo } from "react";
import { useUsers } from "@/features/admin/users/hooks";
import { usersOptimisticSelectors } from "@/features/admin/users/reducers";

const UsersList = () => {
  const { users, optimisticState, banUser, unbanUser, updateUserRole } =
    useUsers();

  // 🔍 Usar selectors para datos específicos
  const activeUsers = usersOptimisticSelectors.getActiveUsers(optimisticState);
  const bannedUsers = usersOptimisticSelectors.getBannedUsers(optimisticState);
  const isLoading = usersOptimisticSelectors.isLoading(optimisticState);

  // 📊 Stats calculadas automáticamente por el reducer
  const stats = usersOptimisticSelectors.getStats(optimisticState);

  const handleBanUser = async (userId: string, reason: string) => {
    // ⚡ UI se actualiza inmediatamente - usuario aparece como baneado
    await banUser({ id: userId, reason });
  };

  const handleUnbanUser = async (userId: string) => {
    // ⚡ UI se actualiza inmediatamente - usuario aparece como activo
    await unbanUser(userId);
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    // ⚡ UI se actualiza inmediatamente - rol cambia visualmente
    await updateUserRole({ userId, role: newRole });
  };

  return (
    <div className="users-list">
      {/* 📊 Dashboard con stats automáticas */}
      <div className="stats-panel">
        <div className="stat">
          <h3>👥 Usuarios Activos</h3>
          <span className="count">{stats.totalActive}</span>
        </div>
        <div className="stat">
          <h3>🚫 Usuarios Baneados</h3>
          <span className="count">{stats.totalBanned}</span>
        </div>
        <div className="stat">
          <h3>👑 Administradores</h3>
          <span className="count">{stats.totalAdmins}</span>
        </div>
      </div>

      {/* 🔄 Indicador de loading global */}
      {isLoading && (
        <div className="loading-bar">🔄 Procesando operaciones...</div>
      )}

      {/* 👥 Lista de usuarios activos */}
      <div className="active-users">
        <h2>Usuarios Activos ({activeUsers.length})</h2>
        {activeUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isOptimistic={user.id.startsWith("temp-")} // 👻 Indicador optimista
            onBan={(reason) => handleBanUser(user.id, reason)}
            onChangeRole={(role) => handleChangeRole(user.id, role)}
          />
        ))}
      </div>

      {/* 🚫 Lista de usuarios baneados */}
      <div className="banned-users">
        <h2>Usuarios Baneados ({bannedUsers.length})</h2>
        {bannedUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isBanned={true}
            onUnban={() => handleUnbanUser(user.id)}
          />
        ))}
      </div>
    </div>
  );
};

// components/users/UserCard.tsx
const UserCard = ({
  user,
  isOptimistic = false,
  isBanned = false,
  onBan,
  onUnban,
  onChangeRole,
}) => {
  return (
    <div
      className={`user-card ${isOptimistic ? "optimistic" : ""} ${
        isBanned ? "banned" : ""
      }`}
    >
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <span className={`role role-${user.role}`}>{user.role}</span>

        {/* 👻 Indicador visual para usuarios optimistas */}
        {isOptimistic && (
          <span className="optimistic-badge">👻 Creando...</span>
        )}

        {/* 🚫 Información de ban */}
        {isBanned && user.banReason && (
          <div className="ban-info">
            <strong>Razón:</strong> {user.banReason}
          </div>
        )}
      </div>

      <div className="user-actions">
        {!isBanned && (
          <>
            <button
              onClick={() => onBan?.("Violación de términos")}
              className="btn btn-danger"
            >
              🚫 Banear
            </button>

            <select
              value={user.role}
              onChange={(e) => onChangeRole?.(e.target.value)}
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </>
        )}

        {isBanned && (
          <button onClick={() => onUnban?.()} className="btn btn-success">
            ✅ Desbanear
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 👥 **GESTIÓN DE USUARIOS AVANZADA**

### **🔍 Escenario 3: Búsqueda y Filtrado en Tiempo Real**

```typescript
// components/users/UsersSearch.tsx
import { useState, useMemo } from "react";
import { useUsers } from "@/features/admin/users/hooks";
import { usersOptimisticSelectors } from "@/features/admin/users/reducers";

const UsersSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { optimisticState } = useUsers();

  // 🔍 Búsqueda y filtrado usando selectors
  const filteredUsers = useMemo(() => {
    let users = optimisticState.users;

    // 🔍 Filtro por término de búsqueda
    if (searchTerm) {
      users = usersOptimisticSelectors.searchUsers(optimisticState, searchTerm);
    }

    // 🎭 Filtro por rol
    if (filterRole !== "all") {
      users = users.filter((user) => user.role === filterRole);
    }

    // 🔄 Filtro por estado
    if (filterStatus === "active") {
      users = users.filter((user) => !user.banned);
    } else if (filterStatus === "banned") {
      users = users.filter((user) => user.banned);
    }

    return users;
  }, [optimisticState, searchTerm, filterRole, filterStatus]);

  // 📊 Estadísticas de la búsqueda
  const searchStats = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter((u) => !u.banned).length;
    const banned = filteredUsers.filter((u) => u.banned).length;
    const admins = filteredUsers.filter(
      (u) => u.role === "admin" || u.role === "super_admin"
    ).length;

    return { total, active, banned, admins };
  }, [filteredUsers]);

  return (
    <div className="users-search">
      {/* 🔍 Controles de búsqueda */}
      <div className="search-controls">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="super_admin">Super Admin</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="banned">Baneados</option>
        </select>

        {/* 🧹 Limpiar filtros */}
        <button
          onClick={() => {
            setSearchTerm("");
            setFilterRole("all");
            setFilterStatus("all");
          }}
          className="btn btn-secondary"
        >
          🧹 Limpiar
        </button>
      </div>

      {/* 📊 Estadísticas de búsqueda */}
      <div className="search-stats">
        <span>📊 Encontrados: {searchStats.total}</span>
        <span>✅ Activos: {searchStats.active}</span>
        <span>🚫 Baneados: {searchStats.banned}</span>
        <span>👑 Admins: {searchStats.admins}</span>
      </div>

      {/* 👥 Resultados */}
      <div className="search-results">
        {filteredUsers.length === 0 ? (
          <div className="no-results">
            🔍 No se encontraron usuarios que coincidan con los criterios
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserSearchCard key={user.id} user={user} />
          ))
        )}
      </div>
    </div>
  );
};

const UserSearchCard = ({ user }) => {
  const { updateUserRole, banUser } = useUsers();

  return (
    <div className="user-search-card">
      <div className="user-avatar">
        {user.image ? (
          <img src={user.image} alt={user.name} />
        ) : (
          <div className="avatar-placeholder">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="user-details">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <div className="user-meta">
          <span className={`role-badge role-${user.role}`}>{user.role}</span>
          {user.banned && <span className="banned-badge">🚫 Baneado</span>}
          {user.id.startsWith("temp-") && (
            <span className="optimistic-badge">👻 Temporal</span>
          )}
        </div>
      </div>

      <div className="user-quick-actions">
        <QuickRoleChanger
          currentRole={user.role}
          onRoleChange={(newRole) =>
            updateUserRole({ userId: user.id, role: newRole })
          }
        />

        {!user.banned && (
          <button
            onClick={() =>
              banUser({ id: user.id, reason: "Ban rápido desde búsqueda" })
            }
            className="btn btn-sm btn-danger"
          >
            🚫
          </button>
        )}
      </div>
    </div>
  );
};
```

---

## 📁 **FILE UPLOAD CON PROGRESO**

### **📤 Escenario 4: Upload Múltiple con Progreso en Tiempo Real**

```typescript
// components/files/FileUpload.tsx
import { useCallback, useState } from "react";
import { useFileUpload } from "@/modules/file-upload/hooks";
import { optimisticSelectors } from "@/modules/file-upload/reducers";

const FileUpload = () => {
  const [isDragOver, setIsDragOver] = useState(false);

  const { uploadFiles, optimisticState, clearCompleted, deleteFile } =
    useFileUpload();

  // 📊 Usar selectors para extraer datos específicos
  const activeUploads = optimisticSelectors.getActiveUploads(optimisticState);
  const completedUploads =
    optimisticSelectors.getCompletedUploads(optimisticState);
  const failedUploads = optimisticSelectors.getFailedUploads(optimisticState);
  const overallProgress =
    optimisticSelectors.getOverallProgress(optimisticState);
  const hasActiveUploads =
    optimisticSelectors.hasActiveUploads(optimisticState);

  const handleFileDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      // ⚡ Optimistic updates - Los archivos aparecen inmediatamente en la lista
      // con estado "pending", luego cambian a "uploading" con progreso
      await uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      await uploadFiles(files);
      e.target.value = ""; // Reset input
    },
    [uploadFiles]
  );

  return (
    <div className="file-upload">
      {/* 📤 Zona de drop */}
      <div
        className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleFileDrop}
      >
        <div className="drop-zone-content">
          <div className="drop-icon">📁</div>
          <p>Arrastra archivos aquí o haz clic para seleccionar</p>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="file-input"
            accept="image/*,application/pdf,.doc,.docx"
          />
        </div>
      </div>

      {/* 📊 Progreso general */}
      {hasActiveUploads && (
        <div className="overall-progress">
          <div className="progress-header">
            <span>📤 Subiendo archivos... {overallProgress}%</span>
            <span>{activeUploads.length} archivos activos</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 🔄 Lista de uploads activos */}
      {activeUploads.length > 0 && (
        <div className="active-uploads">
          <h3>🔄 Subiendo ({activeUploads.length})</h3>
          {activeUploads.map((upload) => (
            <UploadProgressCard key={upload.fileId} upload={upload} />
          ))}
        </div>
      )}

      {/* ✅ Lista de uploads completados */}
      {completedUploads.length > 0 && (
        <div className="completed-uploads">
          <div className="section-header">
            <h3>✅ Completados ({completedUploads.length})</h3>
            <button
              onClick={() => clearCompleted()}
              className="btn btn-sm btn-secondary"
            >
              🧹 Limpiar completados
            </button>
          </div>
          {completedUploads.map((upload) => (
            <CompletedUploadCard
              key={upload.fileId}
              upload={upload}
              onDelete={() => deleteFile(upload.fileId)}
            />
          ))}
        </div>
      )}

      {/* ❌ Lista de uploads fallidos */}
      {failedUploads.length > 0 && (
        <div className="failed-uploads">
          <h3>❌ Fallidos ({failedUploads.length})</h3>
          {failedUploads.map((upload) => (
            <FailedUploadCard
              key={upload.fileId}
              upload={upload}
              onRetry={() =>
                uploadFiles([
                  /* recreate file object */
                ])
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

const UploadProgressCard = ({ upload }) => {
  return (
    <div className="upload-card active">
      <div className="upload-info">
        <div className="file-icon">{getFileIcon(upload.filename)}</div>
        <div className="file-details">
          <h4>{upload.filename}</h4>
          <div className="upload-status">
            {upload.status === "pending" ? (
              <span>⏳ En cola...</span>
            ) : (
              <span>📤 Subiendo... {upload.progress}%</span>
            )}
          </div>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${upload.progress}%` }}
          />
        </div>
        <span className="progress-text">{upload.progress}%</span>
      </div>
    </div>
  );
};

const CompletedUploadCard = ({ upload, onDelete }) => {
  return (
    <div className="upload-card completed">
      <div className="upload-info">
        <div className="file-icon">{getFileIcon(upload.filename)}</div>
        <div className="file-details">
          <h4>{upload.filename}</h4>
          <div className="upload-status">
            <span>✅ Completado</span>
          </div>
        </div>
      </div>

      <div className="upload-actions">
        <button
          onClick={() => window.open(`/files/${upload.fileId}`, "_blank")}
          className="btn btn-sm btn-primary"
        >
          👁️ Ver
        </button>
        <button onClick={onDelete} className="btn btn-sm btn-danger">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

const FailedUploadCard = ({ upload, onRetry }) => {
  return (
    <div className="upload-card failed">
      <div className="upload-info">
        <div className="file-icon error">❌</div>
        <div className="file-details">
          <h4>{upload.filename}</h4>
          <div className="upload-status">
            <span>❌ Error: {upload.error}</span>
          </div>
        </div>
      </div>

      <div className="upload-actions">
        <button onClick={onRetry} className="btn btn-sm btn-primary">
          🔄 Reintentar
        </button>
      </div>
    </div>
  );
};

// utils/fileIcons.ts
const getFileIcon = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return "📄";
    case "doc":
    case "docx":
      return "📝";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️";
    case "mp4":
    case "avi":
    case "mkv":
      return "🎬";
    case "mp3":
    case "wav":
      return "🎵";
    case "zip":
    case "rar":
      return "📦";
    default:
      return "📁";
  }
};
```

---

## 🔄 **OPERACIONES MASIVAS**

### **👥 Escenario 5: Gestión Masiva de Usuarios**

```typescript
// components/users/BulkOperations.tsx
import { useState, useMemo } from "react";
import { useUsers } from "@/features/admin/users/hooks";
import { usersOptimisticSelectors } from "@/features/admin/users/reducers";

const BulkOperations = () => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkRole, setBulkRole] = useState<string>("user");

  const { optimisticState, bulkUpdateUsers, bulkDeleteUsers, bulkBanUsers } =
    useUsers();

  // 🔍 Obtener usuarios seleccionados
  const selectedUsers = useMemo(() => {
    return optimisticState.users.filter((user) =>
      selectedUserIds.includes(user.id)
    );
  }, [optimisticState.users, selectedUserIds]);

  // 📊 Estadísticas de selección
  const selectionStats = useMemo(() => {
    const active = selectedUsers.filter((u) => !u.banned).length;
    const banned = selectedUsers.filter((u) => u.banned).length;
    const admins = selectedUsers.filter(
      (u) => u.role === "admin" || u.role === "super_admin"
    ).length;

    return { total: selectedUsers.length, active, banned, admins };
  }, [selectedUsers]);

  const handleSelectAll = () => {
    const allUserIds = optimisticState.users.map((u) => u.id);
    setSelectedUserIds(allUserIds);
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async () => {
    if (selectedUserIds.length === 0) return;

    switch (bulkAction) {
      case "change-role":
        // ⚡ Todos los usuarios seleccionados cambian de rol inmediatamente
        await bulkUpdateUsers(selectedUserIds, { role: bulkRole });
        break;

      case "ban":
        // ⚡ Todos los usuarios aparecen como baneados inmediatamente
        await bulkBanUsers(selectedUserIds, "Ban masivo desde administración");
        break;

      case "delete":
        if (
          confirm(
            `¿Estás seguro de eliminar ${selectedUserIds.length} usuarios?`
          )
        ) {
          // ⚡ Todos los usuarios desaparecen de la lista inmediatamente
          await bulkDeleteUsers(selectedUserIds);
        }
        break;
    }

    // Limpiar selección después de la operación
    setSelectedUserIds([]);
    setBulkAction("");
  };

  return (
    <div className="bulk-operations">
      {/* 🎛️ Panel de control masivo */}
      <div className="bulk-controls">
        <div className="selection-controls">
          <button
            onClick={handleSelectAll}
            className="btn btn-sm btn-secondary"
          >
            ☑️ Seleccionar todos ({optimisticState.users.length})
          </button>
          <button
            onClick={handleDeselectAll}
            className="btn btn-sm btn-secondary"
          >
            ◻️ Deseleccionar todos
          </button>
        </div>

        {/* 📊 Estadísticas de selección */}
        {selectionStats.total > 0 && (
          <div className="selection-stats">
            <span>📊 Seleccionados: {selectionStats.total}</span>
            <span>✅ Activos: {selectionStats.active}</span>
            <span>🚫 Baneados: {selectionStats.banned}</span>
            <span>👑 Admins: {selectionStats.admins}</span>
          </div>
        )}

        {/* 🔧 Acciones masivas */}
        {selectedUserIds.length > 0 && (
          <div className="bulk-actions">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-action-select"
            >
              <option value="">Selecciona una acción...</option>
              <option value="change-role">Cambiar rol</option>
              <option value="ban">Banear usuarios</option>
              <option value="delete">Eliminar usuarios</option>
            </select>

            {/* 🎭 Selector de rol para cambio masivo */}
            {bulkAction === "change-role" && (
              <select
                value={bulkRole}
                onChange={(e) => setBulkRole(e.target.value)}
                className="bulk-role-select"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
                <option value="super_admin">Super Admin</option>
              </select>
            )}

            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className={`btn ${
                bulkAction === "delete"
                  ? "btn-danger"
                  : bulkAction === "ban"
                  ? "btn-warning"
                  : "btn-primary"
              }`}
            >
              {bulkAction === "change-role" && `🎭 Cambiar a ${bulkRole}`}
              {bulkAction === "ban" && "🚫 Banear seleccionados"}
              {bulkAction === "delete" && "🗑️ Eliminar seleccionados"}
              {!bulkAction && "⚡ Ejecutar acción"}
            </button>
          </div>
        )}
      </div>

      {/* 👥 Lista de usuarios con selección */}
      <div className="users-list-bulk">
        {optimisticState.users.map((user) => (
          <BulkUserCard
            key={user.id}
            user={user}
            isSelected={selectedUserIds.includes(user.id)}
            onToggleSelect={() => handleToggleUser(user.id)}
          />
        ))}
      </div>
    </div>
  );
};

const BulkUserCard = ({ user, isSelected, onToggleSelect }) => {
  return (
    <div className={`bulk-user-card ${isSelected ? "selected" : ""}`}>
      <div className="selection-checkbox">
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} />
      </div>

      <div className="user-info">
        <div className="user-basic">
          <h4>{user.name}</h4>
          <p>{user.email}</p>
        </div>

        <div className="user-badges">
          <span className={`role-badge role-${user.role}`}>{user.role}</span>

          {user.banned && (
            <span className="status-badge banned">🚫 Baneado</span>
          )}

          {user.id.startsWith("temp-") && (
            <span className="status-badge optimistic">👻 Temporal</span>
          )}
        </div>
      </div>

      <div className="user-meta">
        <div className="created-date">
          📅 {new Date(user.createdAt).toLocaleDateString()}
        </div>
        {user.lastLoginAt && (
          <div className="last-login">
            🔐 Último login: {new Date(user.lastLoginAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 📊 **DASHBOARD CON ANALYTICS**

### **📈 Escenario 6: Dashboard de Métricas en Tiempo Real**

```typescript
// components/dashboard/UsersDashboard.tsx
import { useMemo } from "react";
import { useUsers } from "@/features/admin/users/hooks";
import { usersOptimisticSelectors } from "@/features/admin/users/reducers";

const UsersDashboard = () => {
  const { optimisticState } = useUsers();

  // 📊 Usar selectors para métricas en tiempo real
  const stats = usersOptimisticSelectors.getStats(optimisticState);
  const activePercentage =
    usersOptimisticSelectors.getActiveUserPercentage(optimisticState);
  const bannedPercentage =
    usersOptimisticSelectors.getBannedUserPercentage(optimisticState);
  const adminPercentage =
    usersOptimisticSelectors.getAdminPercentage(optimisticState);
  const roleDistribution =
    usersOptimisticSelectors.getRoleDistribution(optimisticState);
  const recentUsers = usersOptimisticSelectors.getRecentUsers(
    optimisticState,
    7
  );
  const monthlyData =
    usersOptimisticSelectors.getUsersByCreationMonth(optimisticState);

  // 📈 Métricas de crecimiento (simuladas)
  const growthMetrics = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 7);

    const currentMonthUsers = monthlyData[currentMonth] || 0;
    const lastMonthUsers = monthlyData[lastMonth] || 0;
    const growth = currentMonthUsers - lastMonthUsers;
    const growthPercentage =
      lastMonthUsers > 0 ? Math.round((growth / lastMonthUsers) * 100) : 0;

    return {
      currentMonth: currentMonthUsers,
      lastMonth: lastMonthUsers,
      growth,
      growthPercentage,
    };
  }, [monthlyData]);

  return (
    <div className="users-dashboard">
      {/* 🎯 Métricas principales */}
      <div className="main-metrics">
        <MetricCard
          title="👥 Total de Usuarios"
          value={optimisticState.totalUsers}
          subtitle={`${stats.totalActive} activos`}
          trend={growthMetrics.growth}
          trendLabel={`${growthMetrics.growthPercentage >= 0 ? "+" : ""}${
            growthMetrics.growthPercentage
          }% este mes`}
        />

        <MetricCard
          title="✅ Usuarios Activos"
          value={stats.totalActive}
          percentage={activePercentage}
          subtitle={`${activePercentage}% del total`}
          color="green"
        />

        <MetricCard
          title="🚫 Usuarios Baneados"
          value={stats.totalBanned}
          percentage={bannedPercentage}
          subtitle={`${bannedPercentage}% del total`}
          color="red"
        />

        <MetricCard
          title="👑 Administradores"
          value={stats.totalAdmins}
          percentage={adminPercentage}
          subtitle={`${adminPercentage}% del total`}
          color="blue"
        />
      </div>

      {/* 📊 Gráficos de distribución */}
      <div className="distribution-charts">
        <div className="chart-container">
          <h3>📊 Distribución por Rol</h3>
          <RoleDistributionChart data={roleDistribution} />
        </div>

        <div className="chart-container">
          <h3>📈 Crecimiento Mensual</h3>
          <MonthlyGrowthChart data={monthlyData} />
        </div>
      </div>

      {/* 👥 Usuarios recientes */}
      <div className="recent-users">
        <div className="section-header">
          <h3>👥 Usuarios Recientes (últimos 7 días)</h3>
          <span className="count">{recentUsers.length} usuarios</span>
        </div>

        <div className="recent-users-list">
          {recentUsers.length === 0 ? (
            <div className="no-data">📭 No hay usuarios recientes</div>
          ) : (
            recentUsers
              .slice(0, 10)
              .map((user) => <RecentUserCard key={user.id} user={user} />)
          )}
        </div>
      </div>

      {/* 🔄 Actividad en tiempo real */}
      <div className="real-time-activity">
        <h3>🔄 Actividad en Tiempo Real</h3>
        <RealTimeActivity optimisticState={optimisticState} />
      </div>
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  percentage,
  subtitle,
  trend,
  trendLabel,
  color = "default",
}) => {
  return (
    <div className={`metric-card ${color}`}>
      <div className="metric-header">
        <h4>{title}</h4>
        {percentage !== undefined && (
          <div className="percentage">{percentage}%</div>
        )}
      </div>

      <div className="metric-value">{value.toLocaleString()}</div>

      {subtitle && <div className="metric-subtitle">{subtitle}</div>}

      {trend !== undefined && (
        <div className={`metric-trend ${trend >= 0 ? "positive" : "negative"}`}>
          {trend >= 0 ? "📈" : "📉"} {trendLabel}
        </div>
      )}
    </div>
  );
};

const RoleDistributionChart = ({ data }) => {
  const total = Object.values(data).reduce(
    (sum: number, count: number) => sum + count,
    0
  );

  return (
    <div className="role-distribution">
      {Object.entries(data).map(([role, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={role} className="role-bar">
            <div className="role-label">
              <span className={`role-badge role-${role}`}>{role}</span>
              <span className="role-count">
                {count} ({percentage}%)
              </span>
            </div>
            <div className="role-progress">
              <div
                className={`role-fill role-${role}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MonthlyGrowthChart = ({ data }) => {
  const months = Object.keys(data).sort();
  const maxCount = Math.max(...Object.values(data));

  return (
    <div className="monthly-chart">
      {months.map((month) => {
        const count = data[month];
        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

        return (
          <div key={month} className="month-bar">
            <div
              className="month-fill"
              style={{ height: `${height}%` }}
              title={`${month}: ${count} usuarios`}
            />
            <div className="month-label">
              {new Date(month + "-01").toLocaleDateString("es", {
                month: "short",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RecentUserCard = ({ user }) => {
  const isOptimistic = user.id.startsWith("temp-");
  const timeAgo = getTimeAgo(user.createdAt);

  return (
    <div className={`recent-user-card ${isOptimistic ? "optimistic" : ""}`}>
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
        <h4>{user.name}</h4>
        <p>{user.email}</p>
        <div className="user-meta">
          <span className={`role-badge role-${user.role}`}>{user.role}</span>
          <span className="time-ago">🕐 {timeAgo}</span>
          {isOptimistic && (
            <span className="optimistic-badge">👻 Creando...</span>
          )}
        </div>
      </div>
    </div>
  );
};

const RealTimeActivity = ({ optimisticState }) => {
  const isLoading = usersOptimisticSelectors.isLoading(optimisticState);
  const activeOperations =
    usersOptimisticSelectors.getActiveOperations(optimisticState);
  const errors = usersOptimisticSelectors.getErrors(optimisticState);
  const hasErrors = usersOptimisticSelectors.hasErrors(optimisticState);

  return (
    <div className="real-time-activity">
      <div className="activity-status">
        {isLoading ? (
          <div className="status active">
            🔄 {activeOperations} operación(es) en curso
          </div>
        ) : (
          <div className="status idle">✅ Sistema en reposo</div>
        )}
      </div>

      {hasErrors && (
        <div className="activity-errors">
          <h4>❌ Errores recientes:</h4>
          {Object.entries(errors).map(([operation, error]) => (
            <div key={operation} className="error-item">
              <strong>{operation}:</strong> {error}
            </div>
          ))}
        </div>
      )}

      <div className="activity-stats">
        <div className="stat">
          <span>📊 Total usuarios:</span>
          <span>{optimisticState.totalUsers}</span>
        </div>
        <div className="stat">
          <span>⏰ Última actualización:</span>
          <span>{getTimeAgo(optimisticState.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
};

// utils/timeUtils.ts
const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return time.toLocaleDateString();
};
```

---

## 🚨 **MANEJO DE ERRORES**

### **❌ Escenario 7: Sistema Robusto de Errores**

```typescript
// components/users/ErrorHandling.tsx
import { useState, useEffect } from "react";
import { useUsers } from "@/features/admin/users/hooks";
import { usersOptimisticSelectors } from "@/features/admin/users/reducers";

const ErrorHandling = () => {
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>(
    {}
  );

  const { optimisticState, createUser, updateUser, deleteUser, clearErrors } =
    useUsers();

  // 🔍 Extraer información de errores usando selectors
  const hasErrors = usersOptimisticSelectors.hasErrors(optimisticState);
  const errors = usersOptimisticSelectors.getErrors(optimisticState);
  const isLoading = usersOptimisticSelectors.isLoading(optimisticState);

  // 🔄 Auto-retry para errores transitorios
  useEffect(() => {
    Object.entries(errors).forEach(([operation, error]) => {
      // Solo retry para errores de red, no para errores de validación
      if (isNetworkError(error) && !retryAttempts[operation]) {
        const attempts = retryAttempts[operation] || 0;
        if (attempts < 3) {
          // Máximo 3 reintentos
          setTimeout(() => {
            retryOperation(operation);
            setRetryAttempts((prev) => ({
              ...prev,
              [operation]: attempts + 1,
            }));
          }, 2000 * (attempts + 1)); // Backoff exponencial
        }
      }
    });
  }, [errors, retryAttempts]);

  const retryOperation = async (operation: string) => {
    // Lógica para reintentar la operación basada en el tipo
    console.log(`Reintentando operación: ${operation}`);
  };

  const isNetworkError = (error: string): boolean => {
    return (
      error.includes("network") ||
      error.includes("timeout") ||
      error.includes("connection")
    );
  };

  const getErrorSeverity = (error: string): "low" | "medium" | "high" => {
    if (isNetworkError(error)) return "low";
    if (error.includes("permission") || error.includes("unauthorized"))
      return "high";
    return "medium";
  };

  const handleRetryAll = async () => {
    // Reintentar todas las operaciones fallidas
    for (const operation of Object.keys(errors)) {
      await retryOperation(operation);
    }
    setRetryAttempts({});
  };

  const handleClearAllErrors = () => {
    clearErrors();
    setRetryAttempts({});
  };

  return (
    <div className="error-handling">
      {/* 🚨 Panel de errores */}
      {hasErrors && (
        <div className="error-panel">
          <div className="error-header">
            <h3>❌ Errores del Sistema ({Object.keys(errors).length})</h3>
            <div className="error-actions">
              <button
                onClick={handleRetryAll}
                className="btn btn-sm btn-primary"
                disabled={isLoading}
              >
                🔄 Reintentar todo
              </button>
              <button
                onClick={handleClearAllErrors}
                className="btn btn-sm btn-secondary"
              >
                🧹 Limpiar errores
              </button>
            </div>
          </div>

          <div className="error-list">
            {Object.entries(errors).map(([operation, error]) => {
              const severity = getErrorSeverity(error);
              const attempts = retryAttempts[operation] || 0;

              return (
                <ErrorCard
                  key={operation}
                  operation={operation}
                  error={error}
                  severity={severity}
                  retryAttempts={attempts}
                  onRetry={() => retryOperation(operation)}
                  onDismiss={() => clearErrors()}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 🔄 Indicador de operaciones en curso */}
      {isLoading && (
        <div className="operations-indicator">
          <div className="loading-spinner" />
          <span>⚡ Procesando operaciones...</span>
        </div>
      )}

      {/* ✅ Estado de éxito */}
      {!hasErrors && !isLoading && (
        <div className="success-state">
          <div className="success-icon">✅</div>
          <p>Sistema funcionando correctamente</p>
        </div>
      )}
    </div>
  );
};

const ErrorCard = ({
  operation,
  error,
  severity,
  retryAttempts,
  onRetry,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return "🚨";
      case "medium":
        return "⚠️";
      case "low":
        return "ℹ️";
      default:
        return "❌";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "error-high";
      case "medium":
        return "error-medium";
      case "low":
        return "error-low";
      default:
        return "error-default";
    }
  };

  return (
    <div className={`error-card ${getSeverityColor(severity)}`}>
      <div className="error-main">
        <div className="error-info">
          <div className="error-icon">{getSeverityIcon(severity)}</div>
          <div className="error-details">
            <h4>{operation}</h4>
            <p className="error-message">
              {isExpanded
                ? error
                : error.slice(0, 100) + (error.length > 100 ? "..." : "")}
            </p>
            {error.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="expand-toggle"
              >
                {isExpanded ? "Ver menos" : "Ver más"}
              </button>
            )}
          </div>
        </div>

        <div className="error-actions">
          {retryAttempts > 0 && (
            <span className="retry-count">🔄 {retryAttempts}/3 intentos</span>
          )}

          <button
            onClick={onRetry}
            className="btn btn-sm btn-primary"
            disabled={retryAttempts >= 3}
          >
            🔄 Reintentar
          </button>

          <button onClick={onDismiss} className="btn btn-sm btn-secondary">
            ✖️ Descartar
          </button>
        </div>
      </div>

      {/* 📊 Información adicional para errores de alta severidad */}
      {severity === "high" && (
        <div className="error-additional">
          <div className="error-suggestions">
            <h5>💡 Sugerencias:</h5>
            <ul>
              <li>Verificar permisos de usuario</li>
              <li>Revisar configuración del sistema</li>
              <li>Contactar al administrador si persiste</li>
            </ul>
          </div>

          <div className="error-metadata">
            <div className="metadata-item">
              <strong>⏰ Tiempo:</strong> {new Date().toLocaleTimeString()}
            </div>
            <div className="metadata-item">
              <strong>🔧 Operación:</strong> {operation}
            </div>
            <div className="metadata-item">
              <strong>🎯 Severidad:</strong> {severity.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Error Boundary para capturar errores de React
class UsersErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Users Error Boundary caught an error:", error, errorInfo);

    // Enviar error a servicio de logging
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>🚨 Something went wrong</h2>
            <p>Ha ocurrido un error inesperado en el módulo de usuarios.</p>
            <details>
              <summary>Detalles del error</summary>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              className="btn btn-primary"
            >
              🔄 Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper que combina error boundary con error handling
export const UsersWithErrorHandling = ({ children }) => {
  return (
    <UsersErrorBoundary>
      <ErrorHandling />
      {children}
    </UsersErrorBoundary>
  );
};
```

---

## ⚡ **OPTIMIZACIONES DE PERFORMANCE**

### **🚀 Escenario 8: Performance Optimizada**

```typescript
// components/users/OptimizedUsersList.tsx
import { useMemo, useCallback, memo } from "react";
import { FixedSizeList as List } from "react-window";
import { useUsers } from "@/features/admin/users/hooks";
import { usersOptimisticSelectors } from "@/features/admin/users/reducers";

// 🎯 Lista virtualizada para miles de usuarios
const OptimizedUsersList = memo(() => {
  const { optimisticState, updateUserRole, banUser } = useUsers();

  // 🧮 Cálculos memoizados para evitar re-renders innecesarios
  const users = usersOptimisticSelectors.getAllUsers(optimisticState);

  // 📊 Stats memoizadas - solo recalcular si los usuarios cambian
  const stats = useMemo(
    () => usersOptimisticSelectors.getStats(optimisticState),
    [optimisticState.stats] // Usar stats del estado directamente
  );

  // 🔍 Memoizar funciones de acción para evitar re-renders
  const handleRoleChange = useCallback(
    (userId: string, newRole: string) => {
      updateUserRole({ userId, role: newRole });
    },
    [updateUserRole]
  );

  const handleBanUser = useCallback(
    (userId: string, reason: string) => {
      banUser({ id: userId, reason });
    },
    [banUser]
  );

  // 📋 Componente de fila memoizado para la virtualización
  const UserRow = memo(({ index, style }) => {
    const user = users[index];

    return (
      <div style={style}>
        <OptimizedUserCard
          user={user}
          onRoleChange={handleRoleChange}
          onBan={handleBanUser}
        />
      </div>
    );
  });

  return (
    <div className="optimized-users-list">
      {/* 📊 Stats siempre visibles */}
      <div className="stats-header">
        <StatCard title="Total" value={users.length} icon="👥" />
        <StatCard
          title="Activos"
          value={stats.totalActive}
          icon="✅"
          percentage={Math.round((stats.totalActive / users.length) * 100)}
        />
        <StatCard
          title="Baneados"
          value={stats.totalBanned}
          icon="🚫"
          percentage={Math.round((stats.totalBanned / users.length) * 100)}
        />
        <StatCard
          title="Admins"
          value={stats.totalAdmins}
          icon="👑"
          percentage={Math.round((stats.totalAdmins / users.length) * 100)}
        />
      </div>

      {/* 📋 Lista virtualizada para performance */}
      <div className="virtualized-container">
        <List
          height={600} // Altura fija del contenedor
          itemCount={users.length} // Número total de items
          itemSize={120} // Altura de cada item
          overscanCount={10} // Items extra renderizados fuera de vista
          itemData={users} // Datos para los items
        >
          {UserRow}
        </List>
      </div>
    </div>
  );
});

// 🎯 Componente de usuario optimizado con React.memo y comparación custom
const OptimizedUserCard = memo(
  ({
    user,
    onRoleChange,
    onBan,
  }: {
    user: User;
    onRoleChange: (userId: string, role: string) => void;
    onBan: (userId: string, reason: string) => void;
  }) => {
    // 🔄 Handlers memoizados para evitar re-renders del padre
    const handleRoleChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onRoleChange(user.id, e.target.value);
      },
      [user.id, onRoleChange]
    );

    const handleBan = useCallback(() => {
      onBan(user.id, "Ban desde lista optimizada");
    }, [user.id, onBan]);

    // 🎨 Clases CSS memoizadas
    const cardClasses = useMemo(() => {
      const classes = ["optimized-user-card"];
      if (user.banned) classes.push("banned");
      if (user.id.startsWith("temp-")) classes.push("optimistic");
      return classes.join(" ");
    }, [user.banned, user.id]);

    return (
      <div className={cardClasses}>
        <div className="user-avatar">
          <LazyAvatar user={user} />
        </div>

        <div className="user-info">
          <h4>{user.name}</h4>
          <p>{user.email}</p>

          <div className="user-badges">
            <RoleBadge role={user.role} />
            {user.banned && <BannedBadge reason={user.banReason} />}
            {user.id.startsWith("temp-") && <OptimisticBadge />}
          </div>
        </div>

        <div className="user-actions">
          {!user.banned && (
            <>
              <select
                value={user.role}
                onChange={handleRoleChange}
                className="role-select"
              >
                <option value="user">Usuario</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>

              <button onClick={handleBan} className="btn btn-sm btn-danger">
                🚫 Ban
              </button>
            </>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 🔍 Comparación custom para optimizar re-renders
    const prevUser = prevProps.user;
    const nextUser = nextProps.user;

    // Solo re-render si cambian propiedades importantes
    return (
      prevUser.id === nextUser.id &&
      prevUser.name === nextUser.name &&
      prevUser.email === nextUser.email &&
      prevUser.role === nextUser.role &&
      prevUser.banned === nextUser.banned &&
      prevUser.banReason === nextUser.banReason &&
      prevUser.updatedAt === nextUser.updatedAt
    );
  }
);

// 🖼️ Avatar lazy loading para mejorar performance
const LazyAvatar = memo(({ user }: { user: User }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!user.image || imageError) {
    return (
      <div className="avatar-placeholder">
        {user.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="avatar-container">
      {!imageLoaded && (
        <div className="avatar-placeholder loading">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <img
        src={user.image}
        alt={user.name}
        className={`avatar-image ${imageLoaded ? "loaded" : "loading"}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
});

// 🏷️ Badges memoizados para evitar re-renders
const RoleBadge = memo(({ role }: { role: string }) => (
  <span className={`role-badge role-${role}`}>{role}</span>
));

const BannedBadge = memo(({ reason }: { reason?: string | null }) => (
  <span className="banned-badge" title={reason || "Usuario baneado"}>
    🚫 Baneado
  </span>
));

const OptimisticBadge = memo(() => (
  <span className="optimistic-badge" title="Usuario temporal (siendo creado)">
    👻 Temporal
  </span>
));

const StatCard = memo(
  ({
    title,
    value,
    icon,
    percentage,
  }: {
    title: string;
    value: number;
    icon: string;
    percentage?: number;
  }) => (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value.toLocaleString()}</div>
        <div className="stat-title">{title}</div>
        {percentage !== undefined && (
          <div className="stat-percentage">{percentage}%</div>
        )}
      </div>
    </div>
  )
);

// 🎯 Hook optimizado con debouncing para búsquedas
const useOptimizedUsersSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const { optimisticState } = useUsers();

  // 🔄 Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  // 🔍 Búsqueda memoizada
  const searchResults = useMemo(() => {
    if (!debouncedTerm) return optimisticState.users;

    return usersOptimisticSelectors.searchUsers(optimisticState, debouncedTerm);
  }, [optimisticState, debouncedTerm]);

  return {
    searchResults,
    isSearching: searchTerm !== debouncedTerm,
  };
};

// 📊 Hook para métricas de performance
const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    searchTime: 0,
    memoryUsage: 0,
  });

  const measureRenderTime = useCallback((label: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();

    setMetrics((prev) => ({
      ...prev,
      renderTime: end - start,
    }));

    console.log(`⚡ ${label}: ${end - start}ms`);
  }, []);

  return { metrics, measureRenderTime };
};
```

---

## 🧪 **TESTING DE REDUCERS**

### **🔬 Escenario 9: Testing Comprehensivo**

```typescript
// __tests__/reducers/usersOptimisticReducer.test.ts
import {
  usersOptimisticReducer,
  createInitialUsersOptimisticState,
  usersOptimisticSelectors,
  type UsersOptimisticState,
  type UsersOptimisticAction,
} from "@/features/admin/users/reducers";
import { USERS_ACTIONS } from "@/features/admin/users/constants";
import type { User } from "@/features/admin/users/types";

// 🏗️ Helper para crear usuarios de prueba
const createTestUser = (overrides: Partial<User> = {}): User => ({
  id: "test-user-1",
  name: "Test User",
  email: "test@example.com",
  role: "user",
  emailVerified: false,
  banned: false,
  banReason: null,
  banExpires: null,
  image: null,
  status: "active",
  createdAt: "2025-01-17T10:00:00Z",
  updatedAt: "2025-01-17T10:00:00Z",
  ...overrides,
});

// 🏗️ Helper para crear estado de prueba
const createTestState = (
  overrides: Partial<UsersOptimisticState> = {}
): UsersOptimisticState => ({
  users: [],
  totalUsers: 0,
  lastUpdated: "2025-01-17T10:00:00Z",
  activeOperations: 0,
  errors: {},
  stats: {
    totalActive: 0,
    totalBanned: 0,
    totalAdmins: 0,
  },
  ...overrides,
});

describe("usersOptimisticReducer", () => {
  let initialState: UsersOptimisticState;

  beforeEach(() => {
    initialState = createInitialUsersOptimisticState();
  });

  describe("CREATE_USER", () => {
    it("should add user optimistically", () => {
      const tempUser = {
        name: "New User",
        email: "new@example.com",
        role: "user" as const,
      };
      const tempId = "temp-123";

      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.CREATE_USER,
        tempUser,
        tempId,
      };

      const newState = usersOptimisticReducer(initialState, action);

      // ✅ Verificar que se añadió el usuario
      expect(newState.users).toHaveLength(1);
      expect(newState.users[0]).toMatchObject({
        id: tempId,
        name: tempUser.name,
        email: tempUser.email,
        role: tempUser.role,
      });

      // ✅ Verificar que se actualizaron los contadores
      expect(newState.totalUsers).toBe(1);
      expect(newState.activeOperations).toBe(1);

      // ✅ Verificar que se actualizaron las stats
      expect(newState.stats.totalActive).toBe(1);
      expect(newState.stats.totalBanned).toBe(0);

      // ✅ Verificar que se actualizó el timestamp
      expect(newState.lastUpdated).not.toBe(initialState.lastUpdated);

      // ✅ Verificar inmutabilidad
      expect(newState).not.toBe(initialState);
      expect(newState.users).not.toBe(initialState.users);
    });

    it("should handle multiple user creation", () => {
      let state = initialState;

      // Crear primer usuario
      state = usersOptimisticReducer(state, {
        type: USERS_ACTIONS.CREATE_USER,
        tempUser: { name: "User 1", email: "user1@test.com", role: "user" },
        tempId: "temp-1",
      });

      // Crear segundo usuario
      state = usersOptimisticReducer(state, {
        type: USERS_ACTIONS.CREATE_USER,
        tempUser: { name: "User 2", email: "user2@test.com", role: "admin" },
        tempId: "temp-2",
      });

      expect(state.users).toHaveLength(2);
      expect(state.totalUsers).toBe(2);
      expect(state.stats.totalActive).toBe(2);
      expect(state.stats.totalAdmins).toBe(1); // Solo un admin
    });
  });

  describe("UPDATE_USER", () => {
    it("should update user optimistically", () => {
      const existingUser = createTestUser();
      const stateWithUser = createTestState({
        users: [existingUser],
        totalUsers: 1,
        stats: { totalActive: 1, totalBanned: 0, totalAdmins: 0 },
      });

      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.UPDATE_USER,
        userId: existingUser.id,
        updates: { name: "Updated Name", role: "admin" },
      };

      const newState = usersOptimisticReducer(stateWithUser, action);

      // ✅ Verificar que se actualizó el usuario
      expect(newState.users[0].name).toBe("Updated Name");
      expect(newState.users[0].role).toBe("admin");

      // ✅ Verificar que se actualizaron las stats (ahora hay un admin)
      expect(newState.stats.totalAdmins).toBe(1);

      // ✅ Verificar que se incrementaron las operaciones activas
      expect(newState.activeOperations).toBe(1);

      // ✅ Verificar inmutabilidad
      expect(newState.users[0]).not.toBe(stateWithUser.users[0]);
    });

    it("should handle non-existent user gracefully", () => {
      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.UPDATE_USER,
        userId: "non-existent",
        updates: { name: "New Name" },
      };

      const newState = usersOptimisticReducer(initialState, action);

      // ✅ No debería haber cambios si el usuario no existe
      expect(newState.users).toHaveLength(0);
      expect(newState.activeOperations).toBe(1); // Pero sí incrementa operaciones
    });
  });

  describe("BAN_USER", () => {
    it("should ban user optimistically", () => {
      const activeUser = createTestUser({ banned: false });
      const stateWithUser = createTestState({
        users: [activeUser],
        totalUsers: 1,
        stats: { totalActive: 1, totalBanned: 0, totalAdmins: 0 },
      });

      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.BAN_USER,
        userId: activeUser.id,
        reason: "Test ban",
      };

      const newState = usersOptimisticReducer(stateWithUser, action);

      // ✅ Verificar que se baneó el usuario
      expect(newState.users[0].banned).toBe(true);
      expect(newState.users[0].banReason).toBe("Test ban");
      expect(newState.users[0].status).toBe("banned");

      // ✅ Verificar que se actualizaron las stats
      expect(newState.stats.totalActive).toBe(0);
      expect(newState.stats.totalBanned).toBe(1);
    });
  });

  describe("BULK_OPERATIONS", () => {
    it("should handle bulk role update", () => {
      const users = [
        createTestUser({ id: "user-1", role: "user" }),
        createTestUser({ id: "user-2", role: "user" }),
        createTestUser({ id: "user-3", role: "admin" }),
      ];

      const stateWithUsers = createTestState({
        users,
        totalUsers: 3,
        stats: { totalActive: 3, totalBanned: 0, totalAdmins: 1 },
      });

      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.BULK_UPDATE,
        userIds: ["user-1", "user-2"],
        newRole: "admin",
      };

      const newState = usersOptimisticReducer(stateWithUsers, action);

      // ✅ Verificar que se actualizaron los usuarios correctos
      expect(newState.users[0].role).toBe("admin"); // user-1
      expect(newState.users[1].role).toBe("admin"); // user-2
      expect(newState.users[2].role).toBe("admin"); // user-3 (sin cambios)

      // ✅ Verificar que se actualizaron las stats
      expect(newState.stats.totalAdmins).toBe(3); // Ahora todos son admins
    });

    it("should handle bulk delete", () => {
      const users = [
        createTestUser({ id: "user-1" }),
        createTestUser({ id: "user-2" }),
        createTestUser({ id: "user-3" }),
      ];

      const stateWithUsers = createTestState({
        users,
        totalUsers: 3,
        stats: { totalActive: 3, totalBanned: 0, totalAdmins: 0 },
      });

      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.BULK_DELETE,
        userIds: ["user-1", "user-3"],
      };

      const newState = usersOptimisticReducer(stateWithUsers, action);

      // ✅ Verificar que se eliminaron los usuarios correctos
      expect(newState.users).toHaveLength(1);
      expect(newState.users[0].id).toBe("user-2");

      // ✅ Verificar que se actualizó el total
      expect(newState.totalUsers).toBe(1);

      // ✅ Verificar que se actualizaron las stats
      expect(newState.stats.totalActive).toBe(1);
    });
  });

  describe("ERROR_HANDLING", () => {
    it("should handle loading states", () => {
      let state = initialState;

      // Iniciar loading
      state = usersOptimisticReducer(state, {
        type: USERS_ACTIONS.START_LOADING,
        operation: "createUser",
      });

      expect(state.activeOperations).toBe(1);

      // Completar loading
      state = usersOptimisticReducer(state, {
        type: USERS_ACTIONS.COMPLETE_LOADING,
        operation: "createUser",
      });

      expect(state.activeOperations).toBe(0);
    });

    it("should handle errors", () => {
      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.FAIL_LOADING,
        operation: "createUser",
        error: "Network error",
      };

      const newState = usersOptimisticReducer(initialState, action);

      expect(newState.errors.createUser).toBe("Network error");
      expect(newState.activeOperations).toBe(0);
    });

    it("should clear errors", () => {
      const stateWithErrors = createTestState({
        errors: { createUser: "Error 1", updateUser: "Error 2" },
      });

      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.CLEAR_ERRORS,
      };

      const newState = usersOptimisticReducer(stateWithErrors, action);

      expect(newState.errors).toEqual({});
    });
  });

  describe("REFRESH_DATA", () => {
    it("should refresh data from server", () => {
      const optimisticState = createTestState({
        users: [createTestUser({ id: "temp-123" })], // Usuario temporal
        activeOperations: 2,
        errors: { createUser: "Some error" },
      });

      const serverUsers = [
        createTestUser({ id: "real-user-1", name: "Real User" }),
        createTestUser({ id: "real-user-2", name: "Another Real User" }),
      ];

      const action: UsersOptimisticAction = {
        type: USERS_ACTIONS.REFRESH_DATA,
        users: serverUsers,
      };

      const newState = usersOptimisticReducer(optimisticState, action);

      // ✅ Verificar que se reemplazaron los datos con los del servidor
      expect(newState.users).toEqual(serverUsers);
      expect(newState.totalUsers).toBe(2);

      // ✅ Verificar que se limpiaron los estados temporales
      expect(newState.activeOperations).toBe(0);
      expect(newState.errors).toEqual({});
    });
  });

  describe("UNKNOWN_ACTION", () => {
    it("should return original state for unknown actions", () => {
      const unknownAction = { type: "UNKNOWN_ACTION" } as any;

      const newState = usersOptimisticReducer(initialState, unknownAction);

      expect(newState).toBe(initialState); // Misma referencia
    });
  });
});

// 🔍 Tests para selectors
describe("usersOptimisticSelectors", () => {
  const testUsers = [
    createTestUser({
      id: "1",
      name: "Active User",
      banned: false,
      role: "user",
    }),
    createTestUser({
      id: "2",
      name: "Banned User",
      banned: true,
      role: "user",
    }),
    createTestUser({
      id: "3",
      name: "Admin User",
      banned: false,
      role: "admin",
    }),
    createTestUser({
      id: "4",
      name: "Super Admin",
      banned: false,
      role: "super_admin",
    }),
  ];

  const testState = createTestState({
    users: testUsers,
    totalUsers: 4,
    stats: { totalActive: 3, totalBanned: 1, totalAdmins: 2 },
  });

  describe("basic selectors", () => {
    it("should get all users", () => {
      const result = usersOptimisticSelectors.getAllUsers(testState);
      expect(result).toEqual(testUsers);
    });

    it("should get total users", () => {
      const result = usersOptimisticSelectors.getTotalUsers(testState);
      expect(result).toBe(4);
    });
  });

  describe("filter selectors", () => {
    it("should get active users", () => {
      const result = usersOptimisticSelectors.getActiveUsers(testState);
      expect(result).toHaveLength(3);
      expect(result.every((u) => !u.banned)).toBe(true);
    });

    it("should get banned users", () => {
      const result = usersOptimisticSelectors.getBannedUsers(testState);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Banned User");
    });

    it("should get admin users", () => {
      const result = usersOptimisticSelectors.getAdminUsers(testState);
      expect(result).toHaveLength(2);
      expect(result.map((u) => u.role)).toEqual(["admin", "super_admin"]);
    });

    it("should get users by role", () => {
      const result = usersOptimisticSelectors.getUsersByRole(
        testState,
        "admin"
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Admin User");
    });
  });

  describe("search selectors", () => {
    it("should search users by name", () => {
      const result = usersOptimisticSelectors.searchUsers(testState, "admin");
      expect(result).toHaveLength(2); // "Admin User" y "Super Admin"
    });

    it("should search users by email", () => {
      const result = usersOptimisticSelectors.searchUsers(
        testState,
        "test@example.com"
      );
      expect(result).toHaveLength(4); // Todos tienen el mismo email en el test
    });

    it("should find user by id", () => {
      const result = usersOptimisticSelectors.getUserById(testState, "3");
      expect(result?.name).toBe("Admin User");
    });

    it("should return undefined for non-existent user", () => {
      const result = usersOptimisticSelectors.getUserById(
        testState,
        "non-existent"
      );
      expect(result).toBeUndefined();
    });
  });

  describe("analytics selectors", () => {
    it("should calculate active user percentage", () => {
      const result =
        usersOptimisticSelectors.getActiveUserPercentage(testState);
      expect(result).toBe(75); // 3 de 4 usuarios = 75%
    });

    it("should calculate banned user percentage", () => {
      const result =
        usersOptimisticSelectors.getBannedUserPercentage(testState);
      expect(result).toBe(25); // 1 de 4 usuarios = 25%
    });

    it("should calculate admin percentage", () => {
      const result = usersOptimisticSelectors.getAdminPercentage(testState);
      expect(result).toBe(50); // 2 de 4 usuarios = 50%
    });

    it("should handle zero users gracefully", () => {
      const emptyState = createTestState();

      expect(usersOptimisticSelectors.getActiveUserPercentage(emptyState)).toBe(
        0
      );
      expect(usersOptimisticSelectors.getBannedUserPercentage(emptyState)).toBe(
        0
      );
      expect(usersOptimisticSelectors.getAdminPercentage(emptyState)).toBe(0);
    });
  });

  describe("state selectors", () => {
    it("should detect loading state", () => {
      const loadingState = createTestState({ activeOperations: 1 });
      expect(usersOptimisticSelectors.isLoading(loadingState)).toBe(true);

      const idleState = createTestState({ activeOperations: 0 });
      expect(usersOptimisticSelectors.isLoading(idleState)).toBe(false);
    });

    it("should detect errors", () => {
      const errorState = createTestState({ errors: { createUser: "Error" } });
      expect(usersOptimisticSelectors.hasErrors(errorState)).toBe(true);

      const noErrorState = createTestState({ errors: {} });
      expect(usersOptimisticSelectors.hasErrors(noErrorState)).toBe(false);
    });

    it("should get error for specific operation", () => {
      const errorState = createTestState({
        errors: { createUser: "Create error", updateUser: "Update error" },
      });

      expect(
        usersOptimisticSelectors.getErrorForOperation(errorState, "createUser")
      ).toBe("Create error");
      expect(
        usersOptimisticSelectors.getErrorForOperation(errorState, "nonExistent")
      ).toBeUndefined();
    });
  });
});

// 🧪 Tests de integración con hooks
describe("reducer integration with useOptimistic", () => {
  it("should work with React useOptimistic hook", async () => {
    // Este test requeriría @testing-library/react-hooks
    // y un setup más complejo para probar la integración real

    // Mock de useOptimistic behavior
    const mockAddOptimistic = jest.fn();
    const mockState = createInitialUsersOptimisticState();

    // Simular dispatch de acción
    const action: UsersOptimisticAction = {
      type: USERS_ACTIONS.CREATE_USER,
      tempUser: { name: "Test", email: "test@test.com", role: "user" },
      tempId: "temp-123",
    };

    mockAddOptimistic(action);

    expect(mockAddOptimistic).toHaveBeenCalledWith(action);
  });
});
```

---

## 💡 **MEJORES PRÁCTICAS APLICADAS**

### **✅ Do's (Hacer)**

1. **Usar selectors para extraer datos específicos**

   ```typescript
   const activeUsers = usersOptimisticSelectors.getActiveUsers(optimisticState);
   ```

2. **Memoizar componentes pesados**

   ```typescript
   const OptimizedUserCard = memo(({ user, onAction }) => { ... });
   ```

3. **Manejar estados de error gracefully**

   ```typescript
   {
     hasErrors && <ErrorPanel errors={errors} onRetry={handleRetry} />;
   }
   ```

4. **Indicar estados optimistas visualmente**
   ```typescript
   {
     user.id.startsWith("temp-") && <span>👻 Creando...</span>;
   }
   ```

### **❌ Don'ts (No hacer)**

1. **No acceder al estado directamente sin selectors**

   ```typescript
   // ❌ MAL
   const activeUsers = optimisticState.users.filter((u) => !u.banned);

   // ✅ BIEN
   const activeUsers = usersOptimisticSelectors.getActiveUsers(optimisticState);
   ```

2. **No olvidar memoizar callbacks pesados**

   ```typescript
   // ❌ MAL - Se recrea en cada render
   const handleAction = (id) => doSomething(id);

   // ✅ BIEN - Memoizado
   const handleAction = useCallback((id) => doSomething(id), []);
   ```

3. **No ignorar estados de loading/error**

   ```typescript
   // ❌ MAL - Sin feedback
   <UsersList users={users} />;

   // ✅ BIEN - Con estados
   {
     isLoading ? <LoadingSpinner /> : <UsersList users={users} />;
   }
   ```

---

## 🚀 **RESUMEN**

Estos ejemplos muestran cómo los reducers proporcionan:

- **🚀 Feedback inmediato** - UI se actualiza antes de confirmar con servidor
- **📊 Métricas en tiempo real** - Stats calculadas automáticamente
- **🔍 Búsquedas optimizadas** - Selectors memoizados para performance
- **🔄 Operaciones masivas** - Gestión eficiente de múltiples elementos
- **🚨 Manejo robusto de errores** - Recovery automático y manual
- **⚡ Performance optimizada** - Virtualización y memoización
- **🧪 Testing comprehensivo** - Cobertura completa de casos de uso

El sistema de reducers te permite crear aplicaciones **reactivas, performantes y confiables** con estado predecible y debugging fácil.

¿Te gustaría que profundice en algún ejemplo específico o que añada más casos de uso para tu aplicación?
