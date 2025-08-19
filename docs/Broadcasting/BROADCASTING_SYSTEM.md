---
title: Sistema
slug: /Broadcasting/sistema
---

# 📡 BROADCASTING SYSTEM - Documentación Completa

**Comunicación en Tiempo Real Entre Pestañas/Ventanas**

---

## 📋 **Tabla de Contenidos**

1. [¿Qué es BroadcastChannel?](#-qué-es-broadcastchannel)
2. [Casos de Uso](#-casos-de-uso)
3. [Implementación Básica](#-implementación-básica)
4. [Implementación Enterprise](#-implementación-enterprise)
5. [Patrones Avanzados](#-patrones-avanzados)
6. [Mejores Prácticas](#-mejores-prácticas)
7. [Troubleshooting](#-troubleshooting)
8. [Ejemplos Prácticos](#-ejemplos-prácticos)
9. [Alternativas](#-alternativas)

---

## 🎯 **¿Qué es BroadcastChannel?**

**BroadcastChannel** es una API nativa del navegador que permite **comunicación bidireccional** entre diferentes contextos del mismo origen:

- 🖥️ **Pestañas** del mismo sitio
- 🪟 **Ventanas** del navegador
- 👷 **Web Workers**
- 🔧 **Service Workers**

### **🔧 Soporte del Navegador**

```javascript
// ✅ Compatible con:
// - Chrome 54+
// - Firefox 38+
// - Safari 15.4+
// - Edge 79+

// 🔍 Verificar soporte
if ("BroadcastChannel" in window) {
  console.log("✅ BroadcastChannel soportado");
} else {
  console.log("❌ BroadcastChannel NO soportado");
}
```

---

## 🎪 **Casos de Uso**

### **✅ Casos Ideales**

- **🔄 Sincronización de estado** entre pestañas
- **🧭 Actualización de navegación** en tiempo real
- **🔐 Logout global** en todas las pestañas
- **📬 Notificaciones** cross-tab
- **🎮 Coordinación de acciones** entre ventanas
- **💾 Cache invalidation** distribuido

### **❌ NO usar para**

- **🌐 Comunicación servidor-cliente** (usar WebSockets)
- **💾 Persistencia de datos** (usar localStorage)
- **🔒 Comunicación cross-origin** (usar postMessage)

---

## 🚀 **Implementación Básica**

### **📤 Enviar Mensajes**

```typescript
// 1. Crear canal
const channel = new BroadcastChannel("mi-canal");

// 2. Enviar mensaje
channel.postMessage({
  type: "USER_ACTION",
  payload: { userId: 123, action: "login" },
  timestamp: Date.now(),
});

// 3. Cerrar canal (opcional)
channel.close();
```

### **📥 Recibir Mensajes**

```typescript
// 1. Crear canal
const channel = new BroadcastChannel("mi-canal");

// 2. Escuchar mensajes
channel.addEventListener("message", (event) => {
  console.log("📨 Mensaje recibido:", event.data);

  if (event.data.type === "USER_ACTION") {
    handleUserAction(event.data.payload);
  }
});

// 3. Cleanup
window.addEventListener("beforeunload", () => {
  channel.close();
});
```

---

## 🏢 **Implementación Enterprise**

### **🎯 Hook React Personalizado**

```typescript
// hooks/useBroadcastChannel.ts
import { useEffect, useCallback, useRef } from "react";

interface BroadcastMessage {
  type: string;
  payload?: any;
  timestamp: number;
  source?: string;
}

export function useBroadcastChannel(
  channelName: string,
  onMessage?: (message: BroadcastMessage) => void
) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 📡 Inicializar canal
  useEffect(() => {
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(channelName);

      if (onMessage) {
        channelRef.current.addEventListener("message", (event) => {
          onMessage(event.data);
        });
      }
    }

    return () => {
      channelRef.current?.close();
    };
  }, [channelName, onMessage]);

  // 📤 Enviar mensaje
  const broadcast = useCallback(
    (message: Omit<BroadcastMessage, "timestamp">) => {
      if (channelRef.current) {
        channelRef.current.postMessage({
          ...message,
          timestamp: Date.now(),
        });
      }
    },
    []
  );

  return { broadcast, isSupported: "BroadcastChannel" in window };
}
```

### **🔄 Provider de Sincronización**

```typescript
// providers/SyncProvider.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useBroadcastChannel } from "../hooks/useBroadcastChannel";

interface SyncContextType {
  broadcast: (type: string, payload?: any) => void;
  isSupported: boolean;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { broadcast: baseBroadcast, isSupported } = useBroadcastChannel(
    "app-sync",
    (message) => {
      console.log("🔄 Sync message received:", message);
      // Manejar mensajes globales aquí
    }
  );

  const broadcast = (type: string, payload?: any) => {
    baseBroadcast({
      type,
      payload,
      source: window.location.pathname,
    });
  };

  return (
    <SyncContext.Provider value={{ broadcast, isSupported }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within SyncProvider");
  }
  return context;
}
```

---

## 🎭 **Patrones Avanzados**

### **🔀 Multiple Channels Pattern**

```typescript
// Diferentes canales para diferentes propósitos
const authChannel = new BroadcastChannel("auth-sync");
const dataChannel = new BroadcastChannel("data-sync");
const notificationChannel = new BroadcastChannel("notifications");

// 🔐 Canal de autenticación
authChannel.postMessage({ type: "LOGOUT", userId: 123 });

// 💾 Canal de datos
dataChannel.postMessage({ type: "DATA_UPDATED", entity: "users" });

// 📬 Canal de notificaciones
notificationChannel.postMessage({
  type: "SHOW_TOAST",
  message: "Usuario creado exitosamente",
});
```

### **🎯 Request-Response Pattern**

```typescript
// Solicitar datos de otras pestañas
class CrossTabCommunicator {
  private channel: BroadcastChannel;
  private pendingRequests = new Map<string, (data: any) => void>();

  constructor(channelName: string) {
    this.channel = new BroadcastChannel(channelName);
    this.channel.addEventListener("message", this.handleMessage.bind(this));
  }

  // 📤 Solicitar datos
  async requestData(type: string, timeout = 5000): Promise<any> {
    const requestId = `req-${Date.now()}-${Math.random()}`;

    return new Promise((resolve, reject) => {
      // Timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${type}`));
      }, timeout);

      // Guardar callback
      this.pendingRequests.set(requestId, (data) => {
        clearTimeout(timeoutId);
        resolve(data);
      });

      // Enviar solicitud
      this.channel.postMessage({
        type: "REQUEST",
        requestType: type,
        requestId,
      });
    });
  }

  // 📥 Manejar mensajes
  private handleMessage(event: MessageEvent) {
    const { type, requestId, data } = event.data;

    if (type === "RESPONSE" && this.pendingRequests.has(requestId)) {
      const callback = this.pendingRequests.get(requestId)!;
      this.pendingRequests.delete(requestId);
      callback(data);
    }
  }
}

// Uso
const communicator = new CrossTabCommunicator("app-data");
const userData = await communicator.requestData("GET_USER_DATA");
```

### **🔄 State Synchronization Pattern**

```typescript
// Sincronizar estado entre pestañas
function useSharedState<T>(
  channelName: string,
  initialState: T,
  stateKey: string
) {
  const [state, setState] = useState<T>(initialState);
  const { broadcast } = useBroadcastChannel(channelName, (message) => {
    if (message.type === "STATE_UPDATE" && message.payload.key === stateKey) {
      setState(message.payload.value);
    }
  });

  const updateSharedState = useCallback(
    (newState: T) => {
      setState(newState);
      broadcast("STATE_UPDATE", { key: stateKey, value: newState });
    },
    [broadcast, stateKey]
  );

  return [state, updateSharedState] as const;
}

// Uso
function MyComponent() {
  const [sharedCounter, setSharedCounter] = useSharedState(
    "app-state",
    0,
    "counter"
  );

  return (
    <div>
      <p>Counter: {sharedCounter}</p>
      <button onClick={() => setSharedCounter(sharedCounter + 1)}>
        Increment (synced across tabs)
      </button>
    </div>
  );
}
```

---

## ✅ **Mejores Prácticas**

### **🎯 Naming Conventions**

```typescript
// ✅ Buenos nombres de canal
"feature-flags-sync"; // Específico y claro
"user-auth-updates"; // Describe el propósito
"data-cache-invalidation"; // Autoexplicativo

// ❌ Malos nombres
"channel1"; // No descriptivo
"sync"; // Muy genérico
"app"; // Demasiado amplio
```

### **📦 Message Structure**

```typescript
// ✅ Estructura consistente
interface StandardMessage {
  type: string; // Requerido: tipo de mensaje
  payload?: any; // Opcional: datos
  timestamp: number; // Requerido: cuándo se envió
  source?: string; // Opcional: quién lo envió
  requestId?: string; // Opcional: para request-response
}

// Ejemplo
const message: StandardMessage = {
  type: "USER_LOGOUT",
  payload: { userId: 123, reason: "manual" },
  timestamp: Date.now(),
  source: "/dashboard",
};
```

### **🔒 Error Handling**

```typescript
// ✅ Manejo robusto de errores
function safeBroadcast(channel: BroadcastChannel, message: any) {
  try {
    // Verificar que el canal esté abierto
    if (channel) {
      channel.postMessage(message);
    }
  } catch (error) {
    console.warn("📡 Broadcast failed:", error);

    // Fallback o logging
    if (error instanceof DOMException && error.name === "DataCloneError") {
      console.error("❌ Message contains non-serializable data");
    }
  }
}

// ✅ Verificar soporte antes de usar
function createChannel(name: string): BroadcastChannel | null {
  if ("BroadcastChannel" in window) {
    return new BroadcastChannel(name);
  }

  console.warn("📡 BroadcastChannel not supported, using fallback");
  return null;
}
```

### **🧹 Memory Management**

```typescript
// ✅ Cleanup apropiado
class ChannelManager {
  private channels = new Map<string, BroadcastChannel>();

  getChannel(name: string): BroadcastChannel {
    if (!this.channels.has(name)) {
      this.channels.set(name, new BroadcastChannel(name));
    }
    return this.channels.get(name)!;
  }

  closeAll() {
    for (const [name, channel] of this.channels) {
      channel.close();
      console.log(`📡 Closed channel: ${name}`);
    }
    this.channels.clear();
  }
}

// Cleanup global al cerrar la página
window.addEventListener("beforeunload", () => {
  channelManager.closeAll();
});
```

---

## 🐛 **Troubleshooting**

### **❌ Problemas Comunes**

#### **1. Mensajes no se reciben**

```typescript
// 🔍 Debug: Verificar que ambos extremos usen el mismo nombre
const channel1 = new BroadcastChannel("my-channel");
const channel2 = new BroadcastChannel("my-channel"); // ✅ Mismo nombre

// 🔍 Debug: Verificar que el listener esté registrado ANTES de enviar
channel.addEventListener("message", handler);
channel.postMessage({ test: true }); // No se recibirá en la misma pestaña
```

#### **2. DataCloneError**

```typescript
// ❌ Estos objetos NO se pueden enviar
const badMessage = {
  func: () => console.log("hello"), // Funciones
  dom: document.getElementById("test"), // Elementos DOM
  symbol: Symbol("test"), // Símbolos
};

// ✅ Solo datos serializables
const goodMessage = {
  type: "UPDATE",
  data: {
    id: 123,
    name: "John",
    config: { enabled: true },
    timestamp: Date.now(),
  },
};
```

#### **3. Performance Issues**

```typescript
// ❌ Enviar demasiados mensajes
setInterval(() => {
  channel.postMessage({ type: "HEARTBEAT" });
}, 100); // Cada 100ms es excesivo

// ✅ Throttling/Debouncing
const debouncedBroadcast = debounce((message) => {
  channel.postMessage(message);
}, 500);
```

### **🔧 Debug Utilities**

```typescript
// 🔍 Logger para debugging
class BroadcastDebugger {
  private static instance: BroadcastDebugger;
  private originalPostMessage: typeof BroadcastChannel.prototype.postMessage;

  static enable() {
    if (!this.instance) {
      this.instance = new BroadcastDebugger();
    }
    return this.instance;
  }

  constructor() {
    this.originalPostMessage = BroadcastChannel.prototype.postMessage;

    // Interceptar todos los mensajes
    BroadcastChannel.prototype.postMessage = function (message) {
      console.log(`📡 Broadcasting on "${this.name}":`, message);
      return BroadcastDebugger.instance.originalPostMessage.call(this, message);
    };
  }
}

// Usar en desarrollo
if (process.env.NODE_ENV === "development") {
  BroadcastDebugger.enable();
}
```

---

## 🎪 **Ejemplos Prácticos**

### **🔐 Logout Global**

```typescript
// auth/AuthProvider.tsx
function AuthProvider({ children }: { children: ReactNode }) {
  const { broadcast } = useBroadcastChannel("auth-sync", (message) => {
    if (message.type === "LOGOUT") {
      // Logout en todas las pestañas
      handleLogout();
    }
  });

  const logout = () => {
    // Logout local
    handleLogout();

    // Notificar otras pestañas
    broadcast({ type: "LOGOUT", payload: { timestamp: Date.now() } });
  };

  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  );
}
```

### **🔄 Cache Invalidation**

```typescript
// data/CacheManager.ts
class CacheManager {
  private cache = new Map();
  private channel = new BroadcastChannel("cache-sync");

  constructor() {
    this.channel.addEventListener("message", (event) => {
      if (event.data.type === "INVALIDATE_CACHE") {
        this.invalidateLocal(event.data.payload.key);
      }
    });
  }

  set(key: string, value: any) {
    this.cache.set(key, value);
  }

  invalidate(key: string) {
    // Invalidar localmente
    this.invalidateLocal(key);

    // Invalidar en otras pestañas
    this.channel.postMessage({
      type: "INVALIDATE_CACHE",
      payload: { key },
    });
  }

  private invalidateLocal(key: string) {
    this.cache.delete(key);
    console.log(`🗑️ Cache invalidated: ${key}`);
  }
}
```

### **📬 Notificaciones Cross-Tab**

```typescript
// notifications/CrossTabNotifications.tsx
function CrossTabNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useBroadcastChannel("notifications", (message) => {
    if (message.type === "SHOW_NOTIFICATION") {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...message.payload,
        },
      ]);
    }
  });

  return (
    <div className="notifications">
      {notifications.map((notif) => (
        <Toast key={notif.id} {...notif} />
      ))}
    </div>
  );
}

// Enviar notificación desde cualquier pestaña
function sendCrossTabNotification(message: string, type: "success" | "error") {
  const channel = new BroadcastChannel("notifications");
  channel.postMessage({
    type: "SHOW_NOTIFICATION",
    payload: { message, type },
  });
  channel.close();
}
```

---

## 🔄 **Alternativas**

### **📊 Comparación**

| Método                    | Velocidad      | Complejidad | Confiabilidad | Casos de Uso        |
| ------------------------- | -------------- | ----------- | ------------- | ------------------- |
| **BroadcastChannel**      | ⚡ Instantáneo | 🟢 Bajo     | 🟢 Alto       | Sync entre pestañas |
| **LocalStorage + Events** | 🐌 Lento       | 🟡 Medio    | 🟡 Medio      | Estado persistente  |
| **WebSockets**            | ⚡ Instantáneo | 🔴 Alto     | 🟢 Alto       | Servidor-cliente    |
| **PostMessage**           | ⚡ Instantáneo | 🟡 Medio    | 🟢 Alto       | Cross-origin        |
| **Polling**               | 🐌 Muy lento   | 🟢 Bajo     | 🔴 Bajo       | No recomendado      |

### **🔄 Fallbacks**

```typescript
// Implementación con fallback a localStorage
function createSyncChannel(channelName: string) {
  if ("BroadcastChannel" in window) {
    return new BroadcastChannel(channelName);
  }

  // Fallback para navegadores viejos
  return {
    postMessage(data: any) {
      localStorage.setItem(
        `${channelName}-message`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    },

    addEventListener(type: string, handler: (event: any) => void) {
      if (type === "message") {
        window.addEventListener("storage", (event) => {
          if (event.key?.startsWith(`${channelName}-message`)) {
            const data = JSON.parse(event.newValue || "{}");
            handler({ data: data.data });
          }
        });
      }
    },

    close() {
      // No-op for localStorage fallback
    },
  };
}
```

---

## 📚 **Referencias y Recursos**

- **📖 MDN Documentation**: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
- **🔧 Can I Use**: https://caniuse.com/broadcastchannel
- **🏗️ Web APIs**: https://web.dev/broadcast-channel/

---

## 🎯 **Conclusión**

**BroadcastChannel** es una herramienta poderosa para **sincronización en tiempo real** entre pestañas. Perfecto para:

- ✅ **Feature flags** sincronizados
- ✅ **Auth state** global
- ✅ **Cache invalidation** distribuido
- ✅ **Notificaciones** cross-tab

**Úsalo cuando necesites comunicación instantánea entre pestañas del mismo dominio. Es simple, eficiente y nativo del navegador.**

---

_Documentación generada para el proyecto Next.js Boilerplate - 2025_
