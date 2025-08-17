# 🏗️ Enterprise Module Generator

Generador automatizado de módulos Enterprise que siguen los patrones documentados en `ENTERPRISE_PATTERNS.md`.

## 🚀 Uso

```bash
npm run generate:module
```

## 🎯 Características

- **Soporte para 2 tipos de módulos:**

  - **Core** (Infraestructura) - Siempre activos, ubicados en `/src/features/`
  - **Feature Flag** (Experimentales) - Opcionales, ubicados en `/src/modules/`

- **Generación completa:**
  - ✅ Estructura de carpetas Enterprise
  - ✅ Constants centralizados (con/sin feature flags)
  - ✅ Configuration Manager (Singleton pattern)
  - ✅ Sistema de logging estructurado
  - ✅ Reducers optimistas con selectors
  - ✅ Hook React 19 compliant
  - ✅ Server Actions con logging
  - ✅ Types TypeScript completos
  - ✅ Schemas Zod validation
  - ✅ UI Components optimizados
  - ✅ Barrel exports organizados
  - ✅ Documentación README
  - ✅ Schema Prisma (opcional)
  - ✅ Integración automática con navegación
  - ✅ Feature flags (para módulos experimentales)

## 🎪 Proceso Interactivo

El generador te preguntará:

1. **Información básica:**

   - Nombre del módulo (kebab-case)
   - Nombre para mostrar
   - Descripción

2. **Configuración:**

   - Tipo de módulo (Core vs Feature Flag)
   - Ícono (Lucide React)
   - Ruta base
   - Rol requerido
   - Categoría
   - Orden en navegación

3. **Base de datos (opcional):**
   - Crear modelo Prisma
   - Campos personalizados
   - Tipos de datos
   - Validaciones

## 📂 Estructura Generada

### Para Módulos Feature Flag (`/src/modules/[name]/`)

```
📁 [module-name]/
├── 📊 constants/index.ts           # Config con feature flags
├── ⚙️ config/index.ts              # Configuration Manager
├── 📝 utils/logger.ts              # Enterprise Logger
├── 🎯 reducers/index.ts            # Estado optimista
├── 🏆 hooks/use[ModuleName].ts     # Hook principal
├── 🏗️ server/actions/index.ts     # Server Actions
├── 📝 types/index.ts               # TypeScript types
├── 📋 schemas/index.ts             # Zod validation
├── 🧩 ui/                          # Componentes UI
├── 📄 index.ts                     # Barrel exports
└── 📚 README.md                    # Documentación
```

### Para Módulos Core (`/src/features/[name]/`)

```
📁 [module-name]/
├── 📊 constants/index.ts           # Config sin feature flags
├── ⚙️ config/index.ts              # Core Configuration Manager
├── 📝 utils/logger.ts              # Enterprise Logger
├── 🎯 reducers/index.ts            # Estado optimista
├── 🏆 hooks/useCore[ModuleName].ts # Hook core
├── 🏗️ server/actions/index.ts     # Server Actions
├── 📝 types/index.ts               # TypeScript types
├── 📋 schemas/index.ts             # Zod validation
├── 🧩 ui/                          # Componentes UI
├── 📄 index.ts                     # Barrel exports
└── 📚 README.md                    # Documentación
```

## 🔧 Patrones Implementados

### Módulos con Feature Flags

- Configuration Manager con `isFeatureEnabled()`
- Hook con verificaciones de flags
- Lógica condicional: `if (config.features.featureName)`
- Renderizado condicional: `{isEnabled && <Component />}`

### Módulos Core

- Configuration Manager simplificado
- Hook sin verificaciones (siempre activo)
- Funcionalidades siempre disponibles
- Performance optimizado

## 🎯 Integración Automática

### Navegación

- Agrega automáticamente el módulo al `NAVIGATION_REGISTRY`
- Importa el ícono necesario
- Configura permisos y feature flags

### Feature Flags (solo módulos experimentales)

- Actualiza `src/core/config/feature-flags.ts`
- Configura el flag en `MODULE_CONFIG`

### Prisma (opcional)

- Agrega modelo al schema
- Incluye relaciones con User
- Campos personalizados

## 🚀 Después de la Generación

1. **Instalar dependencias (si es necesario):**

   ```bash
   npm install
   ```

2. **Actualizar base de datos:**

   ```bash
   npm run db:push
   ```

3. **Personalizar implementación:**
   - Implementar lógica en `server/services/`
   - Personalizar componentes UI
   - Agregar validaciones específicas
   - Escribir tests

## 🎨 Ejemplo de Uso

Después de generar, usar el módulo:

```typescript
// Para módulos Feature Flag
import { useMyModule } from "@/modules/my-module";

// Para módulos Core
import { useCoreMyModule } from "@/features/my-module";

function MyComponent() {
  const { data, isLoading, error, performOperation, refresh, stats } =
    useMyModule();

  // ... resto del componente
}
```

## 🔍 Debugging

El generador incluye:

- Logging detallado del proceso
- Validación de configuración
- Formateo automático del código
- Resumen completo al finalizar

## ❓ Troubleshooting

### Error: "Module already exists"

- El módulo ya está creado en el directorio de destino
- Elige un nombre diferente o elimina el módulo existente

### Error: "Cannot write to Prisma schema"

- Verifica que existe `prisma/schema.prisma`
- Asegúrate de tener permisos de escritura

### Error: "Navigation integration failed"

- Verifica que existe `src/core/navigation/constants.ts`
- El formato del archivo debe coincidir con el esperado

## 🏆 Compliance

Todos los módulos generados siguen:

- ✅ **Enterprise Patterns V2.0**
- ✅ **React 19 compliance**
- ✅ **TypeScript strict mode**
- ✅ **Performance optimization**
- ✅ **Error handling robusto**
- ✅ **Logging estructurado**
- ✅ **Testing preparado**

---

**Generado con Enterprise Module Generator V2.0** 🚀
