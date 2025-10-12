/**
 * 🔄 LOADING SCREEN COMPONENT
 * ==========================
 *
 * Componente reutilizable para estados de carga en páginas de autenticación
 * y otras vistas que requieren verificación de estado.
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <LoadingScreen message="Verificando autenticación..." />;
 * }
 * ```
 */

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = "Cargando...",
  fullScreen = true,
}: LoadingScreenProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

