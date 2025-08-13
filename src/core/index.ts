// 🏗️ CORE INDEX
// =============
// Exportaciones centralizadas de todos los módulos del core del sistema

// 🎛️ Administration - Features moved to src/features/admin/

// 🔧 Configuration (feature flags, environment, modules)
export * from "./config";

// 🧩 Components - Auth components moved to core/auth/components

// 🔐 Auth Core (solo exports públicos)
// export * from "./auth";  // Descomenta cuando tengas exports públicos

// 🗃️ Database (solo si necesitas exports públicos)
// export * from "./database";  // Por ejemplo, para tipos de Prisma
