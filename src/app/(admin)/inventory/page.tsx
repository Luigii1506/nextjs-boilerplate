/**
 * 📦 INVENTORY PAGE
 * ================
 *
 * Next.js App Router page para el módulo de inventory
 * Página principal del dashboard de inventario
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { Metadata } from "next";
import { InventoryScreen } from "@/features/inventory";

export const metadata: Metadata = {
  title: "Inventario | Dashboard",
  description:
    "Gestiona tu inventario, productos y proveedores de forma eficiente",
};

export default function InventoryPage() {
  return <InventoryScreen />;
}
