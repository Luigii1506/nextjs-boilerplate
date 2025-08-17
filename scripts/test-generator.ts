#!/usr/bin/env tsx
/**
 * 🧪 TEST ENTERPRISE MODULE GENERATOR
 * ===================================
 *
 * Script para probar rápidamente el generador de módulos.
 * Crea un módulo de ejemplo para verificar que todo funciona.
 *
 * Usage: npm run test:generator
 */

import { generateModule } from "./generate-module";
import chalk from "chalk";

console.log(
  chalk.bold.blue(`
🧪 TESTING ENTERPRISE MODULE GENERATOR
======================================

Este script te permitirá probar el generador de módulos.
¡Sigue las instrucciones para crear un módulo de ejemplo!

`)
);

generateModule()
  .then(() => {
    console.log(
      chalk.bold.green(`
✅ ¡GENERADOR PROBADO EXITOSAMENTE!

El generador funcionó correctamente. Ahora puedes:

1. Revisar el módulo generado
2. Probar el hook en un componente
3. Verificar la integración con navegación
4. Personalizar según tus necesidades

¿Quieres generar otro módulo? Ejecuta:
npm run generate:module

`)
    );
  })
  .catch((error) => {
    console.error(
      chalk.red(`
❌ ERROR EN EL GENERADOR:
${error.message}

Por favor revisa la configuración y vuelve a intentar.
`)
    );
    process.exit(1);
  });

