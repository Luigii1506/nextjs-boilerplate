# Generadores de Código con Plop

Este proyecto utiliza [Plop.js](https://plopjs.com/) para generar código de manera consistente y rápida. A continuación, se detalla cómo utilizar los generadores disponibles.

## Instalación

Asegúrate de tener instaladas las dependencias de desarrollo:

```bash
npm install --save-dev plop
```

## Generadores Disponibles

### 1. Módulo Complejo

Crea una estructura completa para un módulo complejo (ej: users) con:
- Servidor (service, actions, validators, mappers)
- UI (list, form, components)
- Hooks personalizados
- Tipos y configuración

```bash
npm run generate:complex
```

### 2. Módulo Simple

Crea una estructura simplificada para módulos más pequeños (ej: feature-flags) con:
- Acciones del servidor
- Pantalla principal
- Componentes básicos
- Hooks personalizados

```bash
npm run generate:simple
```

### 3. Componente

Crea un nuevo componente React con TypeScript:
- Componente principal
- Tipos
- Estilos CSS Modules
- Archivo de barril

```bash
npm run generate:component
```

## Estructura de Carpetas

### Módulo Complejo
```
src/features/{nombre-modulo}/
├── index.ts           # Exportaciones del módulo
├── types.ts           # Tipos de TypeScript
├── config.ts          # Configuración del módulo
├── server/
│   ├── service.ts     # Lógica de negocio
│   ├── actions.ts     # Server Actions
│   ├── validators.ts  # Validaciones con Zod
│   └── mappers.ts     # Mapeo de datos
├── ui/
│   ├── index.ts       # Exportaciones de UI
│   ├── {Nombre}List.tsx
│   └── {Nombre}Form.tsx
└── hooks/
    ├── index.ts       # Exportaciones de hooks
    └── use{Nombre}Query.ts
```

### Módulo Simple
```
src/features/{nombre-modulo}/
├── index.ts           # Exportaciones del módulo
├── types.ts           # Tipos de TypeScript
├── actions.ts         # Server Actions
├── screen.tsx         # Pantalla principal
├── components/        # Componentes del módulo
│   ├── index.ts
│   └── {Nombre}Card.tsx
└── hooks/
    ├── index.ts
    └── use{Nombre}Query.ts
```

## Uso Avanzado

### Opciones de la Línea de Comandos

Puedes especificar opciones directamente en la línea de comandos:

```bash
npx plop component --name MiComponente --type features
```

### Personalización

Puedes modificar las plantillas en `.plop/plop-templates/` para adaptarlas a las necesidades específicas de tu proyecto.

## Buenas Prácticas

1. **Nombrado**: Usa nombres descriptivos en kebab-case para módulos y PascalCase para componentes.
2. **Estructura**: Mantén la estructura de archivos consistente.
3. **Documentación**: Actualiza la documentación cuando modifiques las plantillas.
4. **Reutilización**: Crea plantillas para patrones que se repitan en tu aplicación.

## Solución de Problemas

Si encuentras algún problema con los generadores:

1. Verifica que todas las dependencias estén instaladas.
2. Asegúrate de que los archivos de plantilla existan en `.plop/plop-templates/`.
3. Revisa los mensajes de error en la consola.

## Contribución

Si deseas agregar o modificar generadores:

1. Crea una nueva rama: `git checkout -b feature/nuevo-generador`
2. Realiza tus cambios
3. Actualiza la documentación
4. Abre un Pull Request

---

¡Feliz generación de código! 🚀
