# 🧩 **SPA Components & Implementation Guide**

## **Guía Detallada de Componentes para Módulos SPA Feature-First**

---

## 📋 **Tabla de Contenido**

1. [Componentes Core del Sistema](#-componentes-core-del-sistema)
2. [Animaciones y Transiciones](#-animaciones-y-transiciones) 
3. [Hooks Especializados](#-hooks-especializados)
4. [Patrones de Comunicación](#-patrones-de-comunicación)
5. [Gestión de Estado Avanzada](#-gestión-de-estado-avanzada)
6. [Casos de Uso Específicos](#-casos-de-uso-específicos)
7. [Testing Strategies](#-testing-strategies)

---

## 🎯 **Componentes Core del Sistema**

### **1. 🎭 TabTransition - Sistema de Transiciones**

**Propósito**: Manejar transiciones smooth entre tabs sin blocking el UI.

```typescript
// 📁 src/features/inventory/ui/components/shared/TabTransition.tsx

interface TabTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
  transitionType?: "slide" | "fade" | "scale" | "slideUp";
  delay?: number;
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  isActive,
  className,
  transitionType = "slideUp",
  delay = 0,
}) => {
  // 🚀 Optimized for True SPA - Instant rendering
  if (!isActive) {
    return null; // Don't render inactive tabs for performance
  }

  const getTransitionClass = () => {
    switch (transitionType) {
      case "fade":
        return "animate-fadeInScale";
      case "slide":
        return "animate-slideInLeft";
      case "scale":
        return "animate-scaleIn";
      case "slideUp":
      default:
        return "animate-fadeInUp";
    }
  };

  return (
    <div
      className={cn(
        // Base classes for smooth rendering
        "transform-gpu opacity-100 translate-y-0", 
        // Animation class
        getTransitionClass(),
        // Performance optimizations
        "backface-hidden",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        willChange: "transform, opacity", // Optimize for animations
      }}
    >
      {children}
    </div>
  );
};

// 🎨 Usage Examples:
// <TabTransition isActive={activeTab === "products"} transitionType="fade" delay={100}>
//   <ProductsContent />
// </TabTransition>
```

### **2. 🏷️ TabBadge - Navegación Interactiva**

**Propósito**: Botones de navegación con estados, notificaciones y animaciones.

```typescript
// 📁 src/features/inventory/ui/components/shared/TabTransition.tsx (continued)

interface TabBadgeProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  color?: string;
  onClick: () => void;
  hasNotification?: boolean;
  notificationCount?: number;
  disabled?: boolean;
  className?: string;
}

export const TabBadge: React.FC<TabBadgeProps> = ({
  isActive,
  label,
  icon,
  color = "blue",
  onClick,
  hasNotification,
  notificationCount,
  disabled = false,
  className,
}) => {
  // 🎨 Color mapping for different tab types
  const colorClasses = {
    blue: "bg-blue-500 border-blue-500 text-white",
    green: "bg-green-500 border-green-500 text-white",
    purple: "bg-purple-500 border-purple-500 text-white",
    red: "bg-red-500 border-red-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styling
        "group relative flex items-center space-x-2 px-4 py-3 rounded-lg border-2",
        "transition-all duration-300 transform-gpu",
        "hover:scale-[1.02] active:scale-[0.98]",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
        
        // Active/inactive states
        isActive
          ? `${colorClasses[color as keyof typeof colorClasses]} shadow-lg scale-[1.01]`
          : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md",
        
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed",
        
        className
      )}
    >
      {/* Icon with rotation on active */}
      <span
        className={cn(
          "flex-shrink-0 transition-transform duration-300",
          isActive && "scale-110"
        )}
      >
        {icon}
      </span>

      {/* Label with animation */}
      <span className="whitespace-nowrap font-medium transition-all duration-200">
        {label}
      </span>

      {/* Notification Badge with bounce animation */}
      {hasNotification && notificationCount && notificationCount > 0 && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center">
          <span
            className={cn(
              "bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5",
              "animate-bounce shadow-lg border-2 border-white",
              "min-w-[20px] h-5 flex items-center justify-center"
            )}
          >
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        </div>
      )}

      {/* Active indicator */}
      {isActive && (
        <>
          {/* Bottom border indicator */}
          <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-current rounded-full transition-all duration-300" />
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-lg bg-current opacity-5 transition-opacity duration-300" />
        </>
      )}

      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-current opacity-0 group-active:opacity-10 transition-opacity duration-150" />
      </div>
    </button>
  );
};
```

### **3. 🌊 TabLoadingSkeleton - Estados de Carga**

**Propósito**: Skeleton screens específicos para diferentes tipos de content.

```typescript
// 📁 src/features/inventory/ui/components/shared/TabTransition.tsx (continued)

interface TabLoadingSkeletonProps {
  variant?: "overview" | "products" | "grid" | "list";
}

export const TabLoadingSkeleton: React.FC<TabLoadingSkeletonProps> = ({ 
  variant = "grid" 
}) => {
  if (variant === "overview") {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div 
          className="flex justify-between items-center animate-fadeInUp"
          style={{ animationDelay: "0ms" }}
        >
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 shimmer" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 shimmer" />
          </div>
          <div className="flex space-x-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 shimmer"
                style={{ animationDelay: `${100 + i * 50}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-scaleIn"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div 
            className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-slideInLeft"
            style={{ animationDelay: "500ms" }}
          />
          <div 
            className="lg:col-span-2 h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-slideInRight"
            style={{ animationDelay: "600ms" }}
          />
        </div>
      </div>
    );
  }

  if (variant === "products") {
    return (
      <div className="space-y-6 p-6">
        {/* Filters Bar Skeleton */}
        <div 
          className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-slideInDown"
          style={{ animationDelay: "200ms" }}
        />

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-scaleIn"
              style={{ animationDelay: `${300 + i * 75}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-fadeInUp"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
};
```

---

## 🎨 **Animaciones y Transiciones**

### **CSS Animations Framework**

```css
/* 📁 src/features/inventory/ui/styles/animations.css */

/* ========================================
   🎯 CORE ANIMATIONS
   ======================================== */

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
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ========================================
   🌊 SCROLL HEADER ANIMATIONS
   ======================================== */

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

@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* ========================================
   🎭 UTILITY CLASSES
   ======================================== */

.animate-fadeInUp { 
  animation: fadeInUp 0.6s ease-out; 
}

.animate-slideInLeft { 
  animation: slideInLeft 0.5s ease-out; 
}

.animate-slideInRight { 
  animation: slideInRight 0.5s ease-out; 
}

.animate-slideInDown { 
  animation: slideInDown 0.4s ease-out; 
}

.animate-scaleIn { 
  animation: scaleIn 0.4s ease-out; 
}

.animate-fadeInScale { 
  animation: fadeInScale 0.5s ease-out; 
}

/* ========================================
   ⏰ STAGGERED ANIMATIONS
   ======================================== */

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
.stagger-5 { animation-delay: 0.5s; }

/* ========================================
   ⚡ PERFORMANCE OPTIMIZATIONS
   ======================================== */

.transform-gpu {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

.backface-hidden {
  backface-visibility: hidden;
}

/* ========================================
   💫 SHIMMER LOADING EFFECT
   ======================================== */

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0px,
    #e0e0e0 40px,
    #f0f0f0 80px
  );
  background-size: 200px;
  animation: shimmer 1.5s infinite;
}

.dark .shimmer {
  background: linear-gradient(
    90deg,
    #374151 0px,
    #4b5563 40px,
    #374151 80px
  );
  background-size: 200px;
}

/* ========================================
   🎯 HEADER SCROLL STATES
   ======================================== */

.header-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 200px;
}

.header-hidden {
  opacity: 0;
  transform: translate3d(0, -100%, 0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 0;
  overflow: hidden;
  pointer-events: none;
}

/* ========================================
   🌫️ BACKDROP BLUR EFFECTS
   ======================================== */

.header-backdrop {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.85);
  transition: all 0.3s ease-out;
}

.dark .header-backdrop {
  background: rgba(17, 24, 39, 0.85);
}

.header-backdrop.scrolled {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .header-backdrop.scrolled {
  background: rgba(17, 24, 39, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* ========================================
   📱 RESPONSIVE & ACCESSIBILITY
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .shimmer,
  .animate-fadeInUp,
  .animate-slideInLeft,
  .animate-slideInRight,
  .animate-slideInDown,
  .animate-scaleIn,
  .animate-fadeInScale {
    animation: none !important;
  }
  
  .header-visible,
  .header-hidden {
    transition: none !important;
  }
}

@media (max-width: 768px) {
  /* Reduce animation complexity on mobile */
  .animate-fadeInUp,
  .animate-slideInLeft,
  .animate-slideInRight {
    animation-duration: 0.4s;
  }
  
  .stagger-1,
  .stagger-2,
  .stagger-3 {
    animation-delay: 0.05s;
  }
}
```

---

## 🎣 **Hooks Especializados**

### **1. useScrollHeader - Scroll Inteligente**

```typescript
// 📁 src/features/inventory/ui/hooks/useScrollHeader.ts

interface UseScrollHeaderOptions {
  threshold?: number;       // Scroll threshold to trigger hide/show
  debounceDelay?: number;   // Debounce delay for optimization
  scrollDelta?: number;     // Minimum scroll distance to detect direction
}

interface UseScrollHeaderReturn {
  isHeaderVisible: boolean;
  isScrollingDown: boolean;
  scrollY: number;
  isPastThreshold: boolean;
  showHeader: () => void;
  hideHeader: () => void;
}

export const useScrollHeader = ({
  threshold = 100,
  debounceDelay = 10,
  scrollDelta = 5,
}: UseScrollHeaderOptions = {}): UseScrollHeaderReturn => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 Smart scroll detection logic
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY > lastScrollY.current;
    const scrollDistance = Math.abs(currentScrollY - lastScrollY.current);

    // Only process significant scroll changes
    if (scrollDistance < scrollDelta) return;

    setScrollY(currentScrollY);
    setIsPastThreshold(currentScrollY > threshold);
    setIsScrollingDown(scrollDirection);

    // Header visibility logic
    if (currentScrollY <= threshold) {
      setIsHeaderVisible(true);  // Always show near top
    } else if (scrollDirection && currentScrollY > lastScrollY.current) {
      setIsHeaderVisible(false); // Hide when scrolling down
    } else if (!scrollDirection && lastScrollY.current > currentScrollY) {
      setIsHeaderVisible(true);  // Show when scrolling up
    }

    lastScrollY.current = currentScrollY;
    ticking.current = false;
  }, [threshold, scrollDelta]);

  // 🚀 Optimized with requestAnimationFrame
  const requestTick = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(handleScroll);
      ticking.current = true;
    }
  }, [handleScroll]);

  // 🎯 Debounced scroll handler
  const debouncedScrollHandler = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      requestTick();
    }, debounceDelay);
  }, [requestTick, debounceDelay]);

  // Manual control functions
  const showHeader = useCallback(() => setIsHeaderVisible(true), []);
  const hideHeader = useCallback(() => setIsHeaderVisible(false), []);

  // Setup and cleanup
  useEffect(() => {
    setScrollY(window.scrollY);
    lastScrollY.current = window.scrollY;

    const scrollHandler = () => debouncedScrollHandler();
    const handleResize = () => setScrollY(window.scrollY);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setScrollY(window.scrollY);
        lastScrollY.current = window.scrollY;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedScrollHandler]);

  return {
    isHeaderVisible,
    isScrollingDown,
    scrollY,
    isPastThreshold,
    showHeader,
    hideHeader,
  };
};

// 🎯 Specialized hook for tab headers
export const useTabScrollHeader = () => {
  return useScrollHeader({
    threshold: 120,    // More sensitive for tabs
    debounceDelay: 8,  // More responsive
    scrollDelta: 3,    // More precise
  });
};
```

### **2. useTabTransition - Gestión de Tabs**

```typescript
// 📁 src/features/inventory/ui/hooks/useTabTransition.ts

interface TabTransitionConfig {
  defaultTab?: string;
  persistTab?: boolean;      // Persist active tab in localStorage
  onTabChange?: (tab: string) => void;
}

export const useTabTransition = (
  tabs: readonly any[],
  config: TabTransitionConfig = {}
) => {
  const { defaultTab, persistTab = false, onTabChange } = config;
  const contextValue = useInventoryContext();
  
  const [transitionState, setTransitionState] = useState<
    'idle' | 'changing' | 'loading'
  >('idle');

  // Get persisted tab from localStorage if enabled
  const getPersistedTab = useCallback(() => {
    if (!persistTab) return defaultTab || tabs[0]?.id;
    
    try {
      const saved = localStorage.getItem('activeTab');
      const validTab = tabs.find(t => t.id === saved);
      return validTab?.id || defaultTab || tabs[0]?.id;
    } catch {
      return defaultTab || tabs[0]?.id;
    }
  }, [tabs, defaultTab, persistTab]);

  // Initialize active tab
  const [activeTab, setActiveTabState] = useState(() => getPersistedTab());

  // Enhanced tab switching with lifecycle
  const switchTab = useCallback((newTab: string) => {
    if (newTab === activeTab) return;
    
    setTransitionState('changing');
    
    // Persist tab if enabled
    if (persistTab) {
      try {
        localStorage.setItem('activeTab', newTab);
      } catch {
        // Ignore localStorage errors
      }
    }
    
    // Call lifecycle hook
    onTabChange?.(newTab);
    
    // Update active tab
    setActiveTabState(newTab);
    
    // Reset transition state
    requestAnimationFrame(() => {
      setTransitionState('idle');
    });
  }, [activeTab, persistTab, onTabChange]);

  // Get current tab configuration
  const currentTabConfig = useMemo(() => {
    return tabs.find(tab => tab.id === activeTab) || tabs[0];
  }, [tabs, activeTab]);

  // Tab navigation helpers
  const goToNextTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    switchTab(tabs[nextIndex].id);
  }, [tabs, activeTab, switchTab]);

  const goToPreviousTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    switchTab(tabs[prevIndex].id);
  }, [tabs, activeTab, switchTab]);

  return {
    activeTab,
    switchTab,
    goToNextTab,
    goToPreviousTab,
    currentTabConfig,
    transitionState,
    isTabChanging: transitionState === 'changing',
    // Include context values
    ...contextValue,
  };
};
```

---

## 🔄 **Patrones de Comunicación**

### **1. Context-to-Hook Communication**

```typescript
// 📁 Pattern: Context provides data, hooks provide specialized access

// Context (Data Provider)
export const InventoryProvider = ({ children }) => {
  const inventory = useInventoryQuery();
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <InventoryContext.Provider value={{ inventory, activeTab, setActiveTab }}>
      {children}
    </InventoryContext.Provider>
  );
};

// Specialized Hook (Behavior Provider)
export const useInventoryStats = () => {
  const { inventory } = useInventoryContext();
  
  return useMemo(() => ({
    totalProducts: inventory.data?.products.length ?? 0,
    lowStockCount: inventory.data?.alerts.filter(a => a.type === 'LOW_STOCK').length ?? 0,
    totalValue: inventory.data?.stats.totalInventoryValue ?? 0,
    // Computed values...
  }), [inventory.data]);
};

// Component Usage
const StatsOverview = () => {
  const stats = useInventoryStats();
  return <div>Total Products: {stats.totalProducts}</div>;
};
```

### **2. Tab-to-Tab Communication**

```typescript
// 📁 Pattern: Shared state for cross-tab communication

// Context with shared state
export const InventoryProvider = ({ children }) => {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [bulkActionMode, setBulkActionMode] = useState(false);
  
  return (
    <InventoryContext.Provider value={{
      selectedProductIds,
      setSelectedProductIds,
      globalSearchTerm,
      setGlobalSearchTerm,
      bulkActionMode,
      setBulkActionMode,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

// Products Tab (Selection)
const ProductsTab = () => {
  const { selectedProductIds, setSelectedProductIds } = useInventoryContext();
  
  const handleProductSelect = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  return (
    <div>
      {/* Product list with selection */}
    </div>
  );
};

// Overview Tab (Display selected count)
const OverviewTab = () => {
  const { selectedProductIds } = useInventoryContext();
  
  return (
    <div>
      Selected Products: {selectedProductIds.length}
    </div>
  );
};
```

### **3. Event-Based Communication**

```typescript
// 📁 Pattern: Custom events for loosely coupled communication

// Custom hook for event management
export const useTabEvents = () => {
  const emitTabEvent = useCallback((eventType: string, data: any) => {
    window.dispatchEvent(new CustomEvent(`inventory:${eventType}`, { 
      detail: data 
    }));
  }, []);

  const subscribeToTabEvent = useCallback((
    eventType: string, 
    handler: (event: CustomEvent) => void
  ) => {
    const eventName = `inventory:${eventType}`;
    window.addEventListener(eventName, handler);
    
    return () => window.removeEventListener(eventName, handler);
  }, []);

  return { emitTabEvent, subscribeToTabEvent };
};

// Usage in tabs
const ProductsTab = () => {
  const { emitTabEvent } = useTabEvents();
  
  const handleProductCreated = (product: Product) => {
    emitTabEvent('product:created', { product });
  };
  
  return <ProductForm onSubmit={handleProductCreated} />;
};

const OverviewTab = () => {
  const { subscribeToTabEvent } = useTabEvents();
  const [recentlyCreated, setRecentlyCreated] = useState<Product[]>([]);
  
  useEffect(() => {
    return subscribeToTabEvent('product:created', (event) => {
      setRecentlyCreated(prev => [event.detail.product, ...prev.slice(0, 4)]);
    });
  }, [subscribeToTabEvent]);
  
  return (
    <div>
      Recently Created: {recentlyCreated.length}
    </div>
  );
};
```

---

## 🧠 **Gestión de Estado Avanzada**

### **1. Estado con Persistencia**

```typescript
// 📁 src/features/inventory/ui/hooks/usePersistentState.ts

export const usePersistentState = <T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistentState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      
      try {
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch {
        // Handle localStorage errors
      }
      
      return newValue;
    });
  }, [key]);

  return [state, setPersistentState];
};

// Usage in context
export const InventoryProvider = ({ children }) => {
  const [viewMode, setViewMode] = usePersistentState<'grid' | 'list'>('inventory:viewMode', 'grid');
  const [sortConfig, setSortConfig] = usePersistentState('inventory:sortConfig', {
    field: 'name',
    direction: 'asc'
  });
  
  return (
    <InventoryContext.Provider value={{
      viewMode,
      setViewMode,
      sortConfig,
      setSortConfig,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
```

### **2. Estado Optimista con Rollback**

```typescript
// 📁 src/features/inventory/ui/hooks/useOptimisticState.ts

interface OptimisticConfig<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData: T) => void;
  timeout?: number;
}

export const useOptimisticState = <T>(
  initialState: T,
  config: OptimisticConfig<T> = {}
) => {
  const [state, setState] = useState<T>(initialState);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const rollbackRef = useRef<T>(initialState);

  const updateOptimistic = useCallback(async (
    newState: T,
    asyncAction: () => Promise<T>
  ) => {
    // Store rollback data
    rollbackRef.current = state;
    
    // Apply optimistic update
    setState(newState);
    setIsOptimistic(true);
    
    try {
      const result = await asyncAction();
      setState(result);
      config.onSuccess?.(result);
    } catch (error) {
      // Rollback on error
      setState(rollbackRef.current);
      config.onError?.(error as Error, rollbackRef.current);
    } finally {
      setIsOptimistic(false);
    }
  }, [state, config]);

  const rollback = useCallback(() => {
    setState(rollbackRef.current);
    setIsOptimistic(false);
  }, []);

  return {
    state,
    setState,
    updateOptimistic,
    rollback,
    isOptimistic,
  };
};
```

---

## 🎯 **Casos de Uso Específicos**

### **1. Modal Management entre Tabs**

```typescript
// 📁 Pattern: Shared modal state across tabs

export const InventoryProvider = ({ children }) => {
  const [modals, setModals] = useState({
    productModal: { open: false, data: null },
    categoryModal: { open: false, data: null },
    deleteConfirm: { open: false, data: null },
  });

  const openModal = useCallback((modalName: string, data: any = null) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { open: true, data }
    }));
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals(prev => ({
      ...prev,
      [modalName]: { open: false, data: null }
    }));
  }, []);

  return (
    <InventoryContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
      
      {/* Global modals */}
      <ProductModal 
        open={modals.productModal.open}
        product={modals.productModal.data}
        onClose={() => closeModal('productModal')}
      />
    </InventoryContext.Provider>
  );
};
```

### **2. Search Integration Across Tabs**

```typescript
// 📁 Pattern: Global search with tab-specific filters

export const useGlobalSearch = () => {
  const { globalSearchTerm, activeTab } = useInventoryContext();
  
  return useMemo(() => {
    const searchFilters = {
      overview: () => ({
        products: globalSearchTerm,
        categories: globalSearchTerm,
        suppliers: globalSearchTerm,
      }),
      products: () => ({
        name: globalSearchTerm,
        sku: globalSearchTerm,
        description: globalSearchTerm,
      }),
      categories: () => ({
        name: globalSearchTerm,
        description: globalSearchTerm,
      }),
    };

    return searchFilters[activeTab as keyof typeof searchFilters]?.() || {};
  }, [globalSearchTerm, activeTab]);
};

// Usage in tabs
const ProductsTab = () => {
  const searchFilters = useGlobalSearch();
  const { data: products } = useProductsQuery({ filters: searchFilters });
  
  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

---

## 🧪 **Testing Strategies**

### **1. Testing Context Provider**

```typescript
// 📁 src/features/inventory/__tests__/InventoryContext.test.tsx

import { renderHook, act } from '@testing-library/react';
import { InventoryProvider, useInventoryContext } from '../ui/context';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <InventoryProvider>{children}</InventoryProvider>
);

describe('InventoryContext', () => {
  it('should switch tabs correctly', () => {
    const { result } = renderHook(() => useInventoryContext(), { wrapper });
    
    expect(result.current.activeTab).toBe('overview');
    
    act(() => {
      result.current.setActiveTab('products');
    });
    
    expect(result.current.activeTab).toBe('products');
  });

  it('should maintain state during tab switches', () => {
    const { result } = renderHook(() => useInventoryContext(), { wrapper });
    
    act(() => {
      result.current.setGlobalSearchTerm('test search');
      result.current.setActiveTab('products');
    });
    
    expect(result.current.globalSearchTerm).toBe('test search');
  });
});
```

### **2. Testing Tab Components**

```typescript
// 📁 src/features/inventory/__tests__/tabs/ProductsTab.test.tsx

import { render, screen } from '@testing-library/react';
import { ProductsTab } from '../ui/tabs/ProductsTab';
import { InventoryProvider } from '../ui/context';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <InventoryProvider>
      {component}
    </InventoryProvider>
  );
};

describe('ProductsTab', () => {
  it('should render products list', () => {
    renderWithProvider(<ProductsTab />);
    
    expect(screen.getByText('📦 Gestión de Productos')).toBeInTheDocument();
  });

  it('should apply search filters', () => {
    // Test search functionality
  });
});
```

### **3. Testing Animations**

```typescript
// 📁 src/features/inventory/__tests__/components/TabTransition.test.tsx

import { render } from '@testing-library/react';
import { TabTransition } from '../ui/components/shared/TabTransition';

describe('TabTransition', () => {
  it('should render active tab content', () => {
    const { container } = render(
      <TabTransition isActive={true} transitionType="fade">
        <div>Test Content</div>
      </TabTransition>
    );
    
    expect(container.firstChild).toHaveClass('animate-fadeInScale');
  });

  it('should not render inactive tab content', () => {
    const { container } = render(
      <TabTransition isActive={false}>
        <div>Test Content</div>
      </TabTransition>
    );
    
    expect(container.firstChild).toBeNull();
  });
});
```

---

## 📚 **Referencias y Mejores Prácticas**

### **✅ Checklist de Implementación**

- [ ] Context Provider configurado
- [ ] Tab configuration definida
- [ ] TabTransition implementado
- [ ] Animaciones CSS añadidas
- [ ] Hooks personalizados creados
- [ ] Estado persistente (si necesario)
- [ ] Tests unitarios escritos
- [ ] Performance optimizado (React.memo)
- [ ] Accessibility considerado
- [ ] Responsive design validado

### **🚀 Performance Tips**

1. **Lazy Loading**: Usar React.lazy para tabs pesados
2. **Memoization**: React.memo para componentes complejos
3. **Virtualization**: Para listas largas de datos
4. **Query Optimization**: Stale time y cache time apropiados
5. **CSS GPU**: Transform-gpu para animaciones smooth

### **🎯 Accessibility Guidelines**

1. **Keyboard Navigation**: Tab support entre tabs
2. **ARIA Labels**: Proper labeling para screen readers
3. **Focus Management**: Focus visible después de cambios
4. **Reduced Motion**: Respetar preferencias del usuario
5. **Color Contrast**: WCAG compliance

---

**🎉 Esta guía te proporciona todos los componentes, patrones y ejemplos necesarios para implementar módulos SPA Feature-First de nivel enterprise en tu aplicación.**

*Actualizado: 2025-01-17 - Inventory Management Implementation Guide*
