# Patrón Zustand + React 19 + Next.js 15

**Fecha:** 2025-10-28
**Autor:** Equipo de Desarrollo
**Versión:** 1.0.0

---

## 📋 Problema Resuelto

Cuando se usa Zustand con React 19 y Next.js 15, aparecía la siguiente advertencia:

```
The result of getSnapshot should be cached to avoid an infinite loop
```

### ¿Por qué ocurría?

**React 19 llama a `getSnapshot` dos veces por render** para verificar consistencia. Zustand internamente usa `useSyncExternalStore`, que requiere que el snapshot retornado sea **estable** (misma referencia) entre llamadas consecutivas.

#### ❌ Código Problemático

```typescript
// ESTO CAUSABA EL WARNING ❌
export const useSessionActions = () => useSessionStore((state) => ({
  openSession: state.openSession,
  closeSession: state.closeSession,
  // ...más acciones
}));
```

**Problema:** Cada vez que React llama al selector, se crea un **nuevo objeto literal**, rompiendo la estabilidad de referencia que requiere `useSyncExternalStore`.

---

## ✅ Solución: Pattern con `useMemo`

### Regla de Oro

> **SIEMPRE que agregues acciones en un hook personalizado de Zustand, usa `useMemo` para estabilizar la referencia del objeto retornado.**

### ✅ Código Correcto

```typescript
import { useMemo } from 'react';

/**
 * Stable session actions hook
 * ---------------------------
 * React 19 calls getSnapshot twice during render.
 * Creating a new object in the selector breaks caching.
 * We subscribe to each action individually and memoize the aggregated object.
 */
export const useSessionActions = () => {
  // Suscribirse a cada acción individualmente
  const loadActiveSession = useSessionStore((state) => state.loadActiveSession);
  const openSession = useSessionStore((state) => state.openSession);
  const closeSession = useSessionStore((state) => state.closeSession);
  const suspendSession = useSessionStore((state) => state.suspendSession);
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const clearSession = useSessionStore((state) => state.clearSession);
  const setError = useSessionStore((state) => state.setError);

  // Memoizar el objeto agregado para mantener referencia estable
  return useMemo(
    () => ({
      loadActiveSession,
      openSession,
      closeSession,
      suspendSession,
      resumeSession,
      clearSession,
      setError,
    }),
    [
      loadActiveSession,
      openSession,
      closeSession,
      suspendSession,
      resumeSession,
      clearSession,
      setError,
    ]
  );
};
```

**Por qué funciona:**

1. Cada acción se suscribe individualmente → **referencias estables** (Zustand garantiza que las funciones del store son estables)
2. `useMemo` solo re-crea el objeto cuando alguna dependencia cambia
3. React ve la **misma referencia de objeto** en las dos llamadas a `getSnapshot` → ✅ No warning

---

## 📚 Patrón Completo para Stores

### 1. Estructura del Store

```typescript
import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyStoreState {
  // 🔵 STATE
  data: string | null;
  isLoading: boolean;
  error: string | null;

  // 🟢 COMPUTED SELECTORS (funciones dentro del store)
  hasData: () => boolean;
  isReady: () => boolean;

  // 🟡 ACTIONS
  loadData: () => Promise<void>;
  clearData: () => void;
  setError: (error: string | null) => void;
}

export const useMyStore = create<MyStoreState>()(
  devtools(
    (set, get) => ({
      // ========================================
      // INITIAL STATE
      // ========================================

      data: null,
      isLoading: false,
      error: null,

      // ========================================
      // ACTIONS
      // ========================================

      loadData: async () => {
        set({ isLoading: true, error: null });
        try {
          // ... lógica async
          set({ data: 'nuevo dato', isLoading: false });
        } catch (err) {
          set({ error: 'Error cargando', isLoading: false });
        }
      },

      clearData: () => {
        set({ data: null, error: null });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // ========================================
      // COMPUTED SELECTORS
      // ========================================

      /**
       * Funciones computadas que usan get() para acceder al estado actual
       */
      hasData: () => {
        return !!get().data;
      },

      isReady: () => {
        const state = get();
        return !state.isLoading && !state.error && !!state.data;
      },
    }),
    { name: 'My-Store' } // DevTools name
  )
);
```

### 2. Action Hook Estabilizado

```typescript
/**
 * Stable actions hook
 * ------------------
 * React 19 calls getSnapshot twice during render.
 * We subscribe to each action individually and memoize the aggregated object.
 */
export const useMyActions = () => {
  const loadData = useMyStore((state) => state.loadData);
  const clearData = useMyStore((state) => state.clearData);
  const setError = useMyStore((state) => state.setError);

  return useMemo(
    () => ({
      loadData,
      clearData,
      setError,
    }),
    [loadData, clearData, setError]
  );
};
```

### 3. Selector Hooks de Conveniencia

```typescript
/**
 * Hooks selectores individuales para valores computados
 * Estos son seguros sin useMemo porque retornan valores primitivos
 */
export const useHasData = () => useMyStore((state) => state.hasData());
export const useIsReady = () => useMyStore((state) => state.isReady());

// Para valores directos del estado
export const useMyData = () => useMyStore((state) => state.data);
export const useMyLoading = () => useMyStore((state) => state.isLoading);
export const useMyError = () => useMyStore((state) => state.error);
```

### 4. Exports del Store

```typescript
export type { MyStoreState };
```

---

## 🎯 Cuándo Usar `useMemo`

### ✅ Siempre Usar `useMemo`

```typescript
// ✅ Cuando retornas un OBJETO con acciones
export const useActions = () => {
  const action1 = useStore((s) => s.action1);
  const action2 = useStore((s) => s.action2);

  return useMemo(
    () => ({ action1, action2 }),
    [action1, action2]
  );
};

// ✅ Cuando retornas un ARRAY
export const useMultipleValues = () => {
  const value1 = useStore((s) => s.value1);
  const value2 = useStore((s) => s.value2);

  return useMemo(
    () => [value1, value2],
    [value1, value2]
  );
};

// ✅ Cuando haces transformación compleja
export const useTransformedData = () => {
  const items = useStore((s) => s.items);

  return useMemo(
    () => items.filter(i => i.active).sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );
};
```

### ⚠️ NO Necesitas `useMemo`

```typescript
// ⚠️ Valores primitivos directos (string, number, boolean, null)
export const useMyString = () => useStore((s) => s.myString);
export const useMyNumber = () => useStore((s) => s.myNumber);
export const useMyBoolean = () => useStore((s) => s.myBoolean);

// ⚠️ Llamadas a funciones computadas del store (ya son estables)
export const useIsReady = () => useStore((s) => s.isReady());
export const useHasData = () => useStore((s) => s.hasData());

// ⚠️ Referencias directas a objetos/arrays del estado (Zustand los mantiene estables)
export const useMyObject = () => useStore((s) => s.myObject);
export const useMyArray = () => useStore((s) => s.myArray);
```

---

## 📖 Ejemplos de Uso en Componentes

### Ejemplo 1: Usando Actions

```typescript
import { useMyActions, useMyData, useHasData } from '@/features/my-feature';

const MyComponent: React.FC = () => {
  // ✅ Obtener acciones (con useMemo interno)
  const { loadData, clearData } = useMyActions();

  // ✅ Obtener valores individuales
  const data = useMyData();
  const hasData = useHasData();

  return (
    <div>
      {hasData ? (
        <p>Data: {data}</p>
      ) : (
        <button onClick={loadData}>Load Data</button>
      )}
      <button onClick={clearData}>Clear</button>
    </div>
  );
};
```

### Ejemplo 2: Acceso Directo Simple

```typescript
import { useMyStore } from '@/features/my-feature';

const SimpleComponent: React.FC = () => {
  // ✅ Para casos simples, acceso directo
  const data = useMyStore((state) => state.data);
  const isLoading = useMyStore((state) => state.isLoading);

  // ✅ Llamar funciones computadas
  const isReady = useMyStore((state) => state.isReady());

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {isReady && <p>Ready: {data}</p>}
    </div>
  );
};
```

---

## 🔍 Checklist de Implementación

Cuando crees un nuevo store de Zustand:

- [ ] **Store definido con tipos completos**
  - [ ] State inicial
  - [ ] Actions
  - [ ] Computed selectors (funciones con `get()`)

- [ ] **Action hook con `useMemo`**
  - [ ] Suscripciones individuales a cada acción
  - [ ] `useMemo` con dependencias correctas
  - [ ] Comentario explicando por qué se usa `useMemo`

- [ ] **Selector hooks de conveniencia**
  - [ ] Hooks para valores computados (`state.myFunc()`)
  - [ ] Hooks para valores directos opcionales

- [ ] **Exports organizados**
  - [ ] Store principal
  - [ ] Action hook
  - [ ] Selector hooks
  - [ ] Types exportados

- [ ] **Documentación en código**
  - [ ] Comentario en el action hook explicando React 19
  - [ ] JSDoc en funciones computadas
  - [ ] Versión actualizada en header

---

## 🚫 Anti-Patterns a Evitar

### ❌ Anti-Pattern 1: Objeto sin `useMemo`

```typescript
// ❌ MAL - Crea nuevo objeto cada render
export const useActions = () => useStore((state) => ({
  action1: state.action1,
  action2: state.action2,
}));
```

### ❌ Anti-Pattern 2: Getters Externos Innecesarios

```typescript
// ❌ MAL - Patrón obsoleto, innecesario
// getters.ts
export const myGetters = {
  hasData: (state: MyState) => !!state.data,
};

// componente
const state = useMyStore();
const hasData = myGetters.hasData(state); // ❌ Verbose y redundante
```

**Mejor usar funciones computadas dentro del store:**

```typescript
// ✅ BIEN - Función computada en el store
export const useHasData = () => useMyStore((state) => state.hasData());
```

### ❌ Anti-Pattern 3: `useMemo` Innecesario

```typescript
// ❌ MAL - useMemo innecesario para primitivos
export const useMyString = () => {
  const value = useStore((s) => s.myString);
  return useMemo(() => value, [value]); // ❌ Redundante
};

// ✅ BIEN - Directo
export const useMyString = () => useStore((s) => s.myString);
```

---

## 📝 Plantilla Rápida

Copia esto para crear un nuevo store:

```typescript
/**
 * 🎯 [Feature Name] Store (Zustand)
 * ==================================
 *
 * [Brief description]
 *
 * @module [module-path]
 * @version 1.0.0
 * Created: [date]
 */

'use client';

import { useMemo } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ========================================
// TYPES
// ========================================

interface MyState {
  // State
  data: any;
  isLoading: boolean;
  error: string | null;

  // Computed selectors
  hasData: () => boolean;
  isReady: () => boolean;

  // Actions
  loadData: () => Promise<void>;
  reset: () => void;
}

// ========================================
// STORE
// ========================================

export const useMyStore = create<MyState>()(
  devtools(
    (set, get) => ({
      // Initial State
      data: null,
      isLoading: false,
      error: null,

      // Actions
      loadData: async () => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implementar
          set({ data: 'result', isLoading: false });
        } catch (err) {
          set({ error: 'Error', isLoading: false });
        }
      },

      reset: () => {
        set({ data: null, error: null, isLoading: false });
      },

      // Computed Selectors
      hasData: () => !!get().data,
      isReady: () => !get().isLoading && !get().error,
    }),
    { name: 'My-Feature' }
  )
);

// ========================================
// SELECTORS & ACTION HOOKS
// ========================================

/**
 * Stable actions hook
 * React 19 compatible - uses useMemo to maintain reference stability
 */
export const useMyActions = () => {
  const loadData = useMyStore((state) => state.loadData);
  const reset = useMyStore((state) => state.reset);

  return useMemo(
    () => ({ loadData, reset }),
    [loadData, reset]
  );
};

/**
 * Selector hooks for convenience
 */
export const useHasData = () => useMyStore((state) => state.hasData());
export const useIsReady = () => useMyStore((state) => state.isReady());

export type { MyState };
```

---

## 🔗 Referencias

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand + Next.js Guide](https://docs.pmnd.rs/zustand/guides/nextjs)
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)

---

## 🎓 Conclusión

El patrón correcto para Zustand + React 19 es:

1. ✅ **Funciones computadas DENTRO del store** usando `get()`
2. ✅ **Action hooks CON `useMemo`** para mantener referencia estable
3. ✅ **Selector hooks SIN `useMemo`** para valores primitivos y funciones computadas
4. ❌ **NO usar getters externos** (patrón obsoleto)
5. ❌ **NO crear objetos literales** en selectors sin `useMemo`

**Documenta siempre por qué usas `useMemo`** para que futuros desarrolladores entiendan el patrón.

---

**Última actualización:** 2025-10-28
**Mantenido por:** Equipo de Desarrollo
