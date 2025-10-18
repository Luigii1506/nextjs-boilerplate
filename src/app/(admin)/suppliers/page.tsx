/**
 * 🏢 SUPPLIERS PAGE
 * ================
 *
 * Next.js App Router page para el módulo de suppliers
 * Página principal del centro de gestión de proveedores
 *
 * Created: 2025-01-18 - Suppliers Management Module
 */

import { Metadata } from "next";
import { SuppliersScreen } from "@/features/suppliers";

export const metadata: Metadata = {
  title: "Proveedores | Dashboard",
  description:
    "Centro de gestión completo de proveedores, órdenes de compra y analytics",
};

export default function SuppliersPage() {
  return <SuppliersScreen />;
}
