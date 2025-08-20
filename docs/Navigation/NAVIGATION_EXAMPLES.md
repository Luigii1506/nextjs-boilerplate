# 🧭 NAVIGATION EXAMPLES

**Ejemplos prácticos del sistema de navegación**

---

## 📋 **EJEMPLOS DE ELEMENTOS**

### **🎯 Elemento Básico (Sin Restricciones):**

```typescript
{
  id: "dashboard",
  href: "/dashboard",
  icon: Home,
  label: "Dashboard",
  description: "Panel principal",
  requiresAuth: true,
  requiredRole: null, // ✅ Cualquier usuario autenticado
  requiredFeature: null, // ✅ Sin feature flag
  isCore: true,
  category: "core",
  order: 1,
}
```

### **🎭 Elemento Solo para Admins:**

```typescript
{
  id: "user-management",
  href: "/users",
  icon: Users,
  label: "Gestión de Usuarios",
  description: "Administrar usuarios del sistema",
  requiresAuth: true,
  requiredRole: "admin", // 🎭 Solo admin y super_admin
  requiredFeature: null,
  isCore: true,
  category: "admin",
  order: 80,
}
```

### **🎛️ Elemento con Feature Flag:**

```typescript
{
  id: "file-upload",
  href: "/files",
  icon: Upload,
  label: "📁 Gestión de Archivos",
  description: "Subida y gestión de archivos",
  requiresAuth: true,
  requiredRole: null,
  requiredFeature: "fileUpload", // 🎛️ Depende de feature flag
  isCore: false,
  category: "feature",
  order: 10,
  badge: "Beta",
}
```

### **🔒 Elemento Súper Restrictivo:**

```typescript
{
  id: "system-settings",
  href: "/system",
  icon: Settings,
  label: "⚙️ Configuración del Sistema",
  description: "Configuraciones críticas del sistema",
  requiresAuth: true,
  requiredRole: "super_admin", // 🔒 Solo super_admin
  requiredFeature: "systemSettings", // 🎛️ Y feature flag activo
  isCore: true,
  category: "admin",
  order: 99,
  badge: "Crítico",
}
```

---

## 🎨 **EJEMPLOS DE COMPONENTES**

### **🎯 Navegación Sidebar Completa:**

```typescript
// components/Sidebar.tsx
import { useNavigation } from "@/core/navigation/useNavigation";
import { NAVIGATION_STYLES } from "@/core";

interface SidebarProps {
  user: User;
  isCollapsed?: boolean;
}

export default function Sidebar({ user, isCollapsed = false }: SidebarProps) {
  const { navigationItems, isRouteActive, categories, stats } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
    debugMode: process.env.NODE_ENV === "development",
  });

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        <h2>{isCollapsed ? "Nav" : "Navegación"}</h2>
        {!isCollapsed && (
          <span className="item-count">{stats.visible} elementos</span>
        )}
      </div>

      {/* Core Section */}
      {categories.core.length > 0 && (
        <nav className="nav-section">
          {!isCollapsed && <h3>Core</h3>}
          {categories.core.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isRouteActive(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      )}

      {/* Features Section */}
      {categories.feature.length > 0 && (
        <nav className="nav-section">
          {!isCollapsed && <h3>Features</h3>}
          {categories.feature.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isRouteActive(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      )}

      {/* Admin Section */}
      {categories.admin.length > 0 && (
        <nav className="nav-section">
          {!isCollapsed && <h3>Admin</h3>}
          {categories.admin.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={isRouteActive(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      )}
    </aside>
  );
}

// Componente individual
function SidebarItem({ item, isActive, isCollapsed }) {
  return (
    <Link
      href={item.href}
      className={`${NAVIGATION_STYLES.base} ${
        isActive ? NAVIGATION_STYLES.active : NAVIGATION_STYLES.idle
      }`}
      title={isCollapsed ? item.label : undefined}
    >
      <item.icon className="w-5 h-5" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className={NAVIGATION_STYLES.badge}>{item.badge}</span>
          )}
        </>
      )}
    </Link>
  );
}
```

### **📱 Navegación Móvil:**

```typescript
// components/MobileNavigation.tsx
import { useNavigation } from "@/core/navigation/useNavigation";
import { useState } from "react";

interface MobileNavigationProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({
  user,
  isOpen,
  onClose,
}: MobileNavigationProps) {
  const { navigationItems, isRouteActive, stats } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="mobile-nav-overlay" onClick={onClose} />}

      {/* Drawer */}
      <div className={`mobile-nav-drawer ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="mobile-nav-header">
          <div>
            <h2>Navegación</h2>
            <span className="text-sm text-gray-500">
              {stats.visible} elementos disponibles
            </span>
          </div>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mobile-nav-items">
          {navigationItems.map((item) => (
            <MobileNavItem
              key={item.id}
              item={item}
              isActive={isRouteActive(item.href)}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="mobile-nav-footer">
          <span className="text-xs text-gray-400">
            Rol: {user.role} • {stats.hidden} elementos ocultos
          </span>
        </div>
      </div>
    </>
  );
}

function MobileNavItem({ item, isActive, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`mobile-nav-item ${isActive ? "active" : ""}`}
    >
      <div className="nav-item-content">
        <item.icon className="w-6 h-6" />
        <div className="nav-item-text">
          <span className="nav-item-label">{item.label}</span>
          {item.description && (
            <span className="nav-item-description">{item.description}</span>
          )}
        </div>
        {item.badge && <span className="nav-item-badge">{item.badge}</span>}
      </div>
    </Link>
  );
}
```

### **🎯 Navegación Breadcrumb:**

```typescript
// components/Breadcrumb.tsx
import {
  useNavigation,
  navigationUtils,
} from "@/core/navigation/useNavigation";
import { usePathname } from "next/navigation";

interface BreadcrumbProps {
  user: User;
}

export default function Breadcrumb({ user }: BreadcrumbProps) {
  const pathname = usePathname();
  const { navigationItems } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  // Encontrar el elemento actual
  const currentItem = navigationItems.find((item) =>
    navigationUtils.isRouteActive(pathname, item.href)
  );

  if (!currentItem) return null;

  // Generar breadcrumb basado en la ruta
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = [];

  // Home siempre presente
  breadcrumbItems.push({
    label: "Inicio",
    href: "/dashboard",
    isActive: false,
  });

  // Elemento actual
  breadcrumbItems.push({
    label: currentItem.label,
    href: currentItem.href,
    isActive: true,
  });

  return (
    <nav className="breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="breadcrumb-item">
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          {item.isActive ? (
            <span className="breadcrumb-current">{item.label}</span>
          ) : (
            <Link href={item.href} className="breadcrumb-link">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
```

### **📊 Dashboard de Navegación:**

```typescript
// components/NavigationDashboard.tsx
import {
  useNavigation,
  navigationUtils,
} from "@/core/navigation/useNavigation";

interface NavigationDashboardProps {
  user: User;
}

export default function NavigationDashboard({
  user,
}: NavigationDashboardProps) {
  const { navigationItems, categories, stats } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
    debugMode: true,
  });

  const globalStats = navigationUtils.getNavigationStats();

  return (
    <div className="navigation-dashboard">
      <h2>Dashboard de Navegación</h2>

      {/* Estadísticas Globales */}
      <div className="stats-grid">
        <StatCard
          title="Total Elementos"
          value={globalStats.total}
          description="En el registry"
        />
        <StatCard
          title="Elementos Visibles"
          value={stats.visible}
          description={`Para rol ${user.role}`}
        />
        <StatCard
          title="Elementos Ocultos"
          value={stats.hidden}
          description="Por permisos/flags"
        />
        <StatCard
          title="Con Feature Flags"
          value={globalStats.withFeatureFlags}
          description="Dependen de flags"
        />
      </div>

      {/* Elementos por Categoría */}
      <div className="categories-overview">
        <h3>Elementos por Categoría</h3>
        <div className="category-grid">
          <CategoryCard
            title="Core"
            items={categories.core}
            total={globalStats.categories.core}
            color="blue"
          />
          <CategoryCard
            title="Features"
            items={categories.feature}
            total={globalStats.categories.feature}
            color="green"
          />
          <CategoryCard
            title="Admin"
            items={categories.admin}
            total={globalStats.categories.admin}
            color="purple"
          />
        </div>
      </div>

      {/* Lista Detallada */}
      <div className="detailed-list">
        <h3>Elementos Disponibles</h3>
        <div className="navigation-items">
          {navigationItems.map((item) => (
            <NavigationItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, description }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-description">{description}</div>
    </div>
  );
}

function CategoryCard({ title, items, total, color }) {
  return (
    <div className={`category-card category-${color}`}>
      <h4>{title}</h4>
      <div className="category-stats">
        <span className="visible">{items.length} visibles</span>
        <span className="total">de {total} totales</span>
      </div>
      <div className="category-items">
        {items.map((item) => (
          <div key={item.id} className="category-item">
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
            {item.badge && <span className="badge">{item.badge}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavigationItemCard({ item }) {
  return (
    <div className="navigation-item-card">
      <div className="item-header">
        <item.icon className="w-5 h-5" />
        <span className="item-label">{item.label}</span>
        {item.badge && <span className="item-badge">{item.badge}</span>}
      </div>
      <div className="item-details">
        <span className="item-href">{item.href}</span>
        <span className={`item-category category-${item.category}`}>
          {item.category}
        </span>
      </div>
      <div className="item-requirements">
        {item.requiredRole && (
          <span className="requirement role">Rol: {item.requiredRole}</span>
        )}
        {item.requiredFeature && (
          <span className="requirement feature">
            Flag: {item.requiredFeature}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 **EJEMPLOS DE CONFIGURACIÓN**

### **🎯 Hook con Configuración Avanzada:**

```typescript
export default function AdvancedNavigation({ user }) {
  // Configuración memoizada para performance
  const navigationConfig = useMemo(
    () => ({
      userRole: user.role,
      isAuthenticated: !!user,
      debugMode: process.env.NODE_ENV === "development",
    }),
    [user.role, user]
  );

  const { navigationItems, isRouteActive, categories, stats } =
    useNavigation(navigationConfig);

  // Log cambios en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🧭 Navigation updated:", {
        user: user.email,
        role: user.role,
        visibleItems: stats.visible,
        categories: Object.keys(categories).map((key) => ({
          [key]: categories[key].length,
        })),
      });
    }
  }, [stats.visible, user.email, user.role]);

  return <nav className="advanced-navigation">{/* Render navigation */}</nav>;
}
```

### **🎨 Hook con Filtrado Personalizado:**

```typescript
export default function FilteredNavigation({ user, showOnlyCore = false }) {
  const { navigationItems, categories } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  // Filtrado adicional personalizado
  const filteredItems = useMemo(() => {
    if (showOnlyCore) {
      return categories.core;
    }
    return navigationItems;
  }, [navigationItems, categories.core, showOnlyCore]);

  return (
    <nav>
      {filteredItems.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </nav>
  );
}
```

---

## 🎯 **CASOS DE USO ESPECIALES**

### **🔄 Navegación que se Actualiza con Feature Flags:**

```typescript
export default function ReactiveNavigation({ user }) {
  const { navigationItems, stats } = useNavigation({
    userRole: user.role,
    isAuthenticated: !!user,
  });

  // Este componente se re-renderiza automáticamente cuando:
  // 1. Cambian los feature flags (broadcast)
  // 2. Cambia el rol del usuario
  // 3. Cambia el estado de autenticación

  return (
    <div>
      <div className="nav-header">
        <span>Navegación ({stats.visible} elementos)</span>
        <span className="update-indicator">
          {/* Indicador visual de actualizaciones */}
          🔄 Actualización automática activa
        </span>
      </div>

      <nav>
        {navigationItems.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>
    </div>
  );
}
```

### **🎭 Navegación Multi-Rol:**

```typescript
export default function MultiRoleNavigation({ users }) {
  // Mostrar navegación para múltiples roles
  const roleNavigations = users.map((user) => ({
    user,
    navigation: useNavigation({
      userRole: user.role,
      isAuthenticated: true,
    }),
  }));

  return (
    <div className="multi-role-navigation">
      {roleNavigations.map(({ user, navigation }) => (
        <div key={user.id} className="role-section">
          <h3>Navegación para {user.role}</h3>
          <div className="role-stats">
            Elementos visibles: {navigation.stats.visible}
          </div>
          <nav>
            {navigation.navigationItems.map((item) => (
              <div key={item.id} className="nav-item-preview">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
}
```

---

**¡Estos ejemplos cubren la mayoría de casos de uso!** 🎯

Para más detalles, consulta la [📖 Guía Completa](./NAVIGATION_SYSTEM_GUIDE.md).
