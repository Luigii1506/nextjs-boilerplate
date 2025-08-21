# 🌍 **GUÍA DE IMPLEMENTACIÓN DE I18N**

## 📋 **RESUMEN**

Esta guía documenta paso a paso cómo implementar un nuevo módulo UI (Internacionalización) desde cero, incluyendo:

- Configuración de feature flags
- Creación de base de datos
- Desarrollo de hooks y componentes
- Integración en layouts
- Sistema de broadcast
- Testing completo

**Resultado:** Un sistema completo de cambio de idioma (Español/Inglés) que aparece/desaparece según el feature flag.

---

## 🎯 **CARACTERÍSTICAS IMPLEMENTADAS**

### ✅ **Funcionalidades Core**

- **Feature Flag Integration:** Solo funciona cuando el flag `i18n` está habilitado
- **Persistencia:** Guarda la preferencia de idioma en localStorage
- **Broadcast Cross-Tab:** Sincronización instantánea entre pestañas
- **Idioma por Defecto:** Español como idioma predeterminado
- **Limpieza Automática:** Se resetea cuando se desactiva el feature flag

### ✅ **Componentes UI**

- **Múltiples Variantes:** Button, Switch, Icon
- **Múltiples Tamaños:** Small, Medium, Large
- **Responsive:** Adaptado para desktop y mobile
- **Accesibilidad:** ARIA labels, tooltips, keyboard navigation
- **Animaciones:** Transiciones suaves y profesionales

### ✅ **Sistema de Traducciones**

- **Estructura Tipada:** TypeScript completo con autocompletado
- **Organización Modular:** Traducciones por secciones (nav, auth, common, etc.)
- **Extensible:** Fácil agregar nuevos idiomas y textos

---

## 🚀 **PROCESO DE IMPLEMENTACIÓN PASO A PASO**

### **PASO 1: Configurar Feature Flag Estático**

**Archivo:** `src/core/feature-flags/config.ts`

```typescript
// 1. Agregar el flag en la sección UI FEATURES
// 🎨 UI FEATURES
darkMode: process.env.FEATURE_DARK_MODE === "true",
i18n: process.env.FEATURE_I18N === "true",

// 2. Agregarlo a la categoría UI
ui: {
  name: "UI Features",
  description: "User interface and experience features",
  color: "orange",
  icon: "Palette",
  flags: ["darkMode", "i18n", "animations", "notifications"],
},
```

**✅ Resultado:** El feature flag aparece en la configuración estática pero aún no en la base de datos.

---

### **PASO 2: Agregar Feature Flag a la Base de Datos**

**Crear script temporal:** `scripts/add-i18n-feature-flag.js`

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function addI18nFeatureFlag() {
  const newFlag = await prisma.featureFlag.create({
    data: {
      key: "i18n",
      name: "Internacionalización",
      description:
        "Permite cambiar el idioma de la aplicación entre español e inglés.",
      enabled: false, // Inicia deshabilitado
      category: "ui",
      version: "1.0.0",
      author: "System",
      tags: ["ui", "language", "internationalization", "i18n"],
      dependencies: [],
      conflicts: [],
      hasPrismaModels: false,
      rolloutPercentage: 100,
      targetUsers: [],
      targetRoles: [],
    },
  });

  console.log("✅ Feature flag agregado:", newFlag);
}

addI18nFeatureFlag();
```

**Ejecutar:**

```bash
node scripts/add-i18n-feature-flag.js
```

**✅ Resultado:** El feature flag aparece en `/feature-flags` pero aún deshabilitado.

---

### **PASO 3: Crear Sistema de Traducciones**

**Archivo:** `src/shared/i18n/translations.ts`

```typescript
// 🎯 Idiomas soportados
export const SUPPORTED_LANGUAGES = {
  es: "Español",
  en: "English",
} as const;

export type Language = keyof typeof SUPPORTED_LANGUAGES;

// 📝 Estructura de traducciones tipada
export interface Translations {
  nav: {
    dashboard: string;
    users: string;
    // ... más campos
  };
  // ... más secciones
}

// 🇪🇸 Traducciones en español (por defecto)
export const esTranslations: Translations = {
  nav: {
    dashboard: "Dashboard",
    users: "Usuarios",
    // ...
  },
  // ...
};

// 🇺🇸 Traducciones en inglés
export const enTranslations: Translations = {
  nav: {
    dashboard: "Dashboard",
    users: "Users",
    // ...
  },
  // ...
};

// 🗂️ Todas las traducciones
export const translations = {
  es: esTranslations,
  en: enTranslations,
} as const;

// 🎯 Configuración
export const DEFAULT_LANGUAGE: Language = "es";
export const LANGUAGE_STORAGE_KEY = "app-language";
export const LANGUAGE_BROADCAST_CHANNEL = "language-change";
```

**✅ Resultado:** Sistema de traducciones tipado y extensible.

---

### **PASO 4: Crear Hook useI18n**

**Archivo:** `src/shared/hooks/useI18n.ts`

```typescript
export function useI18n(): I18nState {
  const { isEnabled } = useFeatureFlags();
  const isFeatureEnabled = isEnabled("i18n");

  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [broadcastChannel, setBroadcastChannel] =
    useState<BroadcastChannel | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 🚀 Inicialización
  useEffect(() => {
    // Crear canal de broadcast
    const channel = new BroadcastChannel(LANGUAGE_BROADCAST_CHANNEL);
    setBroadcastChannel(channel);

    // Obtener idioma guardado
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    let initialLanguage = DEFAULT_LANGUAGE;

    if (isFeatureEnabled && stored && isLanguageSupported(stored)) {
      initialLanguage = stored;
    }

    setLanguageState(initialLanguage);
    setIsInitialized(true);

    // Escuchar broadcast
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === "LANGUAGE_CHANGE") {
        setLanguageState(event.data.language);
      }
    };

    channel.addEventListener("message", handleBroadcast);
    return () => {
      channel.removeEventListener("message", handleBroadcast);
      channel.close();
    };
  }, [isFeatureEnabled]);

  // 🔄 Resetear cuando se desactiva
  useEffect(() => {
    if (!isFeatureEnabled && language !== DEFAULT_LANGUAGE) {
      setLanguageState(DEFAULT_LANGUAGE);
      localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    }
  }, [isFeatureEnabled, language]);

  // 🎯 Función para cambiar idioma
  const setLanguage = useCallback(
    (newLanguage: Language) => {
      if (!isFeatureEnabled) return;

      setLanguageState(newLanguage);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);

      // Broadcast a otras pestañas
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: "LANGUAGE_CHANGE",
          language: newLanguage,
          timestamp: Date.now(),
        });
      }
    },
    [isFeatureEnabled, broadcastChannel]
  );

  return {
    language,
    isFeatureEnabled,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "es" ? "en" : "es"),
    t: translations[language], // Traducciones actuales
    // ... más funciones
  };
}
```

**Agregar al barrel export:** `src/shared/hooks/index.ts`

```typescript
export * from "./useI18n";
```

**✅ Resultado:** Hook funcional con feature flag integration y broadcast.

---

### **PASO 5: Crear Componente I18nToggle**

**Archivo:** `src/shared/ui/components/I18nToggle.tsx`

```typescript
export function I18nToggle({
  variant = "button",
  size = "md",
  className,
  showLabel = true,
  showTooltip = true,
}: I18nToggleProps) {
  const { language, isFeatureEnabled, toggleLanguage, getLanguageName, t } =
    useI18n();

  // 🚫 No renderizar si está deshabilitado
  if (!isFeatureEnabled) {
    return null;
  }

  // 🎯 Variante Button
  if (variant === "button") {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-300",
          "border border-slate-200 bg-white hover:bg-slate-50",
          "dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          // ... más estilos
        )}
        title={showTooltip ? t.language.tooltip : undefined}
      >
        <Languages className="w-5 h-5" />
        {showLabel && <span>{getLanguageName(language)}</span>}
      </button>
    );
  }

  // 🔄 Variante Switch
  if (variant === "switch") {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className={cn(
            "relative inline-flex items-center rounded-full transition-all duration-300",
            language === "en" ? "bg-blue-600" : "bg-green-600"
          )}
        >
          <span
            className={cn(
              "inline-block rounded-full bg-white shadow-lg transition-transform duration-300",
              language === "en" ? "translate-x-5" : "translate-x-0.5"
            )}
          >
            {language === "es" ? "🇪🇸" : "🇺🇸"}
          </span>
        </button>

        {/* Indicadores ES | EN */}
        <div className="flex items-center gap-1">
          <span
            className={
              language === "es"
                ? "text-green-600 font-semibold"
                : "text-slate-400"
            }
          >
            ES
          </span>
          <span>|</span>
          <span
            className={
              language === "en"
                ? "text-blue-600 font-semibold"
                : "text-slate-400"
            }
          >
            EN
          </span>
        </div>
      </div>
    );
  }

  // 🌐 Variante Icon
  if (variant === "icon") {
    return (
      <button onClick={toggleLanguage}>
        <div className="relative">
          <Globe className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 text-xs">
            {language === "es" ? "🇪🇸" : "🇺🇸"}
          </span>
        </div>
      </button>
    );
  }
}
```

**Agregar al barrel export:** `src/shared/ui/components/index.ts`

```typescript
export * from "./I18nToggle";
```

**✅ Resultado:** Componente hermoso y funcional con múltiples variantes.

---

### **PASO 6: Integrar en AdminLayout**

**Archivo:** `src/shared/ui/layouts/AdminLayout.tsx`

```typescript
// 1. Importar el componente
import { DarkModeToggle, I18nToggle } from "@/shared/ui/components";

// 2. Agregar en header desktop (después del dark mode)
{
  /* 🌙 Dark Mode Toggle */
}
<DarkModeToggle size="md" variant="button" showTooltip={true} />;

{
  /* 🌍 Language Toggle */
}
<I18nToggle size="md" variant="button" showTooltip={true} />;

// 3. Agregar en sidebar mobile
{
  /* 🌙 Mobile Dark Mode Toggle */
}
<DarkModeToggle size="sm" variant="switch" showTooltip={false} />;

{
  /* 🌍 Mobile Language Toggle */
}
<I18nToggle size="sm" variant="switch" showTooltip={false} />;
```

**✅ Resultado:** Toggle visible en desktop y mobile, al lado del dark mode toggle.

---

### **PASO 7: Testing y Verificación**

#### **7.1 Compilación**

```bash
npm run build
```

**✅ Debe compilar sin errores**

#### **7.2 Servidor de Desarrollo**

```bash
npm run dev
```

**✅ Debe iniciar correctamente**

#### **7.3 Pruebas Funcionales**

1. **Ir a `/feature-flags`**

   - ✅ Debe aparecer "Internacionalización" en la categoría UI
   - ✅ Debe estar deshabilitado por defecto

2. **Habilitar el Feature Flag**

   - ✅ El toggle de idioma debe aparecer en el header
   - ✅ Debe mostrar "Español" por defecto

3. **Cambiar Idioma**

   - ✅ Hacer clic debe cambiar a "English"
   - ✅ Los textos deben cambiar (si están implementados)
   - ✅ Debe persistir al recargar la página

4. **Broadcast Cross-Tab**

   - ✅ Abrir otra pestaña de la app
   - ✅ Cambiar idioma en una pestaña
   - ✅ Debe cambiar automáticamente en la otra pestaña

5. **Deshabilitar Feature Flag**
   - ✅ El toggle debe desaparecer
   - ✅ Debe volver a español automáticamente
   - ✅ localStorage debe limpiarse

---

## 🎨 **PATRONES DE DISEÑO UTILIZADOS**

### **1. Feature Flag Integration Pattern**

```typescript
// ✅ Siempre verificar si el feature está habilitado
const { isEnabled } = useFeatureFlags();
const isFeatureEnabled = isEnabled("featureName");

// ✅ No renderizar si está deshabilitado
if (!isFeatureEnabled) {
  return null;
}
```

### **2. Broadcast Pattern**

```typescript
// ✅ Crear canal de broadcast
const channel = new BroadcastChannel("feature-channel");

// ✅ Enviar cambios
channel.postMessage({
  type: "FEATURE_CHANGE",
  data: newValue,
  timestamp: Date.now(),
});

// ✅ Escuchar cambios
channel.addEventListener("message", handleBroadcast);
```

### **3. Persistence Pattern**

```typescript
// ✅ Guardar en localStorage
localStorage.setItem(STORAGE_KEY, value);

// ✅ Leer con fallback
const stored = localStorage.getItem(STORAGE_KEY);
const initialValue = stored ? JSON.parse(stored) : DEFAULT_VALUE;

// ✅ Limpiar cuando se desactiva
if (!isFeatureEnabled) {
  localStorage.removeItem(STORAGE_KEY);
}
```

### **4. Component Variants Pattern**

```typescript
// ✅ Múltiples variantes en un componente
type ComponentVariant = "button" | "switch" | "icon";
type ComponentSize = "sm" | "md" | "lg";

// ✅ Configuración por tamaño
const sizeConfig = {
  sm: { button: "px-2 py-1", icon: "w-4 h-4" },
  md: { button: "px-3 py-2", icon: "w-5 h-5" },
  lg: { button: "px-4 py-3", icon: "w-6 h-6" },
};
```

---

## 🔧 **ARCHIVOS CREADOS/MODIFICADOS**

### **📁 Archivos Nuevos**

```
src/shared/i18n/translations.ts          # Sistema de traducciones
src/shared/hooks/useI18n.ts              # Hook principal
src/shared/ui/components/I18nToggle.tsx  # Componente toggle
docs/Feature-flags/I18N_IMPLEMENTATION_GUIDE.md  # Esta documentación
```

### **📝 Archivos Modificados**

```
src/core/feature-flags/config.ts         # Configuración del feature flag
src/shared/hooks/index.ts                # Export del hook
src/shared/ui/components/index.ts        # Export del componente
src/shared/ui/layouts/AdminLayout.tsx    # Integración en layout
```

### **🗑️ Archivos Temporales**

```
scripts/add-i18n-feature-flag.js         # Script para DB (eliminado después)
```

---

## 🚀 **CÓMO USAR ESTA GUÍA PARA NUEVOS MÓDULOS UI**

### **Template para Nuevos Módulos:**

1. **Reemplazar en toda la guía:**

   - `i18n` → `tuNuevoModulo`
   - `I18n` → `TuNuevoModulo`
   - `language` → `tuEstado`
   - `LANGUAGE_` → `TU_MODULO_`

2. **Seguir los mismos pasos:**

   - ✅ Configurar feature flag estático
   - ✅ Agregar a base de datos
   - ✅ Crear sistema de datos (si aplica)
   - ✅ Crear hook personalizado
   - ✅ Crear componente toggle
   - ✅ Integrar en layout
   - ✅ Testing completo
   - ✅ Documentar proceso

3. **Mantener los patrones:**
   - ✅ Feature flag integration
   - ✅ Broadcast cross-tab
   - ✅ Persistence en localStorage
   - ✅ Limpieza automática
   - ✅ Múltiples variantes de componente
   - ✅ Accesibilidad completa

---

## 🎯 **PRÓXIMOS PASOS SUGERIDOS**

### **Mejoras Inmediatas**

- [ ] Implementar traducciones en más componentes
- [ ] Agregar más idiomas (Francés, Alemán, etc.)
- [ ] Crear sistema de detección automática de idioma del navegador
- [ ] Implementar lazy loading de traducciones

### **Funcionalidades Avanzadas**

- [ ] Pluralización inteligente
- [ ] Formateo de fechas por idioma
- [ ] Formateo de números por región
- [ ] RTL support para idiomas como árabe

### **Optimizaciones**

- [ ] Caché de traducciones
- [ ] Compresión de archivos de idioma
- [ ] Tree shaking de traducciones no usadas
- [ ] Preload de idiomas frecuentes

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Configuración**

- [x] Feature flag agregado a config estático
- [x] Feature flag agregado a base de datos
- [x] Categoría UI configurada correctamente

### **Sistema de Datos**

- [x] Traducciones tipadas creadas
- [x] Idiomas soportados definidos
- [x] Idioma por defecto configurado
- [x] Constantes de storage y broadcast definidas

### **Hook Personalizado**

- [x] Hook useI18n creado
- [x] Feature flag integration implementada
- [x] Persistence en localStorage
- [x] Broadcast cross-tab funcional
- [x] Limpieza automática cuando se desactiva
- [x] Funciones helper incluidas

### **Componente UI**

- [x] Componente I18nToggle creado
- [x] Múltiples variantes (button, switch, icon)
- [x] Múltiples tamaños (sm, md, lg)
- [x] Accesibilidad completa
- [x] Animaciones suaves
- [x] Conditional rendering por feature flag

### **Integración**

- [x] Integrado en AdminLayout desktop
- [x] Integrado en AdminLayout mobile
- [x] Exports agregados a barrel files
- [x] Imports correctos en layouts

### **Testing**

- [x] Compilación sin errores
- [x] Servidor de desarrollo funcional
- [x] Feature flag toggle funcional
- [x] Cambio de idioma funcional
- [x] Persistence funcional
- [x] Broadcast cross-tab funcional
- [x] Limpieza automática funcional

### **Documentación**

- [x] Guía completa de implementación
- [x] Patrones de diseño documentados
- [x] Template para futuros módulos
- [x] Checklist de verificación
- [x] Próximos pasos sugeridos

---

## 🎉 **CONCLUSIÓN**

**¡Implementación Exitosa!** 🌍

El módulo de Internacionalización (i18n) ha sido implementado completamente siguiendo las mejores prácticas:

- ✅ **Funcional:** Cambio de idioma fluido y persistente
- ✅ **Profesional:** UI hermosa y accesible
- ✅ **Robusto:** Feature flag integration y broadcast
- ✅ **Extensible:** Fácil agregar nuevos idiomas
- ✅ **Documentado:** Guía completa para futuros módulos

**Esta guía sirve como template perfecto para implementar cualquier nuevo módulo UI en el futuro.**

---

_Creado: 2025-01-17 - Implementación completa de I18n_
_Autor: Sistema de Desarrollo_
_Versión: 1.0.0_
