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

import React, { useEffect } from "react";
import { cn } from "@/shared/utils";
import { POSUIProvider } from "../../context";
import { useSessionStore } from "../../stores/sessionStore";
import { useSaleStore } from "../../stores/saleStore";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  POSHeader,
  POSNavigation,
  POSTabContent,
  POSFooter,
} from "../components/layout";
import { SessionGuard } from "../components/SessionGuard";
import { OpenSessionModal, CloseSessionModal } from "../components/modals";
import { usePOSUI } from "../../context";
import { ClientOnly } from "../components/ClientOnly";

/**
 * Store Initializer
 * Initializes stores with session data when user is authenticated
 */
const StoreInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentSession = useSessionStore((state) => state.currentSession);
  const setSessionId = useSaleStore((state) => state.setSessionId);

  // Initialize sale store with session ID when session changes
  useEffect(() => {
    if (currentSession?.id) {
      setSessionId(currentSession.id);
    } else {
      setSessionId(null);
    }
  }, [currentSession?.id, setSessionId]);

  return <>{children}</>;
};

/**
 * Main SPA Content
 */
const POSSPAContent: React.FC = () => {
  const { state, closeSessionModal, closeCloseSessionModal } = usePOSUI();

  return (
    <StoreInitializer>
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
    </StoreInitializer>
  );
};

/**
 * Main Exported Component (with POSUIProvider only)
 * Note: Session, Sale, and Payment now use Zustand stores instead of Context Providers
 */
interface POSScreenProps {
  className?: string;
}

const POSScreen: React.FC<POSScreenProps> = ({ className }) => {
  return (
    <div className={cn("w-full", className)}>
      <ClientOnly fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
        <POSUIProvider>
          <POSSPAContent />
        </POSUIProvider>
      </ClientOnly>
    </div>
  );
};

export default POSScreen;
