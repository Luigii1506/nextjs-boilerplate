/**
 * 🎯 USERS ROUTES - BARREL EXPORTS
 * ===============================
 *
 * Exports centralizados para todas las rutas/screens
 * del módulo de gestión de usuarios.
 *
 * Architecture: Clean exports para screens
 *
 * Created: 2025-01-18 - Users SPA Implementation
 */

// Legacy screen (mantener por compatibilidad)
export { default as UsersScreen } from "./users.screen";

// New SPA screen (recommended)
export { default as UsersSPAScreen } from "./users.spa.screen";
