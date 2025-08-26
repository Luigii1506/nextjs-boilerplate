# 📋 ESTÁNDAR TÉCNICO - MÓDULOS SPA CON TABS

> **Documentación oficial para la creación de módulos SPA con arquitectura de tabs**  
> Basado en el análisis exhaustivo del módulo `inventory` - Versión 1.0

---

## 🎯 **INTRODUCCIÓN**

Este documento define el estándar técnico obligatorio para todos los módulos SPA (Single Page Application) con sistema de tabs en nuestra aplicación Next.js. Cada módulo debe seguir exactamente esta arquitectura para garantizar consistencia, performance y mantenibilidad.

### **Características Principales**
- ✅ **True SPA**: Navegación instantánea sin recargas
- ✅ **Always-Mounted Tabs**: Conserva estado entre tabs
- ✅ **Clean Architecture**: Separación clara de responsabilidades
- ✅ **Performance Optimizada**: Cache inteligente y lazy loading
- ✅ **TypeScript First**: Type safety completo
- ✅ **Accesibilidad**: WCAG compliant

---

## 🏗️ **ARQUITECTURA DE CARPETAS**

### **Estructura Obligatoria**

```
src/features/[module-name]/
├── 📄 types.ts              # Todos los tipos TypeScript
├── 📄 schemas.ts            # Validaciones Zod unificadas
├── 📄 constants.ts          # Constantes, cache tags, config
├── 📄 actions.ts            # Next.js Server Actions (thin layer)
├── 📄 index.ts              # Barrel export principal
├── 📁 hooks/                # Custom hooks y lógica client-side
│   ├── 📄 index.ts          # Barrel export
│   ├── 📄 use[Module]Query.ts    # Hook principal de datos
│   ├── 📄 useCreate[Entity].ts   # Hooks de mutations
│   └── 📄 useScrollHeader.ts     # UI hooks específicos
├── 📁 server/               # Lógica de servidor (Domain Layer)
│   ├── 📄 service.ts        # Business Logic (thick layer)
│   ├── 📄 queries.ts        # Database queries
│   ├── 📄 validators.ts     # Auth & permissions
│   ├── 📄 mappers.ts        # Data transformation
│   └── 📄 mockData.ts       # Data para desarrollo
├── 📁 context/              # React Context para estado SPA
│   ├── 📄 index.ts          # Barrel export
│   └── 📄 [Module]Context.tsx    # Context principal
├── 📁 scripts/              # Scripts de utilidad (opcional)
└── 📁 ui/                   # Componentes UI
    ├── 📁 components/       # Modales, forms y componentes
    │   ├── 📄 index.ts      # Barrel export
    │   ├── 📄 [Entity]Modal.tsx       # Modales CRUD
    │   ├── 📄 Delete[Entity]Modal.tsx # Confirmaciones
    │   ├── 📁 shared/       # Componentes reutilizables
    │   │   ├── 📄 index.ts
    │   │   ├── 📄 [Entity]Card.tsx    # Cards de entidades
    │   │   ├── 📄 TabTransition.tsx   # Transiciones SPA
    │   │   └── 📄 *.tsx     # Otros shared components
    │   └── 📁 tabs/         # Tabs del SPA
    │       ├── 📄 index.ts
    │       ├── 📄 OverviewTab.tsx     # Dashboard/Overview
    │       ├── 📄 [Entity1]Tab.tsx    # Tab de entidad 1
    │       ├── 📄 [Entity2]Tab.tsx    # Tab de entidad 2
    │       └── 📄 *.tsx     # Otros tabs
    ├── 📁 routes/           # Screen principal del módulo
    │   ├── 📄 index.ts
    │   └── 📄 [module].screen.tsx     # SPA Screen principal
    └── 📁 styles/           # CSS específico del módulo
        └── 📄 animations.css          # Animaciones personalizadas
```

---

## 📝 **PATRONES DE CÓDIGO OBLIGATORIOS**

### **1. Types (types.ts)**

```typescript
/**
 * 📦 [MODULE] TYPES
 * =================
 */

// 🗄️ Base Entity Types
export interface [Entity] {
  id: string;
  name: string;
  // ... campos base
  createdAt: Date;
  updatedAt: Date;
}

// 🔗 Relations (with populated data)
export interface [Entity]WithRelations extends [Entity] {
  [relation]?: [RelatedEntity] | null;
  [relations]?: [RelatedEntity][];
  _count?: {
    [relation]: number;
  };
}

// 🧮 Computed Properties (para UI)
export interface [Entity]WithComputedProps extends [Entity]WithRelations {
  // Computed properties específicas para UI
  formattedValue: string;
  status: [StatusType];
  isActive: boolean;
}

// 📝 Form Input Types
export interface Create[Entity]Input {
  name: string;
  // ... campos requeridos para creación
}

export interface Update[Entity]Input extends Partial<Create[Entity]Input> {
  id: string;
  isActive?: boolean;
}

// 🔍 Query & Filter Types
export interface [Entity]Filters {
  search?: string;
  isActive?: boolean;
  // ... filtros específicos
}

// 📄 Pagination Types (reutilizable)
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 🎯 Action Result Types (consistente)
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// 🔄 Query Hook Return Types
export interface Use[Module]QueryResult {
  // Data
  [entities]: [Entity]WithRelations[];
  stats: [Module]Stats | null;
  
  // Loading states
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: Error | null;
  
  // Actions
  create[Entity]: (data: Create[Entity]Input) => Promise<ActionResult<[Entity]>>;
  update[Entity]: (data: Update[Entity]Input) => Promise<ActionResult<[Entity]>>;
  delete[Entity]: (id: string) => Promise<ActionResult>;
  
  // Utilities
  refetch: () => void;
  invalidateCache: (tags?: string[]) => void;
}

// 📱 UI Component Props Types
export interface [Entity]CardProps {
  [entity]: [Entity]WithComputedProps;
  showActions?: boolean;
  onEdit?: ([entity]: [Entity]) => void;
  onDelete?: ([entity]: [Entity]) => void;
  onView?: ([entity]: [Entity]) => void;
  className?: string;
}
```

### **2. Constants (constants.ts)**

```typescript
/**
 * 📦 [MODULE] CONSTANTS
 * =====================
 */

// 🗂️ CACHE TAGS (OBLIGATORIO)
export const [MODULE]_CACHE_TAGS = {
  all: "[module]",
  [entities]: "[module]-[entities]",
  [entity]: (id: string) => `[module]-[entity]-${id}`,
  stats: "[module]-stats",
} as const;

// ⚙️ CONFIGURACIÓN POR DEFECTO (OBLIGATORIO)
export const [MODULE]_DEFAULTS = {
  // Query Configuration
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutos
  QUERY_GC_TIME: 10 * 60 * 1000,   // 10 minutos
  STATS_STALE_TIME: 2 * 60 * 1000, // 2 minutos para stats
  
  // Pagination
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // UI Configuration
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

// 🎨 UI CONSTANTS (OBLIGATORIO)
export const [MODULE]_UI = {
  // Animation durations
  ANIMATION_DURATION: 200,
  LOADING_DELAY: 300,
  
  // Spacing
  CARD_PADDING: "p-6",
  CARD_SPACING: "space-y-4",
  
  // Colors
  FALLBACK_COLORS: ["#3B82F6", "#10B981", "#F59E0B"],
} as const;
```

### **3. Server Actions (actions.ts)**

```typescript
/**
 * 📦 [MODULE] SERVER ACTIONS
 * ===========================
 * 
 * Clean Architecture: Infrastructure Layer (Thin Layer)
 * 
 * Responsabilidades:
 * - Schema parsing/validation
 * - Session authentication  
 * - Service delegation
 * - Cache invalidation
 * - Error transformation
 */

"use server";

import { revalidateTag } from "next/cache";
import { requireAuth } from "@/core/auth/server";
import { [MODULE]_CACHE_TAGS } from "./constants";
import { [Entity]Service } from "./server/service";

// ⚡ ULTRA-FAST READ OPERATIONS (no auth para datos públicos)
export async function get[Entities]Action(
  filters?: [Entity]Filters,
  pagination?: PaginationParams
): Promise<ActionResult<PaginatedResponse<[Entity]WithRelations>>> {
  try {
    // 🚀 FAST - Direct service call, zero auth overhead
    const result = await [Entity]Service.getMany(filters, pagination);
    return result;
  } catch (error) {
    console.error(`[${MODULE}] Action error - get[Entities]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al obtener datos",
    };
  }
}

// 🔒 WRITE OPERATIONS (con auth)
export async function create[Entity]Action(
  input: Create[Entity]Input
): Promise<ActionResult<[Entity]>> {
  try {
    // 1. Authentication
    const session = await requireAuth();
    
    // 2. Service delegation (business logic)
    const result = await [Entity]Service.create(session, input);
    
    // 3. Cache invalidation (UI concerns)
    revalidateTag([MODULE]_CACHE_TAGS.[entities]);
    revalidateTag([MODULE]_CACHE_TAGS.stats);
    
    return result;
  } catch (error) {
    console.error(`[${MODULE}] Action error - create[Entity]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear",
    };
  }
}

// Seguir el mismo patrón para update, delete, etc.
```

---

## 🎯 **LÓGICA SPA Y SISTEMA DE TABS**

### **Context Pattern ([Module]Context.tsx)**

```typescript
/**
 * 📦 [MODULE] SPA CONTEXT
 * =======================
 * 
 * Estado compartido para el SPA con navegación por tabs
 * Context Pattern + Custom Hooks para UX fluida
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// 🎯 TABS DISPONIBLES (OBLIGATORIO)
export const [MODULE]_TABS = [
  {
    id: "overview",
    label: "Dashboard", 
    icon: "BarChart3",
    description: "Vista general y métricas",
    color: "blue",
  },
  {
    id: "[entities]",
    label: "[Entities]",
    icon: "Package",
    description: "Gestión de [entities]",
    color: "green",
  },
  // ... otros tabs
] as const;

export type TabId = (typeof [MODULE]_TABS)[number]["id"];

// 🏗️ INTERFACE DEL CONTEXTO (OBLIGATORIO)
interface [Module]ContextType {
  // Tab Management (OBLIGATORIO)
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;
  
  // Global Search & Filters
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  [entity]Filters: [Entity]Filters;
  set[Entity]Filters: (filters: [Entity]Filters) => void;
  
  // View Modes
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  
  // Modal States (por entidad)
  is[Entity]ModalOpen: boolean;
  setIs[Entity]ModalOpen: (open: boolean) => void;
  
  // Edit States
  editing[Entity]: [Entity]WithRelations | null;
  setEditing[Entity]: ([entity]: [Entity]WithRelations | null) => void;
  isEditMode: boolean;
  
  // Data from API
  [module]: ReturnType<typeof use[Module]Query>;
  
  // Actions (OBLIGATORIO)
  refetchAll: () => void;
  clearAllFilters: () => void;
  openEditModal: ([entity]: [Entity]WithRelations) => void;
  closeEditModal: () => void;
}

// 🎯 PROVIDER COMPONENT (OBLIGATORIO)
export const [Module]Provider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 🎨 Tab State (OBLIGATORIO)
  const [activeTab, setActiveTabState] = useState<TabId>("overview");
  const [isTabChanging, setIsTabChanging] = useState(false);
  
  // 🔄 Main Data Query (OBLIGATORIO)
  const [module] = use[Module]Query({
    [entity]Filters: {
      ...entityFilters,
      search: globalSearchTerm || undefined,
    },
    enabled: true,
    refetchOnWindowFocus: false,
  });
  
  // 🎯 Instant Tab Change para True SPA Experience (OBLIGATORIO)
  const setActiveTab = useCallback((tab: TabId) => {
    if (tab === activeTab) return;
    
    // Cambio instantáneo - sin delays artificiales
    setActiveTabState(tab);
    
    // Brief visual transition solo para smooth UX
    setIsTabChanging(true);
    requestAnimationFrame(() => {
      setIsTabChanging(false);
    });
  }, [activeTab]);
  
  // ... resto de la implementación
  
  return (
    <[Module]Context.Provider value={value}>
      {children}
    </[Module]Context.Provider>
  );
};

// 🎯 CUSTOM HOOK (OBLIGATORIO)
export const use[Module]Context = () => {
  const context = useContext([Module]Context);
  if (!context) {
    throw new Error("use[Module]Context must be used within [Module]Provider");
  }
  return context;
};
```

### **SPA Screen Principal ([module].screen.tsx)**

```typescript
/**
 * 📦 [MODULE] SPA SCREEN
 * ======================
 * 
 * Single Page Application completa con navegación por tabs
 * TRUE SPA: Todos los tabs siempre montados, sin re-renders
 */

"use client";

import "../styles/animations.css";
import React, { useMemo } from "react";
import { cn } from "@/shared/utils";
import {
  [Module]Provider,
  use[Module]Context,
  [MODULE]_TABS,
  type TabId,
} from "../../context";
import { ReusableTabs, type TabItem } from "@/shared/ui/components";
import { useScrollHeader } from "@/shared/hooks";

// 🎯 Enhanced Tab Navigation (OBLIGATORIO)
const TabNavigation: React.FC<{ isHeaderVisible: boolean }> = ({ 
  isHeaderVisible 
}) => {
  const { activeTab, setActiveTab, [module], isTabChanging } = use[Module]Context();
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
      <div className="px-6 py-4">
        {/* Header con animaciones de scroll */}
        <div className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
          "transform-gpu transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isHeaderVisible
            ? "opacity-100 translate-y-0 mb-6 max-h-96"
            : "opacity-0 -translate-y-3 mb-0 max-h-0 overflow-hidden pointer-events-none"
        )}>
          {/* Título y descripción */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              [Module Title]
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              [Module Description]
            </p>
          </div>
          
          {/* Quick stats o actions */}
          <div className="flex gap-4">
            {/* Stats cards o botones */}
          </div>
        </div>

        {/* Tab Navigation - SIEMPRE VISIBLE */}
        <div>
          <ReusableTabs
            tabs={[MODULE]_TABS.map((tab) => ({
              id: tab.id,
              label: tab.label,
              icon: <tab.icon className="w-4 h-4" />,
              color: tab.color,
            } as TabItem))}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
            variant="default"
            size="md"
            animated={true}
            scrollable={true}
            className="bg-transparent border-0 shadow-none p-0"
          />
        </div>
      </div>
      
      {/* SPA Performance Indicator (dev mode) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-2 right-2 space-y-1">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full opacity-75">
            SPA ⚡ {!isTabChanging ? "Instant" : "Transitioning"}
          </div>
        </div>
      )}
    </div>
  );
};

// 🎯 TRUE SPA TAB CONTENT - TODOS LOS TABS MONTADOS (OBLIGATORIO)
const TabContent: React.FC = () => {
  const { activeTab, isTabChanging } = use[Module]Context();

  // 🚨 PATRÓN SPA OBLIGATORIO: Renderizar TODOS los tabs pero solo mostrar el activo
  // Esto previene unmounting/remounting que causaba el comportamiento de "refresh"
  return (
    <div className="relative min-h-screen">
      {/* Tab transition overlay */}
      <div className={cn(
        "absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 pointer-events-none transition-opacity duration-150",
        isTabChanging ? "opacity-100" : "opacity-0"
      )} />

      {/* Overview Tab - Always mounted */}
      <div className={cn(
        "transition-all duration-300 ease-out",
        activeTab === "overview"
          ? "opacity-100 visible relative z-0"
          : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
      )}
      style={{
        transform: activeTab === "overview" ? "translateY(0)" : "translateY(20px)",
      }}>
        <OverviewTab />
      </div>

      {/* [Entities] Tab - Always mounted */}
      <div className={cn(
        "transition-all duration-300 ease-out",
        activeTab === "[entities]"
          ? "opacity-100 visible relative z-0" 
          : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
      )}
      style={{
        transform: activeTab === "[entities]" ? "translateY(0)" : "translateY(20px)",
      }}>
        <[Entities]Tab />
      </div>

      {/* Repetir para cada tab... */}
    </div>
  );
};

// 🎯 Main SPA Component
const [Module]SPAContent: React.FC = () => {
  const { isHeaderVisible } = useScrollHeader({
    threshold: 17,
    wheelSensitivity: 0.5,
    useWheelFallback: true,
    debug: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TabNavigation isHeaderVisible={isHeaderVisible} />
      <main className="flex-1 relative">
        <TabContent />
      </main>
    </div>
  );
};

// 🎯 Main Export con Context Provider (OBLIGATORIO)
const [Module]Screen: React.FC = () => {
  return (
    <[Module]Provider>
      <[Module]SPAContent />
    </[Module]Provider>
  );
};

export default [Module]Screen;
```

---

## ⚡ **PERFORMANCE PATTERNS**

### **Query Keys Pattern (OBLIGATORIO)**

```typescript
// En useInventoryQuery.ts
export const [MODULE]_QUERY_KEYS = {
  all: () => ["[module]"] as const,
  [entities]: (filters?: [Entity]Filters) => 
    ["[module]", "[entities]", filters] as const,
  [entity]: (id: string) => 
    ["[module]", "[entity]", id] as const,
  stats: () => 
    ["[module]", "stats"] as const,
} as const;
```

### **Memoized Components Pattern (OBLIGATORIO)**

```typescript
// Todos los tabs deben estar memoizados
const [Tab]Tab: React.FC = React.memo(function [Tab]Tab() {
  // Component implementation
  return (
    <TabTransition isActive={true} transitionType="fade" delay={0}>
      {/* Tab content */}
    </TabTransition>
  );
});

export default [Tab]Tab;
```

### **Sin Parpadeo Inicial (OBLIGATORIO)**

```typescript
// En componentes que usan animaciones
const [Component]: React.FC = () => {
  // 🚨 FIX: Prevent initial flicker
  const isFirstRender = useRef(true);
  const [allowAnimations, setAllowAnimations] = useState(false);
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const timer = setTimeout(() => setAllowAnimations(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className={cn(
      "base-classes",
      allowAnimations && "animate-fadeInUp"
    )}>
      {/* Content */}
    </div>
  );
};
```

### **Computed Properties Utilities (OBLIGATORIO)**

```typescript
// Cuando un componente necesita propiedades computadas
const compute[Entity]Props = (
  entity: [Entity]WithRelations
): [Entity]WithComputedProps => {
  // Calculate derived properties
  const computedValue = /* calculation */;
  
  return {
    ...entity,
    computedValue,
    formattedValue: new Intl.NumberFormat("es-MX").format(computedValue),
    status: /* derive status */,
  };
};

// Uso en componente
<[Entity]Card 
  [entity]={compute[Entity]Props(entity)}
  // ...
/>
```

---

## 🎨 **UI PATTERNS OBLIGATORIOS**

### **Barrel Exports (OBLIGATORIO)**

```typescript
// En CADA index.ts file
/**
 * 📦 [SECTION] - BARREL EXPORTS
 * ===============================
 */

// Componentes
export { default as Component1 } from "./Component1";
export { default as Component2 } from "./Component2";

// Hooks
export * from "./useHook1";
export * from "./useHook2";

// Types (cuando aplique)
export type * from "./types";
```

### **Component Props Pattern (OBLIGATORIO)**

```typescript
// Props interface para cada componente
interface [Component]Props {
  // Required props
  [entity]: [Entity]WithComputedProps;
  
  // Optional functionality
  showActions?: boolean;
  
  // Event handlers
  onEdit?: ([entity]: [Entity]) => void;
  onDelete?: ([entity]: [Entity]) => void;
  onView?: ([entity]: [Entity]) => void;
  
  // Styling
  className?: string;
}

// Component con memo
const [Component]: React.FC<[Component]Props> = React.memo(function [Component]({
  [entity],
  showActions = true,
  onEdit,
  onDelete,  
  onView,
  className,
}) => {
  // Implementation
});

export default [Component];
```

### **Modal Pattern (OBLIGATORIO)**

```typescript
// Para cada entidad, crear modales:
// - [Entity]Modal.tsx (create/edit)
// - [Entity]ViewModal.tsx (readonly view)  
// - Delete[Entity]Modal.tsx (delete confirmation)

const [Entity]Modal: React.FC = () => {
  const {
    is[Entity]ModalOpen,
    setIs[Entity]ModalOpen,
    editing[Entity],
    isEditMode,
  } = use[Module]Context();

  return (
    <Modal
      isOpen={is[Entity]ModalOpen}
      onClose={() => setIs[Entity]ModalOpen(false)}
      title={isEditMode ? "Editar [Entity]" : "Nuevo [Entity]"}
    >
      {/* Form content */}
    </Modal>
  );
};
```

---

## 📋 **CHECKLIST DE CALIDAD OBLIGATORIO**

Antes de considerar un módulo "completo", **DEBE** cumplir:

### **📁 Estructura**
- [ ] Estructura de carpetas exacta según estándar
- [ ] Barrel exports en todos los niveles (`index.ts`)
- [ ] Naming convention consistente

### **⚡ Performance**  
- [ ] **Cero errores de linter**
- [ ] Cache tags implementados correctamente
- [ ] Query keys estructurados
- [ ] Componentes memoizados donde corresponda
- [ ] **Sin parpadeo inicial en animaciones**

### **🎯 SPA Logic**
- [ ] **Todos los tabs siempre montados (true SPA)**
- [ ] Context con estado compartido
- [ ] Transiciones instantáneas entre tabs
- [ ] Header que se oculta al hacer scroll
- [ ] Performance indicator en development

### **🏗️ Architecture**
- [ ] Clean Architecture: Actions (thin) + Services (thick)
- [ ] TypeScript types completos y exportados
- [ ] Schemas Zod para validación
- [ ] Error handling consistente

### **🎨 UI/UX**
- [ ] Componentes shared reutilizables
- [ ] Modales para CRUD completo
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Accessibility compliant

### **🔄 Data Flow**
- [ ] TanStack Query para data fetching
- [ ] Optimistic updates donde corresponda
- [ ] Cache invalidation correcta
- [ ] Loading states apropiados

---

## 🚀 **FLUJO DE DESARROLLO**

### **1. Planificación**
1. Definir entidades principales del módulo
2. Diseñar tabs necesarios (máximo 6 tabs)
3. Identificar componentes reutilizables de otros módulos

### **2. Implementación (Orden obligatorio)**
1. **types.ts** - Definir todos los tipos
2. **constants.ts** - Cache tags y configuración
3. **schemas.ts** - Validaciones Zod
4. **server/service.ts** - Business logic
5. **actions.ts** - Server actions
6. **hooks/** - Custom hooks y queries
7. **context/** - React context
8. **ui/components/shared** - Componentes reutilizables  
9. **ui/components/tabs** - Tabs del SPA
10. **ui/routes** - Screen principal
11. **ui/components** - Modales y forms

### **3. Testing**
1. Verificar checklist de calidad
2. Probar navegación entre tabs
3. Verificar performance (no parpadeos)
4. Validar responsive design
5. Test de accessibility

### **4. Documentación**
1. Comentarios en componentes complejos
2. README específico del módulo (si necesario)
3. Actualizar este estándar si se identifican mejoras

---

## 📚 **EJEMPLOS REALES**

### **Módulo Inventory (Referencia)**
- ✅ Implementa todos los patrones correctamente  
- ✅ 4 tabs: Overview, Products, Categories, Suppliers
- ✅ Performance óptimo, sin parpadeos
- ✅ True SPA con estado preservado

### **Próximo: Módulo Storefront (Planeado)**
- 🔄 Seguirá exactamente este estándar
- 🔄 6 tabs: Overview, Products, Categories, Wishlist, Account, Support
- 🔄 Reutilizará componentes de inventory adaptándolos para customers

---

## 🛠️ **HERRAMIENTAS Y DEPENDENCIAS**

### **Obligatorias**
- Next.js 15 + React 19
- TypeScript (strict mode)
- TanStack Query v5
- Zod para validación
- Tailwind CSS + CSS Modules
- Lucide Icons

### **Recomendadas**
- React Hook Form (para forms complejos)
- Framer Motion (para animaciones avanzadas)  
- Date-fns (para manejo de fechas)

---

## 🔄 **VERSIONADO**

- **v1.0** - Estándar inicial basado en análisis de inventory
- **v1.1** - (Próximo) Refinamientos post-storefront

---

**📞 Contacto**: Este estándar es obligatorio. Para cambios o excepciones, discutir con el equipo de arquitectura.

---

*Documento generado el 2025-01-17 basado en análisis exhaustivo del módulo inventory*
