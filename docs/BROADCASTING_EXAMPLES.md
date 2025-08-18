# 📡 BROADCASTING EXAMPLES - Casos de Uso Prácticos

**Ejemplos listos para implementar**

---

## 🎯 **Ejemplos por Categoría**

### 1. [🔐 Autenticación](#autenticación)

### 2. [💾 Gestión de Datos](#gestión-de-datos)

### 3. [🎮 Estado de la Aplicación](#estado-de-la-aplicación)

### 4. [📬 Notificaciones](#notificaciones)

### 5. [🎛️ Feature Flags](#feature-flags)

### 6. [📊 Analytics y Tracking](#analytics-y-tracking)

---

## 🔐 **Autenticación**

### **🚪 Logout Global Instantáneo**

```typescript
// hooks/useGlobalAuth.ts
import { useBroadcastChannel } from "./useBroadcastChannel";

export function useGlobalAuth() {
  const { broadcast } = useBroadcastChannel("auth-channel", (message) => {
    switch (message.type) {
      case "LOGOUT":
        handleGlobalLogout();
        break;
      case "SESSION_EXPIRED":
        handleSessionExpired();
        break;
      case "ROLE_CHANGED":
        handleRoleChange(message.payload.newRole);
        break;
    }
  });

  const logout = () => {
    // Logout en pestaña actual
    clearLocalSession();

    // Logout en todas las pestañas
    broadcast({
      type: "LOGOUT",
      payload: { reason: "manual", timestamp: Date.now() },
    });

    // Redirect
    window.location.href = "/login";
  };

  const broadcastSessionExpired = () => {
    broadcast({
      type: "SESSION_EXPIRED",
      payload: { expiredAt: Date.now() },
    });
  };

  return { logout, broadcastSessionExpired };
}
```

### **🔄 Sincronización de Tokens**

```typescript
// services/TokenSyncService.ts
class TokenSyncService {
  private channel = new BroadcastChannel("token-sync");

  constructor() {
    this.channel.addEventListener("message", this.handleTokenUpdate.bind(this));
  }

  // Actualizar token en todas las pestañas
  updateToken(newToken: string, refreshToken?: string) {
    // Guardar localmente
    localStorage.setItem("authToken", newToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Sincronizar con otras pestañas
    this.channel.postMessage({
      type: "TOKEN_UPDATED",
      payload: {
        token: newToken,
        refreshToken,
        updatedAt: Date.now(),
      },
    });
  }

  private handleTokenUpdate(event: MessageEvent) {
    if (event.data.type === "TOKEN_UPDATED") {
      const { token, refreshToken } = event.data.payload;

      // Actualizar axios headers o cliente HTTP
      updateAuthHeaders(token);

      console.log("🔄 Token sincronizado desde otra pestaña");
    }
  }
}

export const tokenSync = new TokenSyncService();
```

---

## 💾 **Gestión de Datos**

### **🗂️ Cache Invalidation Inteligente**

```typescript
// services/SmartCacheService.ts
class SmartCacheService {
  private cache = new Map<string, { data: any; expiry: number }>();
  private channel = new BroadcastChannel("cache-sync");

  constructor() {
    this.channel.addEventListener(
      "message",
      this.handleCacheMessage.bind(this)
    );
  }

  // Obtener datos con broadcast automático
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 300000
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    // Fetch nuevo dato
    const data = await fetcher();

    // Cache local
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });

    // Sync con otras pestañas
    this.broadcast("CACHE_SET", { key, data, ttl });

    return data;
  }

  // Invalidar en todas las pestañas
  invalidate(key: string | string[]) {
    const keys = Array.isArray(key) ? key : [key];

    keys.forEach((k) => {
      this.cache.delete(k);
    });

    this.broadcast("CACHE_INVALIDATE", { keys });
  }

  // Invalidar por patrón
  invalidatePattern(pattern: RegExp) {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
      pattern.test(key)
    );

    keysToDelete.forEach((key) => this.cache.delete(key));

    this.broadcast("CACHE_INVALIDATE_PATTERN", {
      pattern: pattern.source,
      flags: pattern.flags,
    });
  }

  private broadcast(type: string, payload: any) {
    this.channel.postMessage({
      type,
      payload,
      timestamp: Date.now(),
      source: window.location.pathname,
    });
  }

  private handleCacheMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case "CACHE_SET":
        this.cache.set(payload.key, {
          data: payload.data,
          expiry: Date.now() + payload.ttl,
        });
        break;

      case "CACHE_INVALIDATE":
        payload.keys.forEach((key: string) => {
          this.cache.delete(key);
        });
        break;

      case "CACHE_INVALIDATE_PATTERN":
        const regex = new RegExp(payload.pattern, payload.flags);
        Array.from(this.cache.keys()).forEach((key) => {
          if (regex.test(key)) {
            this.cache.delete(key);
          }
        });
        break;
    }
  }
}

export const smartCache = new SmartCacheService();
```

### **📊 Sincronización de Estado de Formularios**

```typescript
// hooks/useSharedForm.ts
export function useSharedForm<T>(
  formId: string,
  initialData: T,
  autoSave = true
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  const { broadcast } = useBroadcastChannel("form-sync", (message) => {
    if (message.type === "FORM_UPDATE" && message.payload.formId === formId) {
      setFormData(message.payload.data);
      setIsDirty(message.payload.isDirty);
    }
  });

  const updateForm = useCallback(
    (updates: Partial<T>) => {
      const newData = { ...formData, ...updates };
      setFormData(newData);
      setIsDirty(true);

      if (autoSave) {
        // Sincronizar con otras pestañas
        broadcast({
          type: "FORM_UPDATE",
          payload: {
            formId,
            data: newData,
            isDirty: true,
            lastModified: Date.now(),
          },
        });
      }
    },
    [formData, formId, autoSave, broadcast]
  );

  const saveForm = useCallback(async () => {
    // Guardar en servidor
    await saveToServer(formId, formData);

    setIsDirty(false);

    // Notificar que se guardó
    broadcast({
      type: "FORM_SAVED",
      payload: { formId, data: formData },
    });
  }, [formId, formData, broadcast]);

  return {
    formData,
    updateForm,
    saveForm,
    isDirty,
  };
}
```

---

## 🎮 **Estado de la Aplicación**

### **🌐 Navegación Sincronizada**

```typescript
// hooks/useSyncedNavigation.ts
export function useSyncedNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const { broadcast } = useBroadcastChannel("navigation-sync", (message) => {
    if (message.type === "NAVIGATE" && message.payload.sync) {
      // Solo navegar si no estamos ya en esa ruta
      if (location.pathname !== message.payload.path) {
        navigate(message.payload.path, { replace: true });
      }
    }
  });

  const syncedNavigate = (path: string, options?: { sync?: boolean }) => {
    // Navegar en pestaña actual
    navigate(path);

    // Sincronizar con otras pestañas si se solicita
    if (options?.sync) {
      broadcast({
        type: "NAVIGATE",
        payload: { path, sync: true },
      });
    }
  };

  return { syncedNavigate };
}
```

### **🎯 Configuración Global de Tema**

```typescript
// context/ThemeSync.tsx
function ThemeSyncProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const { broadcast } = useBroadcastChannel("theme-sync", (message) => {
    if (message.type === "THEME_CHANGE") {
      setTheme(message.payload.theme);
      applyTheme(message.payload.theme);
    }
  });

  const changeTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    applyTheme(newTheme);

    // Sincronizar con otras pestañas
    broadcast({
      type: "THEME_CHANGE",
      payload: { theme: newTheme },
    });

    // Persistir
    localStorage.setItem("theme", newTheme);
  };

  const applyTheme = (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## 📬 **Notificaciones**

### **🔔 Sistema de Notificaciones Cross-Tab**

```typescript
// services/CrossTabNotificationService.ts
class CrossTabNotificationService {
  private channel = new BroadcastChannel("notifications");
  private notifications = new Map<string, any>();

  constructor() {
    this.channel.addEventListener(
      "message",
      this.handleNotification.bind(this)
    );
  }

  // Mostrar notificación en todas las pestañas
  showGlobal(notification: {
    id?: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    duration?: number;
    actions?: Array<{ label: string; action: string }>;
  }) {
    const id = notification.id || `notif-${Date.now()}`;

    this.channel.postMessage({
      type: "SHOW_NOTIFICATION",
      payload: { ...notification, id },
    });
  }

  // Ocultar notificación en todas las pestañas
  hideGlobal(notificationId: string) {
    this.channel.postMessage({
      type: "HIDE_NOTIFICATION",
      payload: { id: notificationId },
    });
  }

  // Notificación de progreso sincronizada
  showProgress(id: string, progress: number, message: string) {
    this.channel.postMessage({
      type: "UPDATE_PROGRESS",
      payload: { id, progress, message },
    });
  }

  private handleNotification(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case "SHOW_NOTIFICATION":
        this.displayNotification(payload);
        break;

      case "HIDE_NOTIFICATION":
        this.hideNotification(payload.id);
        break;

      case "UPDATE_PROGRESS":
        this.updateProgress(payload.id, payload.progress, payload.message);
        break;
    }
  }

  private displayNotification(notification: any) {
    // Implementar usando tu sistema de notificaciones preferido
    // Por ejemplo: react-hot-toast, sonner, etc.
    console.log("🔔 Showing notification:", notification);
  }
}

export const crossTabNotifications = new CrossTabNotificationService();
```

### **📱 Estado de Push Notifications**

```typescript
// hooks/usePushNotificationSync.ts
export function usePushNotificationSync() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  const { broadcast } = useBroadcastChannel("push-sync", (message) => {
    switch (message.type) {
      case "PERMISSION_CHANGED":
        setPermission(message.payload.permission);
        break;

      case "SUBSCRIPTION_UPDATED":
        setSubscription(message.payload.subscription);
        break;
    }
  });

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);

    // Sincronizar estado con otras pestañas
    broadcast({
      type: "PERMISSION_CHANGED",
      payload: { permission: result },
    });

    return result;
  };

  const updateSubscription = (newSubscription: PushSubscription | null) => {
    setSubscription(newSubscription);

    broadcast({
      type: "SUBSCRIPTION_UPDATED",
      payload: { subscription: newSubscription },
    });
  };

  return {
    permission,
    subscription,
    requestPermission,
    updateSubscription,
  };
}
```

---

## 🎛️ **Feature Flags**

### **🚀 Feature Flags Avanzado con Rollout**

```typescript
// services/FeatureFlagSyncService.ts
class FeatureFlagSyncService {
  private flags = new Map<string, any>();
  private channel = new BroadcastChannel("feature-flags-advanced");
  private rolloutTimers = new Map<string, NodeJS.Timeout>();

  constructor() {
    this.channel.addEventListener("message", this.handleFlagMessage.bind(this));
  }

  // Activar flag con rollout gradual
  enableWithRollout(
    flagKey: string,
    rolloutConfig: {
      percentage: number; // 0-100
      duration: number; // ms
      targetUsers?: string[];
    }
  ) {
    const { percentage, duration, targetUsers } = rolloutConfig;

    // Calcular si este usuario está en el rollout
    const userId = getCurrentUserId();
    const isInRollout = this.calculateRollout(userId, percentage, targetUsers);

    if (isInRollout) {
      this.setFlag(flagKey, true);

      // Programar desactivación automática
      if (duration > 0) {
        const timer = setTimeout(() => {
          this.setFlag(flagKey, false);
        }, duration);

        this.rolloutTimers.set(flagKey, timer);
      }
    }

    // Broadcast del rollout
    this.broadcast("FLAG_ROLLOUT", {
      flagKey,
      rolloutConfig,
      isInRollout,
      userId,
    });
  }

  // Activar/desactivar flag
  setFlag(flagKey: string, enabled: boolean, metadata?: any) {
    this.flags.set(flagKey, { enabled, metadata, updatedAt: Date.now() });

    this.broadcast("FLAG_UPDATED", {
      flagKey,
      enabled,
      metadata,
    });
  }

  // Verificar si flag está activo
  isEnabled(flagKey: string): boolean {
    const flag = this.flags.get(flagKey);
    return flag?.enabled || false;
  }

  // Obtener metadata del flag
  getFlagMetadata(flagKey: string) {
    return this.flags.get(flagKey)?.metadata;
  }

  // A/B Testing
  getVariant(flagKey: string, variants: string[]): string {
    const userId = getCurrentUserId();
    const hash = this.hashString(`${userId}-${flagKey}`);
    const index = hash % variants.length;

    const variant = variants[index];

    this.broadcast("VARIANT_ASSIGNED", {
      flagKey,
      userId,
      variant,
      availableVariants: variants,
    });

    return variant;
  }

  private calculateRollout(
    userId: string,
    percentage: number,
    targetUsers?: string[]
  ): boolean {
    // Si hay usuarios específicos, verificar primero
    if (targetUsers && targetUsers.includes(userId)) {
      return true;
    }

    // Rollout basado en porcentaje
    const hash = this.hashString(userId);
    return hash % 100 < percentage;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private broadcast(type: string, payload: any) {
    this.channel.postMessage({
      type,
      payload,
      timestamp: Date.now(),
      source: window.location.pathname,
    });
  }

  private handleFlagMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case "FLAG_UPDATED":
        this.flags.set(payload.flagKey, {
          enabled: payload.enabled,
          metadata: payload.metadata,
          updatedAt: Date.now(),
        });
        break;

      case "FLAG_ROLLOUT":
        console.log(`🎯 Rollout para ${payload.flagKey}:`, payload);
        break;

      case "VARIANT_ASSIGNED":
        console.log(`🧪 A/B Test ${payload.flagKey}: ${payload.variant}`);
        break;
    }
  }
}

export const featureFlagSync = new FeatureFlagSyncService();
```

---

## 📊 **Analytics y Tracking**

### **📈 Event Tracking Coordinado**

```typescript
// services/AnalyticsSync.ts
class AnalyticsSync {
  private channel = new BroadcastChannel("analytics-sync");
  private sessionEvents: any[] = [];

  constructor() {
    this.channel.addEventListener(
      "message",
      this.handleAnalyticsMessage.bind(this)
    );
  }

  // Trackear evento en todas las pestañas
  trackGlobalEvent(event: {
    name: string;
    properties?: Record<string, any>;
    userId?: string;
    sessionId?: string;
  }) {
    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      url: window.location.href,
      tabId: this.getTabId(),
    };

    // Track localmente
    this.trackLocal(enrichedEvent);

    // Sincronizar con otras pestañas
    this.channel.postMessage({
      type: "GLOBAL_EVENT",
      payload: enrichedEvent,
    });
  }

  // Coordinar eventos de sesión
  trackSessionStart() {
    const sessionId = `session-${Date.now()}-${Math.random()}`;

    this.broadcast("SESSION_START", {
      sessionId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
    });

    return sessionId;
  }

  trackPageView(path: string) {
    this.broadcast("PAGE_VIEW", {
      path,
      referrer: document.referrer,
      timestamp: Date.now(),
    });
  }

  // Agregar eventos de múltiples pestañas
  getSessionSummary(): {
    totalEvents: number;
    uniquePages: string[];
    sessionDuration: number;
    tabsUsed: string[];
  } {
    return {
      totalEvents: this.sessionEvents.length,
      uniquePages: [...new Set(this.sessionEvents.map((e) => e.url))],
      sessionDuration: this.calculateSessionDuration(),
      tabsUsed: [...new Set(this.sessionEvents.map((e) => e.tabId))],
    };
  }

  private broadcast(type: string, payload: any) {
    this.channel.postMessage({
      type,
      payload,
      timestamp: Date.now(),
      tabId: this.getTabId(),
    });
  }

  private handleAnalyticsMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case "GLOBAL_EVENT":
        this.sessionEvents.push(payload);
        console.log("📊 Global event tracked:", payload);
        break;

      case "SESSION_START":
        console.log("🚀 Session started:", payload);
        break;

      case "PAGE_VIEW":
        this.sessionEvents.push({ type: "page_view", ...payload });
        break;
    }
  }

  private trackLocal(event: any) {
    // Enviar a tu proveedor de analytics
    // Google Analytics, Mixpanel, etc.
    console.log("📈 Tracking event:", event);
  }

  private getTabId(): string {
    if (!sessionStorage.getItem("tabId")) {
      sessionStorage.setItem("tabId", `tab-${Date.now()}-${Math.random()}`);
    }
    return sessionStorage.getItem("tabId")!;
  }

  private calculateSessionDuration(): number {
    if (this.sessionEvents.length === 0) return 0;

    const first = Math.min(...this.sessionEvents.map((e) => e.timestamp));
    const last = Math.max(...this.sessionEvents.map((e) => e.timestamp));

    return last - first;
  }
}

export const analyticsSync = new AnalyticsSync();
```

---

## 🎯 **Hook Utilities Avanzados**

### **🔄 useCrossTabState**

```typescript
// hooks/useCrossTabState.ts
export function useCrossTabState<T>(
  key: string,
  initialValue: T,
  channelName = "cross-tab-state"
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);

  const { broadcast } = useBroadcastChannel(channelName, (message) => {
    if (message.type === "STATE_UPDATE" && message.payload.key === key) {
      setState(message.payload.value);
    }
  });

  const setCrossTabState = useCallback(
    (newValue: T) => {
      setState(newValue);

      broadcast({
        type: "STATE_UPDATE",
        payload: { key, value: newValue },
      });
    },
    [key, broadcast]
  );

  return [state, setCrossTabState];
}

// Uso
function MyComponent() {
  const [sharedCounter, setSharedCounter] = useCrossTabState("counter", 0);

  return (
    <div>
      <p>Counter (synced): {sharedCounter}</p>
      <button onClick={() => setSharedCounter(sharedCounter + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### **📡 useBroadcastEffect**

```typescript
// hooks/useBroadcastEffect.ts
export function useBroadcastEffect(
  channelName: string,
  effect: (message: any) => void,
  deps: any[] = []
) {
  useEffect(() => {
    const channel = new BroadcastChannel(channelName);

    const handler = (event: MessageEvent) => {
      effect(event.data);
    };

    channel.addEventListener("message", handler);

    return () => {
      channel.removeEventListener("message", handler);
      channel.close();
    };
  }, deps);
}

// Uso
function NotificationComponent() {
  useBroadcastEffect("notifications", (message) => {
    if (message.type === "SHOW_TOAST") {
      toast(message.payload.message);
    }
  });

  return <div>Listening for notifications...</div>;
}
```

---

## 🚀 **Casos de Uso Avanzados**

### **🎮 Gaming/Real-time Coordination**

```typescript
// Para aplicaciones que requieren coordinación en tiempo real
class MultiTabGameCoordinator {
  private channel = new BroadcastChannel("game-sync");
  private isLeader = false;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    this.channel.addEventListener("message", this.handleGameMessage.bind(this));
    this.electLeader();
  }

  // Elegir pestaña líder para coordinar
  private electLeader() {
    const tabId = this.getTabId();

    // Anunciar candidatura
    this.channel.postMessage({
      type: "LEADER_ELECTION",
      payload: { tabId, timestamp: Date.now() },
    });

    // Esperar 1 segundo y declararse líder si no hay respuesta
    setTimeout(() => {
      this.isLeader = true;
      this.startHeartbeat();
    }, 1000);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.channel.postMessage({
        type: "LEADER_HEARTBEAT",
        payload: { tabId: this.getTabId() },
      });
    }, 5000);
  }

  // Coordinar acción global
  coordinateAction(action: string, data: any) {
    if (this.isLeader) {
      this.channel.postMessage({
        type: "COORDINATED_ACTION",
        payload: { action, data, coordinator: this.getTabId() },
      });
    }
  }
}
```

### **💼 Enterprise Data Synchronization**

```typescript
// Para sincronización enterprise compleja
class EnterpriseDataSync {
  private channels = new Map<string, BroadcastChannel>();
  private conflictResolution: "last-write-wins" | "merge" | "manual" =
    "last-write-wins";

  getChannel(entity: string): BroadcastChannel {
    if (!this.channels.has(entity)) {
      const channel = new BroadcastChannel(`enterprise-${entity}`);
      channel.addEventListener("message", (event) => {
        this.handleDataUpdate(entity, event.data);
      });
      this.channels.set(entity, channel);
    }
    return this.channels.get(entity)!;
  }

  updateEntity(entity: string, id: string, changes: any, version: number) {
    const channel = this.getChannel(entity);

    channel.postMessage({
      type: "ENTITY_UPDATE",
      payload: {
        entity,
        id,
        changes,
        version,
        timestamp: Date.now(),
        source: this.getInstanceId(),
      },
    });
  }

  private handleDataUpdate(entity: string, message: any) {
    const { type, payload } = message;

    if (type === "ENTITY_UPDATE") {
      this.resolveConflict(entity, payload);
    }
  }

  private resolveConflict(entity: string, update: any) {
    // Implementar lógica de resolución de conflictos
    const currentVersion = this.getEntityVersion(entity, update.id);

    if (update.version > currentVersion) {
      this.applyUpdate(entity, update);
    } else {
      this.handleConflict(entity, update);
    }
  }
}
```

---

_Ejemplos prácticos para el sistema de Broadcasting - Next.js Boilerplate 2025_

