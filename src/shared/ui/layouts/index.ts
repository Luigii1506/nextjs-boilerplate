// 🎨 Shared UI Layouts Barrel
// ===========================
// Entry point para layouts compartidos

// Legacy Client Component version (for migration)
export { default as AdminShell } from "./AdminShell";

// 🏢 Enterprise Server Component version (recommended)
export { default as AdminShellServer } from "./AdminShellServer";

// Individual components
export * from "./components";
