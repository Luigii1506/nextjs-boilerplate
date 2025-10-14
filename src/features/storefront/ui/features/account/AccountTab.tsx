/**
 * 👤 ACCOUNT TAB - Refactored
 * ===========================
 *
 * Clean, modular account management interface
 * Components are extracted to @/features/storefront/ui/components/account
 *
 * @version 3.0.0 - Modular Architecture
 */

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { User, Settings, ShoppingBag, MapPin, Shield, CreditCard } from "lucide-react";

// Import Context and Hooks
import { useAuth } from "@/shared/hooks/useAuth";
import { useOrders, type OrderSummary } from "@/features/storefront/orders";
import { useAddresses, type Address as AddressData } from "@/features/storefront/addresses";
import { usePaymentMethods, type PaymentMethod } from "@/features/storefront/payment-methods";

// Import extracted account components
import {
  AccountHeader,
  AccountNavigation,
  AccountStats,
  OrdersSection,
  AddressSection,
  type AccountSection,
  type UserProfile,
} from "../account";
import { PaymentMethodsSection } from "./components/PaymentMethodsSection";

// Account sections configuration
const ACCOUNT_SECTIONS: AccountSection[] = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "orders", label: "Mis Pedidos", icon: ShoppingBag },
  { id: "addresses", label: "Direcciones", icon: MapPin },
  { id: "payment-methods", label: "Métodos de Pago", icon: CreditCard },
  { id: "settings", label: "Configuración", icon: Settings },
  { id: "security", label: "Seguridad", icon: Shield },
];

/**
 * Main AccountTab Component
 */
const AccountTab: React.FC = () => {
  // 🔐 Auth
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // 🎯 State
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [allowAnimations, setAllowAnimations] = useState(false);
  const [activeSection, setActiveSection] =
    useState<AccountSection["id"]>("profile");
  const [isEditing, setIsEditing] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎨 Anti-flicker Animation Setup
  useEffect(() => {
    if (isFirstRender) {
      timeoutRef.current = setTimeout(() => {
        setAllowAnimations(true);
        setIsFirstRender(false);
      }, 100);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isFirstRender]);

  // 📊 User Profile Data
  const userProfile: UserProfile = useMemo(() => {
    if (user) {
      const [firstName, ...lastNameParts] = (user.name || "Usuario").split(" ");
      return {
        id: user.id,
        firstName: firstName || "Usuario",
        lastName: lastNameParts.join(" ") || "",
        email: user.email,
        phone: undefined,
        birthDate: undefined,
        gender: undefined,
        joinDate: user.createdAt ? new Date(user.createdAt) : new Date(),
        tier: "bronze",
      };
    }

    // Fallback mock data
    return {
      id: "mock-user",
      firstName: "Usuario",
      lastName: "Demo",
      email: "demo@example.com",
      joinDate: new Date(),
      tier: "bronze",
    };
  }, [user]);

  // 📦 Orders Data
  const { data: ordersData } = useOrders({
    userId: user?.id || "",
    enabled: !!user?.id,
  });

  const orders: OrderSummary[] = useMemo(() => {
    console.log("🔍 [AccountTab] Orders data:", {
      hasOrdersData: !!ordersData,
      ordersData,
      ordersCount: ordersData?.orders?.length || 0,
      userId: user?.id,
    });
    return ordersData?.orders || [];
  }, [ordersData, user?.id]);

  // 📍 Addresses Data
  const { data: addressesData } = useAddresses();

  const addresses: AddressData[] = useMemo(() => {
    return addressesData?.addresses || [];
  }, [addressesData]);

  // 💳 Payment Methods Data
  const { data: paymentMethodsData } = usePaymentMethods();

  const paymentMethods: PaymentMethod[] = useMemo(() => {
    return paymentMethodsData?.paymentMethods || [];
  }, [paymentMethodsData]);

  // 🚫 Show login prompt if not authenticated
  if (!isAuthenticated && !isAuthLoading) {
    return <AccountLoginPrompt />;
  }

  // ⏳ Show loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando tu cuenta...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <AccountHeader user={userProfile} allowAnimations={allowAnimations} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <AccountStats
          orders={orders}
          addresses={addresses}
          paymentMethods={paymentMethods}
          user={userProfile}
          allowAnimations={allowAnimations}
        />

        {/* Account Sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <AccountNavigation
            sections={ACCOUNT_SECTIONS}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            allowAnimations={allowAnimations}
          />

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AccountContent
              activeSection={activeSection}
              user={userProfile}
              orders={orders}
              addresses={addresses}
              paymentMethods={paymentMethods}
              isEditing={isEditing}
              onEditToggle={setIsEditing}
              allowAnimations={allowAnimations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Login Prompt Component
 */
const AccountLoginPrompt: React.FC = () => {
  const handleLogin = () => {
    // Navigate to login (implement your navigation logic)
    window.location.href = "/api/auth/signin";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <User className="w-24 h-24 text-gray-400 mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Accede a Tu Cuenta
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Inicia sesión para ver tu perfil, pedidos y configuración en un solo
          lugar
        </p>
        <button
          onClick={handleLogin}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
        >
          <User className="w-5 h-5" />
          <span>Acceder a Mi Cuenta</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Account Content Component
 * Renders the appropriate section based on activeSection
 */
interface AccountContentProps {
  activeSection: AccountSection["id"];
  user: UserProfile;
  orders: OrderSummary[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  allowAnimations: boolean;
}

const AccountContent: React.FC<AccountContentProps> = ({
  activeSection,
  user,
  orders,
  addresses,
  paymentMethods,
  isEditing,
  onEditToggle,
  allowAnimations,
}) => {
  switch (activeSection) {
    case "profile":
      return (
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8",
            allowAnimations && "animate-customerFadeInUp"
          )}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Mi Perfil
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre Completo
              </label>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="text-lg text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Perfil completo disponible próximamente
            </p>
          </div>
        </div>
      );

    case "orders":
      return <OrdersSection orders={orders} allowAnimations={allowAnimations} />;

    case "addresses":
      return <AddressSection addresses={addresses} allowAnimations={allowAnimations} />;

    case "payment-methods":
      return <PaymentMethodsSection paymentMethods={paymentMethods} allowAnimations={allowAnimations} />;

    case "settings":
      return (
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8",
            allowAnimations && "animate-customerFadeInUp"
          )}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Configuración
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Opciones de configuración disponibles próximamente
          </p>
        </div>
      );

    case "security":
      return (
        <div
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8",
            allowAnimations && "animate-customerFadeInUp"
          )}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Seguridad
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Opciones de seguridad disponibles próximamente
          </p>
        </div>
      );

    default:
      return null;
  }
};

export default AccountTab;
