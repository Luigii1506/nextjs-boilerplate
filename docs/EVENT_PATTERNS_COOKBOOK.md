# 🍳 **EVENT PATTERNS COOKBOOK**

> **Recetas prácticas para CustomEvent y BroadcastChannel**

## 📋 **TABLA DE CONTENIDOS**

1. [🎯 Quick Reference](#-quick-reference)
2. [📡 CustomEvent Recipes](#-customevent-recipes)
3. [📻 BroadcastChannel Recipes](#-broadcastchannel-recipes)
4. [🔄 Hybrid Patterns](#-hybrid-patterns)
5. [🛠️ Utilities & Helpers](#️-utilities--helpers)
6. [🚨 Common Pitfalls](#-common-pitfalls)
7. [💡 Pro Tips](#-pro-tips)

---

## 🎯 **Quick Reference**

### **🔍 Decision Matrix**

```
¿Qué necesitas hacer?
├─ 🎨 UI Interaction → CustomEvent
├─ 📊 Analytics → CustomEvent
├─ 🎮 Game Events → CustomEvent
├─ 🔐 Auth Sync → BroadcastChannel
├─ 🛒 Cart Sync → BroadcastChannel
├─ 🎵 Media Control → BroadcastChannel
└─ 🔔 Notifications → Hybrid (ambos)
```

### **⚡ Quick Syntax**

```typescript
// 📡 CustomEvent - Same tab
window.dispatchEvent(new CustomEvent("my-event", { detail: data }));
window.addEventListener("my-event", handler);

// 📻 BroadcastChannel - Cross tabs
const { send, listen } = useBroadcast("my-channel");
send("MESSAGE_TYPE", data);
listen((type, data) => {
  /* handle */
});
```

---

## 📡 **CustomEvent Recipes**

### **🎯 Recipe 1: Modal System**

```typescript
// 🚀 MODAL SYSTEM - Event-Driven

// 1. Modal Hook
export const useModalSystem = () => {
  const openModal = useCallback((modalId: string, data?: any) => {
    window.dispatchEvent(
      new CustomEvent("modal-open", {
        detail: { modalId, data, timestamp: Date.now() },
      })
    );
  }, []);

  const closeModal = useCallback((modalId: string, result?: any) => {
    window.dispatchEvent(
      new CustomEvent("modal-close", {
        detail: { modalId, result, timestamp: Date.now() },
      })
    );
  }, []);

  return { openModal, closeModal };
};

// 2. Modal Manager Component
export const ModalManager = () => {
  const [modals, setModals] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const handleModalOpen = (e: CustomEvent) => {
      const { modalId, data } = e.detail;
      setModals((prev) => new Map(prev).set(modalId, { data, isOpen: true }));
    };

    const handleModalClose = (e: CustomEvent) => {
      const { modalId, result } = e.detail;
      setModals((prev) => {
        const newMap = new Map(prev);
        newMap.delete(modalId);
        return newMap;
      });

      // Dispatch result for other listeners
      window.dispatchEvent(
        new CustomEvent(`modal-result-${modalId}`, {
          detail: { result },
        })
      );
    };

    window.addEventListener("modal-open", handleModalOpen);
    window.addEventListener("modal-close", handleModalClose);

    return () => {
      window.removeEventListener("modal-open", handleModalOpen);
      window.removeEventListener("modal-close", handleModalClose);
    };
  }, []);

  return (
    <>
      {Array.from(modals.entries()).map(([modalId, config]) => (
        <Modal key={modalId} id={modalId} {...config} />
      ))}
    </>
  );
};

// 3. Usage Example
const UserProfile = () => {
  const { openModal, closeModal } = useModalSystem();

  const handleEditProfile = () => {
    openModal("edit-profile", { userId: user.id });
  };

  // Listen for modal result
  useEffect(() => {
    const handleProfileUpdated = (e: CustomEvent) => {
      const { result } = e.detail;
      if (result.success) {
        toast.success("Profile updated!");
        refreshUserData();
      }
    };

    window.addEventListener("modal-result-edit-profile", handleProfileUpdated);
    return () => {
      window.removeEventListener(
        "modal-result-edit-profile",
        handleProfileUpdated
      );
    };
  }, []);

  return <button onClick={handleEditProfile}>Edit Profile</button>;
};
```

### **🎯 Recipe 2: Global Search System**

```typescript
// 🔍 GLOBAL SEARCH - Command Palette Style

// 1. Search Hook
export const useGlobalSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const triggerSearch = useCallback((query: string, filters?: any) => {
    window.dispatchEvent(
      new CustomEvent("global-search", {
        detail: { query, filters, timestamp: Date.now() },
      })
    );
  }, []);

  const selectResult = useCallback((result: any, source: string) => {
    window.dispatchEvent(
      new CustomEvent("search-result-selected", {
        detail: { result, source, timestamp: Date.now() },
      })
    );
  }, []);

  // Listen to search events
  useEffect(() => {
    const handleSearch = async (e: CustomEvent) => {
      const { query, filters } = e.detail;
      setIsLoading(true);

      try {
        // Parallel search across multiple sources
        const [users, documents, settings] = await Promise.all([
          searchUsers(query, filters),
          searchDocuments(query, filters),
          searchSettings(query, filters),
        ]);

        const results = [
          ...users.map((u) => ({ ...u, type: "user" })),
          ...documents.map((d) => ({ ...d, type: "document" })),
          ...settings.map((s) => ({ ...s, type: "setting" })),
        ];

        setSearchResults(results);

        // Analytics tracking
        window.dispatchEvent(
          new CustomEvent("analytics-track", {
            detail: {
              event: "search_performed",
              query,
              resultCount: results.length,
            },
          })
        );
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener("global-search", handleSearch);
    return () => window.removeEventListener("global-search", handleSearch);
  }, []);

  return { triggerSearch, selectResult, searchResults, isLoading };
};

// 2. Search Modal Component
export const GlobalSearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { triggerSearch, selectResult, searchResults, isLoading } =
    useGlobalSearch();

  // Open with Cmd+K (like our AdminLayout)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length > 2) {
      const timer = setTimeout(() => triggerSearch(query), 300);
      return () => clearTimeout(timer);
    }
  }, [query, triggerSearch]);

  const handleResultClick = (result: any) => {
    selectResult(result, "modal");
    setIsOpen(false);

    // Navigate based on result type
    switch (result.type) {
      case "user":
        window.location.href = `/admin/users/${result.id}`;
        break;
      case "document":
        window.location.href = `/admin/documents/${result.id}`;
        break;
      case "setting":
        window.location.href = `/admin/settings#${result.section}`;
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, documents, settings..."
          className="w-full p-4 border-0 rounded-t-xl"
          autoFocus
        />

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">Searching...</div>
          ) : (
            searchResults.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <div className="font-medium">{result.title}</div>
                <div className="text-sm text-gray-500">{result.type}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
```

### **🎯 Recipe 3: Toast Notification System**

```typescript
// 🍞 TOAST SYSTEM - Multiple Sources, Single Display

// 1. Toast Types
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
  persistent?: boolean;
}

// 2. Toast Hook
export const useToastSystem = () => {
  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const toastWithId = { ...toast, id: generateId() };
    window.dispatchEvent(new CustomEvent("toast-show", {
      detail: toastWithId
    }));
    return toastWithId.id;
  }, []);

  const hideToast = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent("toast-hide", {
      detail: { id }
    }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, options?: Partial<Toast>) => {
    return showToast({ type: 'success', message, ...options });
  }, [showToast]);

  const showError = useCallback((message: string, options?: Partial<Toast>) => {
    return showToast({ type: 'error', message, persistent: true, ...options });
  }, [showToast]);

  return { showToast, hideToast, showSuccess, showError };
};

// 3. Toast Manager Component
export const ToastManager = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleShowToast = (e: CustomEvent) => {
      const toast = e.detail as Toast;
      setToasts(prev => [...prev, toast]);

      // Auto-hide non-persistent toasts
      if (!toast.persistent) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration || 5000);
      }
    };

    const handleHideToast = (e: CustomEvent) => {
      const { id } = e.detail;
      setToasts(prev => prev.filter(t => t.id !== id));
    };

    window.addEventListener("toast-show", handleShowToast);
    window.addEventListener("toast-hide", handleHideToast);

    return () => {
      window.removeEventListener("toast-show", handleShowToast);
      window.removeEventListener("toast-hide", handleHideToast);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// 4. Usage in Components
const FileUpload = () => {
  const { showSuccess, showError } = useToastSystem();

  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
      showSuccess(`${file.name} uploaded successfully!`, {
        action: { label: 'View', onClick: () => navigate('/files') }
      });
    } catch (error) {
      showError(`Failed to upload ${file.name}`, { persistent: true });
    }
  };

  return (/* JSX */);
};
```

---

## 📻 **BroadcastChannel Recipes**

### **🎯 Recipe 1: Shopping Cart Sync**

```typescript
// 🛒 SHOPPING CART - Cross-tab Synchronization

// 1. Cart Hook with BroadcastChannel
export const useShoppingCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { send, listen } = useBroadcast("shopping-cart");

  // Cart operations
  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
      setIsLoading(true);
      try {
        const newItem = { id: product.id, product, quantity };
        const updatedCart = [...cart, newItem];

        // Update local state
        setCart(updatedCart);

        // Sync to server
        await updateCartOnServer(updatedCart);

        // Broadcast to other tabs
        send("CART_UPDATED", {
          action: "add",
          item: newItem,
          cart: updatedCart,
          timestamp: Date.now(),
        });

        // Track analytics
        window.dispatchEvent(
          new CustomEvent("analytics-track", {
            detail: { event: "add_to_cart", product_id: product.id, quantity },
          })
        );
      } catch (error) {
        console.error("Failed to add to cart:", error);
        // Revert optimistic update
        setCart(cart);
      } finally {
        setIsLoading(false);
      }
    },
    [cart, send]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      const updatedCart = cart.filter((item) => item.id !== itemId);
      setCart(updatedCart);

      try {
        await updateCartOnServer(updatedCart);
        send("CART_UPDATED", {
          action: "remove",
          itemId,
          cart: updatedCart,
          timestamp: Date.now(),
        });
      } catch (error) {
        // Revert on failure
        setCart(cart);
      }
    },
    [cart, send]
  );

  const clearCart = useCallback(async () => {
    const emptyCart: CartItem[] = [];
    setCart(emptyCart);

    try {
      await updateCartOnServer(emptyCart);
      send("CART_UPDATED", {
        action: "clear",
        cart: emptyCart,
        timestamp: Date.now(),
      });
    } catch (error) {
      setCart(cart);
    }
  }, [cart, send]);

  // Listen for updates from other tabs
  useEffect(() => {
    return listen((type, data) => {
      if (type === "CART_UPDATED") {
        const { cart: updatedCart, action, item } = data;
        setCart(updatedCart);

        // Show notification for changes from other tabs
        if (action === "add" && item) {
          window.dispatchEvent(
            new CustomEvent("toast-show", {
              detail: {
                type: "info",
                message: `${item.product.name} added to cart in another tab`,
                duration: 3000,
              },
            })
          );
        }
      }
    });
  }, [listen]);

  // Calculate totals
  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    cartTotal,
    itemCount,
    isLoading,
    addToCart,
    removeFromCart,
    clearCart,
  };
};

// 2. Cart Indicator Component
export const CartIndicator = () => {
  const { itemCount, cartTotal } = useShoppingCart();

  return (
    <div className="relative">
      <ShoppingCartIcon className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
      <span className="ml-2">${cartTotal.toFixed(2)}</span>
    </div>
  );
};

// 3. Cart Page Component
export const CartPage = () => {
  const { cart, removeFromCart, clearCart, isLoading } = useShoppingCart();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Shopping Cart</h1>
        <button
          onClick={clearCart}
          disabled={cart.length === 0 || isLoading}
          className="btn btn-outline"
        >
          Clear Cart
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <CartItem key={item.id} item={item} onRemove={removeFromCart} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### **🎯 Recipe 2: Real-time Notifications**

```typescript
// 🔔 REAL-TIME NOTIFICATIONS - Cross-tab + Server Events

// 1. Notification Hook
export const useNotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { send, listen } = useBroadcast("notifications");

  // Send notification to all tabs
  const broadcastNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const notificationWithId = {
        ...notification,
        id: generateId(),
        timestamp: Date.now(),
        read: false,
      };

      // Add to local state
      setNotifications((prev) => [notificationWithId, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Broadcast to other tabs
      send("NEW_NOTIFICATION", notificationWithId);

      // Store in localStorage for persistence
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const updated = [notificationWithId, ...stored].slice(0, 100); // Keep last 100
      localStorage.setItem("notifications", JSON.stringify(updated));

      return notificationWithId.id;
    },
    [send]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Sync to other tabs
      send("NOTIFICATION_READ", { id });

      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
      const updated = stored.map((n: Notification) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem("notifications", JSON.stringify(updated));
    },
    [send]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    send("ALL_NOTIFICATIONS_READ", {});

    const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updated = stored.map((n: Notification) => ({ ...n, read: true }));
    localStorage.setItem("notifications", JSON.stringify(updated));
  }, [send]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);

    send("NOTIFICATIONS_CLEARED", {});
    localStorage.removeItem("notifications");
  }, [send]);

  // Listen for events from other tabs
  useEffect(() => {
    return listen((type, data) => {
      switch (type) {
        case "NEW_NOTIFICATION":
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show toast only if this tab is active
          if (document.visibilityState === "visible") {
            window.dispatchEvent(
              new CustomEvent("toast-show", {
                detail: {
                  type: data.type || "info",
                  message: data.message,
                  duration: 5000,
                },
              })
            );
          }
          break;

        case "NOTIFICATION_READ":
          setNotifications((prev) =>
            prev.map((n) => (n.id === data.id ? { ...n, read: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          break;

        case "ALL_NOTIFICATIONS_READ":
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadCount(0);
          break;

        case "NOTIFICATIONS_CLEARED":
          setNotifications([]);
          setUnreadCount(0);
          break;
      }
    });
  }, [listen]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
    setNotifications(stored);
    setUnreadCount(stored.filter((n: Notification) => !n.read).length);
  }, []);

  // Connect to server-sent events for real-time notifications
  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      broadcastNotification(notification);
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [broadcastNotification]);

  return {
    notifications,
    unreadCount,
    broadcastNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};

// 2. Notification Badge Component (for header)
export const NotificationBadge = () => {
  const { unreadCount } = useNotificationSystem();

  return (
    <div className="relative">
      <BellIcon className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
};

// 3. Notification Panel
export const NotificationPanel = ({ isOpen, onClose }: Props) => {
  const { notifications, markAsRead, markAllAsRead, clearAll } =
    useNotificationSystem();

  return (
    <div className={`notification-panel ${isOpen ? "open" : ""}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h3>Notifications</h3>
        <div className="space-x-2">
          <button onClick={markAllAsRead} className="btn btn-sm">
            Mark all read
          </button>
          <button onClick={clearAll} className="btn btn-sm">
            Clear all
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                !notification.read ? "bg-blue-50" : ""
              }`}
            >
              <div className="font-medium">{notification.title}</div>
              <div className="text-sm text-gray-600">
                {notification.message}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(notification.timestamp)} ago
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

---

## 🔄 **Hybrid Patterns**

### **🎯 Pattern 1: Progressive Sync System**

```typescript
// 🔄 PROGRESSIVE SYNC - Local → Cross-tab → Server

export const useProgressiveSync = <T>(key: string, initialData: T) => {
  const [data, setData] = useState<T>(initialData);
  const [syncStatus, setSyncStatus] = useState<'local' | 'syncing' | 'synced'>('local');
  const { send, listen } = useBroadcast(`sync-${key}`);

  const updateData = useCallback(async (newData: T | ((prev: T) => T)) => {
    // 1. Update local state immediately (optimistic)
    const updatedData = typeof newData === 'function'
      ? (newData as (prev: T) => T)(data)
      : newData;

    setData(updatedData);
    setSyncStatus('local');

    // 2. CustomEvent for immediate UI updates
    window.dispatchEvent(new CustomEvent(`data-updated-${key}`, {
      detail: { data: updatedData, source: 'local' }
    }));

    // 3. BroadcastChannel for cross-tab sync
    send("DATA_UPDATED", { data: updatedData, timestamp: Date.now() });

    // 4. Debounced server sync
    setSyncStatus('syncing');
    try {
      await debouncedServerSync(key, updatedData);
      setSyncStatus('synced');

      // Confirm sync across tabs
      send("DATA_SYNCED", { data: updatedData, timestamp: Date.now() });
    } catch (error) {
      setSyncStatus('local');
      console.error("Server sync failed:", error);
    }
  }, [data, key, send]);

  // Listen for updates from other tabs
  useEffect(() => {
    return listen((type, payload) => {
      if (type === "DATA_UPDATED") {
        setData(payload.data);
        setSyncStatus('local');

        // Local CustomEvent for UI updates
        window.dispatchEvent(new CustomEvent(`data-updated-${key}`, {
          detail: { data: payload.data, source: 'remote' }
        }));
      } else if (type === "DATA_SYNCED") {
        setSyncStatus('synced');
      }
    });
  }, [listen, key]);

  return { data, updateData, syncStatus };
};

// Usage Example
const UserPreferences = () => {
  const { data: preferences, updateData, syncStatus } = useProgressiveSync('user-preferences', {
    theme: 'light',
    language: 'en',
    sidebarCollapsed: false
  });

  const toggleTheme = () => {
    updateData(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  // Listen for UI updates
  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      const { data, source } = e.detail;
      if (source === 'remote') {
        toast.info("Preferences updated from another tab");
      }
    };

    window.addEventListener("data-updated-user-preferences", handleUpdate);
    return () => window.removeEventListener("data-updated-user-preferences", handleUpdate);
  }, []);

  return (
    <div>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <div className="sync-status">
        Status: {syncStatus}
        {syncStatus === 'syncing' && <Spinner />}
      </div>
    </div>
  );
};
```

### **🎯 Pattern 2: Event Orchestration**

```typescript
// 🎭 EVENT ORCHESTRATION - Complex workflows

export const useEventOrchestrator = () => {
  const { send: broadcast } = useBroadcast("orchestration");

  const orchestrateUserAction = useCallback(
    async (action: string, data: any) => {
      const orchestrationId = generateId();
      const steps = getWorkflowSteps(action);

      // 1. Announce workflow start
      window.dispatchEvent(
        new CustomEvent("workflow-started", {
          detail: { orchestrationId, action, steps: steps.length },
        })
      );

      broadcast("WORKFLOW_STARTED", {
        orchestrationId,
        action,
        userId: data.userId,
      });

      // 2. Execute steps sequentially
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        try {
          // Local step start
          window.dispatchEvent(
            new CustomEvent("workflow-step", {
              detail: {
                orchestrationId,
                step: i + 1,
                name: step.name,
                status: "started",
              },
            })
          );

          // Execute step
          const result = await step.execute(data);

          // Step completed
          window.dispatchEvent(
            new CustomEvent("workflow-step", {
              detail: {
                orchestrationId,
                step: i + 1,
                name: step.name,
                status: "completed",
                result,
              },
            })
          );

          // Broadcast step completion for monitoring
          if (step.broadcastCompletion) {
            broadcast("WORKFLOW_STEP_COMPLETED", {
              orchestrationId,
              step: i + 1,
              name: step.name,
              result,
            });
          }

          data = { ...data, ...result }; // Pass result to next step
        } catch (error) {
          // Step failed
          window.dispatchEvent(
            new CustomEvent("workflow-step", {
              detail: {
                orchestrationId,
                step: i + 1,
                name: step.name,
                status: "failed",
                error,
              },
            })
          );

          broadcast("WORKFLOW_FAILED", {
            orchestrationId,
            failedStep: i + 1,
            error: error.message,
          });

          throw error;
        }
      }

      // 3. Workflow completed
      window.dispatchEvent(
        new CustomEvent("workflow-completed", {
          detail: { orchestrationId, action, data },
        })
      );

      broadcast("WORKFLOW_COMPLETED", {
        orchestrationId,
        action,
        finalData: data,
      });

      return data;
    },
    [broadcast]
  );

  return { orchestrateUserAction };
};

// Example workflow steps
const getWorkflowSteps = (action: string) => {
  switch (action) {
    case "user-registration":
      return [
        {
          name: "validate-email",
          execute: async (data) => await validateEmail(data.email),
          broadcastCompletion: false,
        },
        {
          name: "create-user",
          execute: async (data) => await createUser(data),
          broadcastCompletion: true,
        },
        {
          name: "send-welcome-email",
          execute: async (data) => await sendWelcomeEmail(data.user),
          broadcastCompletion: false,
        },
        {
          name: "setup-default-preferences",
          execute: async (data) => await setupUserPreferences(data.user.id),
          broadcastCompletion: true,
        },
      ];
    default:
      return [];
  }
};

// Workflow Monitor Component
export const WorkflowMonitor = () => {
  const [activeWorkflows, setActiveWorkflows] = useState<Map<string, any>>(
    new Map()
  );

  useEffect(() => {
    const handleWorkflowStart = (e: CustomEvent) => {
      const { orchestrationId, action, steps } = e.detail;
      setActiveWorkflows((prev) =>
        new Map(prev).set(orchestrationId, {
          action,
          totalSteps: steps,
          currentStep: 0,
          status: "running",
        })
      );
    };

    const handleWorkflowStep = (e: CustomEvent) => {
      const { orchestrationId, step, status } = e.detail;
      setActiveWorkflows((prev) => {
        const workflow = prev.get(orchestrationId);
        if (workflow) {
          return new Map(prev).set(orchestrationId, {
            ...workflow,
            currentStep: step,
            lastStepStatus: status,
          });
        }
        return prev;
      });
    };

    const handleWorkflowComplete = (e: CustomEvent) => {
      const { orchestrationId } = e.detail;
      setTimeout(() => {
        setActiveWorkflows((prev) => {
          const newMap = new Map(prev);
          newMap.delete(orchestrationId);
          return newMap;
        });
      }, 3000); // Keep for 3 seconds after completion
    };

    window.addEventListener("workflow-started", handleWorkflowStart);
    window.addEventListener("workflow-step", handleWorkflowStep);
    window.addEventListener("workflow-completed", handleWorkflowComplete);

    return () => {
      window.removeEventListener("workflow-started", handleWorkflowStart);
      window.removeEventListener("workflow-step", handleWorkflowStep);
      window.removeEventListener("workflow-completed", handleWorkflowComplete);
    };
  }, []);

  return (
    <div className="workflow-monitor">
      {Array.from(activeWorkflows.entries()).map(([id, workflow]) => (
        <div key={id} className="workflow-item">
          <div>{workflow.action}</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(workflow.currentStep / workflow.totalSteps) * 100}%`,
              }}
            />
          </div>
          <div>
            {workflow.currentStep}/{workflow.totalSteps}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 🛠️ **Utilities & Helpers**

### **🎯 Type-Safe Event System**

```typescript
// 📝 TYPE-SAFE EVENTS

// Define all your events in one place
interface CustomEventMap {
  "user-login": { userId: string; timestamp: number };
  "user-logout": { userId: string; reason: string };
  "cart-updated": { items: CartItem[]; total: number };
  "modal-open": { modalId: string; data?: any };
  "modal-close": { modalId: string; result?: any };
  "search-performed": { query: string; filters: any; results: number };
  "theme-changed": { theme: "light" | "dark"; source: string };
}

// Type-safe CustomEvent creator
export const createTypedEvent = <K extends keyof CustomEventMap>(
  type: K,
  detail: CustomEventMap[K]
): CustomEvent<CustomEventMap[K]> => {
  return new CustomEvent(type, { detail });
};

// Type-safe event dispatcher
export const dispatchTypedEvent = <K extends keyof CustomEventMap>(
  type: K,
  detail: CustomEventMap[K]
): boolean => {
  return window.dispatchEvent(createTypedEvent(type, detail));
};

// Type-safe event listener hook
export const useTypedEventListener = <K extends keyof CustomEventMap>(
  type: K,
  handler: (detail: CustomEventMap[K]) => void,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const eventHandler = (e: CustomEvent<CustomEventMap[K]>) => {
      handler(e.detail);
    };

    window.addEventListener(type, eventHandler as EventListener);
    return () => {
      window.removeEventListener(type, eventHandler as EventListener);
    };
  }, deps);
};

// Usage Example
const LoginComponent = () => {
  const handleLogin = async (credentials: LoginCredentials) => {
    const user = await loginUser(credentials);

    // Type-safe event dispatch
    dispatchTypedEvent("user-login", {
      userId: user.id,
      timestamp: Date.now()
    });
  };

  // Type-safe event listener
  useTypedEventListener("user-logout", (detail) => {
    console.log(`User ${detail.userId} logged out: ${detail.reason}`);
    // Detail is fully typed!
  });

  return (/* JSX */);
};
```

### **🎯 Event Debugging Utilities**

```typescript
// 🐛 EVENT DEBUGGING

// Event logger for development
export const createEventLogger = (prefix = "EVENT") => {
  if (process.env.NODE_ENV !== "development") {
    return { log: () => {}, clear: () => {}, getHistory: () => [] };
  }

  const eventHistory: Array<{
    timestamp: number;
    type: string;
    detail: any;
    source: "CustomEvent" | "BroadcastChannel";
  }> = [];

  const log = (
    type: string,
    detail: any,
    source: "CustomEvent" | "BroadcastChannel"
  ) => {
    const entry = {
      timestamp: Date.now(),
      type,
      detail,
      source,
    };

    eventHistory.push(entry);

    // Keep only last 100 events
    if (eventHistory.length > 100) {
      eventHistory.shift();
    }

    console.log(`${prefix} [${source}] ${type}:`, detail);
  };

  const clear = () => {
    eventHistory.length = 0;
    console.log(`${prefix} history cleared`);
  };

  const getHistory = () => [...eventHistory];

  // Make available globally for debugging
  (window as any)[`${prefix.toLowerCase()}Logger`] = {
    log,
    clear,
    getHistory,
    stats: () => {
      const stats = eventHistory.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.table(stats);
    },
  };

  return { log, clear, getHistory };
};

// Auto-attach logger to events
export const attachEventLogger = () => {
  const logger = createEventLogger("EVENT_SYSTEM");

  // Intercept CustomEvent dispatches
  const originalDispatchEvent = window.dispatchEvent;
  window.dispatchEvent = function (event: Event) {
    if (event instanceof CustomEvent) {
      logger.log(event.type, event.detail, "CustomEvent");
    }
    return originalDispatchEvent.call(this, event);
  };

  // Intercept BroadcastChannel messages (more complex)
  const originalBroadcastChannel = window.BroadcastChannel;
  window.BroadcastChannel = class extends originalBroadcastChannel {
    constructor(name: string) {
      super(name);

      const originalPostMessage = this.postMessage;
      this.postMessage = function (message: any) {
        logger.log(
          `[${name}] ${message.type}`,
          message.data,
          "BroadcastChannel"
        );
        return originalPostMessage.call(this, message);
      };

      this.addEventListener("message", (event) => {
        logger.log(
          `[${name}] RECEIVED ${event.data.type}`,
          event.data.data,
          "BroadcastChannel"
        );
      });
    }
  };

  return logger;
};

// Performance monitor
export const createPerformanceMonitor = () => {
  const metrics = new Map<
    string,
    {
      count: number;
      totalTime: number;
      avgTime: number;
      maxTime: number;
      minTime: number;
    }
  >();

  const measureEvent = <T>(eventType: string, fn: () => T): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    const current = metrics.get(eventType) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      minTime: Infinity,
    };

    const updated = {
      count: current.count + 1,
      totalTime: current.totalTime + duration,
      avgTime: (current.totalTime + duration) / (current.count + 1),
      maxTime: Math.max(current.maxTime, duration),
      minTime: Math.min(current.minTime, duration),
    };

    metrics.set(eventType, updated);

    if (duration > 16) {
      // Flag slow events (> 16ms = 1 frame)
      console.warn(
        `Slow event detected: ${eventType} took ${duration.toFixed(2)}ms`
      );
    }

    return result;
  };

  const getMetrics = () => Object.fromEntries(metrics);
  const clearMetrics = () => metrics.clear();

  (window as any).eventPerformance = { getMetrics, clearMetrics };

  return { measureEvent, getMetrics, clearMetrics };
};
```

---

## 🚨 **Common Pitfalls**

### **❌ Memory Leaks**

```typescript
// ❌ BAD: No cleanup
useEffect(() => {
  window.addEventListener("my-event", handler);
  // Missing cleanup = MEMORY LEAK
}, []);

// ✅ GOOD: Always cleanup
useEffect(() => {
  window.addEventListener("my-event", handler);
  return () => window.removeEventListener("my-event", handler);
}, []);

// ❌ BAD: BroadcastChannel not closed
const useNotifications = () => {
  const channel = new BroadcastChannel("notifications");
  // Channel never closed = MEMORY LEAK
};

// ✅ GOOD: Proper cleanup
const useNotifications = () => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel("notifications");
    return () => channelRef.current?.close();
  }, []);
};
```

### **❌ Event Storms**

```typescript
// ❌ BAD: Rapid fire events
const handleMouseMove = (e: MouseEvent) => {
  window.dispatchEvent(
    new CustomEvent("mouse-moved", {
      detail: { x: e.clientX, y: e.clientY },
    })
  );
}; // This will fire hundreds of times per second!

// ✅ GOOD: Throttled events
const handleMouseMove = throttle((e: MouseEvent) => {
  window.dispatchEvent(
    new CustomEvent("mouse-moved", {
      detail: { x: e.clientX, y: e.clientY },
    })
  );
}, 16); // Max 60fps

// ❌ BAD: Nested event triggering
window.addEventListener("user-action", () => {
  window.dispatchEvent(new CustomEvent("another-action")); // Can cause loops!
});

// ✅ GOOD: Use setTimeout to break cycles
window.addEventListener("user-action", () => {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("another-action"));
  }, 0);
});
```

### **❌ Data Race Conditions**

```typescript
// ❌ BAD: Race condition with async operations
const handleSave = async () => {
  const data = getCurrentData();
  await saveToServer(data);

  // Data might have changed while saving!
  window.dispatchEvent(new CustomEvent("data-saved", { detail: data }));
};

// ✅ GOOD: Capture data at call time
const handleSave = async () => {
  const capturedData = getCurrentData();
  const result = await saveToServer(capturedData);

  window.dispatchEvent(
    new CustomEvent("data-saved", {
      detail: { original: capturedData, saved: result },
    })
  );
};
```

---

## 💡 **Pro Tips**

### **🎯 Event Naming Convention**

```typescript
// ✅ GOOD: Descriptive, hierarchical names
"user-profile-updated";
"shopping-cart-item-added";
"modal-confirmation-closed";
"search-results-filtered";
"admin-user-role-changed";

// ❌ BAD: Generic, unclear names
"update";
"change";
"click";
"action";
```

### **🎯 Event Data Structure**

```typescript
// ✅ GOOD: Consistent, rich event data
interface EventDetail {
  // Who triggered it
  source: string;
  userId?: string;

  // What happened
  action: string;
  target: string;

  // When it happened
  timestamp: number;

  // Context data
  data: any;

  // For debugging
  version: string;
}

const createStandardEvent = (type: string, detail: Partial<EventDetail>) => {
  return new CustomEvent(type, {
    detail: {
      source: "unknown",
      action: type,
      target: "window",
      timestamp: Date.now(),
      version: "1.0",
      ...detail,
    },
  });
};
```

### **🎯 Feature Detection**

```typescript
// ✅ GOOD: Always check for feature support
const useBroadcastSafe = (channelName: string) => {
  const isSupported = "BroadcastChannel" in window;

  const send = useCallback(
    (type: string, data: any) => {
      if (!isSupported) {
        // Fallback to localStorage events
        localStorage.setItem(
          `fallback-${channelName}`,
          JSON.stringify({ type, data })
        );
        return;
      }

      // Normal BroadcastChannel logic
    },
    [isSupported, channelName]
  );

  return { send, isSupported };
};
```

### **🎯 Development vs Production**

```typescript
// ✅ GOOD: Different behavior for dev/prod
const createEventSystem = () => {
  const isDev = process.env.NODE_ENV === "development";

  const dispatchEvent = (type: string, detail: any) => {
    if (isDev) {
      // Extra logging, validation, performance monitoring
      console.group(`🎯 Event: ${type}`);
      console.log("Detail:", detail);
      console.log("Stack:", new Error().stack);
      console.groupEnd();

      // Validate event structure
      if (!detail || typeof detail !== "object") {
        console.warn(
          `Event ${type} should have object detail, got:`,
          typeof detail
        );
      }
    }

    return window.dispatchEvent(new CustomEvent(type, { detail }));
  };

  return { dispatchEvent };
};
```

---

**🎯 ¿Necesitas más ejemplos o patrones específicos?**  
**📚 Esta guía cubre los casos más comunes, pero hay muchas más posibilidades!**

**📅 Última actualización:** 18 de Enero, 2025  
**🧑‍💻 Creado por:** AI Assistant + Luis Encinas  
**📖 Guía:** Patrones y recetas prácticas para eventos
