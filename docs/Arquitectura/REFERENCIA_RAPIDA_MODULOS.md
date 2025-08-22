# ⚡ Referencia Rápida: Módulos

## 🎯 Decisión Rápida: ¿Simple o Complejo?

### 🚀 **Módulo Simple** si:
- [ ] < 10 archivos totales
- [ ] Lógica straightforward
- [ ] Principalmente CRUD/UI
- [ ] Desarrollo rápido

### 🏗️ **Módulo Complejo** si:
- [ ] 10+ archivos
- [ ] Lógica de negocio rica
- [ ] Múltiples responsabilidades
- [ ] Separación de capas necesaria

---

## 📁 Estructuras de Referencia

### 🚀 **Simple**
```
src/features/[module]/
├── index.ts                     # API pública
├── [module].types.ts            # Tipos
├── [module].hooks.ts            # Hooks
├── [module].actions.ts          # Server actions
├── [module].screen.tsx          # UI principal
└── components/                  # Componentes
```

### 🏗️ **Complejo**
```
src/features/[module]/
├── index.ts                     # API pública
├── types.ts                     # Tipos consolidados
├── schemas.ts                   # Validaciones
├── constants.ts                 # Constantes
├── utils.ts                     # Utilidades
├── config.ts                    # Configuración
├── hooks/                       # Múltiples hooks
├── server/                      # Server logic
└── ui/                          # Múltiples componentes
```

---

## 📝 Convenciones de Nombres

### ✅ **Archivos**
| Tipo | Simple | Complejo |
|------|--------|----------|
| Tipos | `[module].types.ts` | `types.ts` |
| Hooks | `[module].hooks.ts` | `hooks/use[Module].ts` |
| Actions | `[module].actions.ts` | `server/actions.ts` |
| UI | `[module].screen.tsx` | `ui/[Module]List.tsx` |
| Config | `[module].config.ts` | `config.ts` |

### ✅ **Componentes**
- `[Module]Card.tsx` - Tarjeta individual
- `[Module]List.tsx` - Lista principal
- `[Module]Modal.tsx` - Modal crear/editar
- `[Module]Filters.tsx` - Filtros
- `[Module]Actions.tsx` - Acciones masivas

---

## 🔄 Reglas de Folders

### ✅ **Usar Folder cuando:**
- 3+ archivos relacionados
- Crecimiento esperado
- Separación lógica clara

### ✅ **Usar Archivo cuando:**
- 1-2 archivos únicamente
- No esperas crecimiento
- Funcionalidad simple

---

## 📦 Templates de Barrel Export

### 🚀 **Simple**
```typescript
// index.ts
export { use[Module] } from "./[module].hooks";
export { get[Module]Action } from "./[module].actions";
export type { [Module] } from "./[module].types";
export { default as [Module]Screen } from "./[module].screen";
```

### 🏗️ **Complejo**
```typescript
// index.ts
export { use[Module] } from "./hooks";
export { get[Module]Action } from "./server";
export type { [Module] } from "./types";
export { [module]Schema } from "./schemas";
export { [MODULE]_STATUS } from "./constants";
```

---

## 🚀 Comandos Rápidos

### **Crear Módulo Simple**
```bash
mkdir -p src/features/[module]/components
touch src/features/[module]/{index.ts,[module].types.ts,[module].hooks.ts,[module].actions.ts,[module].screen.tsx}
```

### **Crear Módulo Complejo**
```bash
mkdir -p src/features/[module]/{hooks,server,ui}
touch src/features/[module]/{index.ts,types.ts,schemas.ts,constants.ts,utils.ts,config.ts}
touch src/features/[module]/server/{actions.ts,queries.ts,services.ts,index.ts}
touch src/features/[module]/hooks/{use[Module].ts,index.ts}
touch src/features/[module]/ui/{[Module]List.tsx,index.ts}
```

---

## 🎯 Checklist de Implementación

### 📋 **Módulo Simple**
- [ ] Crear estructura básica
- [ ] Definir tipos en `[module].types.ts`
- [ ] Implementar hooks en `[module].hooks.ts`
- [ ] Crear server actions en `[module].actions.ts`
- [ ] Desarrollar UI en `[module].screen.tsx`
- [ ] Configurar barrel export en `index.ts`
- [ ] Agregar a navegación (si aplica)
- [ ] Configurar feature flag (si aplica)

### 📋 **Módulo Complejo**
- [ ] Crear estructura de folders
- [ ] Definir tipos en `types.ts`
- [ ] Crear schemas en `schemas.ts`
- [ ] Definir constantes en `constants.ts`
- [ ] Implementar utilidades en `utils.ts`
- [ ] Configurar en `config.ts`
- [ ] Desarrollar hooks en `hooks/`
- [ ] Implementar server logic en `server/`
- [ ] Crear componentes UI en `ui/`
- [ ] Configurar barrel exports
- [ ] Agregar a navegación
- [ ] Configurar feature flags
- [ ] Escribir tests

---

## 🔧 Refactoring Rápido

### **Consolidar Folders Unitarios**
```bash
# Si server/actions/ tiene solo 1 archivo
mv server/actions/index.ts server/actions.ts
rmdir server/actions/
```

### **Separar Archivos Grandes**
```bash
# Si [module].hooks.ts > 500 líneas
mkdir hooks/
# Dividir contenido en archivos específicos
```

---

## 🎛️ Integración con Feature Flags

```typescript
// En navigation
{
  path: "/[module]",
  component: [Module]Screen,
  featureFlag: "[module]UI",
  permission: "admin:[module]"
}

// En componente
const isEnabled = useIsEnabled("[module]UI");
if (!isEnabled) return null;
```

---

## 🧪 Testing Patterns

### 🚀 **Simple**
```
__tests__/
├── [module].hooks.test.ts
├── [module].actions.test.ts
└── [module].screen.test.tsx
```

### 🏗️ **Complejo**
```
hooks/__tests__/
server/__tests__/
ui/__tests__/
__tests__/integration.test.ts
```

---

## 🚨 Errores Comunes

### ❌ **Evitar**
- Folders para 1 archivo
- Prefijos redundantes dentro del módulo
- Imports desde rutas internas
- Barrel exports circulares
- Mezclar lógica simple con compleja

### ✅ **Hacer**
- Usar API pública (barrel exports)
- Nombres descriptivos y únicos
- Separar responsabilidades claramente
- Mantener consistencia en el proyecto
- Documentar decisiones arquitectónicas

---

## 📚 Referencias Rápidas

- [Guía Completa](./GUIA_MODULOS_FEATURE_FIRST.md)
- [Ejemplos Paso a Paso](./EJEMPLOS_MODULOS_PASO_A_PASO.md)
- [Patrones de Testing](../Testing/TESTING_PATTERNS.md)
- [Estándares de Código](../Standards/CODE_STANDARDS.md)
