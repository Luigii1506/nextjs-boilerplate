# 🎯 useScrollHeader Hook - Guía de Uso

## Descripción

El hook `useScrollHeader` es un custom hook reutilizable que detecta scroll y controla la visibilidad de headers. Elimina la duplicación de lógica de scroll que se repetía en todas las secciones.

## Problema que Resuelve

### Antes (Código Duplicado):
```tsx
const [showHeader, setShowHeader] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY || currentScrollY < 50) {
      setShowHeader(true);
    } else if (currentScrollY > 50) {
      setShowHeader(false);
    }

    setLastScrollY(currentScrollY);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);
```

Este patrón se repetía en **6+ archivos** diferentes.

### Después (Hook Reutilizable):
```tsx
const { showHeader } = useScrollHeader({
  mode: "direction",
  threshold: 50,
});
```

## Features

- ✅ **Dos Modos**: Threshold y direction-based
- 🎯 **Scroll Detection**: Nativo con fallback a wheel
- ⚡ **Performance**: Refs y passive listeners
- 🎨 **Debounce**: Opcional para reducir eventos
- 🐛 **Debug Mode**: Logging para troubleshooting
- 🧪 **Testeable**: API para set manual scroll
- 📱 **Mobile-Friendly**: Funciona en todos los dispositivos

## Instalación

El hook ya está exportado en el barrel de hooks compartidos:

```tsx
import { useScrollHeader } from "@/shared/hooks";
```

## API

### Hook Signature

```tsx
const result = useScrollHeader(options?: UseScrollHeaderOptions);
```

### Options (UseScrollHeaderOptions)

| Option | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `threshold` | `number` | `50` | Píxeles para hide/show header |
| `mode` | `"threshold" \| "direction"` | `"direction"` | Modo de comportamiento |
| `wheelSensitivity` | `number` | `0.5` | Sensibilidad para wheel fallback |
| `debounceDelay` | `number` | `0` | Delay en ms para debounce |
| `useWheelFallback` | `boolean` | `true` | Usar wheel si scroll falla |
| `debug` | `boolean` | `false` | Habilitar logging |

### Return Value (UseScrollHeaderReturn)

| Property | Tipo | Descripción |
|----------|------|-------------|
| `scrollY` | `number` | Posición actual de scroll |
| `showHeader` | `boolean` | Si el header debe mostrarse |
| `isHeaderVisible` | `boolean` | Alias de `showHeader` |
| `isPastThreshold` | `boolean` | Si scroll > threshold |
| `isNativeScrollWorking` | `boolean` | Si scroll nativo funciona |
| `isWheelSimulationActive` | `boolean` | Si wheel fallback está activo |
| `setScrollPosition` | `(y: number) => void` | Setter manual (testing) |

## Modos de Comportamiento

### 1. Direction Mode (Recomendado)

Muestra el header cuando:
- Usuario hace scroll UP
- Scroll está por debajo del threshold

Oculta el header cuando:
- Usuario hace scroll DOWN
- Scroll está por encima del threshold

```tsx
const { showHeader } = useScrollHeader({
  mode: "direction",
  threshold: 50,
});
```

**Uso**: Interfaces modernas con headers que responden al scroll

---

### 2. Threshold Mode

Muestra el header cuando:
- Scroll < threshold

Oculta el header cuando:
- Scroll >= threshold

```tsx
const { showHeader } = useScrollHeader({
  mode: "threshold",
  threshold: 100,
});
```

**Uso**: Headers simples que desaparecen después de cierto scroll

## Ejemplos de Uso

### 1. Ejemplo Básico - Users (Implementado)

```tsx
import { useScrollHeader } from "@/shared/hooks";

const UsersSPAContent: React.FC = () => {
  // 🎯 Scroll header detection
  const { showHeader } = useScrollHeader({
    mode: "direction",
    threshold: 50,
  });

  return (
    <div>
      <PageHeader
        title="Gestión de Usuarios"
        hidden={!showHeader}
      />
      {/* ... rest of content */}
    </div>
  );
};
```

### 2. Ejemplo - Con Threshold Mode

```tsx
const { showHeader } = useScrollHeader({
  mode: "threshold",
  threshold: 100,
});
```

### 3. Ejemplo - Con Debounce

```tsx
const { showHeader } = useScrollHeader({
  mode: "direction",
  threshold: 50,
  debounceDelay: 100, // 100ms delay
});
```

### 4. Ejemplo - Con Debug Mode

```tsx
const { showHeader, scrollY } = useScrollHeader({
  mode: "direction",
  threshold: 50,
  debug: true, // Console logging enabled
});

console.log(`Current scroll: ${scrollY}px`);
```

### 5. Ejemplo - Obteniendo Múltiples Valores

```tsx
const {
  showHeader,
  scrollY,
  isPastThreshold,
  isNativeScrollWorking,
} = useScrollHeader({
  mode: "direction",
  threshold: 50,
});

return (
  <div>
    <PageHeader hidden={!showHeader} />
    {isPastThreshold && <BackToTopButton />}
    <p>Scroll: {scrollY}px</p>
  </div>
);
```

### 6. Ejemplo - Testing con setScrollPosition

```tsx
const { showHeader, setScrollPosition } = useScrollHeader({
  mode: "direction",
  threshold: 50,
});

// En tests o para simulación
const simulateScroll = () => {
  setScrollPosition(100); // Simula scroll a 100px
};
```

## Integración con PageHeader

El hook está diseñado para trabajar perfectamente con `PageHeader`:

```tsx
import { useScrollHeader } from "@/shared/hooks";
import { PageHeader } from "@/shared/ui/components";

const MyScreen = () => {
  const { showHeader } = useScrollHeader({
    mode: "direction",
    threshold: 50,
  });

  return (
    <div>
      <PageHeader
        icon={<Icon />}
        title="Mi Sección"
        stats={stats}
        hidden={!showHeader} // Control de visibilidad
      />
      {/* ... content */}
    </div>
  );
};
```

## Casos de Uso

### ✅ Cuándo Usar

1. **Headers que desaparecen**: Cualquier header con scroll behavior
2. **Navegación sticky**: Headers que responden al scroll
3. **UX moderna**: Interfaces con scroll-aware components
4. **Múltiples secciones**: Cuando tienes varias páginas similares
5. **Testing**: Necesitas simular scroll en tests

### ❌ Cuándo NO Usar

1. **Headers estáticos**: Headers que nunca cambian
2. **Modales**: Modales que no tienen scroll
3. **Sidebars**: Sidebars fijos sin scroll behavior
4. **Infinite scroll**: Usa intersection observer en su lugar

## Performance

### Optimizaciones Incluidas

1. **Passive Listeners**: No bloquea scroll
```tsx
window.addEventListener("scroll", handleScroll, { passive: true });
```

2. **Refs para Estado**: Evita re-renders innecesarios
```tsx
const scrollYRef = useRef(0);
```

3. **Debounce Opcional**: Reduce eventos
```tsx
useScrollHeader({ debounceDelay: 100 });
```

4. **Cleanup Automático**: Limpia listeners al desmontar

### Medidas de Performance

| Métrica | Valor |
|---------|-------|
| Bundle size | ~2KB (minified + gzipped) |
| Re-renders | Mínimos (usa refs) |
| Event frequency | 60fps max (passive) |
| Memory leak | ❌ No (cleanup correcto) |

## Comparación de Modos

| Feature | Direction | Threshold |
|---------|-----------|-----------|
| Muestra en scroll up | ✅ Sí | ❌ No |
| Oculta en scroll down | ✅ Sí | ❌ No |
| Threshold-based | ✅ Sí | ✅ Sí |
| UX moderna | ✅ Mejor | ⚠️ Básica |
| Use case | Headers inteligentes | Headers simples |

## Troubleshooting

### Problema: Header no desaparece

**Causa**: Threshold muy alto o modo incorrecto

**Solución**:
```tsx
// Reduce threshold
useScrollHeader({ threshold: 30 });

// O usa direction mode
useScrollHeader({ mode: "direction" });
```

### Problema: Header parpadea

**Causa**: Eventos muy frecuentes

**Solución**:
```tsx
// Agrega debounce
useScrollHeader({ debounceDelay: 50 });
```

### Problema: No funciona en móvil

**Causa**: Scroll nativo no detectado

**Solución**:
```tsx
// Habilita wheel fallback (default)
useScrollHeader({ useWheelFallback: true });
```

### Problema: Debugging

**Solución**:
```tsx
// Habilita debug mode
useScrollHeader({ debug: true });
// Revisa la consola para logs detallados
```

## Migración desde Código Legacy

### Paso 1: Identificar el Patrón

Busca este código:
```tsx
const [showHeader, setShowHeader] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    // ... lógica de scroll
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);
```

### Paso 2: Reemplazar con Hook

```tsx
import { useScrollHeader } from "@/shared/hooks";

const { showHeader } = useScrollHeader({
  mode: "direction",
  threshold: 50,
});
```

### Paso 3: Limpiar Imports

Elimina imports innecesarios:
```tsx
// ❌ Ya no necesitas
import { useState, useEffect } from "react";

// ✅ Solo necesitas
import { useMemo } from "react"; // Si usas memos
```

### Paso 4: Verificar Behavior

- Mode `direction` = comportamiento actual en users
- Mode `threshold` = comportamiento simple

## Testing

### Unit Test Básico

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useScrollHeader } from '@/shared/hooks';

describe('useScrollHeader', () => {
  it('shows header initially', () => {
    const { result } = renderHook(() => useScrollHeader());
    expect(result.current.showHeader).toBe(true);
  });

  it('hides header after threshold in threshold mode', () => {
    const { result } = renderHook(() =>
      useScrollHeader({ mode: 'threshold', threshold: 50 })
    );

    act(() => {
      result.current.setScrollPosition(100);
    });

    expect(result.current.showHeader).toBe(false);
  });

  it('shows header on scroll up in direction mode', () => {
    const { result } = renderHook(() =>
      useScrollHeader({ mode: 'direction', threshold: 50 })
    );

    // Scroll down
    act(() => result.current.setScrollPosition(100));
    expect(result.current.showHeader).toBe(false);

    // Scroll up
    act(() => result.current.setScrollPosition(50));
    expect(result.current.showHeader).toBe(true);
  });
});
```

## Best Practices

1. **Usa direction mode por defecto**: Mejor UX
2. **Threshold de 50px**: Valor estándar que funciona bien
3. **No agregues debounce innecesario**: Solo si hay performance issues
4. **Combina con PageHeader**: Para layout completo
5. **Evita múltiples instancias**: Una por página es suficiente

## Próximos Pasos - Plan de Migración

### Archivos a Migrar:

1. ✅ **Users**: `/users` - Implementado
2. ⏳ **Inventory**: `/inventory` - Pendiente (~20 líneas)
3. ⏳ **Suppliers**: `/suppliers` - Pendiente (~20 líneas)
4. ⏳ **Files**: `/files` - Pendiente (~20 líneas)
5. ⏳ **Seller Portal**: `/seller-portal` - Pendiente (~20 líneas)
6. ⏳ **Audit**: `/audit` - Pendiente (~20 líneas)

### Impacto Estimado:

- **Líneas eliminadas**: ~120 líneas de código duplicado
- **Tiempo**: ~5 minutos por archivo
- **Beneficios**: Código más limpio, mantenible y testeable

## Recursos Adicionales

### Código Fuente
- [useScrollHeader.ts](../src/shared/hooks/useScrollHeader.ts)

### Ejemplos
- [Users SPA Screen](../src/features/admin/users/ui/routes/users.spa.screen.tsx)

### Documentación Relacionada
- [PageHeader Usage Guide](./page-header-usage.md)
- [Reusable Components Standard](./reusable-components-standard.md)

---

**Ubicación del hook**: `src/shared/hooks/useScrollHeader.ts`

**Exportado desde**: `src/shared/hooks/index.ts`

**Created**: 2025-01-17 | **Updated**: 2025-01-18
