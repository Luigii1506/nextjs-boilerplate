# 📊 Vitest UI - Visualización Gráfica de Tests

Esta guía te ayudará a configurar y usar Vitest UI para visualizar tus tests de forma gráfica y profesional.

## 🚀 Instalación

Ya he agregado `@vitest/ui` al `package.json`. Solo necesitas instalar las dependencias:

### Opción 1: Instalación Normal (Recomendada)
```bash
npm install
```

### Opción 2: Si tienes problemas con npm cache
```bash
# Limpiar caché
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Opción 3: Si hay conflictos de peer dependencies
```bash
npm install --legacy-peer-deps
```

## ✅ Configuración Completada

Ya he configurado los siguientes scripts en tu `package.json`:

```json
{
  "scripts": {
    "test:vitest:ui": "vitest --ui",              // Todos los tests con UI
    "test:pos": "vitest run src/features/pos",     // Tests POS en terminal
    "test:pos:watch": "vitest watch src/features/pos", // Tests POS en watch mode
    "test:pos:ui": "vitest --ui src/features/pos",     // Tests POS con UI ⭐
    "test:pos:coverage": "vitest run src/features/pos --coverage" // Con cobertura
  }
}
```

## 🎯 Cómo Usar Vitest UI

### Para ver TODOS los tests del POS con interfaz gráfica:

```bash
npm run test:pos:ui
```

### Para ver TODOS los tests de vitest con interfaz gráfica:

```bash
npm run test:vitest:ui
```

Esto abrirá automáticamente tu navegador en `http://localhost:51204` (o un puerto similar) con la interfaz de Vitest UI.

## 📸 Características de Vitest UI

### 1. **Vista de Tests**
- ✅ Lista de todos tus archivos de test
- ✅ Estado visual (pasando/fallando) con iconos y colores
- ✅ Contador de tests por archivo
- ✅ Tiempo de ejecución por test

### 2. **Filtros y Búsqueda**
- 🔍 Buscar tests por nombre
- 📁 Filtrar por archivo
- ✅ Filtrar solo tests que pasan
- ❌ Filtrar solo tests que fallan
- ⏭️ Filtrar tests saltados

### 3. **Código y Resultados Lado a Lado**
- 📝 Ver el código fuente del test
- 📊 Ver los resultados en tiempo real
- 🎯 Click en un test para ver detalles
- 📍 Navegación directa al código

### 4. **Watch Mode Inteligente**
- 🔄 Se actualizan automáticamente al guardar archivos
- ⚡ Solo ejecuta tests afectados por cambios
- 🎮 Control manual de ejecución

### 5. **Stack Traces y Errores**
- 🐛 Ver stack traces formateados
- 📍 Click para abrir archivo en el editor
- 🔴 Errores resaltados con sintaxis
- 💡 Diff visual para assertions

### 6. **Cobertura de Código**
- 📈 Ver porcentaje de cobertura
- 🎨 Código coloreado (verde = cubierto, rojo = no cubierto)
- 📊 Reportes por archivo y función

### 7. **Sin Logs de stderr**
- ✅ Interfaz limpia sin mensajes de logger
- 🎯 Enfoque solo en resultados
- 📝 Logs disponibles si los necesitas (pestaña "Console")

## 🎨 Navegando la Interfaz

### Panel Izquierdo: Lista de Tests
```
├─ 📁 src/features/pos
│  ├─ 📄 payment.calculator.test.ts ✅ (48 tests)
│  ├─ 📄 sale.use-cases.test.ts ✅ (23 tests)
│  ├─ 📄 service.test.ts ✅ (30 tests)
│  └─ ...
```

### Panel Central: Resultados
- Click en un archivo para ver sus tests
- Click en un test para ver detalles
- Ver assertions y expectativas

### Panel Derecho: Código
- Código fuente del test seleccionado
- Resaltado de sintaxis
- Navegación rápida

## 🔧 Opciones Adicionales

### Ejecutar con Cobertura
```bash
npm run test:pos:coverage
```

Esto genera un reporte HTML en `coverage/vitest/index.html` que puedes abrir en tu navegador.

### Watch Mode en Terminal (sin UI)
```bash
npm run test:pos:watch
```

Modo interactivo en terminal para desarrollo rápido.

### Ejecutar Tests una Sola Vez
```bash
npm run test:pos
```

Para CI/CD o verificación rápida.

## 📱 Shortcuts del Teclado en UI

- `r` - Re-ejecutar todos los tests
- `f` - Re-ejecutar solo tests que fallaron
- `w` - Activar/desactivar watch mode
- `/` - Buscar tests
- `Escape` - Limpiar filtros

## 🎯 Casos de Uso

### Durante Desarrollo
```bash
npm run test:pos:ui
```
Deja la UI abierta mientras programas. Se actualizará automáticamente.

### Para Analizar Fallos
1. Ejecuta `npm run test:pos:ui`
2. Filtra tests que fallan
3. Click en el test fallido
4. Revisa el error y el diff
5. Click en el stack trace para ir al código

### Para Ver Cobertura
1. Ejecuta `npm run test:pos:coverage`
2. Abre `coverage/vitest/index.html`
3. Navega por archivos para ver líneas sin cobertura

## 🔕 Silenciar Logs de stderr (Ya Configurado)

He configurado el mock del logger en `tests/setup/vitest.setup.ts` para que:
- ✅ No muestre logs de `logger.error()` durante los tests
- ✅ Mantenga la funcionalidad de logging en producción
- ✅ Permite habilitar logs si necesitas debuggear

Si necesitas ver los logs reales durante debugging, puedes:
1. Comentar el mock en `tests/setup/vitest.setup.ts`
2. O usar `console.log()` en lugar de `logger`

## 📊 Ejemplo de Salida Limpia

Antes (con stderr):
```
stderr | Error: Percentage must be between 0 and 100
stderr | Error: Quantity exceeds maximum
stderr | Error: Fixed discount cannot be negative
✓ Tests passed (207)
```

Ahora (sin stderr):
```
✓ src/features/pos/utils/payment.calculator.test.ts (48)
✓ src/features/pos/sale/server/service.test.ts (30)
✓ src/features/pos/sale/server/actions.test.ts (28)
...
Test Files  11 passed (11)
Tests  207 passed (207)
```

## 🐛 Troubleshooting

### El navegador no se abre automáticamente
Abre manualmente: `http://localhost:51204`

### Error de puerto en uso
Vitest UI encontrará automáticamente un puerto disponible.

### Los tests no se actualizan
Presiona `r` en la UI o guarda un archivo de nuevo.

## 📚 Recursos

- [Documentación oficial de Vitest UI](https://vitest.dev/guide/ui.html)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Vitest Features](https://vitest.dev/guide/features.html)

## ✨ Beneficios vs Terminal

| Característica | Terminal | Vitest UI |
|----------------|----------|-----------|
| Velocidad | ⚡⚡⚡ | ⚡⚡ |
| Visualización | ⭐ | ⭐⭐⭐⭐⭐ |
| Filtros | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Debugging | ⭐⭐ | ⭐⭐⭐⭐ |
| Cobertura | ⭐ | ⭐⭐⭐⭐⭐ |
| Sin stderr | ❌ | ✅ |
| Stack traces | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

¡Disfruta de una experiencia de testing mucho más visual y productiva! 🚀
