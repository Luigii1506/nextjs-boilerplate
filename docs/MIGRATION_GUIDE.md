# 🔄 **TANSTACK QUERY MIGRATION GUIDE**

## Guía para Migrar Módulos Existentes

> **Cómo transformar tus módulos legacy en módulos TanStack Query enterprise de manera sistemática y sin romper nada.**

---

## 🎯 **PROPÓSITO DE ESTA GUÍA**

Esta guía te ayudará a:

- ✅ **Migrar módulos existentes** sin romper la funcionalidad actual
- ✅ **Mantener backward compatibility** durante la transición
- ✅ **Implementar gradualmente** TanStack Query sin big-bang changes
- ✅ **Validar que todo funciona** antes de eliminar código legacy
- ✅ **Optimizar performance** progresivamente

---

## 📋 **TABLA DE CONTENIDO**

1. [🔍 Auditoría Pre-Migración](#auditoría-pre-migración)
2. [📊 Estrategias de Migración](#estrategias-de-migración)
3. [🏗️ Plan de Migración Paso a Paso](#plan-de-migración)
4. [⚙️ Implementación Gradual](#implementación-gradual)
5. [🧪 Testing y Validación](#testing-y-validación)
6. [🧹 Limpieza Final](#limpieza-final)
7. [📝 Checklist de Migración](#checklist-de-migración)

---

## 🔍 **AUDITORÍA PRE-MIGRACIÓN**

### Paso 1: Inventario de Módulos Existentes

```typescript
// 📋 Template: Auditoría de Módulo
interface ModuleAudit {
  moduleName: string;
  moduleType: "large" | "small"; // CRUD completo vs simple
  currentPattern: "useState" | "useReducer" | "custom-hooks" | "context";
  dataOperations: {
    hasCreate: boolean;
    hasRead: boolean;
    hasUpdate: boolean;
    hasDelete: boolean;
    hasSearch: boolean;
    hasFilters: boolean;
    hasPagination: boolean;
  };
  complexity: "low" | "medium" | "high";
  priority: "critical" | "high" | "medium" | "low";
  estimatedHours: number;
}

// Ejemplo de auditoría
const auditResults: ModuleAudit[] = [
  {
    moduleName: "users",
    moduleType: "large",
    currentPattern: "custom-hooks",
    dataOperations: {
      hasCreate: true,
      hasRead: true,
      hasUpdate: true,
      hasDelete: true,
      hasSearch: true,
      hasFilters: true,
      hasPagination: false,
    },
    complexity: "high",
    priority: "critical",
    estimatedHours: 16,
  },
  {
    moduleName: "dashboard",
    moduleType: "small",
    currentPattern: "useState",
    dataOperations: {
      hasCreate: false,
      hasRead: true,
      hasUpdate: false,
      hasDelete: false,
      hasSearch: false,
      hasFilters: false,
      hasPagination: false,
    },
    complexity: "low",
    priority: "high",
    estimatedHours: 4,
  },
  // ... otros módulos
];
```

### Paso 2: Identificar Dependencies y Riesgos

```typescript
// 📋 Template: Análisis de Riesgos
interface RiskAnalysis {
  moduleName: string;
  dependencies: string[]; // Otros módulos que dependen de este
  sharedHooks: string[]; // Hooks compartidos que usa
  criticalPaths: string[]; // Flujos críticos de usuario
  testCoverage: number; // % de cobertura de tests
  risks: {
    level: "low" | "medium" | "high";
    description: string;
    mitigation: string;
  }[];
}
```

### Paso 3: Priorización de Migración

```typescript
// 🎯 Matriz de Priorización
const migrationPriority = auditResults
  .map((module) => ({
    ...module,
    score: calculatePriorityScore(module), // Algoritmo de scoring
  }))
  .sort((a, b) => b.score - a.score);

const calculatePriorityScore = (module: ModuleAudit): number => {
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  const complexityPenalty = { low: 0, medium: -1, high: -2 };

  return priorityWeight[module.priority] + complexityPenalty[module.complexity];
};
```

---

## 📊 **ESTRATEGIAS DE MIGRACIÓN**

### Estrategia 1: Big Bang Migration (No Recomendado)

```
❌ Cambiar todo el módulo de una vez
❌ Alto riesgo de romper funcionalidad
❌ Difícil de debuggear si algo falla
❌ Rollback complejo
```

### Estrategia 2: Parallel Implementation (Recomendado)

```
✅ Implementar TanStack Query en paralelo
✅ Mantener hooks legacy funcionando
✅ Migrar componentes gradualmente
✅ Rollback fácil si hay problemas
✅ Testing exhaustivo antes de cleanup
```

### Estrategia 3: Hybrid Approach (Para Módulos Complejos)

```
✅ Dividir módulo en sub-funcionalidades
✅ Migrar una funcionalidad a la vez
✅ Mantener backward compatibility
✅ Validar cada migración antes de continuar
```

---

## 🏗️ **PLAN DE MIGRACIÓN PASO A PASO**

### Fase 1: Preparación y Setup

```typescript
// 🎯 Paso 1.1: Setup TanStack Query (Si no existe)
// Ya cubierto en CHEAT_SHEET.md → Setup Rápido

// 🎯 Paso 1.2: Crear estructura del módulo
/*
src/features/[module]/
├── hooks/
│   ├── use[Module]Query.ts          # ← NUEVO: TanStack Query hook
│   ├── use[Module]Legacy.ts         # ← RENOMBRAR: Hook existente
│   └── index.ts                     # ← ACTUALIZAR: Exports
├── constants.ts                     # ← CREAR: Query keys y config
└── types.ts                         # ← VERIFICAR: Tipos actualizados
*/

// 🎯 Paso 1.3: Crear constants file
export const [MODULE]_QUERY_KEYS = {
  all: () => ['[modules]'] as const,
  lists: () => [...[MODULE]_QUERY_KEYS.all(), 'list'] as const,
  // ... resto de query keys
} as const;

export const [MODULE]_CONFIG = {
  STALE_TIME: 30 * 1000,
  CACHE_TIME: 5 * 60 * 1000,
} as const;
```

### Fase 2: Implementación Paralela

```typescript
// 🎯 Paso 2.1: Implementar hook TanStack Query
// src/features/[module]/hooks/use[Module]Query.ts
export const use[Module]Query = () => {
  // Implementar usando templates del CHEAT_SHEET.md

  // ✅ Mantener la misma API que el hook legacy
  return {
    [modules]: data || [],
    isLoading,
    error,
    create[Module]: createMutation.mutateAsync,
    update[Module]: updateMutation.mutateAsync,
    delete[Module]: deleteMutation.mutateAsync,
    refresh: refetch,
  };
};

// 🎯 Paso 2.2: Crear hook de compatibilidad
// src/features/[module]/hooks/use[Module]Compatibility.ts
export const use[Module]Compatibility = () => {
  // Flag para controlar qué implementación usar
  const USE_TANSTACK_QUERY = process.env.NEXT_PUBLIC_USE_TANSTACK_QUERY === 'true';

  if (USE_TANSTACK_QUERY) {
    return use[Module]Query();
  } else {
    return use[Module]Legacy();
  }
};

// 🎯 Paso 2.3: Actualizar exports
// src/features/[module]/hooks/index.ts
export { use[Module]Compatibility as use[Module] } from './use[Module]Compatibility';
export { use[Module]Query } from './use[Module]Query';
export { use[Module]Legacy } from './use[Module]Legacy';
```

### Fase 3: Migration Testing

```typescript
// 🎯 Paso 3.1: A/B Testing Setup
const useFeatureFlag = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  // Toggle entre implementaciones para testing
  useEffect(() => {
    const flag = localStorage.getItem("tanstack-query-enabled");
    setIsEnabled(flag === "true");
  }, []);

  return {
    isEnabled,
    toggle: () => {
      const newValue = !isEnabled;
      setIsEnabled(newValue);
      localStorage.setItem("tanstack-query-enabled", newValue.toString());
    },
  };
};

// 🎯 Paso 3.2: Testing Component
const MigrationTester = ({ moduleName }: { moduleName: string }) => {
  const { isEnabled, toggle } = useFeatureFlag();

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded">
      <label>
        <input type="checkbox" checked={isEnabled} onChange={toggle} />
        TanStack Query ({moduleName})
      </label>
    </div>
  );
};
```

### Fase 4: Migración Gradual de Componentes

```typescript
// 🎯 Paso 4.1: Migrar componente por componente
// Ejemplo: UsersList Component

// ❌ ANTES - Usando hook legacy
const UsersListLegacy = () => {
  const { users, isLoading } = useUsersLegacy();
  // ...resto del componente
};

// ✅ DESPUÉS - Usando TanStack Query
const UsersListOptimized = () => {
  const { users, isLoading } = useUsersQuery();
  // ...mismo componente, diferentes datos
};

// 🔄 TRANSICIÓN - Usando compatibility hook
const UsersList = () => {
  const USE_OPTIMIZED =
    process.env.NODE_ENV === "development" ||
    localStorage.getItem("use-tanstack-query") === "true";

  if (USE_OPTIMIZED) {
    return <UsersListOptimized />;
  }

  return <UsersListLegacy />;
};
```

### Fase 5: Validación y Performance Testing

```typescript
// 🎯 Paso 5.1: Performance Comparison
const PerformanceMonitor = ({ moduleName }: { moduleName: string }) => {
  const [metrics, setMetrics] = useState<{
    legacy: { loadTime: number; renderTime: number };
    optimized: { loadTime: number; renderTime: number };
  }>();

  const measurePerformance = async (implementation: "legacy" | "optimized") => {
    const start = performance.now();

    // Simular carga de datos
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));

    const loadTime = performance.now() - start;

    // Medir render time
    const renderStart = performance.now();
    await new Promise((resolve) => setTimeout(resolve, 50)); // Simular render
    const renderTime = performance.now() - renderStart;

    setMetrics((prev) => ({
      ...prev,
      [implementation]: { loadTime, renderTime },
    }));
  };

  return (
    <div className="performance-monitor">
      <h3>Performance Comparison - {moduleName}</h3>
      <button onClick={() => measurePerformance("legacy")}>Test Legacy</button>
      <button onClick={() => measurePerformance("optimized")}>
        Test Optimized
      </button>

      {metrics && (
        <div>
          <div>
            Legacy: {metrics.legacy?.loadTime}ms load,{" "}
            {metrics.legacy?.renderTime}ms render
          </div>
          <div>
            Optimized: {metrics.optimized?.loadTime}ms load,{" "}
            {metrics.optimized?.renderTime}ms render
          </div>
          <div>
            Improvement:{" "}
            {metrics.legacy && metrics.optimized
              ? `${(
                  ((metrics.legacy.loadTime - metrics.optimized.loadTime) /
                    metrics.legacy.loadTime) *
                  100
                ).toFixed(1)}%`
              : "N/A"}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## ⚙️ **IMPLEMENTACIÓN GRADUAL**

### Template: Migration Hook Pattern

```typescript
// 🎯 Universal Migration Pattern
export const createMigrationHook = <T>(
  legacyHook: () => T,
  optimizedHook: () => T,
  moduleName: string
) => {
  return (): T => {
    const [useOptimized, setUseOptimized] = useState(() => {
      // Check feature flags
      const envFlag = process.env.NEXT_PUBLIC_TANSTACK_QUERY_ENABLED === "true";
      const localFlag =
        typeof window !== "undefined" &&
        localStorage.getItem(`tanstack-${moduleName}`) === "true";
      const devMode = process.env.NODE_ENV === "development";

      return envFlag || localFlag || devMode;
    });

    // Performance monitoring
    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const implementation = useOptimized ? "optimized" : "legacy";

        console.log(
          `${moduleName} ${implementation} hook took ${endTime - startTime}ms`
        );

        // Send to analytics
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "hook_performance", {
            module_name: moduleName,
            implementation,
            duration: endTime - startTime,
          });
        }
      };
    }, [useOptimized, moduleName]);

    // Error boundary for optimized version
    try {
      return useOptimized ? optimizedHook() : legacyHook();
    } catch (error) {
      console.error(
        `Error in ${useOptimized ? "optimized" : "legacy"} ${moduleName} hook:`,
        error
      );

      // Fallback to legacy if optimized fails
      if (useOptimized) {
        console.warn(`Falling back to legacy ${moduleName} hook`);
        setUseOptimized(false);
        return legacyHook();
      }

      throw error;
    }
  };
};

// Usage example
export const useUsers = createMigrationHook(
  useUsersLegacy,
  useUsersQuery,
  "users"
);
```

### Feature Flag Management

```typescript
// 🎯 Centralized Feature Flag Management
interface FeatureFlags {
  tanstackQuery: {
    users: boolean;
    dashboard: boolean;
    orders: boolean;
    products: boolean;
  };
}

export const useFeatureFlags = (): FeatureFlags => {
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    const defaultFlags: FeatureFlags = {
      tanstackQuery: {
        users: false,
        dashboard: false,
        orders: false,
        products: false,
      },
    };

    if (typeof window === "undefined") return defaultFlags;

    // Load from localStorage
    try {
      const stored = localStorage.getItem("feature-flags");
      return stored ? { ...defaultFlags, ...JSON.parse(stored) } : defaultFlags;
    } catch {
      return defaultFlags;
    }
  });

  const updateFlag = (
    module: keyof FeatureFlags["tanstackQuery"],
    enabled: boolean
  ) => {
    const newFlags = {
      ...flags,
      tanstackQuery: {
        ...flags.tanstackQuery,
        [module]: enabled,
      },
    };

    setFlags(newFlags);
    localStorage.setItem("feature-flags", JSON.stringify(newFlags));
  };

  return { ...flags, updateFlag };
};

// Feature Flag UI Component
export const FeatureFlagPanel = () => {
  const { tanstackQuery, updateFlag } = useFeatureFlags();

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed top-4 left-4 bg-gray-800 text-white p-4 rounded shadow-lg">
      <h3 className="text-lg font-bold mb-2">Feature Flags - TanStack Query</h3>
      <div className="space-y-2">
        {Object.entries(tanstackQuery).map(([module, enabled]) => (
          <label key={module} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => updateFlag(module as any, e.target.checked)}
            />
            <span>{module}</span>
            <span
              className={`px-2 py-1 text-xs rounded ${
                enabled ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {enabled ? "TanStack" : "Legacy"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
```

---

## 🧪 **TESTING Y VALIDACIÓN**

### Test Suite para Migration

```typescript
// 🧪 Migration Test Suite Template
describe('[Module] Migration Tests', () => {
  describe('Hook Compatibility', () => {
    it('should return same API shape for both implementations', () => {
      const { result: legacyResult } = renderHook(() => use[Module]Legacy());
      const { result: optimizedResult } = renderHook(() => use[Module]Query());

      // Verificar que ambos hooks tienen las mismas propiedades
      const legacyKeys = Object.keys(legacyResult.current).sort();
      const optimizedKeys = Object.keys(optimizedResult.current).sort();

      expect(legacyKeys).toEqual(optimizedKeys);
    });

    it('should handle CRUD operations consistently', async () => {
      // Test con legacy implementation
      const { result: legacy } = renderHook(() => use[Module]Legacy());

      // Test con optimized implementation
      const { result: optimized } = renderHook(() => use[Module]Query());

      // Verificar que ambas implementaciones manejan las operaciones igual
      const testData = { name: 'Test', email: 'test@example.com' };

      await act(async () => {
        await legacy.current.create[Module](testData);
      });

      await act(async () => {
        await optimized.current.create[Module](testData);
      });

      // Ambas implementaciones deberían tener los mismos resultados
      expect(legacy.current.[modules]).toEqual(optimized.current.[modules]);
    });
  });

  describe('Performance Tests', () => {
    it('optimized version should be faster or equal', async () => {
      const legacyStart = performance.now();
      const { result: legacy } = renderHook(() => use[Module]Legacy());
      await waitFor(() => !legacy.current.isLoading);
      const legacyTime = performance.now() - legacyStart;

      const optimizedStart = performance.now();
      const { result: optimized } = renderHook(() => use[Module]Query());
      await waitFor(() => !optimized.current.isLoading);
      const optimizedTime = performance.now() - optimizedStart;

      // Optimized should be faster or at most 20% slower (within margin of error)
      expect(optimizedTime).toBeLessThanOrEqual(legacyTime * 1.2);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors consistently', async () => {
      // Mock API error
      const mockError = new Error('API Error');
      jest.spyOn(global, 'fetch').mockRejectedValueOnce(mockError);

      const { result: legacy } = renderHook(() => use[Module]Legacy());
      const { result: optimized } = renderHook(() => use[Module]Query());

      // Ambas implementaciones deberían manejar errores de manera similar
      await waitFor(() => {
        expect(legacy.current.error).toBeTruthy();
        expect(optimized.current.error).toBeTruthy();
      });
    });
  });
});
```

### E2E Migration Tests

```typescript
// 🧪 E2E Migration Test
describe("[Module] E2E Migration", () => {
  it("should work with feature flag toggle", () => {
    // Start with legacy
    cy.visit("/[module]");
    cy.window().then((win) => {
      win.localStorage.setItem("tanstack-[module]", "false");
    });

    // Test legacy functionality
    cy.get('[data-testid="create-button"]').click();
    cy.get('[data-testid="name-input"]').type("Test Name");
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="[module]-list"]').should("contain", "Test Name");

    // Toggle to optimized
    cy.window().then((win) => {
      win.localStorage.setItem("tanstack-[module]", "true");
    });
    cy.reload();

    // Test optimized functionality - should work the same
    cy.get('[data-testid="[module]-list"]').should("contain", "Test Name");
    cy.get('[data-testid="create-button"]').click();
    cy.get('[data-testid="name-input"]').type("Test Name 2");
    cy.get('[data-testid="submit-button"]').click();
    cy.get('[data-testid="[module]-list"]').should("contain", "Test Name 2");
  });
});
```

---

## 🧹 **LIMPIEZA FINAL**

### Checklist de Cleanup

```typescript
// 📋 Cleanup Checklist Template
const cleanupChecklist = [
  // 🗂️ Files
  "Delete use[Module]Legacy.ts",
  "Delete use[Module]Compatibility.ts",
  "Rename use[Module]Query.ts to use[Module].ts",
  "Update all import statements",
  "Remove feature flag logic",

  // 🧪 Tests
  "Remove migration-specific tests",
  "Update existing tests to use new hooks",
  "Add performance regression tests",

  // 📚 Documentation
  "Update API documentation",
  "Update README.md",
  "Document breaking changes (if any)",

  // ⚙️ Configuration
  "Remove feature flags from environment variables",
  "Update deployment scripts",
  "Update monitoring/analytics",
];
```

### Automated Cleanup Script

```typescript
// 🤖 Automated Cleanup Script
const cleanup = async (moduleName: string) => {
  const fs = require("fs");
  const path = require("path");

  const moduleDir = path.join("src/features", moduleName);

  console.log(`🧹 Cleaning up ${moduleName} module...`);

  // 1. Remove legacy files
  const filesToRemove = [
    `${moduleDir}/hooks/use${moduleName}Legacy.ts`,
    `${moduleDir}/hooks/use${moduleName}Compatibility.ts`,
  ];

  filesToRemove.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✅ Removed ${file}`);
    }
  });

  // 2. Rename optimized hook to main hook
  const optimizedHook = `${moduleDir}/hooks/use${moduleName}Query.ts`;
  const mainHook = `${moduleDir}/hooks/use${moduleName}.ts`;

  if (fs.existsSync(optimizedHook)) {
    fs.renameSync(optimizedHook, mainHook);
    console.log(`✅ Renamed ${optimizedHook} to ${mainHook}`);
  }

  // 3. Update index.ts exports
  const indexFile = `${moduleDir}/hooks/index.ts`;
  let indexContent = fs.readFileSync(indexFile, "utf8");

  // Remove compatibility exports
  indexContent = indexContent.replace(
    /export.*use\w+Compatibility.*from.*;\n/g,
    ""
  );
  indexContent = indexContent.replace(/export.*use\w+Legacy.*from.*;\n/g, "");

  // Update main export
  indexContent = indexContent.replace(/use\w+Query/g, `use${moduleName}`);

  fs.writeFileSync(indexFile, indexContent);
  console.log(`✅ Updated ${indexFile}`);

  console.log(`🎉 Cleanup completed for ${moduleName}!`);
};

// Usage: node cleanup-script.js users
const moduleName = process.argv[2];
if (moduleName) {
  cleanup(moduleName);
} else {
  console.log("Usage: node cleanup-script.js <module-name>");
}
```

---

## 📝 **CHECKLIST DE MIGRACIÓN**

### Pre-Migration

- [ ] **Auditoría completa del módulo existente**

  - [ ] Identificar todas las operaciones CRUD
  - [ ] Mapear dependencies con otros módulos
  - [ ] Evaluar cobertura de tests existentes
  - [ ] Identificar riesgos y edge cases

- [ ] **Setup de TanStack Query**
  - [ ] QueryProvider configurado
  - [ ] DevTools habilitado en desarrollo
  - [ ] Constants file creado con query keys

### During Migration

- [ ] **Implementación paralela**

  - [ ] Hook TanStack Query implementado
  - [ ] Hook de compatibilidad creado
  - [ ] Feature flags configurados
  - [ ] API consistente entre implementaciones

- [ ] **Testing exhaustivo**

  - [ ] Unit tests para nuevo hook
  - [ ] Integration tests
  - [ ] E2E tests con feature flags
  - [ ] Performance comparison tests

- [ ] **Migración gradual**
  - [ ] Components migrados uno por uno
  - [ ] Validación en cada step
  - [ ] Rollback plan preparado
  - [ ] Monitoring configurado

### Post-Migration

- [ ] **Validación final**

  - [ ] Funcionalidad 100% equivalente
  - [ ] Performance igual o mejor
  - [ ] No regressions detectadas
  - [ ] User acceptance testing passed

- [ ] **Cleanup**

  - [ ] Código legacy eliminado
  - [ ] Feature flags removidos
  - [ ] Tests actualizados
  - [ ] Documentación actualizada

- [ ] **Monitoring**
  - [ ] Performance metrics establecidos
  - [ ] Error rates monitoreados
  - [ ] User feedback collected

---

## 🎉 **SIGUIENTE PASO**

Con esta guía de migración tienes todo lo necesario para transformar tus módulos existentes en módulos TanStack Query enterprise de manera segura y sistemática.

### **¿Recomendación para empezar?**

1. **Empieza con el módulo Dashboard** (menor riesgo, resultado rápido)
2. **Usa este módulo como proof of concept**
3. **Refina el proceso** basado en la experiencia
4. **Aplica a módulos más complejos** una vez dominado el patrón

### **¿Siguiente objetivo?**

**¡Migrar el módulo Dashboard usando esta guía!** 🚀

---

_Recuerda: La migración gradual es clave. No hay prisa - es mejor hacerlo bien que hacerlo rápido._
