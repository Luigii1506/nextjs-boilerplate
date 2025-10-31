# 🔧 Troubleshooting: Instalación de Vitest UI

## Error: "Cannot read properties of null (reading 'explain')"

Este es un error común de npm relacionado con conflictos de peer dependencies o problemas de caché.

### ✅ Soluciones (Prueba en este orden)

---

### **Solución 1: Limpiar caché e instalar** ⭐ (Más efectiva)

```bash
# Paso 1: Limpiar caché de npm
npm cache clean --force

# Paso 2: Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Paso 3: Reinstalar todas las dependencias
npm install
```

**¿Por qué funciona?**
- Elimina el caché corrupto de npm
- Regenera el árbol de dependencias desde cero
- Resuelve conflictos de peer dependencies

---

### **Solución 2: Usar --legacy-peer-deps** (Rápida)

```bash
npm install --legacy-peer-deps
```

**¿Por qué funciona?**
- Ignora los conflictos de peer dependencies
- Usa el algoritmo antiguo de resolución de npm
- Útil cuando hay incompatibilidades menores

---

### **Solución 3: Usar --force** (Si la Solución 2 falla)

```bash
npm install --force
```

**⚠️ Advertencia:** Esto puede sobrescribir dependencias existentes.

---

### **Solución 4: Actualizar npm**

```bash
# Ver versión actual
npm --version

# Actualizar npm a la última versión
npm install -g npm@latest

# Luego intentar instalar de nuevo
npm install
```

---

### **Solución 5: Usar pnpm o yarn** (Alternativa)

Si npm sigue dando problemas, prueba otro gestor de paquetes:

#### Con pnpm:
```bash
# Instalar pnpm
npm install -g pnpm

# Instalar dependencias
pnpm install
```

#### Con yarn:
```bash
# Instalar yarn
npm install -g yarn

# Instalar dependencias
yarn install
```

---

## Verificar que Vitest UI está instalado

Después de instalar, verifica que esté en tu `package.json`:

```bash
grep "@vitest/ui" package.json
```

Deberías ver:
```json
"@vitest/ui": "^1.6.1"
```

---

## Probar que funciona

Después de instalar exitosamente:

```bash
# Probar la UI
npm run test:pos:ui
```

Si el navegador se abre en `http://localhost:51204`, ¡está funcionando! 🎉

---

## Errores Comunes Adicionales

### Error: "Module not found: @vitest/ui"

**Solución:**
```bash
# Asegúrate de que node_modules existe
ls node_modules/@vitest/ui

# Si no existe, reinstala
npm install
```

### Error: "Port 51204 already in use"

**Solución:**
Vitest UI encontrará automáticamente otro puerto. Revisa la salida de la consola para ver el puerto correcto.

### Error: "Cannot find module 'jsdom'"

**Solución:**
```bash
npm install --save-dev jsdom happy-dom
```

---

## Debug Avanzado

Si nada funciona, genera un log detallado:

```bash
npm install --verbose --legacy-peer-deps > npm-install.log 2>&1
```

Luego revisa `npm-install.log` para ver exactamente dónde falla.

---

## Estado Actual

✅ **Ya completado:**
- `@vitest/ui` agregado a `package.json`
- Scripts configurados en `package.json`
- Logger mockeado para salida limpia

🔄 **Pendiente:**
- Ejecutar `npm install` (con una de las soluciones de arriba)
- Probar `npm run test:pos:ui`

---

## Contacto y Ayuda

Si sigues teniendo problemas:

1. Revisa la versión de Node.js: `node --version` (debe ser >= 18)
2. Revisa la versión de npm: `npm --version` (debe ser >= 8)
3. Verifica que no tengas procesos de npm colgados: `ps aux | grep npm`

---

## Comando Final Recomendado

```bash
# Combinación de las mejores prácticas
npm cache clean --force && \
rm -rf node_modules package-lock.json && \
npm install --legacy-peer-deps && \
npm run test:pos:ui
```

Este comando:
1. ✅ Limpia el caché
2. ✅ Elimina archivos viejos
3. ✅ Reinstala con modo legacy
4. ✅ Inicia Vitest UI

---

¡Buena suerte! 🚀
