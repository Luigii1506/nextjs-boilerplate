# 🎯 Plan de Reorganización de Tipos

## 📊 Problema Actual

### ❌ Duplicaciones Encontradas:

- `User` interface existe en:
  - `src/shared/types/user.ts`
  - `src/features/admin/users/types/index.ts`
- Tipos dispersos sin lógica clara
- Inconsistencias entre definiciones
- Confusión sobre dónde definir nuevos tipos

## 🎯 Nueva Estructura Propuesta

### 📁 Jerarquía de Tipos

```
src/
├── shared/types/                    # 🌍 TIPOS GLOBALES
│   ├── index.ts                    # Barrel exports
│   ├── base.types.ts               # Tipos base (BaseEntity, etc)
│   ├── api.types.ts                # API responses, requests
│   ├── auth.types.ts               # User, Session, Auth
│   ├── ui.types.ts                 # UI components, props
│   └── database.types.ts           # Database, Prisma
│
├── core/                           # 🔧 TIPOS DE CORE
│   ├── auth/auth.types.ts          # Auth específico
│   ├── feature-flags/feature-flags.types.ts
│   └── navigation/navigation.types.ts
│
├── features/admin/                 # 🏗️ TIPOS DE FEATURES
│   ├── users/users.types.ts        # Solo tipos específicos de users
│   ├── dashboard/dashboard.types.ts
│   └── feature-flags/feature-flags.types.ts
│
└── modules/                        # 📦 TIPOS DE MÓDULOS
    └── file-upload/file-upload.types.ts
```

## 🎯 Reglas de Organización

### 1. **Shared Types** (`src/shared/types/`)

**Usar para:**

- ✅ Tipos usados por 3+ módulos
- ✅ Tipos base del sistema (User, BaseEntity)
- ✅ Tipos de API generales
- ✅ Tipos de UI reutilizables

### 2. **Core Types** (`src/core/[module]/[module].types.ts`)

**Usar para:**

- ✅ Tipos específicos de funcionalidad core
- ✅ Tipos que extienden shared types
- ✅ Configuraciones específicas

### 3. **Feature Types** (`src/features/[feature]/[feature].types.ts`)

**Usar para:**

- ✅ Tipos específicos de la feature
- ✅ Props de componentes específicos
- ✅ Estados específicos del módulo

### 4. **Module Types** (`src/modules/[module]/[module].types.ts`)

**Usar para:**

- ✅ Tipos específicos del módulo
- ✅ Configuraciones del módulo

## 🔄 Plan de Migración

### Fase 1: Consolidar Shared Types

1. Crear `src/shared/types/auth.types.ts` con User definitivo
2. Eliminar duplicados
3. Actualizar imports

### Fase 2: Reorganizar Core Types

1. Mover tipos específicos a sus módulos
2. Mantener solo lo necesario en shared

### Fase 3: Estandarizar Features/Modules

1. Aplicar naming convention
2. Eliminar carpetas `types/`
3. Usar archivos `[module].types.ts`

## ✅ Beneficios

- **Sin duplicaciones** - Un solo lugar para cada tipo
- **Lógica clara** - Fácil saber dónde buscar/definir tipos
- **Consistencia** - Mismo patrón en todo el proyecto
- **Mantenibilidad** - Fácil de actualizar y extender
