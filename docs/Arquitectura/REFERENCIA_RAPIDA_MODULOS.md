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
├── [module].services.ts         # Servicios de dominio
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
│   ├── actions.ts               # Server actions
│   ├── queries.ts               # Database queries
│   ├── service.ts               # Domain services
│   ├── validators.ts            # Input validation
│   └── mappers.ts               # Data transformation
└── ui/                          # Múltiples componentes
```

---

## 📝 Convenciones de Nombres

### ✅ **Archivos**
| Tipo | Simple | Complejo |
|------|--------|----------|
| Tipos | `[module].types.ts` | `types.ts` |
| Hooks | `[module].hooks.ts` | `hooks/use[Module].ts` |
| Services | `[module].services.ts` | `server/service.ts` |
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
touch src/features/[module]/{index.ts,[module].types.ts,[module].hooks.ts,[module].services.ts,[module].actions.ts,[module].screen.tsx}
```

### **Crear Módulo Complejo**
```bash
mkdir -p src/features/[module]/{hooks,server,ui}
touch src/features/[module]/{index.ts,types.ts,schemas.ts,constants.ts,utils.ts,config.ts}
touch src/features/[module]/server/{actions.ts,queries.ts,service.ts,validators.ts,mappers.ts,index.ts}
touch src/features/[module]/hooks/{use[Module].ts,index.ts}
touch src/features/[module]/ui/{[Module]List.tsx,index.ts}
```

---

## 🎯 Checklist de Implementación

### 📋 **Módulo Simple**
- [ ] Crear estructura básica
- [ ] Definir tipos en `[module].types.ts`
- [ ] Implementar hooks en `[module].hooks.ts`
- [ ] Crear servicios de dominio en `[module].services.ts`
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
  - [ ] Domain services en `server/service.ts`
  - [ ] Server actions en `server/actions.ts`
  - [ ] Database queries en `server/queries.ts`
  - [ ] Input validation en `server/validators.ts`
  - [ ] Data mappers en `server/mappers.ts`
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

## 🎯 Patrón SPA con Tabs (Nuevo)

### 🚀 **Arquitectura SPA Reactiva**
Para módulos que requieren alta reactividad y experiencia de usuario fluida:

```
src/features/[module]/
├── context/                     # Estado global SPA
│   └── [Module]Context.tsx      # Context con tabs y estado
├── ui/
│   ├── routes/
│   │   └── [module].screen.tsx  # Screen principal SPA
│   └── components/
│       ├── tabs/                # Componentes de tabs
│       │   ├── Tab1.tsx         # Tab individual
│       │   ├── Tab2.tsx         # Tab individual
│       │   └── index.ts         # Barrel export
│       └── shared/              # Componentes compartidos
└── server/                      # Backend logic
    ├── service.ts               # Domain services
    ├── actions.ts               # Server actions
    └── queries.ts               # Database queries
```

### 🎨 **Características del Patrón SPA**
- **Estado Global**: Context Provider con estado compartido
- **Tabs Siempre Montados**: Todos los tabs renderizados, solo se ocultan/muestran
- **Transiciones Suaves**: Animaciones CSS sin re-mounting
- **Carga Única**: Datos se cargan una vez y viven en memoria
- **Optimistic Updates**: Updates instantáneos con sync en background
- **True SPA Experience**: Sin refreshes entre navegación

### 🔧 **Context Pattern**
```typescript
// [Module]Context.tsx
export const MODULE_TABS = [
  { id: "tab1", label: "Tab 1", icon: "Icon1" },
  { id: "tab2", label: "Tab 2", icon: "Icon2" },
] as const;

export type TabId = typeof MODULE_TABS[number]["id"];

interface ModuleContextType {
  // Tab Management
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;
  
  // Global State
  data: ModuleData;
  isLoading: boolean;
  
  // Actions
  refetchAll: () => void;
}
```

### 🎯 **Screen Pattern**
```typescript
// [module].screen.tsx
const TabContent: React.FC = () => {
  const { activeTab, isTabChanging } = useModuleContext();
  
  return (
    <div className="relative min-h-screen">
      {/* Transition overlay */}
      <div className={cn(
        "absolute inset-0 bg-white/50 z-10 pointer-events-none",
        isTabChanging ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Tab1 - Always mounted */}
      <div className={cn(
        "transition-all duration-300",
        activeTab === "tab1" 
          ? "opacity-100 visible relative z-0"
          : "opacity-0 invisible absolute inset-0 z-0"
      )}>
        <Tab1Component />
      </div>
      
      {/* Tab2 - Always mounted */}
      <div className={cn(
        "transition-all duration-300",
        activeTab === "tab2" 
          ? "opacity-100 visible relative z-0"
          : "opacity-0 invisible absolute inset-0 z-0"
      )}>
        <Tab2Component />
      </div>
    </div>
  );
};
```

### 📋 **Checklist SPA con Tabs**
- [ ] Crear `context/[Module]Context.tsx` con estado global
- [ ] Definir `MODULE_TABS` constante con configuración
- [ ] Implementar `TabContent` con todos los tabs montados
- [ ] Usar transiciones CSS (opacity/visibility) NO conditional rendering
- [ ] Implementar optimistic updates para mejor UX
- [ ] Configurar carga única de datos en memoria
- [ ] Añadir loading states y error handling
- [ ] Implementar tab navigation con smooth transitions

### ✅ **Beneficios del Patrón SPA**
- **Performance**: Sin re-mounting de componentes
- **UX**: Transiciones instantáneas y fluidas
- **Estado**: Datos persisten entre tabs
- **Reactividad**: Updates optimistas inmediatos
- **Escalabilidad**: Fácil agregar nuevos tabs

### 🚨 **Cuándo Usar SPA Pattern**
- Módulos con múltiples vistas/tabs
- Necesidad de alta reactividad
- Estado compartido entre vistas
- Experiencia de usuario premium
- Datos que cambian frecuentemente

---

## 📚 Referencias Rápidas

- [Guía Completa](./GUIA_MODULOS_FEATURE_FIRST.md)
- [Ejemplos Paso a Paso](./EJEMPLOS_MODULOS_PASO_A_PASO.md)
- [Patrones de Testing](../Testing/TESTING_PATTERNS.md)
- [Estándares de Código](../Standards/CODE_STANDARDS.md)
