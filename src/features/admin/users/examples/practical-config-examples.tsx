/**
 * 🎯 EJEMPLOS PRÁCTICOS DE CONFIGURACIÓN DE USUARIOS
 *
 * Ejemplos reales de cómo usar la nueva configuración práctica y útil.
 * Estos son los settings que realmente vas a cambiar y usar.
 *
 * Updated: 2025-01-17 - Configuración práctica
 */

import React from "react";
import {
  usersConfig,
  quickConfig,
  PRACTICAL_PRESETS,
  SORT_OPTIONS,
} from "../config";

// 🎯 EJEMPLO 1: Configuración básica para diferentes escenarios
export function ConfigurationExamples() {
  // 📱 Configurar para móvil
  const setupMobileView = () => {
    usersConfig.usePreset("mobile");
    // Resultado: 10 items, sin avatares, vista compacta, búsqueda no instantánea
  };

  // 🚀 Configurar para rendimiento con muchos usuarios
  const setupPerformanceView = () => {
    usersConfig.usePreset("performance");
    // Resultado: 100 items, sin avatares, sin stats, búsqueda con 3+ chars
  };

  // 🎯 Configurar para administradores avanzados
  const setupAdvancedView = () => {
    usersConfig.usePreset("advanced");
    // Resultado: 50 items, todos los filtros, campos avanzados, bulk operations
  };

  // 🎨 Configurar vista simple y limpia
  const setupSimpleView = () => {
    usersConfig.usePreset("simple");
    // Resultado: 10 items, mínimos filtros, sin campos avanzados
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Presets Rápidos</h3>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={setupMobileView} className="p-3 bg-blue-100 rounded">
          📱 Vista Móvil
        </button>
        <button
          onClick={setupPerformanceView}
          className="p-3 bg-green-100 rounded"
        >
          🚀 Alto Rendimiento
        </button>
        <button
          onClick={setupAdvancedView}
          className="p-3 bg-purple-100 rounded"
        >
          🎯 Administrador Avanzado
        </button>
        <button onClick={setupSimpleView} className="p-3 bg-gray-100 rounded">
          🎨 Vista Simple
        </button>
      </div>
    </div>
  );
}

// 🎯 EJEMPLO 2: Configuraciones específicas que realmente usarás
export function PracticalSettings() {
  // 📊 Cambiar cantidad de items (lo que más cambias)
  const changeItemsPerPage = (items: 10 | 20 | 50 | 100) => {
    usersConfig.setItemsPerPage(items);
  };

  // 🔄 Cambiar ordenamiento (muy útil)
  const changeSorting = () => {
    // Por nombre A-Z
    usersConfig.setDefaultSort("name", "asc");

    // Por más recientes
    usersConfig.setDefaultSort("createdAt", "desc");

    // Por último login
    usersConfig.setDefaultSort("lastLogin", "desc");
  };

  // 🎨 Personalizar vista
  const customizeView = () => {
    // Ocultar avatares para mejor rendimiento
    usersConfig.toggleAvatars();

    // Vista compacta para ver más usuarios
    usersConfig.toggleCompactView();

    // Mostrar estadísticas de usuario
    usersConfig.toggleUserStats();
  };

  // 🔍 Configurar búsqueda
  const configureSearch = () => {
    // Búsqueda instantánea (mientras escribes)
    usersConfig.toggleInstantSearch();

    // Buscar solo en nombres
    usersConfig.setSearchFields(["name"]);

    // Buscar en nombre y email
    usersConfig.setSearchFields(["both"]);

    // Mínimo 3 caracteres para buscar
    usersConfig.setSearchMinChars(3);
  };

  // 🎨 Configurar filtros
  const configureFilters = () => {
    // Mostrar filtro de roles
    usersConfig.toggleRoleFilter();

    // Mostrar filtro de estado
    usersConfig.toggleStatusFilter();

    // Mostrar filtro de fechas (más avanzado)
    usersConfig.toggleDateRangeFilter();

    // Filtro por defecto: solo admins
    usersConfig.setDefaultRole("admin");
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-2">📊 Items por página</h4>
        <div className="flex gap-2">
          {[10, 20, 50, 100].map((num) => (
            <button
              key={num}
              onClick={() => changeItemsPerPage(num as any)}
              className="px-3 py-1 bg-blue-100 rounded text-sm"
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">🔄 Ordenamiento rápido</h4>
        <div className="flex gap-2">
          <button
            onClick={() => usersConfig.setDefaultSort("name", "asc")}
            className="px-3 py-1 bg-green-100 rounded text-sm"
          >
            A-Z Nombre
          </button>
          <button
            onClick={() => usersConfig.setDefaultSort("createdAt", "desc")}
            className="px-3 py-1 bg-green-100 rounded text-sm"
          >
            Más Recientes
          </button>
          <button
            onClick={() => usersConfig.setDefaultSort("lastLogin", "desc")}
            className="px-3 py-1 bg-green-100 rounded text-sm"
          >
            Último Login
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">🎨 Vista</h4>
        <div className="flex gap-2">
          <button
            onClick={() => usersConfig.toggleAvatars()}
            className="px-3 py-1 bg-purple-100 rounded text-sm"
          >
            Toggle Avatares
          </button>
          <button
            onClick={() => usersConfig.toggleCompactView()}
            className="px-3 py-1 bg-purple-100 rounded text-sm"
          >
            Vista Compacta
          </button>
          <button
            onClick={() => usersConfig.toggleUserStats()}
            className="px-3 py-1 bg-purple-100 rounded text-sm"
          >
            Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
}

// 🎯 EJEMPLO 3: Usando quickConfig para cambios súper rápidos
export function QuickConfigExamples() {
  const handleQuickChanges = () => {
    // 📊 Cambios rápidos de display
    quickConfig.show20Items(); // 20 items por página
    quickConfig.sortByNewest(); // Ordenar por más recientes
    quickConfig.enableCompactView(); // Vista compacta

    // 🔍 Búsqueda optimizada
    quickConfig.enableInstantSearch(); // Búsqueda mientras escribes
    quickConfig.searchBothFields(); // Buscar en nombre y email

    // 🎯 Modo específico
    quickConfig.performanceMode(); // Configuración para rendimiento

    // 📊 Ver configuración actual
    const currentConfig = quickConfig.getCurrentConfig();
    console.log("Configuración actual:", currentConfig);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Config (Una línea)</h3>
      <div className="bg-gray-50 p-4 rounded">
        <pre className="text-sm">
          {`// 🚀 Cambios súper rápidos
quickConfig.show20Items();        // 20 items
quickConfig.sortByNewest();       // Más recientes primero  
quickConfig.mobileMode();         // Preset móvil
quickConfig.performanceMode();    // Preset rendimiento
quickConfig.enableInstantSearch(); // Búsqueda instantánea
quickConfig.hideAvatars();        // Sin avatares
quickConfig.enableBulkOps();      // Operaciones masivas`}
        </pre>
      </div>

      <button
        onClick={handleQuickChanges}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Aplicar Configuración Rápida
      </button>
    </div>
  );
}

// 🎯 EJEMPLO 4: Configuración personalizada para casos específicos
export function CustomConfigExamples() {
  // 👥 Para equipos grandes (muchos usuarios)
  const setupForLargeTeams = () => {
    usersConfig.setItemsPerPage(100); // Más usuarios por página
    usersConfig.setDefaultSort("name", "asc"); // Ordenar alfabéticamente
    usersConfig.toggleAvatars(); // Sin avatares (rendimiento)
    usersConfig.toggleCompactView(); // Vista compacta
    usersConfig.setSearchMinChars(2); // Búsqueda con 2+ chars
    usersConfig.toggleRoleFilter(); // Mostrar filtro de roles
  };

  // 📱 Para uso en tablet/móvil
  const setupForMobile = () => {
    usersConfig.setItemsPerPage(10); // Menos items
    usersConfig.toggleCompactView(); // Vista compacta
    usersConfig.toggleAvatars(); // Sin avatares
    usersConfig.setSearchMinChars(3); // Menos búsquedas
    usersConfig.toggleInstantSearch(); // Sin búsqueda instantánea
  };

  // 🎯 Para administradores que necesitan todo
  const setupForPowerUsers = () => {
    usersConfig.setItemsPerPage(50); // Balance entre cantidad y rendimiento
    usersConfig.setDefaultSort("lastLogin", "desc"); // Ver actividad reciente
    usersConfig.toggleAdvancedFields(); // Campos avanzados
    usersConfig.toggleBulkOperations(); // Operaciones masivas
    usersConfig.toggleDateRangeFilter(); // Filtro de fechas
    usersConfig.toggleRoleFilter(); // Filtro de roles
    usersConfig.toggleStatusFilter(); // Filtro de estado
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Configuraciones Personalizadas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">👥 Equipos Grandes</h4>
          <p className="text-sm text-gray-600 mb-3">
            100 usuarios, sin avatares, vista compacta, filtros de rol
          </p>
          <button
            onClick={setupForLargeTeams}
            className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm"
          >
            Configurar
          </button>
        </div>

        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">📱 Móvil/Tablet</h4>
          <p className="text-sm text-gray-600 mb-3">
            10 usuarios, vista compacta, búsqueda optimizada
          </p>
          <button
            onClick={setupForMobile}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm"
          >
            Configurar
          </button>
        </div>

        <div className="p-4 border rounded">
          <h4 className="font-medium mb-2">🎯 Power Users</h4>
          <p className="text-sm text-gray-600 mb-3">
            Todos los filtros, campos avanzados, operaciones masivas
          </p>
          <button
            onClick={setupForPowerUsers}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm"
          >
            Configurar
          </button>
        </div>
      </div>
    </div>
  );
}

// 🎯 EJEMPLO 5: Información útil de la configuración
export function ConfigInfoExamples() {
  const [configInfo, setConfigInfo] = React.useState<any>(null);

  const showCurrentConfig = () => {
    const info = {
      summary: usersConfig.getSummary(),
      itemsPerPage: usersConfig.getItemsPerPage(),
      currentSort: usersConfig.getCurrentSort(),
      searchConfig: usersConfig.getSearchConfig(),
      showAvatars: usersConfig.shouldShowAvatars(),
      compactView: usersConfig.isCompactView(),
      allowsBulk: usersConfig.allowsBulkOperations(),
    };
    setConfigInfo(info);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Información de Configuración</h3>

      <button
        onClick={showCurrentConfig}
        className="px-4 py-2 bg-gray-600 text-white rounded"
      >
        Ver Configuración Actual
      </button>

      {configInfo && (
        <div className="bg-gray-50 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(configInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>
          <strong>Tip:</strong> Usa <code>usersConfig.getSummary()</code> para
          ver un resumen rápido
        </p>
        <p>
          <strong>Tip:</strong> Usa <code>quickConfig.getCurrentConfig()</code>{" "}
          para info básica
        </p>
        <p>
          <strong>Tip:</strong> Usa <code>usersConfig.resetToDefaults()</code>{" "}
          para volver a la configuración inicial
        </p>
      </div>
    </div>
  );
}

// 🎯 COMPONENTE PRINCIPAL CON TODOS LOS EJEMPLOS
export default function PracticalConfigGuide() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          🎯 Configuración Práctica de Usuarios
        </h1>
        <p className="text-gray-600">
          Solo las configuraciones que realmente vas a usar y cambiar
        </p>
      </div>

      <ConfigurationExamples />
      <PracticalSettings />
      <QuickConfigExamples />
      <CustomConfigExamples />
      <ConfigInfoExamples />

      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-2">💡 Consejos Prácticos</h3>
        <ul className="text-sm space-y-1">
          <li>
            • Usa <strong>presets</strong> para cambios rápidos según el
            contexto
          </li>
          <li>
            • Usa <strong>quickConfig</strong> para cambios de una línea
          </li>
          <li>
            • Configura <strong>itemsPerPage</strong> según tu caso de uso
            (10-100)
          </li>
          <li>
            • Activa <strong>instantSearch</strong> para mejor UX (si tienes
            pocos usuarios)
          </li>
          <li>
            • Desactiva <strong>avatares</strong> para mejor rendimiento
          </li>
          <li>
            • Usa <strong>vista compacta</strong> para ver más usuarios
          </li>
          <li>
            • Activa <strong>filtros</strong> solo si los necesitas
          </li>
        </ul>
      </div>
    </div>
  );
}
