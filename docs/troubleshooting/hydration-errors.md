# 🚨 Hydration Errors - Troubleshooting Guide

## 📋 Overview

Este documento describe cómo solucionar errores de hidratación en Next.js cuando hay diferencias entre el renderizado del servidor (SSR) y el cliente.

## 🔍 Problema Identificado

### Error Message

```
Hydration failed because the server rendered HTML didn't match the client.
```

### Causa Raíz

El componente `Navigation.tsx` tenía diferentes clases CSS según el estado de carga:

```typescript
// 🚨 PROBLEMA: Diferentes clases según el estado
// Server render: isLoading = true
<nav className="mt-8 space-y-2">  // ← Skeleton state

// Client render: isLoading = false
<nav className="mt-8 space-y-6">  // ← Normal state
```

## ✅ Solución Implementada

### 1. Dynamic Import con SSR Disabled

**Archivo:** `src/shared/ui/layouts/components/AdminSidebar.tsx`

```typescript
// 🚀 Dynamic import to prevent hydration issues
const Navigation = dynamic(() => import("./Navigation"), {
  ssr: false, // Disable SSR for this component to prevent hydration mismatch
  loading: () => (
    <nav className="mt-8 space-y-6" suppressHydrationWarning>
      <div
        className="animate-pulse space-y-3"
        role="status"
        aria-label="Cargando navegación"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-slate-200 dark:bg-slate-600 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </nav>
  ),
});
```

### 2. suppressHydrationWarning

```typescript
<aside
  className={/* ... */}
  suppressHydrationWarning // Suppress hydration warnings for this component
>
```

## 🎯 Por qué funciona

1. **`ssr: false`**: Evita el renderizado del servidor para el componente problemático
2. **Loading Component**: Proporciona un skeleton consistente mientras carga
3. **`suppressHydrationWarning`**: Suprime warnings específicos de hidratación
4. **Lazy Loading**: El componente se carga solo en el cliente, evitando diferencias

## 🔧 Alternatives

### Opción 1: useEffect + useState (No recomendado)

```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) {
  return <SkeletonComponent />;
}
```

### Opción 2: Consistent CSS Classes (Recomendado para casos simples)

```typescript
// Usar las mismas clases siempre
<nav className="mt-8 space-y-6">{isLoading ? <Skeleton /> : <Content />}</nav>
```

## ⚠️ Casos de Uso

### ✅ Usar Dynamic Import cuando:

- Componente depende de datos que cambian entre server/client
- Hook usa `useRouter`, `localStorage`, etc.
- Estados complejos que pueden diferir entre renders

### ❌ No usar cuando:

- Componente es puramente estático
- Performance SSR es crítica
- SEO requiere contenido indexable

## 🧪 Testing

### Verificar la corrección:

```bash
# 1. Build sin warnings
npm run build 2>&1 | grep -i hydration

# 2. Dev server sin errores en consola
npm run dev
# Abrir DevTools → Console
```

### Métricas de Performance:

- **Before**: Hydration mismatch, re-render forzado
- **After**: Carga suave, sin re-renders

## 📚 Referencias

- [Next.js Hydration Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [suppressHydrationWarning](https://react.dev/reference/react-dom/hydrate#suppressing-unavoidable-hydration-mismatch-warnings)

---

**Created:** 2025-01-18  
**Last Updated:** 2025-01-18  
**Status:** ✅ Resolved
