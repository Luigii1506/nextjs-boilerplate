# Resumen: Fix del Warning de Zustand + React 19

**Fecha:** 2025-10-28
**Problema:** `The result of getSnapshot should be cached to avoid an infinite loop`
**Solución:** Patrón con computed selectors + `useMemo` en action hooks

---

## 🔴 Problema Original

Al usar Zustand con React 19 y Next.js 15, aparecía la advertencia:

```
The result of getSnapshot should be cached to avoid an infinite loop
```

### Causa Raíz

React 19 llama a `getSnapshot` dos veces por render para verificar consistencia. Cuando los action hooks retornaban un nuevo objeto literal en cada llamada, React detectaba referencias diferentes y disparaba el warning.

```typescript
// ❌ CÓDIGO PROBLEMÁTICO
export const useSessionActions = () => useSessionStore((state) => ({
  openSession: state.openSession,      // ← Nuevo objeto cada vez
  closeSession: state.closeSession,
}));
```

---

## ✅ Solución Implementada

### Patrón Correcto

1. **Computed selectors DENTRO del store** usando `get()`
2. **Action hooks CON `useMemo`** para mantener referencia estable
3. **Selector hooks SIN `useMemo`** para valores primitivos

```typescript
// ✅ CÓDIGO CORRECTO
export const useSessionActions = () => {
  // Suscripciones individuales (referencias estables)
  const openSession = useSessionStore((state) => state.openSession);
  const closeSession = useSessionStore((state) => state.closeSession);

  // useMemo mantiene la misma referencia de objeto
  return useMemo(
    () => ({ openSession, closeSession }),
    [openSession, closeSession]
  );
};
```

---

## 📝 Cambios Realizados

### 1. Stores Actualizados

#### ✅ sessionStore.ts

**Agregado:**
- Computed selectors dentro del store:
  - `hasActiveSession()`
  - `isSessionOpen()`
  - `isSessionClosed()`
  - `isSessionSuspended()`
- Action hook estabilizado con `useMemo`
- Selector hooks de conveniencia

**Código:**
```typescript
// Computed selectors en el store
hasActiveSession: () => !!get().currentSession,
isSessionOpen: () => get().currentSession?.status === "OPEN",

// Action hook estabilizado
export const useSessionActions = () => {
  const loadActiveSession = useSessionStore((s) => s.loadActiveSession);
  // ... más acciones

  return useMemo(
    () => ({ loadActiveSession, /* ... */ }),
    [loadActiveSession, /* ... */]
  );
};

// Selector hooks
export const useIsSessionOpen = () => useSessionStore((s) => s.isSessionOpen());
export const useHasActiveSession = () => useSessionStore((s) => s.hasActiveSession());
```

#### ✅ saleStore.ts

**Agregado:**
- Computed selectors:
  - `itemCount()`
  - `total()`
  - `hasItems()`
  - `canCheckout()`
- Action hook con `useMemo`
- Selector hooks

**Código:**
```typescript
// Computed selectors
itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
total: () => get().summary.total,
hasItems: () => get().items.length > 0,
canCheckout: () => {
  const state = get();
  const count = state.items.reduce((sum, item) => sum + item.quantity, 0);
  return state.items.length > 0 && !state.isLoading && count > 0;
},

// Selector hooks
export const useSaleItems = () => useSaleStore((s) => s.items);
export const useSaleSummary = () => useSaleStore((s) => s.summary);
export const useHasItems = () => useSaleStore((s) => s.hasItems());
export const useCanCheckout = () => useSaleStore((s) => s.canCheckout());
```

#### ✅ paymentStore.ts

**Agregado:**
- Computed selectors:
  - `isProcessing()`
  - `isComplete()`
  - `error()`
  - `changeDue()`
  - `canProcess()`
  - `requiresChange()`
- Action hook con `useMemo`
- Selector hooks

**Código:**
```typescript
// Computed selectors
isProcessing: () => get().paymentState.isProcessing,
isComplete: () => get().paymentState.isComplete,
canProcess: () => {
  const { paymentMethod, saleSummary, amountPaid, isProcessing } = get().paymentState;
  return !!(paymentMethod && saleSummary && amountPaid >= saleSummary.total && !isProcessing);
},

// Selector hooks
export const useCurrentTransaction = () => usePaymentStore((s) => s.currentTransaction);
export const usePaymentProcessing = () => usePaymentStore((s) => s.isProcessing());
export const useCanProcessPayment = () => usePaymentStore((s) => s.canProcess());
```

### 2. Componentes Actualizados

Todos los componentes ahora usan los selector hooks correctamente:

#### ✅ POSHeader.tsx
```typescript
// Antes (con getters externos)
const sessionState = useSessionStore();
const isSessionOpen = sessionGetters.isOpen(sessionState);

// Ahora (selector hook)
const isSessionOpen = useIsSessionOpen();
```

#### ✅ SessionGuard.tsx
```typescript
// Ahora
const isSessionOpen = useIsSessionOpen();
const { loadActiveSession, openSession } = useSessionActions();
```

#### ✅ POSNavigation.tsx
```typescript
// Ahora
const itemCount = useItemCount();
const hasItems = useHasItems();
```

#### ✅ SaleTab.tsx
```typescript
// Ahora
const items = useSaleItems();
const summary = useSaleSummary();
const hasItems = useHasItems();
const canCheckout = useCanCheckout();
const { updateQuantity, removeItem, clearSale } = useSaleActions();
```

#### ✅ PaymentTab.tsx
```typescript
// Ahora
const summary = useSaleSummary();
const currentTransaction = useCurrentTransaction();
const isProcessing = usePaymentStore((s) => s.isProcessing());
const changeDue = useChangeDue();
const { setPaymentMethod, processPayment } = usePaymentActions();
```

### 3. Exports Actualizados

**index.ts** ahora exporta todos los selector hooks:

```typescript
// Session Store
export {
  useSessionStore,
  useSessionActions,
  useIsSessionOpen,
  useHasActiveSession,
  useIsSessionClosed,
  useIsSessionSuspended,
  type SessionState,
} from "./session/state/session.store";

// Sale Store
export {
  useSaleStore,
  useSaleActions,
  useSaleItems,
  useSaleSummary,
  useItemCount,
  useHasItems,
  useCanCheckout,
  type SaleState,
} from "./sale/state/sale.store";

// Payment Store
export {
  usePaymentStore,
  usePaymentActions,
  useCurrentTransaction,
  usePaymentProcessing,
  usePaymentComplete,
  usePaymentError,
  useChangeDue,
  useCanProcessPayment,
  type PaymentStoreState,
} from "./payment/state/payment.store";
```

### 4. Archivos Eliminados

Se eliminaron los archivos de getters externos que implementé inicialmente (patrón incorrecto):

- ❌ `src/features/pos/stores/sessionGetters.ts`
- ❌ `src/features/pos/stores/saleGetters.ts`
- ❌ `src/features/pos/stores/paymentGetters.ts`
- ❌ `docs/pos-getters-usage.md`
- ❌ `docs/pos-migration-to-getters.md`

### 5. Documentación Creada

#### ✅ `/docs/zustand-react19-pattern.md`

Documentación completa del patrón correcto que incluye:

- **Explicación del problema** y por qué ocurre en React 19
- **Solución detallada** con código comentado
- **Patrón completo** para crear stores
- **Cuándo usar `useMemo`** y cuándo no
- **Ejemplos de uso** en componentes
- **Checklist de implementación**
- **Anti-patterns** a evitar
- **Plantilla rápida** para copiar/pegar

#### ✅ README.md actualizado

El README del feature POS ahora muestra el uso correcto con selector hooks.

---

## 🎯 Resultado

### ✅ Warning Eliminado

El warning `getSnapshot should be cached` ya no aparece.

### ✅ Patrón Consistente

Todos los stores siguen el mismo patrón:
1. Computed selectors dentro del store
2. Action hooks con `useMemo`
3. Selector hooks para conveniencia

### ✅ Código Limpio

- Sin archivos redundantes
- Sin patrones obsoletos
- Documentación actualizada

### ✅ Compilación Exitosa

```bash
✓ Ready in 1784ms
# Sin errores de TypeScript
# Sin warnings de React
```

---

## 📚 Para Futuras Implementaciones

**Cuando crees un nuevo store de Zustand:**

1. ✅ Define computed selectors DENTRO del store usando `get()`
2. ✅ Crea action hooks CON `useMemo` y documenta por qué
3. ✅ Crea selector hooks para valores computados
4. ✅ Sigue la plantilla en `/docs/zustand-react19-pattern.md`
5. ❌ NO uses getters externos (patrón obsoleto)
6. ❌ NO retornes objetos literales en selectors sin `useMemo`

---

## 🔗 Referencias

- **Documentación del patrón:** `/docs/zustand-react19-pattern.md`
- **Código de ejemplo:** `/src/features/pos/*/state/*.store.ts`
- **README del feature:** `/src/features/pos/README.md`

---

## ✨ Créditos

**Fix identificado por:** Otra IA (Claude/ChatGPT)
**Implementado por:** Luis Encinas
**Fecha:** 2025-10-28

---

**La clave del fix:**

> React 19 calls `getSnapshot` twice. Creating a new object in the selector breaks caching. We subscribe to each action individually and memoize the aggregated object to maintain reference stability.

**Código clave:**

```typescript
export const useMyActions = () => {
  const action1 = useStore((s) => s.action1); // ← Referencia estable
  const action2 = useStore((s) => s.action2); // ← Referencia estable

  return useMemo(                              // ← Objeto estable
    () => ({ action1, action2 }),
    [action1, action2]
  );
};
```

**Esto mantiene la referencia del objeto estable entre renders, cumpliendo con el contrato de `useSyncExternalStore` en React 19.**

---

**Última actualización:** 2025-10-28
