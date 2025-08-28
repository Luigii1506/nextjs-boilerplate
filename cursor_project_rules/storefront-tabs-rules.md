# 📋 REGLAS OFICIALES - STOREFRONT TABS

**Arquitectura Modular Obligatoria v3.0.0 - Feature-First Hooks**

---

## 🎯 **REGLAS FUNDAMENTALES**

### **✅ ARQUITECTURA OBLIGATORIA:**

#### **📁 Estructura de Carpetas (MANDATORIA):**

```
src/features/storefront/ui/components/tabs/[tab-name]/
├── index.ts                           # Barrel export principal
├── [TabName]Tab.tsx                   # 🎯 Coordinador (NO lógica de negocio)
├── types/index.ts                     # 📋 Types, interfaces, constants
├── hooks/ -> **NUEVA ESTRUCTURA Feature-First v3.0.0** ⬇️
│   ├── products/
│   │   ├── useProductsState.ts        # 🔄 Estado local + reducer + animations
│   │   ├── useProductsLogic.ts        # 🧠 Filtros + lógica de negocio
│   │   ├── useProductsActions.ts      # ⚡ Acciones de negocio
│   │   └── index.ts                   # Barrel export
│   ├── wishlist/, overview/, shared/  # Misma estructura
│   └── index.ts                       # Main barrel export
└── components/
    ├── [SpecificComponent].tsx        # 🧩 Sub-componentes puros
    └── index.ts                       # Barrel export components
```

#### **🔧 PATRÓN DE HOOKS v3.0.0 (OBLIGATORIO):**

1. **`use[Feature]State`**: Reducer pattern + anti-flicker animations
2. **`use[Feature]Logic`**: useMemo para data processing + lógica de negocio
3. **`use[Feature]Actions`**: useCallback para acciones + StorefrontContext
4. **`useSharedFiltering`**: Lógica de filtros compartida entre features

#### **🎯 COORDINADOR PATTERN (MANDATORIO):**

```typescript
function [TabName]Tab() {
  // 🌐 GLOBAL CONTEXT
  const { [data], isLoading, error } = useStorefrontContext();

  // 🔧 LOCAL STATE (Reducer pattern)
  const { state, actions } = use[TabName]State();

  // 🧠 LOGIC & DATA PROCESSING
  const { processed[Data], analytics } = use[TabName]Logic({ [data], state });

  // ⚡ BUSINESS ACTIONS
  const { onAddToCart, onAddToWishlist, onQuickView } = use[TabName]Actions();

  // ⏳ LOADING STATE (First render skeleton)
  if (state.isFirstRender) return <StorefrontPageSkeleton />;

  // ✅ RENDER (Solo orquestación de components)
  return (
    <div>
      <[Component1] {...props} />
      <[Component2] {...props} />
    </div>
  );
}
```

---

## 🚫 **PROHIBICIONES ABSOLUTAS**

### **❌ NUNCA HACER:**

- ❌ **Lógica de negocio** en el componente coordinador
- ❌ **Fetch directo** en componentes (usar context)
- ❌ **Types `any`** (usar interfaces específicas)
- ❌ **Relative imports** largos (usar `@/features/...`)
- ❌ **useState excesivo** (preferir reducer pattern)
- ❌ **Components monolíticos** (+200 líneas)
- ❌ **Mixing concerns** en un solo archivo
- ❌ **Inline object creation** en renders

---

## ✅ **REQUERIMIENTOS TÉCNICOS**

### **🔄 ESTADO LOCAL:**

- ✅ **Reducer pattern** obligatorio para estado complejo
- ✅ **Anti-flicker animations**: `useEffect([isFirstRender])`
- ✅ **Skeleton loader** en `isFirstRender: true`
- ✅ **TypeScript strict** (no `any`)

### **🎨 RENDERIZADO:**

- ✅ **Skeleton en first render** (no texto "loading")
- ✅ **Animaciones suaves** con CSS transitions
- ✅ **Error boundaries** implementados
- ✅ **Mobile-first responsive**

### **📊 PERFORMANCE:**

- ✅ **useMemo** para data processing costoso
- ✅ **useCallback** para event handlers
- ✅ **React.memo** solo cuando sea necesario
- ✅ **Memoizar filtros/sorting**

### **🔍 DEBUGGING:**

- ✅ **Console logs estructurados**: `🎯 [TabName] Action:`, `❌ [TabName] Error:`
- ✅ **Performance monitoring** en desarrollo
- ✅ **Type safety** al 100%

---

## 📋 **IMPLEMENTACIÓN CHECKLIST**

### **🎯 ANTES DE CREAR UN TAB:**

- [ ] ✅ **Leer** `storefront-tabs-architecture.md` completo
- [ ] ✅ **Definir types** primero (`types/index.ts`)
- [ ] ✅ **Planificar hooks** especializados
- [ ] ✅ **Identificar components** modulares necesarios

### **🔧 DURANTE LA IMPLEMENTACIÓN:**

- [ ] ✅ **Implementar en orden**: Types → State → Filters → Actions → Components → Coordinador
- [ ] ✅ **Probar cada hook** independientemente
- [ ] ✅ **Verificar anti-flicker** animations
- [ ] ✅ **Testear responsive** design
- [ ] ✅ **Validar TypeScript** compilation

### **✅ ANTES DE MERGE:**

- [ ] ✅ **Zero linting errors**
- [ ] ✅ **Zero TypeScript errors**
- [ ] ✅ **Performance testing** (no re-renders excesivos)
- [ ] ✅ **Mobile testing** completo
- [ ] ✅ **Error handling** implementado
- [ ] ✅ **Barrel exports** configurados

---

## 🚨 **VIOLATIONS & CONSEQUENCES**

### **⚠️ CODE REVIEW BLOCKERS:**

- 🔴 **Lógica de negocio** en coordinador = REJECT
- 🔴 **Types `any`** = REJECT
- 🔴 **No reducer pattern** para estado complejo = REJECT
- 🔴 **No anti-flicker animations** = REJECT
- 🔴 **Estructura no modular** = REJECT

### **📊 PERFORMANCE REQUIREMENTS:**

- 🟡 **First Render**: < 100ms skeleton display
- 🟡 **Data Processing**: < 50ms for 1000+ items
- 🟡 **Filter Response**: < 16ms (60fps)
- 🟡 **Animation Smoothness**: 60fps sustained

---

## 📚 **REFERENCIAS OBLIGATORIAS**

### **📖 DOCUMENTACIÓN:**

- **Arquitectura completa**: `cursor_project_rules/storefront-tabs-architecture.md`
- **Clean Architecture**: Separation of concerns mandatorio
- **SPA Patterns**: Estado global + optimistic updates

### **🎯 EJEMPLOS IMPLEMENTADOS (GOLD STANDARD):**

- **ProductsTab**: `/products/ProductsTab.tsx` ✅
- **WishlistTab**: `/wishlist/WishlistTab.tsx` ✅
- **OverviewTab**: `/overview/OverviewTab.tsx` ✅

### **⚡ CONTEXT INTEGRATION:**

- **StorefrontContext**: `@/features/storefront/context`
- **Global state management**: SPA behavior obligatorio
- **Optimistic updates**: Para todas las mutations

---

## 🎯 **ENFORCEMENT**

### **🔒 ESTA ARQUITECTURA ES:**

- ✅ **OBLIGATORIA** para todos los tabs nuevos
- ✅ **REQUERIDA** para refactors de tabs existentes
- ✅ **ESTÁNDAR GOLD** para el storefront module
- ✅ **BASE KNOWLEDGE** para el proyecto

### **📋 TODO TAB DEBE:**

1. **Seguir** esta estructura exactamente
2. **Implementar** los 3 hooks especializados
3. **Usar** reducer pattern para estado
4. **Mantener** componentes puros y modulares
5. **Aplicar** todas las mejores prácticas

---

**⚡ REMEMBER: Esta arquitectura garantiza código mantenible, escalable y performante. ¡ES OBLIGATORIO SEGUIRLA!**

---

**📅 Versión:** 3.0.0 - Feature-First Hooks  
**🎯 Status:** ENFORCED - Arquitectura Oficial  
**📋 Applies to:** Todos los tabs del Storefront Module  
**🚀 Nueva estructura:** Hooks organizados por feature en `/hooks/[feature]/`
