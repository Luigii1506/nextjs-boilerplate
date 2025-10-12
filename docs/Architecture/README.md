# 🏗️ **Architecture Documentation**

## **Documentación Completa de Arquitecturas del Proyecto**

---

## 📚 **Documentación Disponible**

### 🚀 **[SPA Feature-First Architecture](./spa-feature-modules.md)**

**Arquitectura principal para módulos complejos como Single Page Applications**

- ✅ **Cuándo usar**: Módulos grandes como Inventory, E-commerce, CRM
- ⚡ **Características**: Navegación por tabs, estado compartido, performance optimizado
- 🎯 **Beneficios**: Experiencia instantánea, datos persistentes, UX premium

### 🧩 **[SPA Components & Implementation Guide](./spa-components-guide.md)**

**Guía detallada de componentes y patrones de implementación**

- 🎭 **Componentes Core**: TabTransition, TabBadge, TabLoadingSkeleton
- 🎨 **Sistema de Animaciones**: CSS keyframes, GPU acceleration, responsive
- 🎣 **Hooks Especializados**: useScrollHeader, useTabTransition, persistencia
- 🔄 **Patrones de Comunicación**: Context-to-Hook, Tab-to-Tab, Event-based

---

## 🔴 **CRITICAL: State Management & Bug Prevention**

### 🐛 **[Infinite Loop Post-Mortem](./INFINITE_LOOP_POST_MORTEM.md)** ⚠️ **REQUIRED READING**

**Análisis completo del bug de loop infinito del carrito - Semanas de debugging documentadas**

- 🔍 **Root Cause Analysis**: Bidirectional state sync sin tracking de origen
- 🎯 **The Fatal Flow**: Diagrama completo del ciclo infinito
- ✅ **The Solution**: Edit Mode Pattern con refs
- 📚 **Lessons Learned**: Las 5 Leyes del React State
- 🛡️ **Prevention Guidelines**: Checklist para futuros módulos

### 🎯 **[State Management Guidelines](./STATE_MANAGEMENT_GUIDELINES.md)** 📖 **MANDATORY**

**Guía profesional de arquitectura de estado en React**

- 🏛️ **Core Principles**: Las 5 Leyes del React State
- 🌳 **Decision Tree**: Dónde colocar cada tipo de estado
- 🎨 **Context Best Practices**: Patrón profesional con memoización
- ❌ **Anti-Patterns**: 6 errores comunes que causan loops
- ✅ **Code Review Checklist**: Qué verificar en cada PR

### ⚡ **[Optimistic Updates Pattern](./OPTIMISTIC_UPDATES_PATTERN.md)** 🚀 **COPY & PASTE**

**Patrón battle-tested para updates optimistas sin loops**

- 🎯 **Edit Mode Pattern**: Hook reutilizable completo
- 📝 **Usage Examples**: Cart, Wishlist, Auto-save
- 🧪 **Testing Guide**: Unit e Integration tests
- 🐛 **Debugging Checklist**: Cómo detectar y resolver loops
- 🎬 **Component Pattern**: Implementación exacta del CartItem fix

---

## 🎯 **Quick Start Guide**

### **Para Módulos Simples** (Settings, Feature Flags, Audit)

```typescript
// Estructura tradicional feature-first
src/features/simple-module/
├── actions.ts
├── schemas.ts
├── ui/
│   ├── components/
│   └── routes/
│       └── simple.screen.tsx
└── hooks/
```

### **Para Módulos Complejos** (Inventory, E-commerce, CRM)

```typescript
// Arquitectura SPA Feature-First
src/features/complex-module/
├── server/                     # Enterprise logic
├── ui/
│   ├── components/shared/      # Shared components
│   ├── context/               # SPA state management
│   ├── hooks/                 # Custom hooks
│   ├── routes/               # SPA container
│   ├── styles/               # Animations
│   └── tabs/                 # Individual views
├── actions.ts
├── schemas.ts
└── hooks/                     # Feature-level hooks
```

---

## 🔄 **Migration Path**

### **De Módulo Simple a SPA Complex**

1. **Preparar estructura**:

   ```bash
   mkdir -p ui/{context,tabs,styles}
   mv ui/routes/module.screen.tsx ui/routes/module.screen.tsx.backup
   ```

2. **Crear Context Provider**:

   ```typescript
   // ui/context/ModuleContext.tsx
   export const ModuleProvider = ({ children }) => {
     const [activeTab, setActiveTab] = useState("overview");
     return (
       <ModuleContext.Provider value={{ activeTab, setActiveTab }}>
         {children}
       </ModuleContext.Provider>
     );
   };
   ```

3. **Convertir a SPA Container**:

   ```typescript
   // ui/routes/module.screen.tsx
   const ModuleScreen = () => (
     <ModuleProvider>
       <TabNavigation />
       <TabContent />
     </ModuleProvider>
   );
   ```

4. **Crear Tab Components**:
   ```typescript
   // ui/tabs/OverviewTab.tsx
   const OverviewTab = React.memo(() => (
     <TabTransition isActive={true}>
       {/* Content from original screen */}
     </TabTransition>
   ));
   ```

---

## 🎨 **Design Patterns Implementados**

### **1. 🏗️ SPA Architecture Pattern**

- **Single URL** con navegación interna
- **Estado compartido** entre tabs
- **Datos persistentes** con TanStack Query
- **Performance optimizado** con React.memo

### **2. 🎭 Smart Header Pattern**

- **Scroll-aware** header que se oculta/muestra
- **Backdrop blur** effects
- **Progress indicator** visual
- **Responsive** en todos los dispositivos

### **3. 🌊 Transition System Pattern**

- **CSS-only** animations (no JavaScript delays)
- **GPU accelerated** transforms
- **Accessibility** compliant (reduced-motion)
- **Staggered animations** para elementos múltiples

### **4. 🎣 Hook Composition Pattern**

- **Specialized hooks** para diferentes behaviors
- **Context + Hook** communication pattern
- **Event-based** loose coupling
- **Persistent state** management

---

## 📊 **Performance Benchmarks**

### **Antes (Traditional Navigation)**

- ❌ **Tab Switch**: 300ms loading + network request
- ❌ **Data Loss**: Re-fetch en cada cambio
- ❌ **UX**: Interruption y flickering

### **Después (SPA Architecture)**

- ✅ **Tab Switch**: 0ms (instantáneo)
- ✅ **Data Persistence**: Cache inteligente
- ✅ **UX**: Smooth y premium experience

### **Métricas del Módulo Inventory**

- 🚀 **FCP (First Contentful Paint)**: < 200ms
- ⚡ **Tab Switching**: 0ms (instant)
- 💾 **Memory Usage**: Optimizado con memoization
- 📱 **Mobile Performance**: 60fps animations

---

## 🧪 **Testing Strategy**

### **Unit Tests**

```bash
# Context testing
src/features/module/__tests__/ModuleContext.test.tsx

# Component testing
src/features/module/__tests__/components/TabTransition.test.tsx

# Hook testing
src/features/module/__tests__/hooks/useScrollHeader.test.tsx
```

### **Integration Tests**

```bash
# Tab navigation
src/features/module/__tests__/integration/tab-navigation.test.tsx

# State management
src/features/module/__tests__/integration/state-management.test.tsx
```

### **E2E Tests**

```bash
# Full SPA workflow
cypress/e2e/inventory-spa-workflow.cy.ts

# Performance testing
cypress/e2e/performance/tab-switching.cy.ts
```

---

## 📋 **Implementation Checklist**

### **Planning Phase**

- [ ] Definir si el módulo requiere arquitectura SPA
- [ ] Identificar tabs/secciones necesarias
- [ ] Diseñar estructura de estado compartido
- [ ] Planificar integraciones con otros módulos

### **Development Phase**

- [ ] Crear estructura de carpetas SPA
- [ ] Implementar Context Provider
- [ ] Crear Tab Navigation system
- [ ] Implementar individual Tab components
- [ ] Añadir animaciones y transiciones
- [ ] Configurar hooks especializados
- [ ] Optimizar performance (React.memo)

### **Testing Phase**

- [ ] Unit tests para Context y Hooks
- [ ] Component testing para Tabs
- [ ] Integration tests para navigation
- [ ] E2E tests para workflows completos
- [ ] Performance testing

### **Launch Phase**

- [ ] Documentar module-specific patterns
- [ ] Crear migration guide (si aplica)
- [ ] Monitor performance metrics
- [ ] Collect user feedback

---

## 🔧 **Troubleshooting Common Issues**

### **❌ "isTabChanging is not defined"**

```typescript
// ✅ Fix: Import from context
const { activeTab, setActiveTab, isTabChanging } = useInventoryContext();
```

### **❌ Loading shown between tabs**

```typescript
// ❌ Problem: Artificial delays
setTimeout(() => setIsTabChanging(false), 300);

// ✅ Solution: Instant switching
setActiveTabState(tab);
requestAnimationFrame(() => setIsTabChanging(false));
```

### **❌ Poor animation performance**

```css
/* ✅ Solution: GPU acceleration */
.transform-gpu {
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
}
```

### **❌ State loss between tabs**

```typescript
// ✅ Solution: TanStack Query persistence
const inventory = useInventoryQuery({
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnMount: false, // Don't refetch
});
```

---

## 🎯 **Best Practices Summary**

### **✅ DO's**

- Use SPA pattern for complex modules (5+ sections)
- Implement instant tab switching (no artificial delays)
- Persist data with TanStack Query
- Use Context API for shared state
- Memoize heavy components with React.memo
- Apply GPU acceleration for smooth animations
- Support keyboard navigation and accessibility
- Test all interaction patterns thoroughly

### **❌ DON'Ts**

- Don't use SPA pattern for simple modules (< 3 sections)
- Don't add loading states between cached tabs
- Don't use multiple contexts per module
- Don't create artificial delays in transitions
- Don't forget mobile responsiveness
- Don't ignore accessibility requirements
- Don't skip performance optimization
- Don't over-engineer simple interactions

---

## 📈 **Future Enhancements**

### **Planned Features**

- [ ] **Route Sync**: URL params sync with active tabs
- [ ] **Deep Linking**: Direct links to specific tabs
- [ ] **Lazy Loading**: Code splitting for heavy tabs
- [ ] **Offline Support**: PWA capabilities
- [ ] **Real-time Updates**: WebSocket integration
- [ ] **Advanced Search**: Global search with filters
- [ ] **Keyboard Shortcuts**: Power user navigation
- [ ] **Customizable Layouts**: User preference system

### **Architecture Evolution**

- [ ] **Micro-frontends**: Independent module deployment
- [ ] **SSR/SSG Support**: Server-side rendering
- [ ] **Edge Caching**: CDN-optimized assets
- [ ] **Advanced Analytics**: User behavior tracking

---

## 📞 **Support & Resources**

### **Internal Resources**

- 🏗️ [Architecture Decisions](./architecture-decisions.md)
- 🧩 [Component Library](../components/README.md)
- 🎨 [Design System](../design-system/README.md)
- 🧪 [Testing Guidelines](../testing/README.md)

### **External Resources**

- [React 19 Documentation](https://react.dev)
- [TanStack Query Guide](https://tanstack.com/query)
- [Next.js Best Practices](https://nextjs.org/docs)
- [TypeScript Guidelines](https://www.typescriptlang.org/docs)

---

**🚀 Esta documentación te proporciona todo lo necesario para implementar y mantener módulos SPA Feature-First de nivel enterprise en tu aplicación.**

_Creado: 2025-01-17 - Comprehensive Architecture Documentation_
_Módulo de referencia: Inventory Management SPA_
