# ⚡ AUDIT TRAIL - REFERENCIA RÁPIDA

## 🚀 Inicio Rápido

### 1. **Habilitar el Módulo**

```bash
# .env.local
FEATURE_AUDIT_TRAIL=true
```

### 2. **Importar en tu Componente**

```typescript
import {
  useAuditTrail,
  useAuditStats,
  useAuditCapture,
  AuditEventsList,
  AuditStats,
} from "@/features/audit";
```

### 3. **Uso Básico**

```typescript
function MyComponent() {
  const { events, loadEvents } = useAuditTrail();
  const { stats } = useAuditStats();
  const { logCreate } = useAuditCapture();

  // Cargar eventos
  useEffect(() => {
    loadEvents({ action: "update", limit: 20 });
  }, []);

  // Capturar evento
  const handleUserCreated = async (user) => {
    await logCreate("user", user.id, user.name);
  };

  return <AuditEventsList events={events} />;
}
```

---

## 🎯 Server Actions (API)

### 📊 **Obtener Datos**

```typescript
// Eventos con filtros
const events = await getAuditEventsAction({
  action: "update",
  resource: "user",
  page: 1,
  limit: 20,
});

// Estadísticas
const stats = await getAuditStatsAction();

// Evento específico
const event = await getAuditEventAction("event_id");
```

### 📝 **Crear Eventos**

```typescript
// Evento manual
await createAuditEventAction({
  action: "update",
  resource: "user",
  resourceId: "user_123",
  severity: "medium",
  description: "Usuario actualizado",
  changes: [
    {
      field: "email",
      oldValue: "old@email.com",
      newValue: "new@email.com",
    },
  ],
});
```

### 🔍 **Búsqueda y Exportación**

```typescript
// Búsqueda
await searchAuditEventsAction("usuario eliminado", {
  severity: "high",
});

// Exportar
await exportAuditEventsAction({ action: "delete" }, "csv");
```

### 🗑️ **Gestión**

```typescript
// Eliminar eventos
await bulkDeleteEventsAction(["id1", "id2"]);

// Limpiar antiguos (90 días)
await cleanupOldEventsAction(90);
```

---

## 🪝 Hooks Principales

### 🎯 **useAuditTrail**

```typescript
const {
  events, // Array de eventos
  isLoading, // Estado de carga
  error, // Error si existe
  pagination, // Info de paginación
  loadEvents, // (filters) => Promise
  refreshEvents, // () => Promise
  exportEvents, // (options) => Promise
  deleteEvents, // (ids) => Promise
} = useAuditTrail();
```

### 📊 **useAuditStats**

```typescript
const {
  stats, // Estadísticas completas
  isLoading, // Estado de carga
  error, // Error si existe
  refresh, // () => Promise
  getActionCount, // (action) => number
  getResourceCount, // (resource) => number
  getSeverityCount, // (severity) => number
} = useAuditStats();
```

### 🔍 **useAuditFilters**

```typescript
const {
  filters, // Filtros actuales
  updateFilter, // (key, value) => void
  resetFilters, // () => void
  applyPreset, // (preset) => void
  activeFilters, // Array de filtros activos
  hasActiveFilters, // boolean
} = useAuditFilters();
```

### 📝 **useAuditCapture**

```typescript
const {
  captureEvent, // (data) => Promise
  logCreate, // (resource, id, name, options?) => Promise
  logUpdate, // (resource, id, name, options?) => Promise
  logDelete, // (resource, id, name, options?) => Promise
  isCapturing, // boolean
  error, // string | null
} = useAuditCapture();
```

---

## 🎨 Componentes UI

### 📋 **AuditEventsList**

```typescript
<AuditEventsList
  events={events}
  isLoading={isLoading}
  onRefresh={refresh}
  onFilterChange={updateFilter}
  onExport={exportEvents}
  showFilters={true}
  showExport={true}
  showBulkActions={true}
  pageSize={20}
/>
```

### 📊 **AuditStats**

```typescript
<AuditStats
  stats={stats}
  isLoading={isLoading}
  onRefresh={refresh}
  showCharts={true}
  showTopUsers={true}
  showRecentEvents={true}
  autoRefresh={true}
  refreshInterval={30000}
/>
```

### 🔍 **AuditFilters**

```typescript
<AuditFilters
  filters={filters}
  onFilterChange={updateFilter}
  onReset={resetFilters}
  showPresets={true}
  showDateRange={true}
  showSearch={true}
  compact={false}
/>
```

### 📋 **AuditEventCard**

```typescript
<AuditEventCard
  event={event}
  onViewDetails={(event) => console.log(event)}
  onViewChanges={(changes) => console.log(changes)}
  showChanges={true}
  compact={false}
/>
```

---

## 📊 Tipos Principales

### 🎯 **AuditEvent**

```typescript
interface AuditEvent {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName?: string;
  userId: string;
  userName?: string;
  userEmail: string;
  userRole: string;
  severity: AuditSeverity;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  changes: AuditChange[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 🔄 **AuditChange**

```typescript
interface AuditChange {
  id: string;
  eventId: string;
  field: string;
  fieldLabel?: string;
  oldValue?: unknown;
  newValue?: unknown;
  type: "create" | "update" | "delete";
}
```

### 🔍 **AuditFilters**

```typescript
interface AuditFilters {
  action?: AuditAction;
  resource?: AuditResource;
  userId?: string;
  severity?: AuditSeverity;
  resourceId?: string;
  ipAddress?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}
```

### 📊 **AuditStats**

```typescript
interface AuditStats {
  totalEvents: number;
  byAction: Record<AuditAction, number>;
  byResource: Record<AuditResource, number>;
  bySeverity: Record<AuditSeverity, number>;
  byUser: Array<{
    userId: string;
    userName: string | null;
    userEmail: string;
    eventCount: number;
  }>;
  recentEvents: AuditEvent[];
  dateRange: {
    from: Date;
    to: Date;
  };
}
```

---

## 🏷️ Enums y Constantes

### 🎯 **AuditAction**

```typescript
type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "register"
  | "upload"
  | "download"
  | "enable"
  | "disable"
  | "ban"
  | "unban"
  | "role_change"
  | "permission_change";
```

### 📦 **AuditResource**

```typescript
type AuditResource =
  | "user"
  | "feature_flag"
  | "upload"
  | "session"
  | "role"
  | "permission"
  | "setting"
  | "notification";
```

### ⚠️ **AuditSeverity**

```typescript
type AuditSeverity = "low" | "medium" | "high" | "critical";
```

---

## 💡 Ejemplos Rápidos

### 🎯 **Dashboard Básico**

```typescript
function AuditDashboard() {
  const stats = useAuditStats();
  const trail = useAuditTrail();

  return (
    <div className="space-y-6">
      <AuditStats {...stats} />
      <AuditEventsList {...trail} />
    </div>
  );
}
```

### 🔍 **Búsqueda de Usuario**

```typescript
function UserAudit({ userId }) {
  const { loadEvents } = useAuditTrail();
  const { updateFilter } = useAuditFilters();

  useEffect(() => {
    updateFilter("userId", userId);
    loadEvents();
  }, [userId]);

  return <AuditEventsList />;
}
```

### 📝 **Captura Automática**

```typescript
function useUserActions() {
  const { logCreate, logUpdate, logDelete } = useAuditCapture();

  const createUser = async (user) => {
    const result = await createUserAPI(user);
    await logCreate("user", result.id, result.name);
    return result;
  };

  return { createUser };
}
```

### 📤 **Exportación Simple**

```typescript
function ExportButton() {
  const { exportEvents } = useAuditTrail();

  const handleExport = async () => {
    const result = await exportEvents({
      filters: { severity: "critical" },
      format: "csv",
    });

    if (result.success) {
      // Descargar archivo
      downloadFile(result.data, "audit-critical.csv");
    }
  };

  return <button onClick={handleExport}>Exportar Críticos</button>;
}
```

---

## 🔧 Configuración Rápida

### ⚙️ **Constantes Principales**

```typescript
// src/features/audit/constants.ts
export const AUDIT_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_EXPORT_RECORDS: 10000,
  DEFAULT_RETENTION_DAYS: 90,
  CACHE_TTL: {
    EVENTS: 300, // 5 minutos
    STATS: 600, // 10 minutos
  },
};
```

### 🎨 **Tema de Colores**

```typescript
export const AUDIT_THEME = {
  severity: {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  },
};
```

### 🔒 **Permisos**

```typescript
export const AUDIT_PERMISSIONS = {
  VIEW_AUDIT: ["admin", "super_admin"],
  EXPORT_AUDIT: ["admin", "super_admin"],
  DELETE_AUDIT: ["super_admin"],
  CREATE_AUDIT: ["admin", "super_admin"],
};
```

---

## 🐛 Troubleshooting Rápido

### ❓ **Problemas Comunes**

| Problema              | Solución                             |
| --------------------- | ------------------------------------ |
| Módulo no aparece     | Verificar `FEATURE_AUDIT_TRAIL=true` |
| Eventos no se guardan | Verificar modelos Prisma             |
| Performance lenta     | Agregar índices en BD                |
| Exportación falla     | Reducir scope de datos               |
| Permisos negados      | Verificar rol de usuario             |

### 🔧 **Comandos Útiles**

```bash
# Verificar feature flag
echo $FEATURE_AUDIT_TRAIL

# Regenerar Prisma
npx prisma generate
npx prisma db push

# Ver logs
npm run dev | grep audit
```

### 📊 **Verificar Estado**

```typescript
// En consola del navegador
console.log("Feature flags:", window.__FEATURE_FLAGS__);
console.log("User role:", window.__USER_ROLE__);
```

---

## 🎯 Casos de Uso Frecuentes

### 1. **Auditoría de Seguridad**

```typescript
// Eventos críticos últimas 24h
loadEvents({
  severity: "critical",
  dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
});
```

### 2. **Actividad de Usuario**

```typescript
// Todo lo que hizo un usuario
loadEvents({
  userId: "user_123",
  dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
});
```

### 3. **Cambios en Recursos**

```typescript
// Cambios en usuarios
loadEvents({
  resource: "user",
  action: "update",
});
```

### 4. **Monitoreo en Tiempo Real**

```typescript
// Auto-refresh cada 30 segundos
useEffect(() => {
  const interval = setInterval(refreshEvents, 30000);
  return () => clearInterval(interval);
}, []);
```

---

## 📚 Enlaces Útiles

- **📖 Documentación Completa:** `docs/Audit-Trail/README.md`
- **💡 Ejemplos Prácticos:** `docs/Audit-Trail/EJEMPLOS_PRACTICOS.md`
- **🏗️ Arquitectura:** `src/features/audit/`
- **🎨 Componentes:** `src/features/audit/ui/`
- **🪝 Hooks:** `src/features/audit/hooks/`

---

**⚡ Referencia creada:** $(date)  
**🔄 Última actualización:** $(date)
