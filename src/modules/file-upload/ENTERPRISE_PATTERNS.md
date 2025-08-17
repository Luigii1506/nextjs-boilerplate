# 🏆 ENTERPRISE PATTERNS - ESTÁNDAR DE MÓDULOS

## 📐 ARQUITECTURA ESTÁNDAR

### **Estructura de Carpetas (OBLIGATORIA)**

```
📁 modules/[module-name]/
├── 📁 server/
│   ├── actions/index.ts     # Server Actions (Source of Truth)
│   ├── services/index.ts    # Business Logic Layer
│   └── validators/index.ts  # Data Validation
├── 📁 hooks/
│   └── use[ModuleName].ts   # SINGLE hook per module
├── 📁 ui/
│   ├── components/          # Reusable components
│   └── routes/              # Pages/screens
├── 📁 types/index.ts        # TypeScript interfaces
├── 📁 schemas/index.ts      # Zod validation schemas
└── ENTERPRISE_PATTERNS.md  # This documentation
```

## 🎯 PRINCIPIOS EMPRESARIALES

### **1. Single Source of Truth**

- **Server Actions** son la única fuente de verdad para datos
- **No cache manual** - usar revalidateTag/revalidatePath
- **No estado duplicado** entre cliente y servidor

### **2. One Hook Per Module**

- **Un solo hook** `use[ModuleName]()` por módulo
- **Todas las funciones** del módulo van en este hook
- **State unificado** y predecible

### **3. Predictable Optimistic UI**

- **Solo para feedback visual** (progress, loading)
- **NO para datos críticos** (usar server state)
- **Auto-clear optimistic state** después de server response

### **4. Automatic Cache Invalidation**

- **Server Actions manejan** revalidateTag automáticamente
- **NO invalidación manual** en el cliente
- **Consistencia automática** entre tabs/ventanas

### **5. Enterprise Error Handling**

- **Errores estructurados** con códigos y mensajes claros
- **Boundaries consistentes** para manejo de errores
- **Logging estructurado** para debugging

## 🛠️ PATRONES DE IMPLEMENTACIÓN

### **Server Actions Pattern**

```typescript
export async function [action]ServerAction(
  formData: FormData
): Promise<FileActionResult> {
  try {
    // 1. Authentication & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "No autorizado" };
    }

    // 2. Validation (Zod schemas)
    const validated = parseInputSchema(Object.fromEntries(formData));

    // 3. Business Logic (Service layer)
    const result = await moduleService.performAction(validated);

    // 4. Cache Invalidation
    revalidateTag("[module]-data");
    revalidatePath("/[module]");

    return { success: true, data: result };
  } catch (error) {
    console.error("Server Action Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### **Hook Pattern**

```typescript
export const use[ModuleName] = (config?: Config): Return => {
  const { user } = useAuth();
  const hasInitialized = useRef(false);

  // PRIMARY DATA (Server Actions)
  const [dataState, dataAction, dataPending] = useActionState(serverAction, null);

  // OPTIMISTIC STATE (UI feedback only)
  const [optimisticState, addOptimistic] = useOptimistic(initialState, reducer);

  // AUTO-INITIALIZATION (once per mount)
  if (!hasInitialized.current && user) {
    hasInitialized.current = true;
    dataAction();
  }

  // COMPUTED STATES
  const isLoading = dataPending;
  const data = dataState?.success ? dataState.data : [];
  const error = dataState?.error || null;

  return {
    // Data
    data,
    isLoading,
    error,

    // Actions
    create: useCallback(async (input) => {
      // Optimistic UI
      addOptimistic({ type: "CREATE", input });

      // Server Action
      const result = await createServerAction(formData);

      // Auto-refresh
      dataAction();
    }, []),

    // Utilities
    refresh: () => dataAction(),
  };
};
```

## 🔧 CONFIGURACIÓN EMPRESARIAL

### **Enterprise Config Pattern**

```typescript
const ENTERPRISE_CONFIG = {
  // Feature flags
  enableOptimisticUI: true,
  enableAdvancedLogging: process.env.NODE_ENV === "development",

  // Performance
  debounceMs: 300,
  maxRetries: 3,
  cacheTimeout: 5 * 60 * 1000,
} as const;
```

### **Structured Logging**

```typescript
const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    if (ENTERPRISE_CONFIG.enableAdvancedLogging) {
      console.log(`🏆 [ModuleName] ${message}`, data);
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`❌ [ModuleName] ${message}`, error);
  },
};
```

## 📋 ERROR HANDLING STANDARDS

### **Result Pattern**

```typescript
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

### **Error Categories**

- **Authentication**: Usuario no autenticado
- **Authorization**: Sin permisos suficientes
- **Validation**: Datos inválidos
- **Business**: Reglas de negocio violadas
- **System**: Errores de infraestructura

## 🚀 PERFORMANCE PATTERNS

### **Loading States**

- **Global loading**: Para operaciones que bloquean toda la UI
- **Local loading**: Para operaciones específicas de componente
- **Skeleton states**: Para mejora de perceived performance

### **Cache Strategy**

- **Server-side**: revalidateTag/revalidatePath automático
- **Client-side**: React Query o similar para cache avanzado
- **Optimistic updates**: Solo para feedback inmediato

## 🧪 TESTING STANDARDS

### **Unit Tests**

- **Hooks**: Testing con renderHook
- **Server Actions**: Testing con mocks de DB
- **Components**: Testing con MSW para mocks

### **E2E Tests**

- **Happy paths**: Flujos principales funcionando
- **Error handling**: Manejo correcto de errores
- **Edge cases**: Casos límite y excepciones

## 📚 MIGRATION CHECKLIST

Para migrar un módulo existente al estándar empresarial:

- [ ] **Estructura de carpetas** siguiendo el estándar
- [ ] **Un solo hook** con toda la funcionalidad
- [ ] **Server Actions** como única fuente de verdad
- [ ] **Optimistic UI** solo para feedback visual
- [ ] **Cache invalidation** automática
- [ ] **Error handling** estructurado
- [ ] **Logging** configurable
- [ ] **TypeScript strict** mode
- [ ] **Tests** unitarios y E2E
- [ ] **Documentación** actualizada

---

## 🎯 PRÓXIMOS PASOS

1. **Terminar file-upload** como template perfecto
2. **Migrar users module** al nuevo estándar
3. **Migrar dashboard module** al nuevo estándar
4. **Crear tooling** para generar nuevos módulos automáticamente
5. **Documentar patterns** específicos por tipo de módulo
