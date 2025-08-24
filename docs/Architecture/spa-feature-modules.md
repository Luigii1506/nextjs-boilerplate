# 🚀 **SPA Feature-First Architecture**

## **Arquitectura de Módulos Feature-First como Single Page Applications**

---

## 📋 **Tabla de Contenido**

1. [Visión General](#-visión-general)
2. [Estructura del Módulo SPA](#-estructura-del-módulo-spa)
3. [Componentes Principales](#-componentes-principales)
4. [Sistema de Navegación por Tabs](#-sistema-de-navegación-por-tabs)
5. [Gestión de Estado](#-gestión-de-estado)
6. [Animaciones y Transiciones](#-animaciones-y-transiciones)
7. [Hooks Personalizados](#-hooks-personalizados)
8. [Optimizaciones de Performance](#-optimizaciones-de-performance)
9. [Mejores Prácticas](#-mejores-prácticas)
10. [Guía de Implementación](#-guía-de-implementación)

---

## 🎯 **Visión General**

Esta arquitectura está diseñada para **módulos complejos** que requieren múltiples vistas, funcionalidades avanzadas y una experiencia de usuario fluida. En lugar de navegar entre diferentes páginas, el módulo funciona como una **Single Page Application (SPA)** con navegación interna por tabs.

### **¿Cuándo usar esta arquitectura?**

✅ **Usar para módulos grandes:**
- Inventario Management
- E-commerce Dashboard
- CRM Completo
- Analytics Dashboard
- User Management Avanzado

❌ **No usar para módulos simples:**
- Feature Flags
- Settings básicos
- Audit logs simples

---

## 📁 **Estructura del Módulo SPA**

```
src/features/inventory/
├── 📂 server/                    # Server-side logic (enterprise modules only)
│   ├── service.ts               # Business logic
│   ├── queries.ts               # Database queries
│   ├── validators.ts            # Input validation
│   └── mappers.ts               # Data transformation
├── 📂 ui/                       # Client-side UI components
│   ├── 📂 components/           # Shared components
│   │   └── 📂 shared/
│   │       ├── TabTransition.tsx      # Tab animation system
│   │       ├── TabBadge.tsx           # Interactive tab buttons
│   │       ├── ProductCard.tsx        # Feature-specific components
│   │       └── index.ts               # Barrel exports
│   ├── 📂 context/              # State management
│   │   ├── InventoryContext.tsx       # Main SPA context
│   │   └── index.ts                   # Context exports
│   ├── 📂 hooks/                # Custom hooks
│   │   ├── useScrollHeader.ts         # Scroll behavior
│   │   └── index.ts                   # Hook exports
│   ├── 📂 routes/               # Main SPA container
│   │   └── inventory.screen.tsx       # SPA orchestrator
│   ├── 📂 styles/               # Custom animations
│   │   └── animations.css             # CSS keyframes
│   └── 📂 tabs/                 # Individual tab views
│       ├── OverviewTab.tsx            # Dashboard view
│       ├── ProductsTab.tsx            # Products management
│       └── index.ts                   # Tab exports
├── actions.ts                   # Server actions
├── schemas.ts                   # Zod validation schemas
├── types.ts                     # TypeScript types
└── hooks/                       # Feature-level hooks
    └── useInventoryQuery.ts     # TanStack Query hooks
```

---

## 🧩 **Componentes Principales**

### **1. 🎭 SPA Container (`inventory.screen.tsx`)**

El componente principal que orquesta toda la aplicación SPA:

```typescript
// 🎯 Main SPA Component
const InventoryScreen: React.FC<InventoryScreenProps> = ({ className }) => {
  return (
    <div className={cn("w-full", className)}>
      <InventoryProvider>           {/* Context Provider */}
        <InventorySPAContent />     {/* SPA Content */}
      </InventoryProvider>
    </div>
  );
};

// 🎭 SPA Content Orchestrator
const InventorySPAContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TabNavigation />    {/* Smart Header + Tabs */}
      <main className="flex-1 relative">
        <TabContent />     {/* Dynamic Content */}
      </main>
    </div>
  );
};
```

### **2. 🎯 Tab Navigation (`TabNavigation`)**

Header inteligente con scroll behavior y navegación por tabs:

```typescript
const TabNavigation: React.FC = () => {
  const { activeTab, setActiveTab, inventory, isTabChanging } = useInventoryContext();
  
  // 🚀 Smart scroll header hook
  const { isHeaderVisible, isPastThreshold, scrollY } = useTabScrollHeader();

  return (
    <div className={cn(
      "border-b sticky top-0 z-50 transform-gpu transition-all duration-300",
      isPastThreshold ? "header-backdrop scrolled" : "header-backdrop"
    )}>
      {/* Smart Header - Hides on scroll down, shows on scroll up */}
      <div id="header-tabs" className={cn(
        "transform-gpu transition-all duration-500 ease-out",
        isHeaderVisible 
          ? "header-visible opacity-100 translate-y-0" 
          : "header-hidden opacity-0 -translate-y-full"
      )}>
        <h1>Inventory Management</h1>
        <p>Sistema completo de gestión</p>
      </div>

      {/* Tab Navigation - Always visible */}
      <div className="flex space-x-1 overflow-x-auto">
        {INVENTORY_TABS.map((tab, index) => (
          <TabBadge
            key={tab.id}
            isActive={activeTab === tab.id}
            label={tab.label}
            icon={<IconComponent />}
            onClick={() => setActiveTab(tab.id)}
            hasNotification={notificationCount > 0}
          />
        ))}
      </div>
    </div>
  );
};
```

### **3. 📱 Tab Content Renderer (`TabContent`)**

Renderiza dinámicamente el contenido según el tab activo:

```typescript
const TabContent: React.FC = () => {
  const { activeTab } = useInventoryContext();

  // ⚡ Instantaneous tab switching - no loading between tabs!
  switch (activeTab) {
    case "overview":
      return <OverviewTab />;
    case "products":
      return <ProductsTab />;
    case "categories":
      return <CategoriesTab />;
    default:
      return <OverviewTab />;
  }
};
```

---

## 🎨 **Sistema de Navegación por Tabs**

### **Configuración de Tabs**

```typescript
// 🎯 Tab Configuration
export const INVENTORY_TABS = [
  {
    id: "overview" as const,
    label: "Dashboard",
    icon: "BarChart3",
    color: "blue",
    path: "/inventory"  // Virtual path for SPA
  },
  {
    id: "products" as const,
    label: "Productos",
    icon: "Package",
    color: "green",
    path: "/inventory/products"
  },
  // ... more tabs
] as const;

export type TabId = typeof INVENTORY_TABS[number]["id"];
```

### **Componente TabBadge**

```typescript
interface TabBadgeProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  hasNotification?: boolean;
  notificationCount?: number;
}

export const TabBadge: React.FC<TabBadgeProps> = ({
  isActive,
  label,
  icon,
  onClick,
  hasNotification,
  notificationCount
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center space-x-2 px-4 py-3 rounded-lg",
        "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? "bg-blue-500 text-white shadow-lg scale-[1.01]"
          : "text-gray-600 hover:bg-gray-50"
      )}
    >
      {/* Icon with animation */}
      <span className={cn(
        "flex-shrink-0 transition-transform duration-300",
        isActive && "scale-110"
      )}>
        {icon}
      </span>

      {/* Label */}
      <span className="font-medium">{label}</span>

      {/* Notification Badge */}
      {hasNotification && notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-bounce">
          {notificationCount}
        </span>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-current rounded-full" />
      )}
    </button>
  );
};
```

---

## 🔄 **Gestión de Estado**

### **Context API para SPA**

```typescript
// 🎯 SPA Context Type
interface InventoryContextType {
  // Tab Management
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // Search & Filters (shared across tabs)
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  productFilters: ProductFilters;
  setProductFilters: (filters: ProductFilters) => void;

  // View Modes
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Modal States (shared across tabs)
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;

  // Data (TanStack Query)
  inventory: ReturnType<typeof useInventoryQuery>;

  // Actions
  refetchAll: () => void;
  clearAllFilters: () => void;
}

// 🎯 Context Provider
export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [activeTab, setActiveTabState] = useState<TabId>("overview");
  const [isTabChanging, setIsTabChanging] = useState(false);
  
  // 🚀 TanStack Query - Persistent data across tabs
  const inventory = useInventoryQuery({
    productsPagination: { page: 1, limit: 20 },
    enabled: true,
    refetchOnWindowFocus: false,
  });

  // ⚡ Instant Tab Change for True SPA Experience
  const setActiveTab = useCallback((tab: TabId) => {
    if (tab === activeTab) return;
    
    // Instant change - no artificial delays
    setActiveTabState(tab);
    
    // Brief visual transition only for smooth UX
    setIsTabChanging(true);
    requestAnimationFrame(() => {
      setIsTabChanging(false);
    });
  }, [activeTab]);

  // ... rest of context logic

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};
```

### **Custom Hook para Context**

```typescript
export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventoryContext must be used within InventoryProvider");
  }
  return context;
};
```

---

## 🎭 **Animaciones y Transiciones**

### **CSS Keyframes Personalizadas**

```css
/* 🎯 Tab Transitions */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 🎭 Header Scroll Animations */
@keyframes slideUpFade {
  from {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  to {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
  }
}

/* 🌊 Utility Classes */
.animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
.animate-slideInLeft { animation: slideInLeft 0.5s ease-out; }
.animate-scaleIn { animation: scaleIn 0.4s ease-out; }

/* 🎯 Staggered Animations */
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
```

### **Componente TabTransition**

```typescript
// 🎨 Simplified Tab Transition Component
export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  isActive,
  className,
  transitionType = "slideUp",
  delay = 0,
}) => {
  if (!isActive) {
    return null; // Don't render inactive tabs
  }

  const getTransitionClass = () => {
    switch (transitionType) {
      case "fade": return "animate-fadeInScale";
      case "slide": return "animate-slideInLeft";
      case "scale": return "animate-scaleIn";
      case "slideUp": default: return "animate-fadeInUp";
    }
  };

  return (
    <div
      className={cn(
        "transform-gpu opacity-100 translate-y-0", 
        getTransitionClass(),
        "backface-hidden",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};
```

---

## 🎣 **Hooks Personalizados**

### **useScrollHeader Hook**

```typescript
export const useScrollHeader = ({
  threshold = 100,
  debounceDelay = 10,
  scrollDelta = 5,
}: UseScrollHeaderOptions = {}) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // 🎯 Smart scroll detection
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY.current;

    setScrollY(currentScrollY);
    setIsPastThreshold(currentScrollY > threshold);

    // Logic: Hide on scroll down, show on scroll up
    if (currentScrollY <= threshold) {
      setIsHeaderVisible(true);
    } else if (scrollDirection) {
      setIsHeaderVisible(false); // Scrolling down
    } else {
      setIsHeaderVisible(true);  // Scrolling up
    }

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold]);

  // 🚀 Optimized with requestAnimationFrame
  const requestTick = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(handleScroll);
      ticking.current = true;
    }
  }, [handleScroll]);

  useEffect(() => {
    window.addEventListener('scroll', requestTick, { passive: true });
    return () => window.removeEventListener('scroll', requestTick);
  }, [requestTick]);

  return { isHeaderVisible, scrollY, isPastThreshold };
};
```

### **useTabTransition Hook**

```typescript
export const useTabTransition = () => {
  const { activeTab, setActiveTab, isTabChanging } = useInventoryContext();

  const switchTab = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, [setActiveTab]);

  return {
    activeTab,
    switchTab,
    isTabChanging,
    currentTabConfig: INVENTORY_TABS.find((t) => t.id === activeTab)!,
  };
};
```

---

## ⚡ **Optimizaciones de Performance**

### **1. React.memo para Tabs**

```typescript
// 🎯 Memoized tab components to prevent unnecessary re-renders
const OverviewTab: React.FC = React.memo(function OverviewTab() {
  const { inventory, setActiveTab } = useInventoryContext();
  
  // Tab content...
  return (
    <TabTransition isActive={true} transitionType="slideUp">
      {/* Content */}
    </TabTransition>
  );
});

const ProductsTab: React.FC = React.memo(function ProductsTab() {
  // Similar implementation...
});
```

### **2. TanStack Query - Data Persistence**

```typescript
// 🚀 Query configuration for SPA
export const useInventoryQuery = (config: InventoryQueryConfig = {}) => {
  return useQuery({
    queryKey: ["inventory", config],
    queryFn: () => getInventoryDataAction(config),
    staleTime: 5 * 60 * 1000,        // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000,          // 10 minutes - cache cleanup
    refetchOnWindowFocus: false,      // No refetch on tab focus
    refetchOnMount: false,            // No refetch on component mount
    refetchOnReconnect: "always",     // Refetch on reconnect
  });
};
```

### **3. CSS GPU Acceleration**

```css
/* 🚀 GPU Optimizations */
.transform-gpu {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

.header-visible,
.header-hidden {
  transform: translate3d(0, 0, 0); /* Force GPU layer */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 📋 **Mejores Prácticas**

### **✅ DO's (Hacer)**

1. **Datos Persistentes**: Usar TanStack Query para cache entre tabs
2. **Transiciones Instantáneas**: No delays artificiales entre tabs
3. **Estado Compartido**: Context API para estado global del módulo
4. **Componentes Memoizados**: React.memo para tabs grandes
5. **GPU Acceleration**: `transform-gpu` para animaciones smooth
6. **Scroll Inteligente**: Header que se oculta/muestra según scroll
7. **Indicadores Visuales**: Notificaciones y badges en tabs
8. **Tipos Estrictos**: TypeScript para toda la arquitectura

### **❌ DON'Ts (No hacer)**

1. **Loading entre tabs**: Si los datos ya están en caché
2. **Múltiples Contexts**: Un solo context por módulo SPA
3. **Animaciones bloqueantes**: Usar CSS puro, no JavaScript delays
4. **Re-renders innecesarios**: Memoizar componentes pesados
5. **Estado en localStorage**: Para estado temporal del SPA
6. **Rutas reales**: Usar navegación interna virtual
7. **Props drilling**: Usar context para estado compartido

---

## 🛠️ **Guía de Implementación**

### **Paso 1: Crear la Estructura Base**

```bash
# Crear estructura de carpetas
mkdir -p src/features/your-module/ui/{components/shared,context,hooks,routes,styles,tabs}
mkdir -p src/features/your-module/server
```

### **Paso 2: Configurar el Context**

```typescript
// 1. Define your tab configuration
export const YOUR_MODULE_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "BarChart3" },
  { id: "management", label: "Management", icon: "Settings" },
] as const;

// 2. Create context interface
interface YourModuleContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  // ... other shared state
}

// 3. Implement context provider
export const YourModuleProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Context implementation...
};
```

### **Paso 3: Crear el SPA Container**

```typescript
const YourModuleScreen: React.FC = () => {
  return (
    <div className="w-full">
      <YourModuleProvider>
        <YourModuleSPAContent />
      </YourModuleProvider>
    </div>
  );
};

const YourModuleSPAContent: React.FC = () => {
  return (
    <div className="min-h-screen">
      <TabNavigation />
      <main>
        <TabContent />
      </main>
    </div>
  );
};
```

### **Paso 4: Implementar Tab Components**

```typescript
const DashboardTab: React.FC = React.memo(function DashboardTab() {
  return (
    <TabTransition isActive={true} transitionType="slideUp">
      <div className="p-6">
        {/* Your tab content */}
      </div>
    </TabTransition>
  );
});
```

### **Paso 5: Configurar Animaciones**

```css
/* Add to your module's animations.css */
@import '../shared/styles/animations.css';

/* Custom animations for your module */
@keyframes yourCustomAnimation {
  /* ... */
}
```

---

## 🎯 **Ejemplo Completo: E-commerce Module**

```typescript
// 📁 src/features/ecommerce/ui/context/EcommerceContext.tsx
const ECOMMERCE_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "BarChart3" },
  { id: "products", label: "Products", icon: "Package" },
  { id: "orders", label: "Orders", icon: "ShoppingCart" },
  { id: "customers", label: "Customers", icon: "Users" },
] as const;

export const EcommerceProvider: React.FC = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const ecommerce = useEcommerceQuery();
  
  return (
    <EcommerceContext.Provider value={{ activeTab, setActiveTab, ecommerce }}>
      {children}
    </EcommerceContext.Provider>
  );
};

// 📁 src/features/ecommerce/ui/routes/ecommerce.screen.tsx
const EcommerceScreen: React.FC = () => {
  return (
    <div className="w-full">
      <EcommerceProvider>
        <EcommerceSPAContent />
      </EcommerceProvider>
    </div>
  );
};

// Tab content similar to inventory example...
```

---

## 🎉 **Beneficios de esta Arquitectura**

### **🚀 Performance**
- **Instant tab switching** (0ms loading)
- **Persistent data** across tabs
- **Optimized re-renders** with memoization
- **GPU-accelerated animations**

### **🎨 User Experience**
- **Smooth transitions** entre secciones
- **Smart scroll header** que se adapta
- **Visual feedback** con notificaciones
- **Responsive design** en todos los dispositivos

### **🔧 Developer Experience**
- **Type-safe** con TypeScript estricto
- **Modular** y fácil de extender
- **Consistent patterns** entre módulos
- **Easy testing** con componentes aislados

### **📈 Scalability**
- **Feature-first** organization
- **Shared components** reutilizables
- **Context isolation** por módulo
- **Independent deployment** capabilities

---

## 📚 **Recursos Adicionales**

- [TanStack Query Documentation](https://tanstack.com/query)
- [React Context Best Practices](https://react.dev/reference/react/useContext)
- [CSS GPU Acceleration Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/will-change)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**🎯 Esta arquitectura SPA Feature-First es ideal para módulos complejos que requieren múltiples vistas, estado compartido y una experiencia de usuario premium.**

*Creado: 2025-01-17 - Inventory Management SPA Implementation*
