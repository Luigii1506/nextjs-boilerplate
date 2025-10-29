/**
 * 🏪 POS Layout
 * =============
 *
 * Layout para las páginas del POS.
 * Maneja metadata y configuración específica.
 *
 * @version 1.0.0
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Punto de Venta - POS",
  description: "Sistema de Punto de Venta para cajeros",
};

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
