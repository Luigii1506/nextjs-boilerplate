# 📚 Feature Flags - Ejemplos Completos

> **Ejemplos paso a paso para todos los casos de uso del sistema de feature flags**

## 📋 **Índice de Ejemplos**

1. [🆕 Ejemplo Básico: Nuevo Módulo](#-ejemplo-básico-nuevo-módulo)
2. [🎨 Ejemplo Avanzado: Módulo con UI Completa](#-ejemplo-avanzado-módulo-con-ui-completa)
3. [🔄 Ejemplo: Feature Flag Condicional](#-ejemplo-feature-flag-condicional)
4. [🎭 Ejemplo: Feature Flag por Roles](#-ejemplo-feature-flag-por-roles)
5. [⚡ Ejemplo: Server-Side Feature Flag](#-ejemplo-server-side-feature-flag)
6. [🧪 Ejemplo: A/B Testing](#-ejemplo-ab-testing)
7. [📱 Ejemplo: Responsive Feature Flag](#-ejemplo-responsive-feature-flag)

---

## 🆕 **Ejemplo Básico: Nuevo Módulo**

### **Escenario:** Agregar un módulo de "Reportes" que se puede activar/desactivar

### **Paso 1: Configurar el Feature Flag**

```typescript
// src/core/feature-flags/config.ts
export const FEATURE_FLAGS = {
  // Flags existentes...
  reports: false, // 🆕 Nuevo módulo desactivado por defecto
} as const;
```

### **Paso 2: Agregar a Navigation**

```typescript
// src/core/navigation/constants.ts
import { BarChart3 } from "lucide-react";

export const NAVIGATION_REGISTRY: NavigationItem[] = [
  // Items existentes...
  {
    id: "reports",
    label: "Reportes",
    href: "/reports",
    icon: BarChart3,
    requiredFeature: "reports", // 🎯 Vinculado al feature flag
    requiredRole: "admin",
    requiresAuth: true,
    category: "feature",
    order: 40,
    isCore: false,
  },
];
```

### **Paso 3: Crear la Página**

```typescript
// src/app/(admin)/reports/page.tsx
import { isServerFeatureEnabled } from "@/core/feature-flags/server";
import { notFound } from "next/navigation";
import ReportsScreen from "@/features/admin/reports/page";

export default async function ReportsPage() {
  // 🛡️ Server-side gate
  const enabled = await isServerFeatureEnabled("reports");
  if (!enabled) notFound();

  return <ReportsScreen />;
}
```

### **Paso 4: Crear el Componente**

```typescript
// src/features/admin/reports/page.tsx
"use client";

import { useIsEnabled } from "@/core/feature-flags";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function ReportsScreen() {
  const isEnabled = useIsEnabled();

  // 🔒 Client-side double check
  if (!isEnabled("reports")) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Módulo de Reportes Desactivado
        </h3>
        <p className="text-slate-600">
          Contacta al administrador para activar esta funcionalidad.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-600">Análisis y métricas del sistema</p>
      </div>

      {/* 📊 Dashboard de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Usuarios Activos"
          value="1,234"
          icon={Users}
          trend="+12%"
          color="blue"
        />
        <ReportCard
          title="Ingresos"
          value="$45,678"
          icon={DollarSign}
          trend="+8%"
          color="green"
        />
        <ReportCard
          title="Crecimiento"
          value="23%"
          icon={TrendingUp}
          trend="+5%"
          color="purple"
        />
      </div>
    </div>
  );
}

// 📊 Componente de tarjeta de reporte
function ReportCard({ title, value, icon: Icon, trend, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-green-600">{trend}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
```

### **Resultado:**

- ✅ Navigation muestra/oculta "Reportes" en tiempo real
- ✅ Página protegida server-side
- ✅ UI reactiva client-side
- ✅ Admin puede activar/desactivar desde `/feature-flags`

---

## 🎨 **Ejemplo Avanzado: Módulo con UI Completa**

### **Escenario:** Módulo de "Analytics" con dashboard completo

### **Paso 1: Feature Flag con Metadata**

```typescript
// src/core/feature-flags/config.ts
export const FEATURE_FLAGS = {
  analytics: false,
} as const;

export const FEATURE_CATEGORIES = {
  analytics: {
    name: "Analytics",
    description: "Módulos de análisis y métricas",
    color: "indigo",
  },
} as const;
```

### **Paso 2: Componente con Estados de Carga**

```typescript
// src/features/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useIsEnabled } from "@/core/feature-flags";
import { useNotifications } from "@/shared/hooks/useNotifications";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsScreen() {
  const isEnabled = useIsEnabled();
  const { notify } = useNotifications();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 Feature flag check
  if (!isEnabled("analytics")) {
    return <FeatureDisabledState />;
  }

  // 📊 Cargar datos
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData({
        users: { total: 1234, growth: 12 },
        sessions: { total: 5678, growth: 8 },
        revenue: { total: 45678, growth: 15 },
      });
    } catch (error) {
      notify(
        () => Promise.reject(error),
        "Cargando analytics...",
        "Error al cargar analytics"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* 📊 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600">Métricas y análisis en tiempo real</p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* 📈 Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Usuarios"
          value={data.users.total.toLocaleString()}
          growth={data.users.growth}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Sesiones"
          value={data.sessions.total.toLocaleString()}
          growth={data.sessions.growth}
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Ingresos"
          value={`$${data.revenue.total.toLocaleString()}`}
          growth={data.revenue.growth}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* 📊 Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Usuarios por Día" />
        <ChartCard title="Ingresos por Mes" />
      </div>
    </div>
  );
}

// 🚫 Estado cuando feature está desactivado
function FeatureDisabledState() {
  return (
    <div className="text-center py-12">
      <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-900 mb-2">
        Analytics Desactivado
      </h3>
      <p className="text-slate-600">
        Esta funcionalidad está temporalmente desactivada.
      </p>
    </div>
  );
}

// ⏳ Estado de carga
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔄 **Ejemplo: Feature Flag Condicional**

### **Escenario:** Feature que se activa solo en ciertas condiciones

```typescript
// src/components/ConditionalFeature.tsx
"use client";

import { useIsEnabled } from "@/core/feature-flags";
import { useAuth } from "@/shared/hooks/useAuth";

export function ConditionalFeature() {
  const isEnabled = useIsEnabled();
  const { user } = useAuth();

  // 🎯 Múltiples condiciones
  const showFeature =
    isEnabled("experimentalFeature") &&
    user?.role === "super_admin" &&
    process.env.NODE_ENV === "development";

  if (!showFeature) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-yellow-800 font-medium">
        🧪 Funcionalidad Experimental
      </h3>
      <p className="text-yellow-700 text-sm">
        Solo visible para super admins en desarrollo
      </p>
    </div>
  );
}
```

---

## 🎭 **Ejemplo: Feature Flag por Roles**

### **Escenario:** Diferentes funcionalidades según el rol del usuario

```typescript
// src/components/RoleBasedFeatures.tsx
"use client";

import { useIsEnabled } from "@/core/feature-flags";
import { useAuth } from "@/shared/hooks/useAuth";

export function RoleBasedFeatures() {
  const isEnabled = useIsEnabled();
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {/* 👤 Para todos los usuarios autenticados */}
      {isEnabled("basicFeatures") && <BasicFeatureCard />}

      {/* 👨‍💼 Solo para admins */}
      {isEnabled("adminFeatures") && user?.role === "admin" && (
        <AdminFeatureCard />
      )}

      {/* 👑 Solo para super admins */}
      {isEnabled("superAdminFeatures") && user?.role === "super_admin" && (
        <SuperAdminFeatureCard />
      )}
    </div>
  );
}
```

---

## ⚡ **Ejemplo: Server-Side Feature Flag**

### **Escenario:** Decisiones de rendering en el servidor

```typescript
// src/app/(admin)/dashboard/page.tsx
import { isServerFeatureEnabled } from "@/core/feature-flags/server";
import { requireAuth } from "@/core/auth/server";

export default async function DashboardPage() {
  const session = await requireAuth();

  // 🔍 Verificar múltiples flags en paralelo
  const [analyticsEnabled, reportsEnabled, advancedChartsEnabled] =
    await Promise.all([
      isServerFeatureEnabled("analytics"),
      isServerFeatureEnabled("reports"),
      isServerFeatureEnabled("advancedCharts"),
    ]);

  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>

      {/* 📊 Renderizado condicional server-side */}
      {analyticsEnabled && <AnalyticsWidget />}
      {reportsEnabled && <ReportsWidget />}

      {/* 📈 Charts básicos vs avanzados */}
      {advancedChartsEnabled ? (
        <AdvancedChartsSection />
      ) : (
        <BasicChartsSection />
      )}
    </div>
  );
}
```

---

## 🧪 **Ejemplo: A/B Testing**

### **Escenario:** Probar dos versiones de una funcionalidad

```typescript
// src/components/ABTestFeature.tsx
"use client";

import { useIsEnabled } from "@/core/feature-flags";
import { useAuth } from "@/shared/hooks/useAuth";

export function ABTestFeature() {
  const isEnabled = useIsEnabled();
  const { user } = useAuth();

  // 🎲 Lógica de A/B testing
  const showVariantB =
    isEnabled("abTestNewUI") && getUserVariant(user?.id) === "B";

  return showVariantB ? <NewUIVersion /> : <OriginalUIVersion />;
}

// 🎯 Función para determinar variante
function getUserVariant(userId?: string): "A" | "B" {
  if (!userId) return "A";

  // Hash simple para consistencia
  const hash = userId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return Math.abs(hash) % 2 === 0 ? "A" : "B";
}
```

---

## 📱 **Ejemplo: Responsive Feature Flag**

### **Escenario:** Funcionalidades que dependen del tamaño de pantalla

```typescript
// src/components/ResponsiveFeature.tsx
"use client";

import { useIsEnabled } from "@/core/feature-flags";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

export function ResponsiveFeature() {
  const isEnabled = useIsEnabled();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // 📱 Feature solo en mobile
  const showMobileFeature = isEnabled("mobileOnlyFeature") && isMobile;

  // 🖥️ Feature solo en desktop
  const showDesktopFeature = isEnabled("desktopOnlyFeature") && isDesktop;

  return (
    <div>
      {showMobileFeature && (
        <div className="md:hidden">
          <MobileOnlyComponent />
        </div>
      )}

      {showDesktopFeature && (
        <div className="hidden lg:block">
          <DesktopOnlyComponent />
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 **Patrones Recomendados**

### **✅ Buenas Prácticas:**

```typescript
// ✅ CORRECTO: Verificación temprana
function MyComponent() {
  const isEnabled = useIsEnabled();

  if (!isEnabled("myFeature")) {
    return null; // O componente fallback
  }

  return <ExpensiveComponent />;
}

// ✅ CORRECTO: Server-side gate
export default async function MyPage() {
  const enabled = await isServerFeatureEnabled("myFeature");
  if (!enabled) notFound();

  return <MyPageContent />;
}

// ✅ CORRECTO: Fallback UI
function FeatureWithFallback() {
  const isEnabled = useIsEnabled();

  return isEnabled("newFeature") ? (
    <NewFeatureComponent />
  ) : (
    <LegacyFeatureComponent />
  );
}
```

### **❌ Anti-Patrones:**

```typescript
// ❌ INCORRECTO: Verificación tardía
function MyComponent() {
  const isEnabled = useIsEnabled();
  const [data, setData] = useState(null);

  useEffect(() => {
    // ❌ Carga datos innecesariamente
    loadExpensiveData().then(setData);
  }, []);

  if (!isEnabled("myFeature")) {
    return null; // ❌ Muy tarde
  }

  return <div>{data}</div>;
}

// ❌ INCORRECTO: Sin server-side protection
export default function MyPage() {
  // ❌ Página se renderiza y luego se oculta
  return <MyPageContent />;
}
```

---

## 🔧 **Herramientas de Debug**

### **🐛 Debug Hook:**

```typescript
// src/hooks/useFeatureFlagDebug.ts
"use client";

import { useFeatureFlags } from "@/core/feature-flags";

export function useFeatureFlagDebug() {
  const { flags, flagsMap } = useFeatureFlags();

  // 🔍 Log estado actual
  const logFlags = () => {
    console.group("🎛️ Feature Flags Debug");
    console.table(flagsMap);
    console.groupEnd();
  };

  // 🎯 Verificar flag específico
  const debugFlag = (flagKey: string) => {
    const flag = flags.find((f) => f.key === flagKey);
    console.log(`🎛️ Flag "${flagKey}":`, {
      enabled: flagsMap[flagKey],
      metadata: flag,
      source: flag ? "database" : "static",
    });
  };

  return { logFlags, debugFlag };
}
```

### **🔍 Uso del Debug:**

```typescript
// En cualquier componente
function MyComponent() {
  const { logFlags, debugFlag } = useFeatureFlagDebug();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      logFlags();
      debugFlag("myFeature");
    }
  }, []);

  // ... resto del componente
}
```

---

_Última actualización: Enero 2025 - Ejemplos completos v2.0_
