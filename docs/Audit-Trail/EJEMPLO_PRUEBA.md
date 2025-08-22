# 🧪 EJEMPLO DE PRUEBA - AUDITORÍA DE USUARIOS

## 🎯 Cómo Probar la Auditoría Implementada

Esta guía te muestra cómo probar que la auditoría automática está funcionando correctamente en el módulo de usuarios.

---

## 🚀 Pasos para Probar

### 1. **Habilitar el Feature Flag de Auditoría**

```bash
# En tu .env.local
FEATURE_AUDIT_TRAIL=true
```

### 2. **Acceder al Panel de Administración**

1. Inicia sesión como administrador
2. Ve a la sección de **Usuarios**
3. Ve a la sección de **Audit Trail** (debería aparecer en la navegación)

### 3. **Realizar Operaciones de Prueba**

#### 🆕 **Crear un Usuario**

```
1. Ve a "Usuarios" → "Crear Usuario"
2. Completa el formulario:
   - Email: test@example.com
   - Nombre: Usuario de Prueba
   - Rol: user
3. Guarda el usuario
```

**✅ Resultado esperado:** Se debe crear un evento de auditoría con:

- Acción: `create`
- Severidad: `medium`
- Descripción: "Usuario Usuario de Prueba creado con rol user"

#### ✏️ **Actualizar el Usuario**

```
1. Edita el usuario recién creado
2. Cambia el nombre a: "Usuario Actualizado"
3. Cambia el email a: updated@example.com
4. Guarda los cambios
```

**✅ Resultado esperado:** Se debe crear un evento de auditoría con:

- Acción: `update`
- Severidad: `medium`
- Cambios detallados de nombre y email

#### 🎭 **Cambiar Rol (Crítico)**

```
1. Edita el usuario
2. Cambia el rol de "user" a "admin"
3. Guarda los cambios
```

**✅ Resultado esperado:** Se debe crear un evento de auditoría con:

- Acción: `role_change`
- Severidad: `critical` ⚠️
- Cambio detallado del rol

#### 🚫 **Banear Usuario**

```
1. En la lista de usuarios, busca la opción "Banear"
2. Proporciona una razón: "Prueba de auditoría"
3. Confirma el baneo
```

**✅ Resultado esperado:** Se debe crear un evento de auditoría con:

- Acción: `ban`
- Severidad: `high`
- Razón del baneo en metadata

#### ✅ **Desbanear Usuario**

```
1. En la lista de usuarios, busca la opción "Desbanear"
2. Confirma el desbaneo
```

**✅ Resultado esperado:** Se debe crear un evento de auditoría con:

- Acción: `unban`
- Severidad: `medium`

#### 🗑️ **Eliminar Usuario (Crítico)**

```
1. En la lista de usuarios, busca la opción "Eliminar"
2. Confirma la eliminación
```

**✅ Resultado esperado:** Se debe crear un evento de auditoría con:

- Acción: `delete`
- Severidad: `critical` ⚠️
- Marcado como no recuperable

---

## 🔍 Verificar los Eventos de Auditoría

### **Opción 1: Dashboard de Auditoría**

1. Ve a **"Audit Trail"** en la navegación
2. Deberías ver todos los eventos que acabas de generar
3. Verifica que cada evento tenga:
   - ✅ Acción correcta
   - ✅ Severidad apropiada
   - ✅ Descripción clara
   - ✅ Tu usuario como ejecutor
   - ✅ Timestamp correcto

### **Opción 2: Filtros Específicos**

```
1. En el dashboard de auditoría, usa los filtros:
   - Recurso: "user"
   - Fecha: "Hoy"
   - Usuario: Tu usuario admin

2. Deberías ver solo los eventos que generaste
```

### **Opción 3: Ver Eventos Críticos**

```
1. Filtra por severidad: "critical"
2. Deberías ver:
   - El cambio de rol
   - La eliminación del usuario
```

---

## 📊 Ejemplo de Eventos Esperados

### 🆕 **Evento de Creación**

```json
{
  "action": "create",
  "resource": "user",
  "resourceName": "Usuario de Prueba",
  "description": "Usuario Usuario de Prueba creado con rol user",
  "severity": "medium",
  "metadata": {
    "email": "test@example.com",
    "role": "user",
    "createdBy": "tu_admin_id",
    "source": "admin_panel"
  }
}
```

### 🎭 **Evento de Cambio de Rol**

```json
{
  "action": "role_change",
  "resource": "user",
  "resourceName": "Usuario Actualizado",
  "description": "Rol cambiado de user a admin",
  "severity": "critical",
  "changes": [
    {
      "field": "role",
      "fieldLabel": "Rol del Usuario",
      "oldValue": "user",
      "newValue": "admin"
    }
  ],
  "metadata": {
    "changedBy": "tu_admin_id",
    "previousRole": "user",
    "newRole": "admin",
    "source": "admin_panel"
  }
}
```

### 🗑️ **Evento de Eliminación**

```json
{
  "action": "delete",
  "resource": "user",
  "resourceName": "Usuario Actualizado",
  "description": "Usuario Usuario Actualizado eliminado permanentemente",
  "severity": "critical",
  "metadata": {
    "deletedBy": "tu_admin_id",
    "userEmail": "updated@example.com",
    "userRole": "admin",
    "source": "admin_panel",
    "recoverable": false
  }
}
```

---

## 🧪 Pruebas Avanzadas

### **1. Operación Masiva**

```
1. Selecciona múltiples usuarios
2. Cambia el rol de todos a "admin"
3. Verifica que se generen:
   - Un evento individual por cada usuario
   - Un evento resumen de la operación masiva
```

### **2. Manejo de Errores**

```
1. Temporalmente desconecta la base de datos
2. Intenta crear un usuario
3. Verifica que:
   - La operación falle apropiadamente
   - Se registre el error en console.error
   - No se genere evento de auditoría corrupto
```

### **3. Filtros y Búsquedas**

```
1. Genera varios eventos de diferentes tipos
2. Prueba los filtros:
   - Por acción (create, update, delete)
   - Por severidad (medium, high, critical)
   - Por rango de fechas
   - Por búsqueda de texto
```

---

## 🔧 Debugging

### **Si no ves eventos de auditoría:**

1. **Verifica el Feature Flag:**

   ```bash
   echo $FEATURE_AUDIT_TRAIL
   # Debe mostrar: true
   ```

2. **Verifica la base de datos:**

   ```bash
   npx prisma studio
   # Ve a la tabla: audit_events
   ```

3. **Verifica los logs del servidor:**

   ```bash
   # En la consola del servidor, busca:
   # - "Error logging ... audit:"
   # - Errores de conexión a base de datos
   ```

4. **Verifica permisos:**
   ```
   - Asegúrate de estar logueado como admin
   - Verifica que el feature flag esté habilitado en la BD
   ```

### **Si ves errores en la consola:**

```typescript
// Errores comunes y soluciones:

// Error: "createAuditService is not a function"
// Solución: Verificar import en service.ts

// Error: "AuditAction type error"
// Solución: Verificar que los tipos estén actualizados

// Error: "Prisma model not found"
// Solución: Ejecutar npx prisma generate
```

---

## ✅ Checklist de Verificación

- [ ] Feature flag habilitado
- [ ] Usuario admin logueado
- [ ] Navegación muestra "Audit Trail"
- [ ] Crear usuario genera evento `create`
- [ ] Actualizar usuario genera evento `update`
- [ ] Cambio de rol genera evento `role_change` (crítico)
- [ ] Banear usuario genera evento `ban`
- [ ] Desbanear usuario genera evento `unban`
- [ ] Eliminar usuario genera evento `delete` (crítico)
- [ ] Eventos aparecen en dashboard de auditoría
- [ ] Filtros funcionan correctamente
- [ ] Detalles de cambios son precisos
- [ ] Metadata incluye información relevante
- [ ] Timestamps son correctos
- [ ] No hay errores en consola del servidor

---

## 🎉 **¡Auditoría Funcionando!**

Si todos los pasos anteriores funcionan correctamente, tienes una **auditoría completa y automática** funcionando en tu sistema de usuarios.

**Beneficios que ahora tienes:**

- ✅ **Trazabilidad completa** de todas las acciones
- ✅ **Seguridad mejorada** con eventos críticos
- ✅ **Compliance** para auditorías externas
- ✅ **Debugging eficiente** con historial completo
- ✅ **Transparencia administrativa** total

---

**📅 Guía creada:** $(date)  
**🔄 Última actualización:** $(date)  
**📧 Soporte:** Consulta el equipo de desarrollo
