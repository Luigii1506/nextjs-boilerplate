// // scripts/new-module.ts
// import { mkdirSync, writeFileSync } from "fs";
// import { join } from "path";

// const name = process.argv[2];
// if (!name) {
//   console.error("Usage: pnpm new:module <name>");
//   process.exit(1);
// }

// const base = join(process.cwd(), "src/modules", name);
// const dirs = ["components", "hooks", "services", "types", "config", "utils"];
// dirs.forEach((d) => mkdirSync(join(base, d), { recursive: true }));

// const index = `// ${name} module
// export * from "./components";
// export * from "./hooks";
// export * from "./services";
// export * from "./types";
// `;
// writeFileSync(join(base, "index.ts"), index);

// writeFileSync(
//   join(base, "components", `${capitalize(name)}View.tsx`),
//   `\"use client\";
// import React from "react";
// export default function ${capitalize(name)}View(){return <div>${name} works</div>;}`
// );

// writeFileSync(
//   join(base, "types", "index.ts"),
//   `export interface ${capitalize(name)}Item { id: string }`
// );

// console.log(\`✅ Module created at src/modules/${name}\`);

// function capitalize(s:string){return s.charAt(0).toUpperCase()+s.slice(1)}
