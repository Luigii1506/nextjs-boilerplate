# 🚀 Generadores de Código con Plop

Este proyecto utiliza [Plop.js](https://plopjs.com/) para generar código de manera consistente y rápida. Los generadores están integrados con los patrones de módulos definidos en [REFERENCIA_RAPIDA_MODULOS.md](./REFERENCIA_RAPIDA_MODULOS.md).

## 📦 Instalación

Asegúrate de tener instaladas las dependencias de desarrollo:

```bash
npm install --save-dev plop
```

## 🎯 Generadores Disponibles

### 1. 🏗️ Módulo Complejo

Crea una estructura completa para un módulo complejo (ej: users, storefront) con:
- **Servidor**: service, actions, validators, mappers, queries
- **UI**: componentes, screens, tabs (si es SPA)
- **Context**: estado global (para módulos SPA)
- **Hooks**: personalizados con TanStack Query
- **Tipos**: TypeScript completos

```bash
npm run generate:complex
# o
npx plop complex-module
```

**Estructura generada:**
```
src/features/{nombre-modulo}/
├── index.ts                     # API pública
├── types.ts                     # Tipos consolidados
├── schemas.ts                   # Validaciones Zod
├── constants.ts                 # Constantes
├── utils.ts                     # Utilidades
├── config.ts                    # Configuración
├── context/                     # Estado global (SPA)
│   └── {Module}Context.tsx      # Context con tabs
├── hooks/                       # Múltiples hooks
│   ├── use{Module}.ts           # Hook principal
│   └── index.ts                 # Barrel export
├── server/                      # Server logic
│   ├── actions.ts               # Server actions
│   ├── queries.ts               # Database queries
│   ├── service.ts               # Domain services
│   ├── validators.ts            # Input validation
│   ├── mappers.ts               # Data transformation
│   └── index.ts                 # Barrel export
└── ui/                          # Múltiples componentes
    ├── routes/
    │   └── {module}.screen.tsx  # Screen principal
    ├── components/
    │   ├── tabs/                # Tabs (si es SPA)
    │   │   ├── Tab1.tsx
    │   │   ├── Tab2.tsx
    │   │   └── index.ts
    │   └── shared/              # Componentes compartidos
    └── index.ts                 # Barrel export
```

### 2. 🚀 Módulo Simple

Crea una estructura simplificada para módulos más pequeños (ej: feature-flags, settings) con:
- **Servidor**: services, actions básicos
- **UI**: screen principal y componentes
- **Hooks**: personalizados básicos
- **Tipos**: TypeScript esenciales

```bash
npm run generate:simple
# o
npx plop simple-module
```

**Estructura generada:**
```
src/features/{nombre-modulo}/
├── index.ts                     # API pública
├── {module}.types.ts            # Tipos
├── {module}.hooks.ts            # Hooks
├── {module}.services.ts         # Servicios de dominio
├── {module}.actions.ts          # Server actions
├── {module}.screen.tsx          # UI principal
└── components/                  # Componentes
    ├── {Module}Card.tsx
    └── index.ts
```

### 3. 🎨 Componente

Crea un nuevo componente React con TypeScript:
- **Componente**: principal con props tipadas
- **Tipos**: interfaces y types
- **Estilos**: CSS Modules o Tailwind
- **Barrel**: export automático

```bash
npm run generate:component
# o
npx plop component
```

### 4. 🎯 Módulo SPA con Tabs

Genera un módulo completo con patrón SPA y sistema de tabs:
- **Context**: estado global compartido
- **Tabs**: navegación interna fluida
- **Screen**: con tabs siempre montados
- **Optimistic Updates**: para mejor UX

```bash
npm run generate:spa-module
# o
npx plop spa-module
```

## 🛠️ Uso Avanzado

### Opciones de la Línea de Comandos

Puedes especificar opciones directamente:

```bash
# Generar componente específico
npx plop component --name MiComponente --type features

# Generar módulo con opciones
npx plop complex-module --name inventory --spa true
```

### Personalización de Templates

Las plantillas están en `.plop/plop-templates/` y puedes modificarlas:

```
.plop/plop-templates/
├── complex-module/              # Templates módulo complejo
│   ├── context/
│   ├── server/
│   └── ui/
├── simple-module/               # Templates módulo simple
├── component/                   # Templates componente
└── spa-module/                  # Templates SPA con tabs
```

## 📋 Integración con Patrones

Los generadores están alineados con los patrones documentados:

| Generador | Patrón | Uso Recomendado |
|-----------|--------|-----------------|
| `simple-module` | Módulo Simple | < 10 archivos, CRUD básico |
| `complex-module` | Módulo Complejo | 10+ archivos, lógica rica |
| `spa-module` | SPA con Tabs | Alta reactividad, múltiples vistas |
| `component` | Componente | Reutilizable, standalone |

## ✅ Buenas Prácticas

### 📝 Nombrado
- **Módulos**: `kebab-case` (ej: `user-management`)
- **Componentes**: `PascalCase` (ej: `UserCard`)
- **Archivos**: Seguir convenciones del patrón

### 🏗️ Estructura
- Mantener consistencia con patrones definidos
- Usar barrel exports (`index.ts`)
- Seguir separación de responsabilidades

### 📚 Documentación
- Actualizar documentación al modificar templates
- Documentar decisiones arquitectónicas
- Mantener ejemplos actualizados

### 🔄 Reutilización
- Crear templates para patrones recurrentes
- Reutilizar componentes entre módulos
- Mantener API pública consistente

## 🚨 Solución de Problemas

### Errores Comunes

1. **Template no encontrado**:
   ```bash
   # Verificar que existan los templates
   ls .plop/plop-templates/
   ```

2. **Dependencias faltantes**:
   ```bash
   npm install --save-dev plop
   ```

3. **Permisos de archivos**:
   ```bash
   chmod +x node_modules/.bin/plop
   ```

### Debug

Para debug detallado:
```bash
DEBUG=plop* npx plop
```

## 🎯 Comandos Rápidos

```bash
# Generar módulo simple
npm run generate:simple

# Generar módulo complejo
npm run generate:complex

# Generar módulo SPA
npm run generate:spa

# Generar componente
npm run generate:component

# Ver todos los generadores
npx plop --help
```

## 🔧 Configuración Avanzada

### Custom Helpers

Puedes agregar helpers personalizados en `plopfile.js`:

```javascript
// Ejemplo de helper personalizado
plop.setHelper('upperCase', (text) => text.toUpperCase());
```

### Conditional Templates

Templates condicionales basados en respuestas:

```javascript
// En el generador
actions: function(data) {
  const actions = [];
  
  if (data.includeSPA) {
    actions.push({
      type: 'add',
      path: 'src/features/{{dashCase name}}/context/{{pascalCase name}}Context.tsx',
      templateFile: '.plop/plop-templates/spa-module/context.hbs'
    });
  }
  
  return actions;
}
```

## 🤝 Contribución

Para agregar o modificar generadores:

1. **Crear rama**: `git checkout -b feature/nuevo-generador`
2. **Modificar templates**: En `.plop/plop-templates/`
3. **Actualizar plopfile**: Agregar nuevo generador
4. **Documentar**: Actualizar esta documentación
5. **Testing**: Probar generación completa
6. **Pull Request**: Abrir PR con cambios

## 📚 Referencias

- [Referencia Rápida de Módulos](./REFERENCIA_RAPIDA_MODULOS.md)
- [Plop.js Documentation](https://plopjs.com/)
- [Handlebars Templates](https://handlebarsjs.com/)

---

¡Feliz generación de código! 🚀✨
