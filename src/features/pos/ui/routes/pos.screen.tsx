/**
 * 🏪 POS SPA SCREEN
 * =================
 *
 * Single Page Application for POS (Point of Sale)
 * Clean, modular architecture following storefront pattern
 *
 * @version 1.0.0
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { POSUIProvider } from "../../context";
import { PaymentProvider } from "../../payment";
import { SaleProvider } from "../../sale";
import {
  POSHeader,
  POSNavigation,
  POSTabContent,
  POSFooter,
} from "../components/layout";
import { SessionGuard } from "../components/SessionGuard";
import { OpenSessionModal, CloseSessionModal } from "../components/modals";
import { usePOSUI } from "../../context";

/**
 * Main SPA Content
 */
const POSSPAContent: React.FC = () => {
  const { state, closeSessionModal, closeCloseSessionModal } = usePOSUI();

  return (
    <>
      {/* Session Guard - Blocks access without active session */}
      <SessionGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <POSHeader />
          <POSNavigation />

          <main className="flex-1 bg-gray-50 dark:bg-gray-900">
            <POSTabContent />
          </main>

          <POSFooter />

          {/* Debug Panels - Only in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="fixed bottom-4 right-4 z-50">
              {/* TODO: Add debug panel if needed */}
            </div>
          )}
        </div>
      </SessionGuard>

      {/* Session Modals */}
      <OpenSessionModal
        isOpen={state.isSessionModalOpen}
        onClose={closeSessionModal}
      />
      <CloseSessionModal
        isOpen={state.isCloseSessionModalOpen}
        onClose={closeCloseSessionModal}
      />
    </>
  );
};

/**
 * Main Exported Component (with Providers)
 */
interface POSScreenProps {
  className?: string;
}

const POSScreen: React.FC<POSScreenProps> = ({ className }) => {
  return (
    <div className={cn("w-full", className)}>
      <SaleProvider>
        <PaymentProvider>
          <POSUIProvider>
            <POSSPAContent />
          </POSUIProvider>
        </PaymentProvider>
      </SaleProvider>
    </div>
  );
};

export default POSScreen;
