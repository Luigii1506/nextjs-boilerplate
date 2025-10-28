"use client";
/**
 * 📑 POS Tab Content
 * ==================
 *
 * Contenedor de tabs del POS siguiendo patrón SPA.
 * Todos los tabs están siempre montados, solo cambia la visibilidad.
 *
 * @module pos/ui/components/layout/POSTabContent
 * @version 1.0.0
 */

import React from "react";
import { usePOSUI } from "../../../context";
import { BrowseTab } from "../../features/browse/BrowseTab";
import { SaleTab } from "../../features/sale/SaleTab";
import { PaymentTab } from "../../features/payment/PaymentTab";
import { HistoryTab } from "../../features/history/HistoryTab";

export const POSTabContent: React.FC = () => {
  const { activeTab } = usePOSUI();

  return (
    <div className="relative">
      {/* Browse Tab */}
      <div
        className={`${activeTab === "browse" ? "block" : "hidden"}`}
        data-tab="browse"
      >
        <BrowseTab />
      </div>

      {/* Sale Tab */}
      <div
        className={`${activeTab === "sale" ? "block" : "hidden"}`}
        data-tab="sale"
      >
        <SaleTab />
      </div>

      {/* Payment Tab */}
      <div
        className={`${activeTab === "payment" ? "block" : "hidden"}`}
        data-tab="payment"
      >
        <PaymentTab />
      </div>

      {/* History Tab */}
      <div
        className={`${activeTab === "history" ? "block" : "hidden"}`}
        data-tab="history"
      >
        <HistoryTab />
      </div>
    </div>
  );
};
