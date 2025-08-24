# 🎯 **EVENT SYSTEMS GUIDE - CustomEvent vs BroadcastChannel**

## 📋 **TABLA DE CONTENIDOS**

1. [🔍 Introducción](#-introducción)
2. [📡 CustomEvent - Comunicación Intra-App](#-customevent---comunicación-intra-app)
3. [📻 BroadcastChannel - Comunicación Inter-App](#-broadcastchannel---comunicación-inter-app)
4. [⚖️ Comparación Técnica](#️-comparación-técnica)
5. [🎯 Casos de Uso Recomendados](#-casos-de-uso-recomendados)
6. [🚀 Implementación Práctica](#-implementación-práctica)
7. [📊 Matriz de Decisión](#-matriz-de-decisión)
8. [🛠️ Mejores Prácticas](#️-mejores-prácticas)
9. [🔗 Referencias](#-referencias)

---

## 🔍 **Introducción**

En aplicaciones web modernas, la **comunicación entre componentes** es fundamental. Este proyecto utiliza **dos tecnologías nativas del navegador** para diferentes tipos de comunicación:

- **CustomEvent**: Comunicación dentro de la misma pestaña/contexto
- **BroadcastChannel**: Comunicación entre múltiples pestañas/contextos

Ambas son **complementarias** y sirven propósitos específicos.

---

## 📡 **CustomEvent - Comunicación Intra-App**

### **🎯 ¿Qué es?**

`CustomEvent` es un **evento DOM personalizado** que permite comunicación desacoplada dentro del **mismo contexto de navegación** (misma pestaña).

### **✅ Características:**

- ✅ **Síncrono** - Ejecución inmediata
- ✅ **Liviano** - Mínimo overhead
- ✅ **Nativo** - Sin dependencias externas
- ✅ **Type-safe** - Compatible con TypeScript
- ✅ **Escalable** - Múltiples listeners por evento

### **🔧 Sintaxis Básica:**

```typescript
// ✅ Crear y disparar evento
const event = new CustomEvent("evento-personalizado", {
  detail: {
    usuario: "juan@ejemplo.com",
    timestamp: Date.now(),
    data: { cualquierDato: "aquí" },
  },
});
window.dispatchEvent(event);

// ✅ Escuchar evento
window.addEventListener("evento-personalizado", (e) => {
  console.log("Datos recibidos:", e.detail);
  // e.detail.usuario = "juan@ejemplo.com"
  // e.detail.timestamp = 1705843200000
  // e.detail.data = { cualquierDato: "aquí" }
});

// 🧹 Cleanup (importante)
const handler = (e) => {
  /* manejar evento */
};
window.addEventListener("mi-evento", handler);
// Al desmontar componente:
window.removeEventListener("mi-evento", handler);
```

### **🎯 Casos de Uso Perfectos:**

#### **1. UI Interactions (Nuestro uso actual)**

```typescript
// AdminLayout - Header actions
const handleSearch = useCallback(() => {
  const event = new CustomEvent("admin-search", {
    detail: {
      source: "admin-layout",
      user: user.email,
      currentPath: window.location.pathname,
    },
  });
  window.dispatchEvent(event);
}, [user.email]);

// Listener automático muestra modal
window.addEventListener("admin-search", (e) => {
  showSearchModal(e.detail.user, e.detail.currentPath);
});
```

#### **2. Component Decoupling**

```typescript
// Componente dispara evento sin conocer quién escucha
const Modal = () => {
  const handleClose = () => {
    window.dispatchEvent(
      new CustomEvent("modal-closed", {
        detail: { modalId: "user-profile", timestamp: Date.now() },
      })
    );
  };

  return <button onClick={handleClose}>Cerrar</button>;
};

// Múltiples componentes pueden reaccionar
window.addEventListener("modal-closed", updateNavigationState);
window.addEventListener("modal-closed", trackAnalytics);
window.addEventListener("modal-closed", cleanupResources);
```

#### **3. Event-Driven Analytics**

```typescript
// Un evento → múltiples trackers
const trackUserAction = (action: string, data: any) => {
  window.dispatchEvent(
    new CustomEvent("user-action", {
      detail: { action, data, timestamp: Date.now() },
    })
  );
};

// Diferentes servicios de analytics escuchan
window.addEventListener("user-action", sendToGoogleAnalytics);
window.addEventListener("user-action", sendToMixpanel);
window.addEventListener("user-action", logToConsole);
window.addEventListener("user-action", updateUserBehaviorProfile);
```

---

## 📻 **BroadcastChannel - Comunicación Inter-App**

### **🎯 ¿Qué es?**

`BroadcastChannel` es un **canal de comunicación asíncrono** que permite intercambio de mensajes entre **múltiples contextos de navegación** (pestañas, ventanas, workers, iframes).

### **✅ Características:**

- ✅ **Cross-context** - Entre pestañas/ventanas
- ✅ **Asíncrono** - No bloquea la UI
- ✅ **Persistente** - Canal mantiene conexión
- ✅ **Bidireccional** - Cualquier pestaña puede enviar/recibir
- ✅ **Sincronización** - Estado compartido automático

### **🔧 Sintaxis Básica:**

```typescript
// ✅ Crear canal
const channel = new BroadcastChannel("mi-canal");

// ✅ Enviar mensaje
channel.postMessage({
  type: "USER_LOGIN",
  data: { userId: "12345", timestamp: Date.now() },
});

// ✅ Escuchar mensajes
channel.addEventListener("message", (event) => {
  console.log("Mensaje recibido:", event.data);
  if (event.data.type === "USER_LOGIN") {
    updateUserState(event.data.data);
  }
});

// 🧹 Cleanup (importante)
channel.close();
```

### **🎯 Nuestro Hook Optimizado:**

```typescript
// 📻 Hook reutilizable - src/shared/hooks/useBroadcast.ts
export function useBroadcast(channelName: string) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 🔧 Inicialización automática
  useEffect(() => {
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(channelName);
    }
    return () => channelRef.current?.close();
  }, [channelName]);

  // 📤 Enviar - API simple
  const send = useCallback((type: string, data?: unknown) => {
    if (!channelRef.current) return;
    try {
      channelRef.current.postMessage({
        type,
        data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.debug("Broadcast error:", error);
    }
  }, []);

  // 📥 Escuchar - API simple
  const listen = useCallback(
    (callback: (type: string, data?: unknown) => void) => {
      if (!channelRef.current) return () => {};

      const handler = (event: MessageEvent) => {
        callback(event.data.type, event.data.data);
      };

      channelRef.current.addEventListener("message", handler);
      return () => {
        channelRef.current?.removeEventListener("message", handler);
      };
    },
    []
  );

  return { send, listen };
}
```

### **🎯 Casos de Uso Perfectos:**

#### **1. Authentication Sync**

```typescript
// Hook especializado para Auth
export function useAuthBroadcast() {
  const { send, listen } = useBroadcast("auth-sync");

  const notifyLogin = useCallback(
    (userId: string) => {
      send("LOGIN", { userId });
    },
    [send]
  );

  const notifyLogout = useCallback(() => {
    send("LOGOUT");
  }, [send]);

  const onAuthChange = useCallback(
    (callback: (type: "LOGIN" | "LOGOUT", userId?: string) => void) => {
      return listen((type, data) => {
        if (type === "LOGIN" || type === "LOGOUT") {
          const userId = data?.userId;
          callback(type as "LOGIN" | "LOGOUT", userId);
        }
      });
    },
    [listen]
  );

  return { notifyLogin, notifyLogout, onAuthChange };
}

// Uso en components
const { notifyLogin, onAuthChange } = useAuthBroadcast();

// En login
const handleLogin = async (credentials) => {
  const user = await loginUser(credentials);
  notifyLogin(user.id); // 👈 TODAS las pestañas se enteran
};

// En cualquier pestaña
useEffect(() => {
  return onAuthChange((type, userId) => {
    if (type === "LOGOUT") {
      // Todas las pestañas hacen logout automático
      redirect("/login");
      clearUserData();
    }
  });
}, []);
```

#### **2. Shopping Cart Synchronization**

```typescript
// E-commerce - Cart sync entre pestañas
const useCartBroadcast = () => {
  const { send, listen } = useBroadcast("shopping-cart");

  const syncCartUpdate = useCallback((cart, action, product) => {
    send("CART_UPDATED", { cart, action, product, timestamp: Date.now() });
  }, [send]);

  const onCartUpdate = useCallback((callback) => {
    return listen((type, data) => {
      if (type === "CART_UPDATED") {
        callback(data.cart, data.action, data.product);
      }
    });
  }, [listen]);

  return { syncCartUpdate, onCartUpdate };
};

// Component uso
const ShoppingCart = () => {
  const [cart, setCart] = useState([]);
  const { syncCartUpdate, onCartUpdate } = useCartBroadcast();

  const addProduct = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    syncCartUpdate(newCart, "add", product); // 👈 Sync a otras pestañas
  };

  // Escuchar cambios de otras pestañas
  useEffect(() => {
    return onCartUpdate((newCart, action, product) => {
      setCart(newCart);
      showNotification(`Product ${action}ed: ${product.name}`);
    });
  }, [onCartUpdate]);

  return (/* JSX */);
};
```

#### **3. Real-time Notifications**

```typescript
// Sistema de notificaciones cross-tab
const useNotificationsBroadcast = () => {
  const { send, listen } = useBroadcast("notifications");

  const broadcastNotification = useCallback((message, type = "info") => {
    send("NEW_NOTIFICATION", {
      id: generateId(),
      message,
      type,
      timestamp: Date.now(),
    });
  }, [send]);

  const onNewNotification = useCallback((callback) => {
    return listen((type, data) => {
      if (type === "NEW_NOTIFICATION") {
        callback(data);
      }
    });
  }, [listen]);

  return { broadcastNotification, onNewNotification };
};

// Uso global
const NotificationSystem = () => {
  const { broadcastNotification, onNewNotification } = useNotificationsBroadcast();

  // Recibir notificaciones de cualquier pestaña
  useEffect(() => {
    return onNewNotification((notification) => {
      toast.show(notification.message, { type: notification.type });

      // Solo la pestaña activa reproduce sonido
      if (document.visibilityState === "visible") {
        playNotificationSound();
      }
    });
  }, [onNewNotification]);

  return (/* JSX */);
};
```

---

## ⚖️ **Comparación Técnica**

| **Aspecto**           | **CustomEvent**                | **BroadcastChannel**                  |
| --------------------- | ------------------------------ | ------------------------------------- |
| **🌍 Alcance**        | **Mismo contexto** (1 pestaña) | **Múltiples contextos** (N pestañas)  |
| **⚡ Velocidad**      | **Inmediato** (síncrono)       | **Ligeramente más lento** (asíncrono) |
| **💾 Persistencia**   | **No persiste** (evento único) | **Persiste** mientras haya listeners  |
| **🔄 Sincronización** | No aplica                      | **Sincroniza estado** automáticamente |
| **📱 Soporte móvil**  | ✅ **Universal**               | ⚠️ **Limitado** en iOS Safari         |
| **🧠 Uso de memoria** | **Mínimo** (evento temporal)   | **Moderado** (mantiene canal abierto) |
| **🎯 Propósito**      | **UI interactions**            | **Estado compartido**                 |
| **🔧 Complexity**     | **Simple**                     | **Medio** (requiere cleanup)          |
| **👥 Listeners**      | **Múltiples** por evento       | **Múltiples** por canal               |
| **📊 Debugging**      | **DevTools Events**            | **Network/Application tab**           |

---

## 🎯 **Casos de Uso Recomendados**

### **✅ Usa CustomEvent para:**

| **Caso de Uso**             | **Razón**                          | **Ejemplo**                    |
| --------------------------- | ---------------------------------- | ------------------------------ |
| 🎨 **UI Interactions**      | Reacción inmediata, mismo contexto | Header clicks → Modal show     |
| 🎮 **Gaming Events**        | Performance crítico                | Player scored → Update UI      |
| 📊 **Analytics Tracking**   | Múltiples trackers, evento único   | User action → Track everywhere |
| 🔄 **Component Events**     | Desacoplamiento interno            | Modal close → Update parent    |
| ⚡ **Performance Critical** | Latencia mínima requerida          | Real-time game updates         |

### **✅ Usa BroadcastChannel para:**

| **Caso de Uso**              | **Razón**                 | **Ejemplo**                        |
| ---------------------------- | ------------------------- | ---------------------------------- |
| 🔐 **Authentication**        | Estado compartido crítico | Login/logout sync                  |
| 🛒 **Shopping Cart**         | Datos compartidos         | Cart updates cross-tab             |
| 🎵 **Media Players**         | Control centralizado      | Play/pause desde cualquier pestaña |
| 📝 **Collaborative Editing** | Sincronización de datos   | Document changes sync              |
| 🔔 **Notifications**         | Comunicación global       | Alerts cross-tab                   |
| ⚙️ **User Preferences**      | Settings synchronization  | Theme, language changes            |

---

## 🚀 **Implementación Práctica**

### **🎯 AdminLayout - Uso Actual (CustomEvent)**

```typescript
// src/shared/ui/layouts/hooks/useAdminLayoutNavigation.ts
export function useAdminLayoutNavigation({ user, userRole, isAuthenticated }) {

  // 📡 CustomEvent - UI interactions
  const handleSearch = useCallback(() => {
    console.log("🔍 Search action triggered");

    // 🎯 Evento para mostrar modal de búsqueda
    const event = new CustomEvent("admin-search", {
      detail: {
        source: "admin-layout",
        user: user.email,
        currentPath: window.location.pathname,
      },
    });
    window.dispatchEvent(event);

    // 📊 Analytics tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "admin_search_triggered", {
        event_category: "navigation",
        event_label: "header_search",
      });
    }
  }, [user.email]);

  const handleNotifications = useCallback(() => {
    console.log("🔔 Notifications action triggered");

    // 🎯 Toggle notifications panel
    const event = new CustomEvent("admin-notifications", {
      detail: {
        action: "toggle",
        user: user.email,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(event);
  }, [user.email]);

  return { handleSearch, handleNotifications, ... };
}
```

### **🔄 Event Listeners Setup**

```typescript
// src/shared/utils/eventListeners.ts - Sistema automático
export const setupAllEventListeners = () => {
  // 🔍 Search modal
  const handleSearchEvent = (e) => {
    const { user, currentPath } = e.detail;
    const modal = createSearchModal(user, currentPath);
    document.body.appendChild(modal);
  };

  // 🔔 Notifications panel
  const handleNotificationsEvent = (e) => {
    const { user, action } = e.detail;
    const panel = createNotificationsPanel(user);
    document.body.appendChild(panel);
  };

  // 👤 Profile dropdown
  const handleProfileEvent = (e) => {
    const { user } = e.detail;
    const dropdown = createProfileDropdown(user);
    document.body.appendChild(dropdown);
  };

  // ✅ Register listeners
  window.addEventListener("admin-search", handleSearchEvent);
  window.addEventListener("admin-notifications", handleNotificationsEvent);
  window.addEventListener("admin-profile-menu", handleProfileEvent);

  // 🧹 Return cleanup function
  return () => {
    window.removeEventListener("admin-search", handleSearchEvent);
    window.removeEventListener("admin-notifications", handleNotificationsEvent);
    window.removeEventListener("admin-profile-menu", handleProfileEvent);
  };
};
```

### **🎯 Hook Híbrido - Lo Mejor de Ambos Mundos**

```typescript
// Ejemplo: Enhanced AdminLayout con ambas tecnologías
const useAdminLayoutEnhanced = () => {
  // 📡 CustomEvent - UI interactions (mantener)
  const { handleSearch, handleNotifications } = useAdminLayoutNavigation();

  // 📻 BroadcastChannel - Cross-tab sync (agregar)
  const { send: sendPreferences } = useBroadcast("user-preferences");
  const { send: sendActivity } = useBroadcast("admin-activity");

  // 🎯 Enhanced handlers con sync
  const handleSearchEnhanced = useCallback(() => {
    // 🎨 Evento local para UI
    handleSearch();

    // 🚀 Sync actividad a otras pestañas
    sendActivity("SEARCH_PERFORMED", {
      timestamp: Date.now(),
      userId: user.id,
    });
  }, [handleSearch, sendActivity, user.id]);

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(!sidebarOpen);

    // 🚀 Sincronizar preferencia
    sendPreferences("SIDEBAR_TOGGLED", {
      collapsed: !sidebarOpen,
      userId: user.id,
    });
  }, [sidebarOpen, sendPreferences, user.id]);

  // 🎯 Listen to preferences from other tabs
  const { listen: listenPreferences } = useBroadcast("user-preferences");

  useEffect(() => {
    return listenPreferences((type, data) => {
      if (type === "SIDEBAR_TOGGLED" && data.userId === user.id) {
        setSidebarOpen(!data.collapsed);
      }
    });
  }, [listenPreferences, user.id]);

  return {
    handleSearchEnhanced,
    handleNotifications,
    handleSidebarToggle,
  };
};
```

---

## 📊 **Matriz de Decisión**

### **🎯 Flow Chart de Decisión:**

```
¿Necesitas comunicación entre componentes?
              │
              ▼
    ┌─────────────────────────┐
    │ ¿Es en la misma pestaña? │
    └─────────┬───────────────┘
              │
         ┌────▼────┐
      Sí │         │ No
         ▼         ▼
    ┌─────────┐ ┌─────────────┐
    │CustomEvent│ │BroadcastChannel│
    └─────────┘ └─────────────┘
         │              │
         ▼              ▼
  ┌─────────────┐ ┌─────────────────┐
  │• UI Actions │ │• Auth Sync      │
  │• Analytics  │ │• Data Sharing   │
  │• Game Events│ │• Preferences    │
  │• Performance│ │• Notifications  │
  └─────────────┘ └─────────────────┘
```

### **📋 Checklist de Decisión:**

**Usa CustomEvent si:**

- [ ] Necesitas **reacción inmediata** (< 1ms)
- [ ] Es **comunicación interna** (misma pestaña)
- [ ] Requieres **múltiples listeners** para un evento
- [ ] Es **crítico para performance**
- [ ] Necesitas **desacoplamiento** sin overhead

**Usa BroadcastChannel si:**

- [ ] Necesitas **sincronización** entre pestañas
- [ ] Es **estado compartido** importante
- [ ] Los usuarios tienen **múltiples pestañas** abiertas
- [ ] Requieres **persistencia** del canal
- [ ] Es **colaboración** en tiempo real

---

## 🛠️ **Mejores Prácticas**

### **🎯 CustomEvent Best Practices**

#### **✅ DO - Hacer:**

```typescript
// ✅ Nombres descriptivos con namespacing
const event = new CustomEvent("admin-search-modal-open", {
  detail: { source: "header", user: user.email },
});

// ✅ Siempre incluir cleanup
useEffect(() => {
  const handler = (e) => handleEvent(e.detail);
  window.addEventListener("my-event", handler);

  return () => {
    window.removeEventListener("my-event", handler); // 👈 CRÍTICO
  };
}, []);

// ✅ Type safety con TypeScript
interface SearchEventDetail {
  source: string;
  user: string;
  currentPath: string;
}

const event: CustomEvent<SearchEventDetail> = new CustomEvent("admin-search", {
  detail: { source: "header", user: user.email, currentPath },
});

// ✅ Error handling
const dispatchSafeEvent = (eventName: string, detail: any) => {
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  } catch (error) {
    console.error(`Failed to dispatch event ${eventName}:`, error);
  }
};
```

#### **❌ DON'T - Evitar:**

```typescript
// ❌ Nombres genéricos
new CustomEvent("click", { detail: data });

// ❌ Sin cleanup (MEMORY LEAK)
useEffect(() => {
  window.addEventListener("event", handler);
  // Sin return cleanup = MEMORY LEAK
}, []);

// ❌ Datos sensibles en detail
new CustomEvent("user-action", {
  detail: { password: "123456", token: "secret" }, // 👈 NUNCA
});

// ❌ Eventos excesivos
for (let i = 0; i < 1000; i++) {
  window.dispatchEvent(new CustomEvent("spam-event")); // 👈 Performance killer
}
```

### **📻 BroadcastChannel Best Practices**

#### **✅ DO - Hacer:**

```typescript
// ✅ Hook reutilizable con cleanup automático
export const useBroadcast = (channelName: string) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(channelName);
    }
    return () => channelRef.current?.close(); // 👈 Auto cleanup
  }, [channelName]);

  return { send, listen };
};

// ✅ Structured message format
const sendMessage = (type: string, data: any) => {
  channel.postMessage({
    type,
    data,
    timestamp: Date.now(),
    source: "admin-panel",
    version: "1.0",
  });
};

// ✅ Feature detection
const useBroadcastSafe = (channelName: string) => {
  const isSupported = "BroadcastChannel" in window;

  return {
    send: isSupported ? send : () => {}, // Fallback
    listen: isSupported ? listen : () => () => {}, // Fallback
    isSupported,
  };
};
```

#### **❌ DON'T - Evitar:**

```typescript
// ❌ Sin feature detection
const channel = new BroadcastChannel("test"); // Puede fallar en iOS

// ❌ Sin cleanup
const channel = new BroadcastChannel("test");
// Sin channel.close() = MEMORY LEAK

// ❌ Mensajes masivos
setInterval(() => {
  channel.postMessage({ ping: Date.now() }); // 👈 Spam cross-tab
}, 10); // Cada 10ms = Performance killer

// ❌ Datos grandes
channel.postMessage({
  largeData: new Array(1000000).fill("data"), // 👈 Puede causar lag
});
```

### **🔒 Security Considerations**

```typescript
// ✅ Validate message origin
channel.addEventListener("message", (event) => {
  // Validate message structure
  if (!event.data.type || typeof event.data.type !== "string") {
    console.warn("Invalid message received:", event.data);
    return;
  }

  // Validate expected types
  const allowedTypes = ["USER_LOGIN", "USER_LOGOUT", "PREFERENCES_UPDATE"];
  if (!allowedTypes.includes(event.data.type)) {
    console.warn("Unexpected message type:", event.data.type);
    return;
  }

  handleMessage(event.data);
});

// ✅ Sanitize data
const sanitizeData = (data: any) => {
  // Remove sensitive fields
  const { password, token, ...safeData } = data;
  return safeData;
};
```

---

## 🔗 **Referencias**

### **📚 Documentación Oficial:**

- [CustomEvent - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [BroadcastChannel - MDN](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [Event Handling - React Docs](https://react.dev/learn/responding-to-events)

### **🛠️ Archivos del Proyecto:**

- `src/shared/ui/layouts/hooks/useAdminLayoutNavigation.ts` - CustomEvent implementation
- `src/shared/hooks/useBroadcast.ts` - BroadcastChannel hook
- `src/shared/utils/eventListeners.ts` - Event listeners setup
- `src/shared/ui/layouts/AdminLayout.tsx` - Usage example

### **🎯 Patrones Relacionados:**

- Observer Pattern
- Event-Driven Architecture
- Pub/Sub Pattern
- Cross-Tab Communication

---

## 📝 **Notas de Implementación**

### **📊 Performance Metrics:**

| **Operación**       | **CustomEvent** | **BroadcastChannel**  |
| ------------------- | --------------- | --------------------- |
| **Setup Time**      | ~0.1ms          | ~1-2ms                |
| **Message Send**    | ~0.05ms         | ~0.5-1ms              |
| **Memory Usage**    | ~50 bytes/event | ~1KB/channel          |
| **Browser Support** | 99%+            | 95%+ (sin iOS Safari) |

### **🔄 Migration Path:**

```typescript
// Fase 1: CustomEvent only (actual)
const { handleSearch } = useAdminLayoutNavigation();

// Fase 2: Hybrid approach (futuro)
const useAdminLayoutV2 = () => {
  // Keep existing CustomEvent for UI
  const { handleSearch } = useAdminLayoutNavigation();

  // Add BroadcastChannel for cross-tab
  const { send } = useBroadcast("admin-sync");

  const handleSearchEnhanced = () => {
    handleSearch(); // UI reaction
    send("SEARCH", { query, timestamp: Date.now() }); // Cross-tab sync
  };

  return { handleSearchEnhanced };
};
```

---

**📅 Última actualización:** 18 de Enero, 2025  
**👨‍💻 Mantenido por:** Equipo de Frontend  
**📋 Estado:** ✅ Completo y funcional
