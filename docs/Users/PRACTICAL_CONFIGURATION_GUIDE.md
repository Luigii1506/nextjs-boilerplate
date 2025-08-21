# 🎯 Guía de Configuración Práctica - Módulo de Usuarios

> **Configuración simple, funcional y útil. Solo lo que realmente vas a cambiar.**

## 📋 Índice

1. [Filosofía de la Configuración](#filosofía)
2. [Configuraciones Principales](#configuraciones-principales)
3. [Presets Predefinidos](#presets-predefinidos)
4. [Quick Config (Una Línea)](#quick-config)
5. [Ejemplos Prácticos](#ejemplos-prácticos)
6. [API Completa](#api-completa)

---

## 🎯 Filosofía

**Antes:** Configuraciones técnicas que nunca cambiarías (cache, debounce, retries)
**Ahora:** Solo configuraciones que realmente usas y cambias

### ✅ Lo que SÍ incluimos:

- **Display:** Items por página, ordenamiento, vista compacta
- **Búsqueda:** Campos de búsqueda, búsqueda instantánea
- **Filtros:** Qué filtros mostrar, valores por defecto
- **Formularios:** Campos avanzados, operaciones masivas
- **Notificaciones:** Duración, posición

### ❌ Lo que NO incluimos:

- Configuraciones de cache (siempre optimizadas)
- Timeouts y delays (valores óptimos fijos)
- Configuraciones de red (manejadas automáticamente)
- Settings que nunca cambiarías

---

## 📊 Configuraciones Principales

### 1. **Display (Lo que más cambias)**

```typescript
// Items por página (5, 10, 20, 50, 100)
usersConfig.setItemsPerPage(20);

// Ordenamiento por defecto
usersConfig.setDefaultSort("createdAt", "desc"); // Más recientes primero
usersConfig.setDefaultSort("name", "asc"); // Alfabético A-Z
usersConfig.setDefaultSort("lastLogin", "desc"); // Último acceso

// Vista
usersConfig.toggleAvatars(); // Mostrar/ocultar avatares
usersConfig.toggleCompactView(); // Vista compacta vs expandida
usersConfig.toggleUserStats(); // Mostrar estadísticas de usuario
```

### 2. **Búsqueda**

```typescript
// Configurar búsqueda
usersConfig.setSearchMinChars(2); // Mínimo 2 caracteres
usersConfig.toggleInstantSearch(); // Búsqueda mientras escribes
usersConfig.setSearchFields(["both"]); // Buscar en nombre y email
usersConfig.setSearchFields(["name"]); // Solo en nombres
usersConfig.setSearchFields(["email"]); // Solo en emails
```

### 3. **Filtros**

```typescript
// Qué filtros mostrar
usersConfig.toggleRoleFilter(); // Filtro por rol
usersConfig.toggleStatusFilter(); // Filtro por estado
usersConfig.toggleDateRangeFilter(); // Filtro por fechas

// Valores por defecto
usersConfig.setDefaultRole("admin"); // Mostrar solo admins
usersConfig.setDefaultRole("all"); // Mostrar todos
```

### 4. **Formularios**

```typescript
// Funcionalidades de formularios
usersConfig.toggleAdvancedFields(); // Campos avanzados
usersConfig.toggleBulkOperations(); // Operaciones masivas
```

---

## 🚀 Presets Predefinidos

### 📱 Mobile

```typescript
usersConfig.usePreset("mobile");
// ✅ 10 items, sin avatares, vista compacta, búsqueda no instantánea
```

### 🚀 Performance

```typescript
usersConfig.usePreset("performance");
// ✅ 100 items, sin avatares, sin stats, búsqueda con 3+ chars
```

### 🎯 Advanced

```typescript
usersConfig.usePreset("advanced");
// ✅ 50 items, todos los filtros, campos avanzados, bulk operations
```

### 🎨 Simple

```typescript
usersConfig.usePreset("simple");
// ✅ 10 items, mínimos filtros, sin campos avanzados
```

---

## ⚡ Quick Config (Una Línea)

Para cambios súper rápidos:

```typescript
// 📊 Display rápido
quickConfig.show10Items();
quickConfig.show20Items();
quickConfig.show50Items();
quickConfig.show100Items();

// 🔄 Ordenamiento rápido
quickConfig.sortByName(); // A-Z por nombre
quickConfig.sortByNewest(); // Más recientes
quickConfig.sortByOldest(); // Más antiguos
quickConfig.sortByEmail(); // Por email
quickConfig.sortByLastLogin(); // Por último acceso

// 🎨 Vista rápida
quickConfig.enableCompactView();
quickConfig.hideAvatars();
quickConfig.showAdvancedFields();
quickConfig.enableBulkOps();

// 🔍 Búsqueda rápida
quickConfig.enableInstantSearch();
quickConfig.searchBothFields();
quickConfig.searchNameOnly();
quickConfig.searchEmailOnly();

// 🎯 Presets rápidos
quickConfig.mobileMode();
quickConfig.performanceMode();
quickConfig.advancedMode();
quickConfig.simpleMode();

// 📊 Info rápida
quickConfig.getCurrentConfig();
quickConfig.getItemsPerPage();
quickConfig.getCurrentSort();

// 🔄 Reset
quickConfig.resetToDefaults();
```

---

## 💡 Ejemplos Prácticos

### Caso 1: Equipo Grande (100+ usuarios)

```typescript
// Configuración para muchos usuarios
usersConfig.setItemsPerPage(100); // Más usuarios por página
usersConfig.setDefaultSort("name", "asc"); // Orden alfabético
usersConfig.toggleAvatars(); // Sin avatares (rendimiento)
usersConfig.toggleCompactView(); // Vista compacta
usersConfig.toggleRoleFilter(); // Filtro por roles
```

### Caso 2: Uso en Móvil/Tablet

```typescript
// Optimizado para móvil
usersConfig.usePreset("mobile");
// O manualmente:
usersConfig.setItemsPerPage(10);
usersConfig.toggleCompactView();
usersConfig.toggleAvatars();
usersConfig.setSearchMinChars(3);
```

### Caso 3: Administrador Power User

```typescript
// Todas las funcionalidades
usersConfig.usePreset("advanced");
// O manualmente:
usersConfig.setItemsPerPage(50);
usersConfig.toggleAdvancedFields();
usersConfig.toggleBulkOperations();
usersConfig.toggleDateRangeFilter();
usersConfig.toggleRoleFilter();
usersConfig.toggleStatusFilter();
```

### Caso 4: Vista Simple para Usuarios Básicos

```typescript
// Interfaz limpia y simple
usersConfig.usePreset("simple");
// O manualmente:
usersConfig.setItemsPerPage(10);
usersConfig.setDefaultSort("name", "asc");
// Sin filtros complejos
```

---

## 📋 API Completa

### 🏗️ Manager Principal

```typescript
import { usersConfig } from "@/features/admin/users";

// Obtener configuración
const config = usersConfig.getConfig();

// Usar preset
usersConfig.usePreset("mobile" | "performance" | "advanced" | "simple");

// Reset
usersConfig.resetToDefaults();
```

### 📊 Display

```typescript
// Items por página
usersConfig.setItemsPerPage(5 | 10 | 20 | 50 | 100);
usersConfig.getItemsPerPage(); // number

// Ordenamiento
usersConfig.setDefaultSort(field, direction);
usersConfig.getCurrentSort(); // { field, direction }

// Vista
usersConfig.toggleAvatars();
usersConfig.shouldShowAvatars(); // boolean

usersConfig.toggleCompactView();
usersConfig.isCompactView(); // boolean

usersConfig.toggleUserStats();
```

### 🔍 Búsqueda

```typescript
// Configuración
usersConfig.setSearchMinChars(1 | 2 | 3);
usersConfig.toggleInstantSearch();
usersConfig.setSearchFields(["name"] | ["email"] | ["both"]);

// Info
usersConfig.getSearchConfig(); // SearchConfig
```

### 🎨 Filtros

```typescript
// Mostrar/ocultar filtros
usersConfig.toggleRoleFilter();
usersConfig.shouldShowRoleFilter(); // boolean

usersConfig.toggleStatusFilter();
usersConfig.shouldShowStatusFilter(); // boolean

usersConfig.toggleDateRangeFilter();

// Valores por defecto
usersConfig.setDefaultRole("all" | "user" | "admin" | "super_admin");
```

### 📝 Formularios

```typescript
// Funcionalidades
usersConfig.toggleAdvancedFields();
usersConfig.toggleBulkOperations();
usersConfig.allowsBulkOperations(); // boolean
```

### 🔔 Notificaciones

```typescript
// Configuración
usersConfig.setNotificationDuration(2000 | 3000 | 5000);
usersConfig.setNotificationPosition(
  "top-right" | "top-center" | "bottom-right"
);
```

### 📊 Información

```typescript
// Resumen de configuración
usersConfig.getSummary();
// {
//   itemsPerPage: 20,
//   defaultSort: "createdAt_desc",
//   instantSearch: true,
//   showAvatars: true,
//   compactView: false,
//   preset: "custom"
// }
```

---

## 🎯 Consejos de Uso

### ✅ Mejores Prácticas

1. **Usa presets** para cambios rápidos según contexto
2. **Usa quickConfig** para cambios de una línea
3. **Configura itemsPerPage** según tu caso de uso:
   - 10-20: Equipos pequeños, móvil
   - 50: Equipos medianos
   - 100: Equipos grandes, power users
4. **Activa instantSearch** solo si tienes pocos usuarios
5. **Desactiva avatares** para mejor rendimiento
6. **Usa vista compacta** para ver más usuarios
7. **Activa filtros** solo si los necesitas

### 🚫 Evita

- Cambiar configuraciones muy frecuentemente
- Activar todos los filtros si no los usas
- Usar 100+ items en móvil
- Búsqueda instantánea con miles de usuarios

---

## 🔄 Migración desde Configuración Anterior

Si tenías la configuración anterior con `performance`, `ui`, `settings`, etc:

```typescript
// ❌ Antes
const oldConfig = {
  ui: { itemsPerPage: 20 },
  performance: { debounceMs: 300 },
  settings: { optimisticUpdates: true },
};

// ✅ Ahora
usersConfig.setItemsPerPage(20);
// debounce y optimistic updates están optimizados automáticamente
```

---

## 📚 Recursos Adicionales

- **Ejemplos en vivo:** `src/features/admin/users/examples/practical-config-examples.tsx`
- **Tipos TypeScript:** `src/features/admin/users/config/index.ts`
- **Hook de usuarios:** `src/features/admin/users/hooks/useUsers.ts`

---

_Configuración práctica y funcional. Solo lo que realmente necesitas. 🎯_
