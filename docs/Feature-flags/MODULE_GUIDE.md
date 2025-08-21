# 🚀 Guía Completa: Agregar Nuevos Módulos con Feature Flags

> **Tutorial paso a paso para integrar cualquier módulo nuevo al sistema de feature flags**

## 📋 **Índice**

1. [🎯 Preparación](#-preparación)
2. [⚙️ Configuración del Feature Flag](#️-configuración-del-feature-flag)
3. [🧭 Integración con Navigation](#-integración-con-navigation)
4. [🏗️ Estructura del Módulo](#️-estructura-del-módulo)
5. [🔒 Protección Server-Side](#-protección-server-side)
6. [🎨 Componentes Client-Side](#-componentes-client-side)
7. [🧪 Testing y Validación](#-testing-y-validación)
8. [📚 Casos de Uso Específicos](#-casos-de-uso-específicos)

---

## 🎯 **Preparación**

### **📝 Checklist Inicial:**

- [ ] Definir nombre del módulo (ej: `inventory`, `billing`, `notifications`)
- [ ] Decidir categoría (`core`, `module`, `experimental`, `admin`)
- [ ] Determinar roles requeridos (`user`, `admin`, `super_admin`)
- [ ] Planificar estructura de archivos
- [ ] Considerar dependencias con otros módulos

### **🎨 Convenciones de Naming:**

```typescript
// ✅ CORRECTO: camelCase, descriptivo
const FEATURE_FLAGS = {
  userManagement: true,
  inventoryTracking: false,
  billingSystem: true,
  notificationCenter: false,
};

// ❌ INCORRECTO: snake_case, abreviaciones
const FEATURE_FLAGS = {
  user_mgmt: true,
  inv_track: false,
  bill_sys: true,
  notif_ctr: false,
};
```

---

## ⚙️ **Configuración del Feature Flag**

### **Paso 1: Agregar al Config Principal**

```typescript
// src/core/feature-flags/config.ts

export const FEATURE_FLAGS = {
  // 🏠 Core features
  userManagement: true,
  fileUpload: true,

  // 📦 Module features
  inventory: false, // 🆕 Tu nuevo módulo
  billing: false, // 🆕 Otro módulo
  notifications: true, // 🆕 Módulo activo

  // 🧪 Experimental features
  aiAssistant: false,
  advancedAnalytics: false,
} as const;
```

### **Paso 2: Definir Categoría (Opcional)**

```typescript
// src/core/feature-flags/config.ts

export const FEATURE_CATEGORIES = {
  // Categorías existentes...

  business: {
    // 🆕 Nueva categoría
    name: "Business",
    description: "Módulos de negocio y operaciones",
    color: "emerald",
  },

  integration: {
    // 🆕 Otra categoría
    name: "Integraciones",
    description: "Conectores y APIs externas",
    color: "orange",
  },
} as const;
```

### **Paso 3: Verificar Tipos (Automático)**

El sistema automáticamente incluirá tu nuevo flag en el tipo `FeatureFlag`:

```typescript
// ✅ Esto funcionará automáticamente
type FeatureFlag = "userManagement" | "fileUpload" | "inventory" | "billing" | ...
```

---

## 🧭 **Integración con Navigation**

### **Paso 1: Agregar Item de Navegación**

```typescript
// src/core/navigation/constants.ts
import {
  Package, // Para inventory
  CreditCard, // Para billing
  Bell, // Para notifications
} from "lucide-react";

export const NAVIGATION_REGISTRY: NavigationItem[] = [
  // Items existentes...

  // 🆕 Módulo de Inventario
  {
    id: "inventory",
    label: "Inventario",
    href: "/inventory",
    icon: Package,
    requiredFeature: "inventory", // 🎯 Vinculado al feature flag
    requiredRole: "admin", // 🔒 Solo admins
    requiresAuth: true,
    category: "feature",
    order: 30,
    isCore: false,
  },

  // 🆕 Módulo de Facturación
  {
    id: "billing",
    label: "Facturación",
    href: "/billing",
    icon: CreditCard,
    requiredFeature: "billing", // 🎯 Vinculado al feature flag
    requiredRole: "super_admin", // 🔒 Solo super admins
    requiresAuth: true,
    category: "feature",
    order: 35,
    isCore: false,
  },

  // 🆕 Centro de Notificaciones
  {
    id: "notifications",
    label: "Notificaciones",
    href: "/notifications",
    icon: Bell,
    requiredFeature: "notifications", // 🎯 Vinculado al feature flag
    requiredRole: "user", // 🔓 Todos los usuarios
    requiresAuth: true,
    category: "feature",
    order: 25,
    isCore: false,
  },
];
```

### **Resultado:**

- ✅ Navigation se actualiza automáticamente cuando activas/desactivas el flag
- ✅ Respeta roles y permisos
- ✅ Broadcast funciona entre pestañas

---

## 🏗️ **Estructura del Módulo**

### **Opción A: Módulo Simple (Recomendado)**

```
src/features/admin/inventory/
├── page.tsx                    # Componente principal
├── components/
│   ├── InventoryList.tsx      # Lista de items
│   ├── InventoryForm.tsx      # Formulario
│   └── InventoryCard.tsx      # Card individual
└── hooks/
    └── useInventory.ts        # Lógica de estado
```

### **Opción B: Módulo Complejo (Solo si es necesario)**

```
src/features/admin/inventory/
├── page.tsx                    # Página principal
├── components/                 # Componentes UI
├── hooks/                      # Hooks específicos
├── server/                     # Lógica server-side
│   ├── actions/               # Server actions
│   ├── queries/               # Consultas DB
│   └── validators/            # Validaciones
├── types/                      # Tipos específicos
└── utils/                      # Utilidades
```

### **Opción C: Módulo en /modules (Para funcionalidades independientes)**

```
src/modules/inventory/
├── index.ts                    # Barrel export
├── components/                 # Componentes exportables
├── hooks/                      # Hooks exportables
├── server/                     # Server utilities
└── types/                      # Tipos exportables
```

---

## 🔒 **Protección Server-Side**

### **Paso 1: Crear la Página Protegida**

```typescript
// src/app/(admin)/inventory/page.tsx
import { isServerFeatureEnabled } from "@/core/feature-flags/server";
import { notFound } from "next/navigation";
import InventoryScreen from "@/features/admin/inventory/page";

export const runtime = "nodejs";

export default async function InventoryPage() {
  // 🛡️ Server-side feature flag check
  const enabled = await isServerFeatureEnabled("inventory");
  if (!enabled) {
    notFound(); // Retorna 404 si está desactivado
  }

  return <InventoryScreen />;
}
```

### **Paso 2: Protección Adicional por Roles (Opcional)**

```typescript
// src/app/(admin)/inventory/page.tsx
import { isServerFeatureEnabled } from "@/core/feature-flags/server";
import { requireAuth } from "@/core/auth/server";
import { ROLE_HIERARCHY } from "@/core/auth/config/permissions";
import { notFound, redirect } from "next/navigation";
import InventoryScreen from "@/features/admin/inventory/page";

export default async function InventoryPage() {
  // 🔐 Auth check
  const session = await requireAuth();
  const userRole = session.user.role ?? "user";

  // 🛡️ Feature flag check
  const enabled = await isServerFeatureEnabled("inventory");
  if (!enabled) notFound();

  // 🎭 Role check (si necesitas más restricción que la navigation)
  if ((ROLE_HIERARCHY[userRole] ?? 0) < ROLE_HIERARCHY.admin) {
    redirect("/unauthorized");
  }

  return <InventoryScreen />;
}
```

### **Paso 3: Metadata y SEO**

```typescript
// src/app/(admin)/inventory/page.tsx
import { Metadata } from "next";
import { isServerFeatureEnabled } from "@/core/feature-flags/server";

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await isServerFeatureEnabled("inventory");

  if (!enabled) {
    return {
      title: "Página no encontrada",
      robots: "noindex",
    };
  }

  return {
    title: "Inventario - Admin",
    description: "Gestión de inventario y productos",
  };
}
```

---

## 🎨 **Componentes Client-Side**

### **Paso 1: Componente Principal con Feature Flag**

```typescript
// src/features/admin/inventory/page.tsx
"use client";

import { useIsEnabled } from "@/core/feature-flags";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { Package, Plus, Search } from "lucide-react";
import { useState } from "react";

export default function InventoryScreen() {
  const isEnabled = useIsEnabled();
  const { notify } = useNotifications();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔒 Client-side feature flag check (double protection)
  if (!isEnabled("inventory")) {
    return <FeatureDisabledState />;
  }

  const handleAddItem = async () => {
    await notify(
      async () => {
        // Lógica para agregar item
        console.log("Adding item...");
      },
      "Agregando producto...",
      "Producto agregado correctamente"
    );
  };

  return (
    <div className="space-y-6">
      {/* 📊 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-600">Gestión de productos y stock</p>
        </div>

        <button
          onClick={handleAddItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {/* 🔍 Filtros */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 📦 Lista de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((item) => <InventoryCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

// 🚫 Estado cuando feature está desactivado
function FeatureDisabledState() {
  return (
    <div className="text-center py-12">
      <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        Módulo de Inventario Desactivado
      </h3>
      <p className="text-slate-600">
        Esta funcionalidad está temporalmente desactivada.
      </p>
    </div>
  );
}

// 📭 Estado vacío
function EmptyState() {
  return (
    <div className="col-span-full text-center py-12">
      <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        No hay productos
      </h3>
      <p className="text-slate-600">
        Comienza agregando tu primer producto al inventario.
      </p>
    </div>
  );
}
```

### **Paso 2: Componentes Reutilizables**

```typescript
// src/features/admin/inventory/components/InventoryCard.tsx
"use client";

import { Package, Edit, Trash2 } from "lucide-react";

interface InventoryCardProps {
  item: {
    id: string;
    name: string;
    stock: number;
    price: number;
    category: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function InventoryCard({ item, onEdit, onDelete }: InventoryCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
      {/* 📦 Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{item.name}</h3>
            <p className="text-sm text-slate-500">{item.category}</p>
          </div>
        </div>

        {/* 🔧 Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit?.(item.id)}
            className="p-1 text-slate-400 hover:text-blue-600 rounded"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="p-1 text-slate-400 hover:text-red-600 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 📊 Stats */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Stock:</span>
          <span
            className={`text-sm font-medium ${
              item.stock > 10
                ? "text-green-600"
                : item.stock > 0
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {item.stock} unidades
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-slate-600">Precio:</span>
          <span className="text-sm font-medium text-slate-900">
            ${item.price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
```

---

## 🧪 **Testing y Validación**

### **Paso 1: Checklist de Testing**

```typescript
// ✅ Tests a realizar:

// 1. Feature flag desactivado
// - [ ] Navigation no muestra el item
// - [ ] Página retorna 404
// - [ ] Componente muestra estado desactivado

// 2. Feature flag activado
// - [ ] Navigation muestra el item
// - [ ] Página carga correctamente
// - [ ] Componente funciona normalmente

// 3. Broadcast
// - [ ] Cambio en admin UI actualiza navigation
// - [ ] Funciona entre múltiples pestañas
// - [ ] No hay errores en consola

// 4. Roles y permisos
// - [ ] Usuario sin permisos no ve navigation
// - [ ] Página respeta restricciones de rol
// - [ ] Redirects funcionan correctamente
```

### **Paso 2: Testing Manual**

```bash
# 1. Activar feature flag
# - Ir a /feature-flags
# - Activar tu módulo
# - Verificar que aparece en navigation

# 2. Probar funcionalidad
# - Hacer clic en navigation item
# - Verificar que página carga
# - Probar funcionalidades básicas

# 3. Desactivar feature flag
# - Volver a /feature-flags
# - Desactivar tu módulo
# - Verificar que desaparece de navigation
# - Verificar que página retorna 404

# 4. Probar broadcast
# - Abrir dos pestañas
# - Cambiar flag en una pestaña
# - Verificar actualización en otra pestaña
```

### **Paso 3: Debug y Troubleshooting**

```typescript
// src/features/admin/inventory/page.tsx
"use client";

import { useIsEnabled } from "@/core/feature-flags";

export default function InventoryScreen() {
  const isEnabled = useIsEnabled();

  // 🐛 Debug en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.log("🎛️ Inventory feature flag:", isEnabled("inventory"));
  }

  // ... resto del componente
}
```

---

## 📚 **Casos de Uso Específicos**

### **🔄 Módulo con Dependencias**

```typescript
// Módulo que depende de otros módulos
export default function AdvancedInventoryScreen() {
  const isEnabled = useIsEnabled();

  // 🎯 Verificar múltiples dependencias
  const canShowAdvanced =
    isEnabled("inventory") && isEnabled("analytics") && isEnabled("reporting");

  if (!canShowAdvanced) {
    return <DependenciesNotMetState />;
  }

  return <AdvancedInventoryContent />;
}
```

### **🎭 Módulo con Variantes**

```typescript
// Diferentes versiones según flags
export default function BillingScreen() {
  const isEnabled = useIsEnabled();

  if (isEnabled("advancedBilling")) {
    return <AdvancedBillingUI />;
  }

  if (isEnabled("basicBilling")) {
    return <BasicBillingUI />;
  }

  return <BillingDisabledState />;
}
```

### **⏰ Módulo con Rollout Gradual**

```typescript
// Activación gradual por porcentaje de usuarios
export default function ExperimentalScreen() {
  const isEnabled = useIsEnabled();
  const { user } = useAuth();

  const isInRollout =
    isEnabled("experimentalFeature") && isUserInRollout(user?.id, 25); // 25% de usuarios

  return isInRollout ? <ExperimentalFeature /> : <StandardFeature />;
}

function isUserInRollout(userId?: string, percentage: number): boolean {
  if (!userId) return false;

  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return Math.abs(hash) % 100 < percentage;
}
```

---

## 🎯 **Checklist Final**

### **✅ Antes de hacer commit:**

- [ ] Feature flag agregado a `config.ts`
- [ ] Navigation item configurado en `constants.ts`
- [ ] Página protegida server-side creada
- [ ] Componente principal con feature flag check
- [ ] Estados de error/desactivado implementados
- [ ] Testing manual completado
- [ ] No hay errores en consola
- [ ] Build pasa sin errores
- [ ] Broadcast funciona correctamente

### **📝 Documentación a actualizar:**

- [ ] Agregar módulo a README del proyecto
- [ ] Documentar APIs específicas si las hay
- [ ] Actualizar guías de usuario si es necesario

---

## 🚀 **Próximos Pasos**

1. **Implementar tu módulo** siguiendo esta guía
2. **Probar exhaustivamente** todos los escenarios
3. **Documentar funcionalidades específicas** de tu módulo
4. **Considerar métricas y analytics** para el uso del módulo

---

_Última actualización: Enero 2025 - Guía completa de módulos v2.0_
