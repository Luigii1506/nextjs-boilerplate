# 🛠️ Scripts de Utilidad

Scripts auxiliares para administración y configuración del sistema.

## 📜 Scripts Disponibles

### 🔐 Gestión de Usuarios

#### `create-super-admin.ts`

Crea un usuario super administrador del sistema.

```bash
npm run create-super-admin
# o
npx tsx scripts/create-super-admin.ts
```

#### `create-test-users.ts`

Crea usuarios de prueba con diferentes roles para testing.

```bash
npm run create-test-users
# o
npx tsx scripts/create-test-users.ts
```

#### `make-admin.ts`

Convierte un usuario existente en administrador.

```bash
npm run make-admin
# o
npx tsx scripts/make-admin.ts
```

#### `make-super-admin.ts`

Convierte un usuario existente en super administrador (permisos para eliminar usuarios).

```bash
npx tsx scripts/make-super-admin.ts
```

#### `update-user-role.ts`

Actualiza el rol de un usuario específico.

```bash
npm run update-user-role
# o
npx tsx scripts/update-user-role.ts
```

## 🎯 Uso Recomendado

### 🚀 Setup Inicial

1. **Primero**: `npm run create-super-admin`
2. **Luego**: `npm run create-test-users` (opcional, para desarrollo)

### 🔧 Administración

- **Promover usuario**: `npm run make-admin`
- **Cambiar rol**: `npm run update-user-role`

## ⚠️ Consideraciones

- **Ejecutar solo cuando sea necesario**
- **Requiere base de datos activa**
- **Verificar variables de entorno**
- **Scripts interactivos** (piden confirmación)

## 🔐 Jerarquía de Roles

### Super Admin (`super_admin`)

- ✅ Crear usuarios
- ✅ Editar usuarios
- ✅ **Eliminar usuarios**
- ✅ Banear/desbanear usuarios
- ✅ Cambiar roles de usuarios
- ✅ Operaciones masivas

### Admin (`admin`)

- ✅ Crear usuarios (excepto super_admin)
- ✅ Editar usuarios
- ❌ **NO puede eliminar usuarios**
- ✅ Banear/desbanear usuarios (excepto super_admin)
- ✅ Cambiar roles (excepto super_admin)

### User (`user`)

- ❌ Sin permisos administrativos

**Nota importante**: Solo los `super_admin` pueden eliminar usuarios del sistema.

## 📝 Agregar Nuevos Scripts

1. Crear archivo `.ts` en esta carpeta
2. Agregar script a `package.json`:
   ```json
   "script-name": "npx tsx scripts/nuevo-script.ts"
   ```
3. Documentar en este README
