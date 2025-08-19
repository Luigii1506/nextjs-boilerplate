---
title: Dark mode tutorial
slug: /feature-flags/darkmode
---

# 🌙 TUTORIAL: Implementar Dark Mode con Feature Flags

> **Guía paso a paso para implementar Dark Mode completo usando el sistema de Feature Flags**

## 🎯 Objetivo

Al final de este tutorial tendrás:

- ✅ Dark Mode funcional en toda la aplicación
- ✅ Toggle smooth en el header
- ✅ Persistencia de preferencia del usuario
- ✅ Detección automática de preferencia del sistema
- ✅ Hydration-safe (sin flash)
- ✅ Controlado por Feature Flag

## 🚀 Paso a Paso

### 1. 📝 Crear el Feature Flag

```bash
npm run create-flag darkMode "Dark Mode" ui --desc="Modo oscuro para toda la aplicación"
```

**Qué hace este comando:**

- ✅ Agrega `darkMode: process.env.FEATURE_DARK_MODE === "true"` a `feature-flags.ts`
- ✅ Crea entrada en base de datos
- ✅ Genera archivo de ejemplo
- ✅ Actualiza documentación

### 2. 🔧 Configurar Environment Variable

```bash
# .env.local
FEATURE_DARK_MODE=true
```

### 3. 🗄️ Verificar en Base de Datos

Ve a `/admin/feature-flags` y verifica que aparece el flag `darkMode`. Actívalo si está deshabilitado.

### 4. 🎨 Configurar Tailwind CSS

Asegúrate que `tailwind.config.js` tiene dark mode configurado:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // 👈 Importante
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para dark mode
        dark: {
          bg: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
        },
      },
    },
  },
};
```

### 5. 🎨 Crear Theme Provider

Crea `src/shared/providers/ThemeProvider.tsx`:

```typescript
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
      setIsDarkMode(false);
      setIsThemeLoading(false);
      return;
    }

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

  const toggleTheme = () => {
    if (darkModeEnabled && !isThemeLoading) {
      setIsDarkMode(!isDarkMode);
    }
  };

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

### 6. 🎛️ Crear Theme Toggle Component

Crea `src/shared/components/ThemeToggle.tsx`:

```typescript
"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/shared/providers/ThemeProvider";

export function ThemeToggle() {
  const { isDarkMode, toggleTheme, isThemeLoading, canToggle } = useTheme();

  if (!canToggle) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      disabled={isThemeLoading}
      className="
        p-2 rounded-lg border border-slate-200 dark:border-slate-700
        hover:bg-slate-50 dark:hover:bg-slate-800
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      aria-label={isDarkMode ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {isThemeLoading ? (
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      ) : (
        <div className="relative">
          <Sun
            className={`
            w-5 h-5 text-amber-500 transition-transform duration-300
            ${isDarkMode ? "scale-0 rotate-90" : "scale-100 rotate-0"}
          `}
          />
          <Moon
            className={`
            w-5 h-5 text-blue-400 transition-transform duration-300 absolute inset-0
            ${isDarkMode ? "scale-100 rotate-0" : "scale-0 -rotate-90"}
          `}
          />
        </div>
      )}
    </button>
  );
}
```

### 7. 🏗️ Actualizar Layout Root

Edita `src/app/layout.tsx`:

```typescript
import { FeatureFlagsServerProvider } from "@/shared/hooks/useFeatureFlagsServerActions";
import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { headers } from "next/headers";
import { getServerFeatureFlags } from "@/core/config/server-feature-flags";

async function getInitialTheme() {
  try {
    const flags = await getServerFeatureFlags();
    const darkModeEnabled = flags.darkMode || false;

    if (!darkModeEnabled) {
      return { darkModeEnabled: false, initialTheme: "light" };
    }

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
  const { darkModeEnabled, initialTheme } = await getInitialTheme();

  return (
    <html
      lang="es"
      className={`h-full ${initialTheme === "dark" ? "dark" : ""}`}
      style={{ colorScheme: initialTheme === "dark" ? "dark" : "light" }}
    >
      <head>
        {/* Prevenir flash de contenido sin estilo */}
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

### 8. 🎛️ Agregar Toggle al Header

Edita `src/shared/ui/layouts/AdminShellPure.tsx`:

```typescript
// Importar el componente
import { ThemeToggle } from "@/shared/components/ThemeToggle";

// En headerActions, agregar:
const headerActions = React.useMemo(
  (): HeaderAction[] => [
    {
      id: "search",
      icon: <Search className="w-5 h-5" />,
      label: "Buscar",
      onClick: onSearch,
    },
    {
      id: "theme",
      icon: <ThemeToggle />,
      label: "Cambiar tema",
    },
    {
      id: "notifications",
      icon: <Bell className="w-5 h-5" />,
      label: "Notificaciones",
      onClick: onNotifications,
      badge: 3,
    },
    {
      id: "settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Configuración",
      onClick: onSettings,
    },
  ],
  [onSearch, onNotifications, onSettings]
);
```

### 9. 🎨 Actualizar Componentes con Dark Mode

Ejemplo de componente actualizado:

```typescript
// Antes
<div className="bg-white border border-gray-200 p-4 rounded-lg">

// Después
<div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-lg">
```

### 10. 🧪 Probar la Implementación

1. **Verificar que funciona el toggle:**

   - Ve a `/admin/dashboard`
   - Busca el ícono de sol/luna en el header
   - Haz clic y verifica que cambia el tema

2. **Probar persistencia:**

   - Cambia a dark mode
   - Recarga la página
   - Debería mantener dark mode

3. **Probar feature flag:**

   - Ve a `/admin/feature-flags`
   - Desactiva `darkMode`
   - El toggle debería desaparecer
   - El tema debería forzarse a light mode

4. **Probar detección del sistema:**
   - Activa el flag pero borra `localStorage.theme`
   - Cambia la preferencia del sistema en tu OS
   - Recarga y debería respetar la preferencia del sistema

### 11. 🎨 Personalizar Colores

Agrega variables CSS personalizadas en `globals.css`:

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 59 130 246; /* blue-500 */
    --color-background: 255 255 255; /* white */
    --color-foreground: 15 23 42; /* slate-900 */
    --color-muted: 248 250 252; /* slate-50 */
    --color-border: 226 232 240; /* slate-200 */
  }

  .dark {
    --color-primary: 96 165 250; /* blue-400 */
    --color-background: 15 23 42; /* slate-900 */
    --color-foreground: 248 250 252; /* slate-50 */
    --color-muted: 30 41 59; /* slate-800 */
    --color-border: 51 65 85; /* slate-700 */
  }
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
```

### 12. 📊 Agregar Analytics (Opcional)

Track cuando los usuarios usan dark mode:

```typescript
// En ThemeProvider.tsx
const toggleTheme = () => {
  if (darkModeEnabled && !isThemeLoading) {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // Track analytics
    window.gtag?.("event", "theme_change", {
      theme_mode: newMode ? "dark" : "light",
      source: "toggle_button",
    });
  }
};
```

## ✅ Verificación Final

### Checklist de Funcionalidad

- [ ] 🎛️ Feature flag aparece en `/admin/feature-flags`
- [ ] 🌙 Toggle visible en header cuando flag activo
- [ ] 🔄 Tema cambia al hacer clic en toggle
- [ ] 💾 Preferencia se persiste al recargar
- [ ] 🖥️ Detecta preferencia del sistema automáticamente
- [ ] ❌ Toggle desaparece cuando flag desactivado
- [ ] 🎨 Todos los componentes respetan dark/light mode
- [ ] ⚡ No hay flash de contenido sin estilo
- [ ] 📱 Funciona en móvil y desktop

### Comandos de Prueba

```bash
# Verificar que el flag existe
npm run flags:list | grep darkMode

# Probar en diferentes dispositivos
npm run dev
# Abrir en múltiples navegadores/dispositivos
```

## 🎯 Próximos Pasos

1. **🎨 Personalización Avanzada:**

   - Agregar más variantes de color
   - Crear tema sepia/high-contrast
   - Transiciones más suaves

2. **📊 Analytics:**

   - Track adoption de dark mode
   - A/B test diferentes posiciones del toggle
   - Métricas de retención por tema

3. **🔧 Optimizaciones:**
   - Preload del tema preferido
   - Reducir tamaño del CSS
   - Lazy load componentes por tema

¡Felicidades! 🎉 Ahora tienes un sistema de Dark Mode completo controlado por Feature Flags.
