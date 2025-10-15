/**
 * 📄 SELLER PORTAL PAGE
 * =====================
 *
 * Next.js page for Seller Portal
 * Route: /seller-portal
 *
 * Created: 2025-01-17 - Seller Portal Implementation
 */

import { SellerPortalScreen } from "@/features/seller-portal/ui/routes/seller-portal.screen";

export const metadata = {
  title: "Portal de Ventas | Seller Portal",
  description: "Gestiona tus órdenes, productos y promociones",
};

export default function SellerPortalPage() {
  return <SellerPortalScreen />;
}
