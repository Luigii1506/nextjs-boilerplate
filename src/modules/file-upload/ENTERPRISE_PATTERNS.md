# 🏆 ENTERPRISE PATTERNS V2.0 - ESTÁNDAR AVANZADO DE MÓDULOS

## 📐 ARQUITECTURA ENTERPRISE AVANZADA

### **Estructura de Carpetas (OBLIGATORIA - VERSIÓN 2.0)**

```
📁 modules/[module-name]/
├── 📊 constants/index.ts           # ⭐ NUEVO: Configuración centralizada
├── ⚙️ config/
│   ├── index.ts                    # ⭐ NUEVO: Configuration Manager
│   └── legacy.ts                   # ⭐ NUEVO: Backward compatibility
├── 📝 utils/
│   ├── index.ts                    # Utilities compartidos
│   └── logger.ts                   # ⭐ NUEVO: Sistema de logging avanzado
├── 🎯 reducers/index.ts            # ⭐ NUEVO: Estado optimista centralizado
├── 🏆 hooks/
│   └── use[ModuleName].ts          # SINGLE hook per module (ENHANCED)
├── 🏗️ server/
│   ├── actions/index.ts            # Server Actions (Source of Truth)
│   ├── services/index.ts           # Business Logic Layer
│   ├── queries/index.ts            # Database queries
│   └── mappers/index.ts            # Data transformation
├── 🧩 ui/
│   ├── components/
│   │   ├── shared/                 # ⭐ NUEVO: Componentes micro reutilizables
│   │   └── [ComponentName].tsx     # Componentes específicos
│   └── routes/                     # Pages/screens
├── 📝 types/index.ts               # TypeScript interfaces
├── 📋 schemas/index.ts             # Zod validation schemas
├── 📄 index.ts                     # ⭐ NUEVO: Barrel exports enterprise
├── 📚 ENTERPRISE_PATTERNS.md       # Esta documentación
└── 📊 OPTIMIZATION_SUMMARY.md      # ⭐ NUEVO: Métricas y logros
```

## 🎯 PRINCIPIOS EMPRESARIALES V2.0

### **1. Configuration-Driven Architecture**

- **Configuration Manager** centralizado con patrón Singleton
- **Feature flags** para habilitar/deshabilitar funcionalidades
- **Environment-specific configs** (dev, prod, high-performance)
- **User overrides** permitidos con merge inteligente

### **2. Structured Logging Excellence**

- **Enterprise Logger** con múltiples niveles y contexto
- **Performance timing** integrado para métricas
- **Module-specific loggers** con prefijos consistentes
- **Production-safe logging** con configuración por ambiente

### **3. Centralized State Management**

- **Optimistic reducers** con estado inmutable
- **Selector patterns** para queries eficientes
- **Action constants** centralizados y tipados
- **State analytics** con métricas detalladas

### **4. Single Source of Truth + Enhanced**

- **Server Actions** como única fuente de verdad
- **React 19 compliance** con useActionState correcto
- **Automatic cache invalidation** con tags específicos
- **Error boundaries** y manejo robusto de errores

### **5. Modular Component Architecture**

- **Shared micro-components** reutilizables
- **Barrel exports** organizados por responsabilidad
- **Legacy compatibility** mantenida automáticamente
- **Performance optimization** con React.memo y useCallback

### **6. Enterprise-Grade Performance**

- **Memoization strategies** aplicadas consistentemente
- **Bundle optimization** con tree-shaking automático
- **Lazy loading** de componentes pesados
- **Background sync** y refresh inteligente

## 🛠️ PATRONES DE IMPLEMENTACIÓN V2.0

### **📊 Constants Pattern (NUEVO)**

```typescript
// constants/index.ts
export const ENTERPRISE_CONFIG = {
  // 🔧 Feature flags
  enableOptimisticUI: true,
  enableAdvancedLogging: process.env.NODE_ENV === "development",
  enableProgressTracking: true,
  enableAutoRefresh: true,

  // ⚡ Performance settings
  debounceMs: 300,
  maxRetries: 3,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // 🕐 Timing constants
  uploadProgressDelay: 50,
  clearCompletedDelay: 2000,
  retryDelayMs: 1000,
  
  // 📊 UI Constants
  maxFilesPerBatch: 10,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  progressUpdateInterval: 100,
} as const;

// Action constants - TIPADOS Y CENTRALIZADOS
export const MODULE_ACTIONS = {
  START_UPLOAD: "START_UPLOAD",
  UPDATE_PROGRESS: "UPDATE_PROGRESS", 
  COMPLETE_UPLOAD: "COMPLETE_UPLOAD",
  FAIL_UPLOAD: "FAIL_UPLOAD",
  CLEAR_COMPLETED: "CLEAR_COMPLETED",
} as const;

// Status constants
export const MODULE_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading", 
  COMPLETED: "completed",
  ERROR: "error",
} as const;

// Cache tags para revalidation
export const CACHE_TAGS = {
  DATA: "module-data",
  STATS: "module-stats",
  CATEGORIES: "module-categories",
} as const;

// Logging levels
export const LOG_LEVELS = {
  INFO: "info",
  ERROR: "error", 
  DEBUG: "debug",
  WARN: "warn",
} as const;
```

### **📝 Enterprise Logger Pattern (NUEVO)**

```typescript
// utils/logger.ts
import { ENTERPRISE_CONFIG, LOG_LEVELS } from "../constants";

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type LogContext = Record<string, unknown>;

class EnterpriseLogger {
  private module: string;
  private sessionId: string;

  constructor(module: string) {
    this.module = module;
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === "error") return true; // Always log errors
    return ENTERPRISE_CONFIG.enableAdvancedLogging;
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog("info")) return;
    console.log(`🏆 ${this.module} ${message}`, context || "");
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;
    console.debug(`🔍 ${this.module} ${message}`, context || "");
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`❌ ${this.module} ${message}`, { 
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    });
  }

  // 🎯 Enterprise: Performance timing
  timeStart(label: string): void {
    if (this.shouldLog("debug")) {
      console.time(`⏱️ ${this.module} ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog("debug")) {
      console.timeEnd(`⏱️ ${this.module} ${label}`);
    }
  }

  // 🎯 Enterprise: Grouped logging
  group(title: string): void {
    if (this.shouldLog("debug")) {
      console.group(`🗂️ ${this.module} ${title}`);
    }
  }

  groupEnd(): void {
    if (this.shouldLog("debug")) {
      console.groupEnd();
    }
  }
}

// 🏗️ Factory function
export function createLogger(module: string): EnterpriseLogger {
  return new EnterpriseLogger(`[ModuleName] ${module}`);
}

// 🎯 Pre-configured loggers
export const moduleLogger = createLogger("Hook");
export const serverActionLogger = createLogger("ServerAction");
export const optimisticLogger = createLogger("Optimistic");
```

### **⚙️ Configuration Manager Pattern (NUEVO)**

```typescript
// config/index.ts
import { ENTERPRISE_CONFIG } from "../constants";

export interface EnterpriseModuleConfig {
  features: {
    optimisticUI: boolean;
    advancedLogging: boolean;
    progressTracking: boolean;
    autoRefresh: boolean;
  };
  performance: {
    debounceMs: number;
    maxRetries: number;
    cacheTimeout: number;
  };
  ui: {
    maxFilesPerBatch: number;
    maxFileSize: number;
  };
}

export class ModuleConfigManager {
  private static instance: ModuleConfigManager;
  private config: EnterpriseModuleConfig;
  private overrides: Partial<EnterpriseModuleConfig> = {};

  private constructor() {
    this.config = this.deepClone(DEFAULT_CONFIG);
  }

  public static getInstance(): ModuleConfigManager {
    if (!ModuleConfigManager.instance) {
      ModuleConfigManager.instance = new ModuleConfigManager();
    }
    return ModuleConfigManager.instance;
  }

  public getConfig(): EnterpriseModuleConfig {
    return this.mergeConfigs(this.config, this.overrides);
  }

  public setOverrides(overrides: Partial<EnterpriseModuleConfig>): void {
    this.overrides = this.deepClone(overrides);
  }

  public isFeatureEnabled(feature: keyof EnterpriseModuleConfig["features"]): boolean {
    return this.getConfig().features[feature];
  }
}

export const moduleConfig = ModuleConfigManager.getInstance();
```

### **🎯 Optimistic Reducer Pattern (NUEVO)**

```typescript
// reducers/index.ts
import { MODULE_ACTIONS } from "../constants";
import { optimisticLogger } from "../utils/logger";

export interface OptimisticState {
  items: Item[];
  lastUpdated: string;
  totalActiveItems: number;
}

export type OptimisticAction =
  | { type: typeof MODULE_ACTIONS.START_UPLOAD; files: File[]; tempIds: string[] }
  | { type: typeof MODULE_ACTIONS.UPDATE_PROGRESS; tempId: string; progress: number }
  | { type: typeof MODULE_ACTIONS.COMPLETE_UPLOAD; tempId: string }
  | { type: typeof MODULE_ACTIONS.CLEAR_COMPLETED };

// 🎯 Helper functions
const calculateActiveItems = (items: Item[]): number => {
  return items.filter(item => 
    item.status === "pending" || item.status === "processing"
  ).length;
};

// 🎯 ENTERPRISE REDUCER (immutable, logging integrated)
export function optimisticReducer(
  state: OptimisticState,
  action: OptimisticAction
): OptimisticState {
  optimisticLogger.debug(`Optimistic action: ${action.type}`, {
    currentState: state.items.length,
    activeItems: state.totalActiveItems,
  });

  switch (action.type) {
    case MODULE_ACTIONS.START_UPLOAD: {
      const newItems = action.tempIds.map((tempId, index) => ({
        id: tempId,
        progress: 0,
        status: "pending" as const,
        filename: action.files[index]?.name || `file-${index + 1}`,
      }));

      const nextState = {
        items: [...state.items, ...newItems],
        lastUpdated: new Date().toISOString(),
        totalActiveItems: 0, // Will be recalculated
      };

      nextState.totalActiveItems = calculateActiveItems(nextState.items);
      
      optimisticLogger.info(`Started ${newItems.length} item(s)`, {
        totalItems: nextState.items.length,
        activeItems: nextState.totalActiveItems,
      });

      return nextState;
    }

    // ... other cases
  }
}

// 🎯 Selector functions for derived state
export const optimisticSelectors = {
  getActiveItems: (state: OptimisticState) =>
    state.items.filter(item => 
      item.status === "pending" || item.status === "processing"
    ),

  getCompletedItems: (state: OptimisticState) => 
    state.items.filter(item => item.status === "completed"),

  hasActiveItems: (state: OptimisticState) => state.totalActiveItems > 0,

  getOverallProgress: (state: OptimisticState) => {
    if (state.items.length === 0) return 0;
    
    const totalProgress = state.items.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / state.items.length);
  },
};
```

### **🏆 Enhanced Hook Pattern (ACTUALIZADO)**

```typescript
// hooks/useModuleName.ts
import { useActionState, useOptimistic, useCallback, useMemo, useRef, useTransition, useEffect } from "react";
import { MODULE_ACTIONS } from "../constants";
import { moduleLogger } from "../utils/logger";
import { moduleConfig, adaptConfigForHook } from "../config";
import { optimisticReducer, createInitialOptimisticState, optimisticSelectors } from "../reducers";

export const useModuleName = (userConfig?: Config): Return => {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const hasInitialized = useRef(false);

  // 🏗️ ENTERPRISE: Configuration management
  const enterpriseConfig = useMemo(() => adaptConfigForHook(userConfig), [userConfig]);
  
  // 🎯 ENTERPRISE: Structured logging with performance tracking
  moduleLogger.timeStart("Hook Initialization");
  moduleLogger.debug("Hook initialized", {
    hasUserConfig: !!userConfig,
    enterpriseFeatures: moduleConfig.getConfigSummary(),
  });
  moduleLogger.timeEnd("Hook Initialization");

  // 🎯 PRIMARY DATA STATE (Server Actions as Source of Truth)
  const [dataState, dataAction, dataPending] = useActionState(
    async (): Promise<ActionResult> => {
      moduleLogger.debug("Fetching data from server");
      return await getDataServerAction();
    },
    null
  );

  // 🎯 OPTIMISTIC STATE (UI feedback only) - Enterprise managed
  const [optimisticState, addOptimistic] = useOptimistic(
    createInitialOptimisticState(),
    optimisticReducer
  );

  // 🚀 AUTO-INITIALIZATION (React 19 compliant)
  useEffect(() => {
    if (!hasInitialized.current && user) {
      hasInitialized.current = true;
      
      moduleLogger.group("Module Initialization");
      moduleLogger.info("Initializing module", {
        userId: user.id,
        configSummary: moduleConfig.getConfigSummary(),
      });

      // Load initial data AFTER render (React 19 compliance)
      startTransition(() => {
        dataAction();
      });
      
      moduleLogger.groupEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user - actions are stable

  // 🎯 COMPUTED STATES (Enterprise patterns)
  const isLoading = useMemo(() => dataPending || isPending, [dataPending, isPending]);
  const data = useMemo(() => (dataState?.success ? dataState.data : []), [dataState]);
  const error = useMemo(() => dataState?.error || null, [dataState?.error]);

  // 🏆 ENTERPRISE RETURN INTERFACE (Enhanced with selectors and performance metrics)
  return useMemo(() => ({
    // 📊 Core Data
    data,
    optimisticState: optimisticState.items,

    // 🔄 Loading States (Enhanced with granular state)
    isLoading,
    isProcessing: optimisticSelectors.hasActiveItems(optimisticState),
    isPending,
    
    // 🎯 Analytics
    activeItems: optimisticSelectors.getActiveItems(optimisticState),
    completedItems: optimisticSelectors.getCompletedItems(optimisticState),
    overallProgress: optimisticSelectors.getOverallProgress(optimisticState),

    // ❌ Error States
    error,
    hasError: !!error,

    // 🎯 Actions (Performance optimized)
    performAction: useCallback(async (input) => {
      // Optimistic UI (configurable)
      if (enterpriseConfig.features.optimisticUI) {
        startTransition(() => {
          addOptimistic({ 
            type: MODULE_ACTIONS.START_UPLOAD, 
            files: input.files, 
            tempIds: input.tempIds 
          });
        });
      }

      // Server Action
      const result = await performServerAction(input);

      // Auto-refresh (configurable)
      if (result.success && enterpriseConfig.features.autoRefresh) {
        startTransition(() => {
          dataAction();
        });
      }

      return result;
    }, [enterpriseConfig, addOptimistic, dataAction]),

    // 🔄 Refresh Actions
    refresh: useCallback(() => {
      moduleLogger.debug("Manual refresh requested");
      startTransition(() => dataAction());
    }, []),

    // 🏗️ Configuration & Debugging
    config: enterpriseConfig,
    configSummary: moduleConfig.getConfigSummary(),
    
    // 📊 Performance Metrics (Development only)
    ...(process.env.NODE_ENV === "development" && {
      debug: {
        hasInitialized: hasInitialized.current,
        optimisticState,
        enterpriseConfig,
        selectors: optimisticSelectors,
      },
    }),
  }), [data, optimisticState, isLoading, isPending, error, enterpriseConfig]);
};
```

### **🏗️ Server Actions Pattern (ENHANCED)**

```typescript
// server/actions/index.ts
import { serverActionLogger } from "../../utils/logger";
import { CACHE_TAGS } from "../../constants";

export async function performActionServerAction(
  formData: FormData
): Promise<ActionResult> {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  serverActionLogger.timeStart(`Action ${requestId}`);
  serverActionLogger.info("Server action started", { requestId });

  try {
    // 1. Authentication & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      serverActionLogger.error("Unauthorized access attempt", null, { requestId });
      return { success: false, error: "No autorizado" };
    }

    // 2. Validation (Zod schemas)
    const validated = parseInputSchema(Object.fromEntries(formData));
    serverActionLogger.debug("Input validated", { requestId, inputKeys: Object.keys(validated) });

    // 3. Business Logic (Service layer)
    const result = await moduleService.performAction(validated);
    serverActionLogger.info("Business logic completed", { requestId, resultType: typeof result });

    // 4. Cache Invalidation (with logging)
    revalidateTag(CACHE_TAGS.DATA);
    revalidatePath("/module");
    serverActionLogger.debug("Cache invalidated", { requestId, tags: [CACHE_TAGS.DATA] });

    serverActionLogger.timeEnd(`Action ${requestId}`);
    return { success: true, data: result };
  } catch (error) {
    serverActionLogger.error("Server action failed", error, { requestId });
    serverActionLogger.timeEnd(`Action ${requestId}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### **📄 Barrel Exports Pattern (NUEVO)**

```typescript
// index.ts - Enterprise exports organizados
// 🎯 Core Hooks (Enterprise Enhanced)
export { useModuleName } from "./hooks/useModuleName";

// 📝 Types & Interfaces  
export * from "./types";

// 🏗️ Enterprise Configuration System
export {
  type EnterpriseModuleConfig,
  ModuleConfigManager,
  moduleConfig,
  adaptConfigForHook,
  configUtils,
} from "./config";

// 📊 Enterprise Constants
export {
  ENTERPRISE_CONFIG,
  MODULE_ACTIONS,
  MODULE_STATUS,
  CACHE_TAGS,
  LOG_LEVELS,
} from "./constants";

// 📝 Enterprise Logging System
export {
  createLogger,
  moduleLogger,
  serverActionLogger,
  optimisticLogger,
} from "./utils/logger";

// 🔄 State Management (Optimistic Updates)
export {
  optimisticReducer,
  createInitialOptimisticState,
  optimisticSelectors,
} from "./reducers";

// 🎯 Server Layer
export * from "./server";

// 🧩 UI Components (Enterprise Ready)
export * from "./ui";

// 🔧 Utilities
export * from "./utils";
```

### **🧩 Shared Components Pattern (NUEVO)**

```typescript
// ui/components/shared/FileIcon.tsx
import React from "react";
import { getFileIcon } from "../../../utils";

interface FileIconProps {
  filename: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const FileIcon = React.memo<FileIconProps>(({ filename, className, size = "md" }) => {
  const icon = getFileIcon(filename);
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
  };

  return React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
    className: `${sizeClasses[size]} ${className || ""}`.trim(),
  });
});

FileIcon.displayName = "FileIcon";

// ui/components/shared/FileSize.tsx
export const FileSize = React.memo<{ size: number; className?: string }>(
  ({ size, className }) => (
    <span className={className}>{formatFileSize(size)}</span>
  )
);

// ui/components/shared/ProgressBar.tsx
export const ProgressBar = React.memo<{ 
  progress: number; 
  className?: string;
  showPercentage?: boolean;
}>(({ progress, className, showPercentage = true }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(progress, 100)}%` }}
    />
    {showPercentage && (
      <span className="text-xs text-gray-600 ml-2">{progress}%</span>
    )}
  </div>
));

// ui/components/shared/index.ts
export { FileIcon } from "./FileIcon";
export { FileSize } from "./FileSize"; 
export { ProgressBar } from "./ProgressBar";
```

## 🔧 ERROR HANDLING STANDARDS V2.0

### **Enhanced Result Pattern**

```typescript
// types/index.ts
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string; // Para tracking
  metadata?: Record<string, unknown>; // Para contexto adicional
}

interface ErrorDetails {
  code: string;
  message: string;
  field?: string; // Para errores de validación
  context?: Record<string, unknown>;
}

interface EnhancedActionResult<T = unknown> extends ActionResult<T> {
  errors?: ErrorDetails[]; // Para múltiples errores
  warnings?: string[]; // Para advertencias no críticas
}
```

### **Error Categories (ACTUALIZADO)**

- **AUTH_ERROR**: Usuario no autenticado/autorizado
- **VALIDATION_ERROR**: Datos inválidos (con field específico)
- **BUSINESS_ERROR**: Reglas de negocio violadas
- **NETWORK_ERROR**: Problemas de conectividad
- **SYSTEM_ERROR**: Errores de infraestructura
- **RATE_LIMIT_ERROR**: Límites de API excedidos
- **CONFIGURATION_ERROR**: Problemas de configuración

### **Error Boundary Pattern**

```typescript
// ui/components/ErrorBoundary.tsx
export class ModuleErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<any> }>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    moduleLogger.error("Module error boundary triggered", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    moduleLogger.error("Detailed error info", error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## 🚀 PERFORMANCE PATTERNS V2.0

### **React Optimization Standards**

```typescript
// Performance-optimized component pattern
export const OptimizedComponent = React.memo<ComponentProps>(
  ({ data, onAction, config }) => {
    // Memoized calculations
    const processedData = useMemo(() => 
      data.map(item => processItem(item, config)), 
      [data, config]
    );

    // Memoized callbacks
    const handleAction = useCallback((id: string) => {
      onAction(id);
    }, [onAction]);

    // Memoized sub-components
    const ItemComponent = useMemo(() => 
      React.memo<ItemProps>(({ item, onItemAction }) => (
        <div onClick={() => onItemAction(item.id)}>
          {item.name}
        </div>
      )),
      []
    );

    return (
      <div>
        {processedData.map(item => (
          <ItemComponent 
            key={item.id} 
            item={item} 
            onItemAction={handleAction}
          />
        ))}
      </div>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    return (
      prevProps.data.length === nextProps.data.length &&
      prevProps.config.version === nextProps.config.version
    );
  }
);
```

### **Loading States (ENHANCED)**

- **Skeleton loading**: Para perceived performance
- **Progressive loading**: Cargar datos por partes
- **Background refresh**: Actualizar sin bloquear UI
- **Optimistic loading**: Mostrar cambios inmediatamente
- **Error recovery**: Retry automático con backoff

### **Bundle Optimization**

```typescript
// Lazy loading pattern
const HeavyComponent = React.lazy(() => 
  import("./HeavyComponent").then(module => ({
    default: module.HeavyComponent
  }))
);

// Code splitting con dynamic imports
const loadFeature = async () => {
  const { feature } = await import("./feature");
  return feature;
};
```

## 🧪 TESTING STANDARDS V2.0

### **Hook Testing Pattern**

```typescript
// __tests__/useModuleName.test.ts
import { renderHook, act } from "@testing-library/react";
import { useModuleName } from "../hooks/useModuleName";

describe("useModuleName", () => {
  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useModuleName());
    
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should handle optimistic updates correctly", async () => {
    const { result } = renderHook(() => useModuleName());
    
    await act(async () => {
      await result.current.performAction({ files: [mockFile] });
    });

    expect(result.current.activeItems).toHaveLength(1);
  });
});
```

### **Component Testing with MSW**

```typescript
// __tests__/Component.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Component } from "../Component";

const server = setupServer(
  rest.post("/api/module", (req, res, ctx) => {
    return res(ctx.json({ success: true, data: mockData }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 📚 MIGRATION CHECKLIST V2.0

Para migrar un módulo existente al estándar empresarial:

### **Arquitectura**
- [ ] **📊 Constants centralizados** en `/constants/index.ts`
- [ ] **⚙️ Configuration Manager** con patrón Singleton
- [ ] **📝 Sistema de logging** con EnterpriseLogger
- [ ] **🎯 Reducers optimistas** con selectors
- [ ] **🧩 Shared components** micro-reutilizables

### **Hook Enterprise**
- [ ] **🏆 Un solo hook** por módulo con configuración avanzada
- [ ] **React 19 compliance** con useActionState correcto
- [ ] **Performance optimization** con memoización
- [ ] **Estado unificado** con analytics integradas

### **Server Layer**
- [ ] **🏗️ Server Actions** como única fuente de verdad
- [ ] **Logging estructurado** en todas las acciones
- [ ] **Cache invalidation** automática con tags
- [ ] **Error handling** robusto con categorías

### **UI Layer**
- [ ] **📄 Barrel exports** organizados por responsabilidad
- [ ] **🎨 Componentes optimizados** con React.memo
- [ ] **Error boundaries** para manejo de errores
- [ ] **Lazy loading** para componentes pesados

### **Quality Assurance**
- [ ] **TypeScript strict** mode habilitado
- [ ] **ESLint** configurado con reglas enterprise
- [ ] **Tests unitarios** para hooks y componentes
- [ ] **Tests E2E** para flujos críticos
- [ ] **📊 Documentación** actualizada (ENTERPRISE_PATTERNS.md)

---

## 🎯 IMPLEMENTACIÓN PRÁCTICA

### **Orden de Implementación Recomendado**

1. **Fase 1: Foundation**
   - Crear `/constants/index.ts` con configuración centralizada
   - Implementar `/utils/logger.ts` con EnterpriseLogger
   - Configurar `/config/index.ts` con ConfigManager

2. **Fase 2: State Management**
   - Crear `/reducers/index.ts` con optimistic state
   - Implementar selectors para queries eficientes
   - Configurar action types centralizados

3. **Fase 3: Hook Enhancement**
   - Refactorizar hook principal con nuevos patrones
   - Implementar React 19 compliance
   - Agregar performance optimizations

4. **Fase 4: UI Optimization**
   - Crear shared components reutilizables
   - Implementar React.memo y useCallback
   - Configurar lazy loading

5. **Fase 5: Server Integration** 
   - Enhancear Server Actions con logging
   - Implementar error handling robusto
   - Configurar cache invalidation

6. **Fase 6: Quality & Documentation**
   - Configurar tests unitarios y E2E
   - Crear documentación enterprise
   - Configurar barrel exports

---

## 🏆 ENTERPRISE EXCELLENCE ACHIEVED

**Este template representa el estándar MÁS ALTO de desarrollo de módulos empresariales:**

✅ **Arquitectura modular** y escalable
✅ **Performance optimizado** con métricas
✅ **Logging estructurado** para debugging
✅ **Configuración extensible** por ambiente
✅ **Estado predecible** con analytics
✅ **React 19 compliance** total
✅ **TypeScript strict** mode
✅ **Testing** comprehensivo
✅ **Documentación** completa

**🚀 Úsalo como base para TODOS los módulos futuros.**
