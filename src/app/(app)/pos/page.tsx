/**
 * 🏪 POS Page
 * ===========
 *
 * Página principal del Punto de Venta.
 * Ruta: /pos
 *
 * @version 1.0.0
 */

import { Metadata } from "next";
import POSScreen from "@/features/pos/ui/routes/pos.screen";

export const metadata: Metadata = {
  title: "Punto de Venta - POS",
  description: "Sistema de Punto de Venta para cajeros",
};

export default function POSPage() {
  return <POSScreen />;
}
