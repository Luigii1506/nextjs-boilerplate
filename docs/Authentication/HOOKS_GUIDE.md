# 🔧 AUTHENTICATION HOOKS GUIDE

**Guía completa de todos los hooks de autenticación**

---

## 📋 **HOOKS DISPONIBLES**

| Hook | Tipo | Redirección | Uso Principal |
|------|------|-------------|---------------|
| [`useAuth()`](#useauth) | Base | Manual | Casos personalizados |
| [`useProtectedPage()`](#useprotectedpage) | Wrapper | Auto → `/login` | Páginas protegidas |
| [`useAdminPage()`](#useadminpage) | Wrapper | Auto → `/login` o `/` | Solo admin |
| [`usePublicPage()`](#usepublicpage) | Wrapper | Ninguna | Páginas públicas |
| [`useRefreshAuth()`](#userefreshauth) | Utility | Ninguna | Refrescar estado |

---

## 🔐 **useAuth(requireAuth?: boolean)**

### **📝 Descripción:**
Hook base que maneja todo el estado de autenticación. Todos los otros hooks están construidos sobre este.

### **⚙️ Parámetros:**
- `requireAuth` (boolean, opcional): Si `true`, redirige a `/login` si no está autenticado

### **📤 Retorna:**
```typescript
interface AuthState {
  isLoading: boolean;        // Cargando verificación inicial
  isAuthenticated: boolean;  // Usuario autenticado
  user: User | null;        // Datos del usuario
  isAdmin: boolean;         // Es admin o super_admin
}
```

### **💡 Ejemplo de Uso:**
```typescript
import { useAuth } from "@/shared/hooks/useAuth";

function CustomAuthComponent() {
  const { isLoading, isAuthenticated, user, isAdmin } = useAuth(false);
  
  if (isLoading) {
    return <div className="animate-pulse">Verificando...</div>;
  }
  
  return (
    <div>
      <p>Estado: {isAuthenticated ? "Logueado" : "No logueado"}</p>
      {user && <p>Usuario: {user.name}</p>}
      {isAdmin && <p>🔑 Permisos de administrador</p>}
    </div>
  );
}
```

### **🎯 Casos de Uso:**
- Componentes que necesitan estado de auth sin redirección automática
- Navegación condicional
- Mostrar/ocultar elementos basado en autenticación
- Lógica personalizada de redirección

---

## 🛡️ **useProtectedPage()**

### **📝 Descripción:**
Hook especializado para páginas que requieren autenticación. Redirige automáticamente a `/login` si el usuario no está autenticado.

### **⚙️ Parámetros:**
Ninguno (internamente llama a `useAuth(true)`)

### **📤 Retorna:**
```typescript
AuthState // Mismo que useAuth
```

### **💡 Ejemplo de Uso:**
```typescript
import { useProtectedPage } from "@/shared/hooks/useAuth";

export default function DashboardPage() {
  const { isLoading, user } = useProtectedPage();
  
  // Si no está autenticado, ya fue redirigido a /login
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1>Dashboard de {user?.name}</h1>
      <p>Esta página requiere autenticación</p>
    </div>
  );
}
```

### **🎯 Casos de Uso:**
- Páginas de usuario (dashboard, perfil, configuración)
- Cualquier página que requiera login
- Páginas donde todos los usuarios autenticados tienen acceso

### **🔄 Flujo de Redirección:**
1. Usuario accede a página protegida
2. Hook verifica autenticación
3. Si no está autenticado → redirige a `/login?callbackUrl=/current-page`
4. Después del login → redirige de vuelta a la página original

---

## 👑 **useAdminPage()**

### **📝 Descripción:**
Hook especializado para páginas de administración. Requiere autenticación Y permisos de admin/super_admin.

### **⚙️ Parámetros:**
Ninguno

### **📤 Retorna:**
```typescript
AuthState // Mismo que useAuth
```

### **💡 Ejemplo de Uso:**
```typescript
import { useAdminPage } from "@/shared/hooks/useAuth";

export default function AdminUsersPage() {
  const { isLoading, user, isAdmin } = useAdminPage();
  
  // Si no es admin, ya fue redirigido
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1>Gestión de Usuarios</h1>
      <p>Bienvenido al panel de admin, {user?.name}</p>
      {user?.role === "super_admin" && (
        <div className="bg-yellow-100 p-4 rounded-lg mt-4">
          <p>🔑 Tienes permisos de Super Administrador</p>
        </div>
      )}
    </div>
  );
}
```

### **🎯 Casos de Uso:**
- Páginas de administración
- Gestión de usuarios
- Configuración del sistema
- Cualquier funcionalidad que requiera permisos elevados

### **🔄 Flujo de Redirección:**
1. Usuario accede a página de admin
2. Hook verifica autenticación
3. Si no está autenticado → redirige a `/login`
4. Si está autenticado pero no es admin → redirige a `/` (home)
5. Si es admin → permite acceso

---

## 🌍 **usePublicPage()**

### **📝 Descripción:**
Hook para páginas públicas que no requieren autenticación, pero pueden mostrar contenido diferente si el usuario está logueado.

### **⚙️ Parámetros:**
Ninguno (internamente llama a `useAuth(false)`)

### **📤 Retorna:**
```typescript
AuthState // Mismo que useAuth
```

### **💡 Ejemplo de Uso:**
```typescript
import { usePublicPage } from "@/shared/hooks/useAuth";

export default function HomePage() {
  const { isLoading, isAuthenticated, user } = usePublicPage();
  
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="animate-pulse h-6 bg-gray-200 rounded w-32"></div>
          ) : isAuthenticated ? (
            <div className="flex justify-between items-center">
              <h1>Bienvenido de vuelta, {user?.name}!</h1>
              <nav>
                <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
                  Ir al Dashboard
                </a>
              </nav>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <h1>Bienvenido a nuestra aplicación</h1>
              <nav className="space-x-4">
                <a href="/login" className="text-blue-600 hover:text-blue-800">
                  Iniciar Sesión
                </a>
                <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Registrarse
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Página de Inicio</h2>
        <p>Esta página es accesible para todos los usuarios.</p>
        
        {isAuthenticated && (
          <div className="mt-6 p-4 bg-green-100 rounded-lg">
            <p>✅ Estás logueado como {user?.name}</p>
            <p>Tienes acceso a funciones adicionales.</p>
          </div>
        )}
      </main>
    </div>
  );
}
```

### **🎯 Casos de Uso:**
- Landing pages
- Páginas de marketing
- Páginas informativas
- Home page con contenido condicional
- Navegación que cambia según autenticación

---

## 🔄 **useRefreshAuth()**

### **📝 Descripción:**
Hook utilitario para refrescar manualmente el estado de autenticación. Útil después de cambios en el perfil del usuario.

### **⚙️ Parámetros:**
Ninguno

### **📤 Retorna:**
```typescript
{
  refreshAuth: () => Promise<boolean>; // Función para refrescar
  isRefreshing: boolean;               // Estado de carga
}
```

### **💡 Ejemplo de Uso:**
```typescript
import { useAuth, useRefreshAuth } from "@/shared/hooks/useAuth";

function UserProfileForm() {
  const { user } = useAuth();
  const { refreshAuth, isRefreshing } = useRefreshAuth();
  
  const handleUpdateProfile = async (formData) => {
    try {
      // Actualizar perfil en el servidor
      await updateUserProfile(formData);
      
      // Refrescar estado de autenticación
      const success = await refreshAuth();
      
      if (success) {
        toast.success("Perfil actualizado correctamente");
      } else {
        toast.error("Error al actualizar el estado");
      }
    } catch (error) {
      toast.error("Error al actualizar perfil");
    }
  };
  
  return (
    <form onSubmit={handleUpdateProfile}>
      <input defaultValue={user?.name} name="name" />
      <input defaultValue={user?.email} name="email" />
      
      <button 
        type="submit" 
        disabled={isRefreshing}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isRefreshing ? "Actualizando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}
```

### **🎯 Casos de Uso:**
- Después de actualizar perfil de usuario
- Después de cambios de rol
- Después de operaciones que afecten la sesión
- Refrescar estado sin recargar página

---

## 🎭 **PATRONES DE USO COMUNES**

### **🔄 Conditional Rendering:**

```typescript
function ConditionalContent() {
  const { isAuthenticated, isAdmin, user } = usePublicPage();
  
  return (
    <div>
      {/* Contenido público */}
      <h1>Página Pública</h1>
      
      {/* Contenido para usuarios autenticados */}
      {isAuthenticated && (
        <div className="bg-blue-50 p-4 rounded">
          <p>Hola {user?.name}, tienes acceso a contenido exclusivo</p>
        </div>
      )}
      
      {/* Contenido solo para admins */}
      {isAdmin && (
        <div className="bg-red-50 p-4 rounded">
          <p>🔑 Panel de administración disponible</p>
          <a href="/admin">Ir al Admin</a>
        </div>
      )}
      
      {/* Contenido para usuarios no autenticados */}
      {!isAuthenticated && (
        <div className="bg-gray-50 p-4 rounded">
          <p>Regístrate para acceder a más funciones</p>
          <a href="/register">Crear cuenta</a>
        </div>
      )}
    </div>
  );
}
```

### **🛡️ Route Protection:**

```typescript
// Página protegida básica
function ProtectedRoute() {
  const { isLoading, user } = useProtectedPage();
  
  if (isLoading) return <LoadingSpinner />;
  
  return <DashboardContent user={user} />;
}

// Página de admin
function AdminRoute() {
  const { isLoading, user, isAdmin } = useAdminPage();
  
  if (isLoading) return <LoadingSpinner />;
  
  return <AdminPanel user={user} />;
}
```

### **🔄 State Management:**

```typescript
function AuthAwareComponent() {
  const { isAuthenticated, user } = useAuth();
  const { refreshAuth } = useRefreshAuth();
  
  // Refrescar después de cambios
  const handleUserUpdate = async () => {
    await updateUser();
    await refreshAuth(); // Actualizar estado
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <UserDashboard user={user} onUpdate={handleUserUpdate} />
      ) : (
        <LoginPrompt />
      )}
    </div>
  );
}
```

---

## ⚡ **PERFORMANCE TIPS**

### **🎯 Uso Eficiente:**

```typescript
// ✅ Bueno: Un hook por componente
function MyComponent() {
  const { isAuthenticated, user } = useAuth();
  return <div>{user?.name}</div>;
}

// ❌ Malo: Múltiples hooks innecesarios
function BadComponent() {
  const auth1 = useAuth();
  const auth2 = useProtectedPage(); // Redundante
  return <div>{auth1.user?.name}</div>;
}
```

### **🔄 Evitar Re-renders:**

```typescript
// ✅ Bueno: Destructuring específico
function OptimizedComponent() {
  const { user } = useAuth(); // Solo lo que necesitas
  return <div>{user?.name}</div>;
}

// ❌ Malo: Objeto completo
function UnoptimizedComponent() {
  const auth = useAuth(); // Todo el objeto
  return <div>{auth.user?.name}</div>; // Re-render en cada cambio
}
```

---

## 🐛 **TROUBLESHOOTING**

### **❌ Problema: "Hook redirige constantemente"**

**Causa:** Usando hook incorrecto para el tipo de página.

**Solución:**
```typescript
// ❌ Malo: useAdminPage en página pública
function PublicPage() {
  const auth = useAdminPage(); // Redirige siempre
  return <div>Página pública</div>;
}

// ✅ Bueno: usePublicPage para páginas públicas
function PublicPage() {
  const auth = usePublicPage(); // No redirige
  return <div>Página pública</div>;
}
```

### **❌ Problema: "Loading infinito"**

**Causa:** Error en verificación de sesión.

**Solución:**
```typescript
// Verificar en DevTools si hay errores de red
// Verificar configuración de authClient
// Verificar que el servidor de auth esté funcionando
```

### **❌ Problema: "Usuario no se actualiza después de cambios"**

**Causa:** Estado no se refresca automáticamente.

**Solución:**
```typescript
function ProfileUpdate() {
  const { refreshAuth } = useRefreshAuth();
  
  const handleUpdate = async () => {
    await updateProfile();
    await refreshAuth(); // ✅ Refrescar estado
  };
  
  return <button onClick={handleUpdate}>Actualizar</button>;
}
```

---

**¡Hooks de autenticación potentes y fáciles de usar!** 🔐✨
