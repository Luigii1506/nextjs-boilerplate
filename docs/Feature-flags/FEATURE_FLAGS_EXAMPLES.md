---
title: Ejemplos
slug: /feature-flags/ejemplos
---

# 🎯 FEATURE FLAGS - EJEMPLOS PRÁCTICOS

> **Ejemplos reales de implementación paso a paso**

## 📋 Índice

1. [Dark Mode Completo](#-dark-mode-completo)
2. [Notificaciones Push](#-notificaciones-push)
3. [Dashboard Experimental](#-dashboard-experimental)
4. [A/B Testing Hero](#-ab-testing-hero)
5. [Feature por Región](#-feature-por-región)

---

## 🌙 Dark Mode Completo

### 📝 1. Configuración Inicial

```typescript
// src/core/config/feature-flags.ts
export const FEATURE_FLAGS = {
  // ... otros flags
  darkMode: process.env.FEATURE_DARK_MODE === "true",
} as const;
```

```sql
-- Base de datos
INSERT INTO feature_flags (
  key, name, description, enabled, category, version, rollout_percentage
) VALUES (
  'darkMode',
  'Dark Mode',
  'Modo oscuro para toda la aplicación',
  true,
  'ui',
  '1.0.0',
  100
);
```

### 🎨 2. Theme Provider

```typescript
// src/shared/providers/ThemeProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  isThemeLoading: boolean;
  canToggle: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
  serverDarkMode = false,
}: {
  children: React.ReactNode;
  serverDarkMode?: boolean;
}) {
  const isEnabled = useIsEnabled();
  const [isDarkMode, setIsDarkMode] = useState(serverDarkMode);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // 🎛️ Verificar si dark mode está habilitado
  const darkModeEnabled = isEnabled("darkMode");

  // 🏗️ Inicialización
  useEffect(() => {
    if (!darkModeEnabled) {
      // Si flag desactivado, forzar light mode
      setIsDarkMode(false);
      setIsThemeLoading(false);
      return;
    }

    // Obtener preferencia del usuario
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    let shouldBeDark = serverDarkMode;

    if (savedTheme) {
      shouldBeDark = savedTheme === "dark";
    } else if (!serverDarkMode) {
      shouldBeDark = prefersDark;
    }

    setIsDarkMode(shouldBeDark);
    setIsThemeLoading(false);
  }, [darkModeEnabled, serverDarkMode]);

  // 🎨 Aplicar tema al DOM
  useEffect(() => {
    if (isThemeLoading) return;

    const root = document.documentElement;

    if (isDarkMode && darkModeEnabled) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, darkModeEnabled, isThemeLoading]);

  // 🔄 Toggle function
  const toggleTheme = () => {
    if (darkModeEnabled && !isThemeLoading) {
      setIsDarkMode(!isDarkMode);
    }
  };

  // 👂 Escuchar cambios del sistema
  useEffect(() => {
    if (!darkModeEnabled) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo aplicar si no hay preferencia guardada
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [darkModeEnabled]);

  const value: ThemeContextType = {
    isDarkMode: isDarkMode && darkModeEnabled,
    toggleTheme,
    isThemeLoading,
    canToggle: darkModeEnabled,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

### 🎛️ 3. Theme Toggle Component

```typescript
// src/shared/components/ThemeToggle.tsx
"use client";

import React from "react";
import { Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "@/shared/providers/ThemeProvider";

interface ThemeToggleProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "button" | "switch";
}

export function ThemeToggle({
  size = "md",
  showLabel = false,
  variant = "button",
}: ThemeToggleProps) {
  const { isDarkMode, toggleTheme, isThemeLoading, canToggle } = useTheme();

  const sizeClasses = {
    sm: "p-1.5 text-sm",
    md: "p-2",
    lg: "p-3 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // ❌ No mostrar si feature desactivado
  if (!canToggle) {
    return showLabel ? (
      <span className="text-xs text-slate-500">🌙 Próximamente</span>
    ) : null;
  }

  if (variant === "switch") {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        {showLabel && (
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Modo Oscuro
          </span>
        )}
        <div className="relative">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
            disabled={isThemeLoading}
            className="sr-only"
          />
          <div
            className={`
            w-11 h-6 rounded-full transition-colors duration-200
            ${isDarkMode ? "bg-blue-600" : "bg-slate-300"}
            ${isThemeLoading ? "opacity-50" : ""}
          `}
          >
            <div
              className={`
              w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200
              ${isDarkMode ? "translate-x-5" : "translate-x-0.5"}
              mt-0.5
            `}
            >
              <div className="w-full h-full flex items-center justify-center">
                {isThemeLoading ? (
                  <div className="w-3 h-3 animate-spin rounded-full border border-slate-400 border-t-transparent" />
                ) : isDarkMode ? (
                  <Moon className="w-3 h-3 text-blue-600" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </label>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isThemeLoading}
      className={`
        ${sizeClasses[size]}
        rounded-lg border border-slate-200 dark:border-slate-700
        hover:bg-slate-50 dark:hover:bg-slate-800
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        group
      `}
      aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
      title={`Cambiar a modo ${isDarkMode ? "claro" : "oscuro"}`}
    >
      <div className="flex items-center gap-2">
        {isThemeLoading ? (
          <div
            className={`${iconSizes[size]} animate-spin rounded-full border-2 border-slate-300 border-t-slate-600`}
          />
        ) : (
          <div className="relative">
            <Sun
              className={`
              ${iconSizes[size]} 
              text-amber-500 transition-transform duration-300
              ${isDarkMode ? "scale-0 rotate-90" : "scale-100 rotate-0"}
            `}
            />
            <Moon
              className={`
              ${iconSizes[size]} 
              text-blue-400 transition-transform duration-300 absolute inset-0
              ${isDarkMode ? "scale-100 rotate-0" : "scale-0 -rotate-90"}
            `}
            />
          </div>
        )}
        {showLabel && (
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isDarkMode ? "Claro" : "Oscuro"}
          </span>
        )}
      </div>
    </button>
  );
}

// 🎨 Variante compacta para headers
export function ThemeToggleCompact() {
  return <ThemeToggle size="sm" />;
}

// 🎛️ Variante con etiqueta para settings
export function ThemeToggleWithLabel() {
  return <ThemeToggle variant="switch" showLabel />;
}
```

### 🏗️ 4. Server-Side Theme Detection

```typescript
// src/app/layout.tsx
import { headers } from "next/headers";
import { getServerFeatureFlags } from "@/core/config/server-feature-flags";

async function getServerTheme() {
  try {
    const flags = await getServerFeatureFlags();
    const darkModeEnabled = flags.darkMode || false;

    if (!darkModeEnabled) {
      return { darkModeEnabled: false, initialTheme: "light" };
    }

    // Leer cookie de tema si existe
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const themeCookie = cookieHeader
      ?.split(";")
      ?.find((c) => c.trim().startsWith("theme="))
      ?.split("=")[1];

    return {
      darkModeEnabled: true,
      initialTheme: themeCookie || "system",
    };
  } catch (error) {
    return { darkModeEnabled: false, initialTheme: "light" };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { darkModeEnabled, initialTheme } = await getServerTheme();

  return (
    <html
      lang="es"
      className={`h-full ${initialTheme === "dark" ? "dark" : ""}`}
      style={{ colorScheme: initialTheme === "dark" ? "dark" : "light" }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const darkModeEnabled = ${darkModeEnabled};
                if (!darkModeEnabled) return;
                
                const theme = localStorage.getItem('theme') || 'system';
                const isDark = theme === 'dark' || 
                  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body className="h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        <FeatureFlagsServerProvider>
          <ThemeProvider serverDarkMode={initialTheme === "dark"}>
            {children}
          </ThemeProvider>
        </FeatureFlagsServerProvider>
      </body>
    </html>
  );
}
```

---

## 🔔 Notificaciones Push

### 📝 1. Feature Flag Setup

```typescript
// feature-flags.ts
export const FEATURE_FLAGS = {
  pushNotifications: process.env.FEATURE_PUSH_NOTIFICATIONS === "true",
} as const;
```

```sql
INSERT INTO feature_flags (
  key, name, description, enabled, category, rollout_percentage
) VALUES (
  'pushNotifications',
  'Push Notifications',
  'Notificaciones push del navegador',
  false,
  'ui',
  25  -- Solo 25% de usuarios inicialmente
);
```

### 🔔 2. Notification Service

```typescript
// src/features/notifications/services/PushNotificationService.ts
"use client";

import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance() {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async isSupported(): Promise<boolean> {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!(await this.isSupported())) {
      throw new Error("Push notifications not supported");
    }

    return await Notification.requestPermission();
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.register("/sw.js");
    }

    const subscription = await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    // Enviar subscription al servidor
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    return subscription;
  }
}

// Hook personalizado
export function usePushNotifications() {
  const isEnabled = useIsEnabled();
  const pushEnabled = isEnabled("pushNotifications");

  const service = PushNotificationService.getInstance();

  const requestPermission = async () => {
    if (!pushEnabled) {
      throw new Error("Push notifications are not enabled");
    }
    return await service.requestPermission();
  };

  const subscribe = async () => {
    if (!pushEnabled) {
      throw new Error("Push notifications are not enabled");
    }
    return await service.subscribe();
  };

  return {
    isFeatureEnabled: pushEnabled,
    requestPermission,
    subscribe,
    isSupported: service.isSupported,
  };
}
```

### 🎛️ 3. Notification Setup Component

```typescript
// src/features/notifications/components/PushNotificationSetup.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, AlertCircle } from "lucide-react";
import { usePushNotifications } from "../services/PushNotificationService";

export function PushNotificationSetup() {
  const { isFeatureEnabled, requestPermission, subscribe, isSupported } =
    usePushNotifications();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = await isSupported();
      setSupported(supported);

      if (supported && "Notification" in window) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, [isSupported]);

  if (!isFeatureEnabled) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <BellOff className="w-5 h-5" />
          <span className="text-sm">
            Las notificaciones push estarán disponibles próximamente
          </span>
        </div>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">
            Tu navegador no soporta notificaciones push
          </span>
        </div>
      </div>
    );
  }

  const handleEnable = async () => {
    setIsLoading(true);
    try {
      const newPermission = await requestPermission();
      setPermission(newPermission);

      if (newPermission === "granted") {
        await subscribe();
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
            Notificaciones Push
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Recibe notificaciones importantes directamente en tu navegador
          </p>

          {permission === "granted" ? (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">
                Notificaciones activadas
              </span>
            </div>
          ) : permission === "denied" ? (
            <div className="text-sm text-red-600 dark:text-red-400">
              Notificaciones bloqueadas. Actívalas en la configuración del
              navegador.
            </div>
          ) : (
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 
                         text-white rounded-lg text-sm font-medium transition-colors
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Activando...
                </span>
              ) : (
                "Activar Notificaciones"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 🛡️ 4. Server-Side Protection

```typescript
// src/app/api/notifications/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/core/config/server-feature-flags";
import { requireAuth } from "@/core/auth/server";

export async function POST(request: NextRequest) {
  try {
    // 🛡️ Verificar autenticación
    const session = await requireAuth();

    // 🎛️ Verificar feature flag
    const enabled = await isFeatureEnabled("pushNotifications", {
      userId: session.user.id,
      userRole: session.user.role,
    });

    if (!enabled) {
      return NextResponse.json(
        {
          error: "Push notifications are not available",
          code: "FEATURE_DISABLED",
        },
        { status: 403 }
      );
    }

    const subscription = await request.json();

    // Guardar subscription en base de datos
    await prisma.pushSubscription.upsert({
      where: { userId: session.user.id },
      update: {
        subscription: subscription,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        subscription: subscription,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Dashboard Experimental

### 📝 1. Feature Flag para A/B Testing

```sql
INSERT INTO feature_flags (
  key, name, description, enabled, category, rollout_percentage
) VALUES (
  'dashboardV2',
  'Dashboard V2',
  'Nueva versión del dashboard con mejores métricas',
  true,
  'ui',
  50  -- 50% split test
);
```

### 🎨 2. Dashboard Selector Component

```typescript
// src/features/admin/dashboard/components/DashboardSelector.tsx
import { isFeatureEnabled } from "@/core/config/server-feature-flags";
import DashboardV1 from "./DashboardV1";
import DashboardV2 from "./DashboardV2";

interface DashboardSelectorProps {
  userId: string;
}

export default async function DashboardSelector({
  userId,
}: DashboardSelectorProps) {
  // 🎲 A/B Testing basado en userId
  const showV2 = await isFeatureEnabled("dashboardV2", { userId });

  if (showV2) {
    return <DashboardV2 userId={userId} isExperimental />;
  }

  return <DashboardV1 userId={userId} />;
}
```

### 📊 3. Dashboard V2 con Analytics

```typescript
// src/features/admin/dashboard/components/DashboardV2.tsx
"use client";

import React, { useEffect } from "react";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

interface DashboardV2Props {
  userId: string;
  isExperimental?: boolean;
}

export default function DashboardV2({
  userId,
  isExperimental,
}: DashboardV2Props) {
  const dashboardV2Enabled = useIsEnabled("dashboardV2");

  // 📊 Track experiment exposure
  useEffect(() => {
    if (isExperimental && dashboardV2Enabled) {
      // Analytics tracking
      window.gtag?.("event", "experiment_exposure", {
        experiment_id: "dashboard_v2",
        variant_id: "treatment",
        user_id: userId,
      });
    }
  }, [userId, isExperimental, dashboardV2Enabled]);

  if (!dashboardV2Enabled) {
    // Fallback si el flag se desactiva
    return <DashboardV1 userId={userId} />;
  }

  return (
    <div className="space-y-6">
      {isExperimental && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Estás viendo la nueva versión del dashboard
            </span>
          </div>
        </div>
      )}

      {/* Nuevo dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Usuarios Activos"
          value="2,345"
          change="+12%"
          trend="up"
        />
        <MetricCard title="Ingresos" value="$45,678" change="+8%" trend="up" />
        {/* Más métricas... */}
      </div>

      {/* Charts mejorados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedChart type="revenue" />
        <EnhancedChart type="users" />
      </div>
    </div>
  );
}
```

---

## 📍 Feature por Región

### 🌍 1. Feature Flag con Targeting

```sql
INSERT INTO feature_flags (
  key, name, description, enabled, category, target_audience
) VALUES (
  'paymentMethodApplePay',
  'Apple Pay',
  'Método de pago Apple Pay',
  true,
  'payment',
  ARRAY['US', 'CA', 'UK', 'AU']  -- Solo estos países
);
```

### 🛡️ 2. Middleware con Geo Detection

```typescript
// middleware.ts (ya implementado en tu sistema)
export async function middleware(request: NextRequest) {
  // ... código existente

  // 🌍 Obtener información geográfica
  const country = request.geo?.country || "unknown";
  const flagContext: FeatureFlagContext = {
    userId,
    userRole,
    country, // 🎯 Usado para targeting
  };

  const featureFlags = await getServerFeatureFlags(flagContext);
  // ... resto del código
}
```

### 💳 3. Payment Method Component

```typescript
// src/features/payment/components/PaymentMethods.tsx
"use client";

import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

export function PaymentMethods() {
  const applePayEnabled = useIsEnabled("paymentMethodApplePay");

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Métodos de Pago</h3>

      {/* Métodos siempre disponibles */}
      <PaymentOption
        id="card"
        name="Tarjeta de Crédito/Débito"
        icon="💳"
        available={true}
      />

      <PaymentOption id="paypal" name="PayPal" icon="🏦" available={true} />

      {/* Apple Pay solo en regiones soportadas */}
      {applePayEnabled && (
        <PaymentOption
          id="apple-pay"
          name="Apple Pay"
          icon="🍎"
          available={true}
          badge="🌟 Nuevo"
        />
      )}

      {!applePayEnabled && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
            🍎 Apple Pay no está disponible en tu región
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Analytics y Métricas

### 📈 1. Event Tracking

```typescript
// src/shared/utils/analytics.ts
export function trackFeatureFlagExposure(
  flagKey: string,
  enabled: boolean,
  userId?: string
) {
  // Google Analytics
  window.gtag?.("event", "feature_flag_exposure", {
    flag_key: flagKey,
    flag_enabled: enabled,
    user_id: userId,
  });

  // Custom analytics
  fetch("/api/analytics/feature-flag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      flagKey,
      enabled,
      userId,
      timestamp: new Date().toISOString(),
    }),
  }).catch(console.error);
}

// Hook para tracking automático
export function useFeatureFlagTracking(flagKey: string, userId?: string) {
  const isEnabled = useIsEnabled();
  const enabled = isEnabled(flagKey);

  useEffect(() => {
    trackFeatureFlagExposure(flagKey, enabled, userId);
  }, [flagKey, enabled, userId]);

  return enabled;
}
```

### 📊 2. Dashboard de Métricas

```typescript
// src/features/admin/feature-flags/components/FeatureFlagMetrics.tsx
"use client";

import { useState, useEffect } from "react";

interface FlagMetrics {
  flagKey: string;
  exposures: number;
  conversions: number;
  conversionRate: number;
  userCount: number;
}

export function FeatureFlagMetrics() {
  const [metrics, setMetrics] = useState<FlagMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/feature-flags/metrics")
      .then((res) => res.json())
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Cargando métricas...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">📊 Métricas de Feature Flags</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.flagKey}
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border"
          >
            <h4 className="font-medium text-slate-900 dark:text-slate-100">
              {metric.flagKey}
            </h4>
            <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <div>👥 {metric.userCount} usuarios</div>
              <div>👀 {metric.exposures} exposiciones</div>
              <div>✅ {metric.conversions} conversiones</div>
              <div className="font-semibold text-blue-600">
                📈 {(metric.conversionRate * 100).toFixed(1)}% tasa de
                conversión
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Tips y Best Practices

### ✅ Do's

```typescript
// ✅ Usar nombres descriptivos
const isNewCheckoutEnabled = useIsEnabled("checkoutFlowV2");

// ✅ Tener fallbacks seguros
function PaymentFlow() {
  const newFlowEnabled = useIsEnabled("checkoutFlowV2");

  return newFlowEnabled ? <NewCheckout /> : <LegacyCheckout />;
}

// ✅ Combinar con analytics
function MyFeature() {
  const enabled = useFeatureFlagTracking("myFeature", userId);
  return enabled ? <Feature /> : null;
}
```

### ❌ Don'ts

```typescript
// ❌ No hardcodear valores
if (userRole === "admin" && process.env.NODE_ENV === "production") {
  // Malo - usa feature flags en su lugar
}

// ❌ No crear dependencias complejas
const showFeature =
  isEnabled("flag1") && isEnabled("flag2") && userRole === "admin";
// Mejor: crear un flag específico "adminAdvancedFeatures"

// ❌ No olvidar fallbacks
const isEnabled = useIsEnabled("unstableFeature");
return <UnstableFeature />; // ¿Qué pasa si está desactivado?
```

---

¡Estos ejemplos te dan una base sólida para implementar cualquier feature flag en tu sistema! 🚀
