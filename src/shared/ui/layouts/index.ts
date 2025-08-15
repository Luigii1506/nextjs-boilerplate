// 🎨 Shared UI Layouts Barrel
// ===========================
// Entry point para layouts compartidos

// Legacy Client Component version (for migration)
export { default as AdminShell } from "./AdminShell";

// 🏢 Enterprise Server Component version (recommended)
export { default as AdminShellServer } from "./AdminShellServer";

// 🚀 Pure Server Actions version (best performance)
export { default as AdminShellPure } from "./AdminShellPure";

// Individual components
export * from "./components";
