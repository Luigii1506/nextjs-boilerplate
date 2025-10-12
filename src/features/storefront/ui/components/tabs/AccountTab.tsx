/**
 * 👤 AccountTab - Professional E-commerce Account Management
 *
 * Amazon Prime-inspired account dashboard with:
 * - Complete profile management
 * - Order history and tracking
 * - Address management
 * - Account settings
 * - Security preferences
 * - Beautiful animations
 * - Responsive design
 *
 * @version 2.0.0
 * @author Storefront Team
 */

"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";
import {
  User,
  Settings,
  ShoppingBag,
  MapPin,
  Shield,
  Truck,
  Calendar,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Award,
  Mail,
  Phone,
  Home,
  Building,
  Globe,
} from "lucide-react";

// Import Context and Types
import { useAuth } from "@/shared/hooks/useAuth";
import { useOrders } from "@/features/orders";

// Define interfaces for account management
interface AccountSection {
  id: "profile" | "orders" | "addresses" | "settings" | "security";
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  avatar?: string;
  joinDate: Date;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

interface Order {
  id: string;
  number: string;
  date: Date;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  category: string;
}

interface Address {
  id: string;
  type: "shipping" | "billing";
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

const ACCOUNT_SECTIONS: AccountSection[] = [
  { id: "profile", label: "Mi Perfil", icon: User },
  { id: "orders", label: "Mis Pedidos", icon: ShoppingBag, badge: 3 },
  { id: "addresses", label: "Direcciones", icon: MapPin },
  { id: "settings", label: "Configuración", icon: Settings },
  { id: "security", label: "Seguridad", icon: Shield },
];

/**
 * 👤 Main AccountTab Component
 */
const AccountTab: React.FC = () => {
  // 🔐 Auth Hook - Better Auth Integration
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // 🎯 Component State
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

  // 📊 User Profile Data - Real or Mock
  const userProfile: UserProfile = useMemo(() => {
    if (user) {
      // Use real user data from Better Auth
      const [firstName, ...lastNameParts] = (user.name || "Usuario").split(" ");
      return {
        id: user.id,
        firstName: firstName || "Usuario",
        lastName: lastNameParts.join(" ") || "",
        email: user.email,
        phone: user.phone || undefined,
        birthDate: undefined, // Not available in Better Auth by default
        gender: undefined, // Not available in Better Auth by default
        joinDate: user.createdAt ? new Date(user.createdAt) : new Date(),
        tier: "bronze", // Default tier, can be fetched from user metadata
      };
    }

    // Fallback mock data for development
    return {
      id: "mock-user-1",
      firstName: "Ana",
      lastName: "García",
      email: "ana.garcia@email.com",
      phone: "+34 666 123 456",
      birthDate: "1990-05-15",
      gender: "female",
      joinDate: new Date("2023-01-15"),
      tier: "gold",
    };
  }, [user]);

  // 📦 Fetch Real Orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
  } = useOrders({
    userId: user?.id || "",
    enabled: !!user?.id,
  });

  // 🔄 Map API orders to AccountTab Order format
  const orders: Order[] = useMemo(() => {
    if (!ordersData?.orders || ordersData.orders.length === 0) {
      // Return empty array if no orders, mock data will be used as fallback if needed
      return [];
    }

    // Map OrderSummary to AccountTab Order interface
    return ordersData.orders.map((apiOrder) => {
      // Map status from database enum to AccountTab status
      const statusMap: Record<
        string,
        "pending" | "processing" | "shipped" | "delivered" | "cancelled"
      > = {
        PENDING: "pending",
        CONFIRMED: "processing",
        PROCESSING: "processing",
        SHIPPED: "shipped",
        DELIVERED: "delivered",
        CANCELLED: "cancelled",
        REFUNDED: "cancelled",
      };

      return {
        id: apiOrder.id,
        number: apiOrder.number,
        date: new Date(apiOrder.placedAt),
        status: statusMap[apiOrder.status] || "pending",
        total: apiOrder.total,
        items: [], // Summary doesn't include items, will be loaded on demand
        shippingAddress: {
          id: "temp",
          type: "shipping",
          label: "Dirección de envío",
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
          isDefault: false,
        },
        estimatedDelivery: apiOrder.estimatedDelivery
          ? new Date(apiOrder.estimatedDelivery)
          : undefined,
      };
    });
  }, [ordersData, userProfile]);

  // 📊 Mock orders data (fallback for development/empty state)
  const mockOrders: Order[] = useMemo(
    () => [
      {
        id: "order-1",
        number: "SP-2025-001",
        date: new Date("2025-01-15"),
        status: "delivered",
        total: 1299,
        trackingNumber: "SP123456789",
        estimatedDelivery: new Date("2025-01-20"),
        items: [
          {
            id: "item-1",
            name: "iPhone 15 Pro",
            price: 1199,
            quantity: 1,
            category: "Electrónicos",
          },
          {
            id: "item-2",
            name: "Funda iPhone",
            price: 100,
            quantity: 1,
            category: "Accesorios",
          },
        ],
        shippingAddress: {
          id: "addr-1",
          type: "shipping",
          label: "Casa",
          firstName: "Ana",
          lastName: "García",
          street: "Calle Mayor 123",
          city: "Madrid",
          state: "Madrid",
          zipCode: "28001",
          country: "España",
          phone: "+34 666 123 456",
          isDefault: true,
        },
      },
      {
        id: "order-2",
        number: "SP-2025-002",
        date: new Date("2025-01-10"),
        status: "shipped",
        total: 849,
        trackingNumber: "SP987654321",
        estimatedDelivery: new Date("2025-01-18"),
        items: [
          {
            id: "item-3",
            name: "MacBook Air M2",
            price: 849,
            quantity: 1,
            category: "Computadoras",
          },
        ],
        shippingAddress: {
          id: "addr-1",
          type: "shipping",
          label: "Casa",
          firstName: "Ana",
          lastName: "García",
          street: "Calle Mayor 123",
          city: "Madrid",
          state: "Madrid",
          zipCode: "28001",
          country: "España",
          phone: "+34 666 123 456",
          isDefault: true,
        },
      },
      {
        id: "order-3",
        number: "SP-2025-003",
        date: new Date("2025-01-05"),
        status: "processing",
        total: 299,
        estimatedDelivery: new Date("2025-01-19"),
        items: [
          {
            id: "item-4",
            name: "Auriculares Sony",
            price: 299,
            quantity: 1,
            category: "Audio",
          },
        ],
        shippingAddress: {
          id: "addr-1",
          type: "shipping",
          label: "Casa",
          firstName: "Ana",
          lastName: "García",
          street: "Calle Mayor 123",
          city: "Madrid",
          state: "Madrid",
          zipCode: "28001",
          country: "España",
          phone: "+34 666 123 456",
          isDefault: true,
        },
      },
    ],
    []
  );

  // 📊 Mock addresses data
  const mockAddresses: Address[] = useMemo(
    () => [
      {
        id: "addr-1",
        type: "shipping",
        label: "Casa",
        firstName: "Ana",
        lastName: "García",
        street: "Calle Mayor 123, 2º A",
        city: "Madrid",
        state: "Madrid",
        zipCode: "28001",
        country: "España",
        phone: "+34 666 123 456",
        isDefault: true,
      },
      {
        id: "addr-2",
        type: "shipping",
        label: "Oficina",
        firstName: "Ana",
        lastName: "García",
        street: "Av. de la Castellana 200",
        city: "Madrid",
        state: "Madrid",
        zipCode: "28046",
        country: "España",
        phone: "+34 911 234 567",
        isDefault: false,
      },
    ],
    []
  );

  // 🎯 Section Navigation Handler
  const handleSectionChange = useCallback((sectionId: AccountSection["id"]) => {
    setActiveSection(sectionId);
    setIsEditing(false); // Reset editing state when changing sections
  }, []);

  // 🔐 Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full animate-pulse flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Verificando sesión...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Por favor espera un momento
          </p>
        </div>
      </div>
    );
  }

  // 🔐 Login Required Check
  if (!isAuthenticated || !user) {
    return <AccountLoginPrompt />;
  }

  // Loading State for empty first render
  if (isFirstRender) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full animate-pulse flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cargando Cuenta...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Preparando tu información personal
          </p>
        </div>
      </div>
    );
  }

  // 📊 Determine which orders to display (real or mock)
  const displayOrders = orders.length > 0 ? orders : mockOrders;

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Account Header */}
      <AccountHeader user={userProfile} allowAnimations={allowAnimations} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Stats */}
        <AccountStats
          orders={displayOrders}
          addresses={mockAddresses}
          user={userProfile}
          allowAnimations={allowAnimations}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar Navigation */}
          <AccountNavigation
            sections={ACCOUNT_SECTIONS}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            allowAnimations={allowAnimations}
          />

          {/* Account Content */}
          <div className="flex-1">
            {ordersLoading && activeSection === "orders" ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Cargando pedidos...
                  </span>
                </div>
              </div>
            ) : (
              <AccountContent
                activeSection={activeSection}
                user={userProfile}
                orders={displayOrders}
                addresses={mockAddresses}
                isEditing={isEditing}
                onEditToggle={setIsEditing}
                allowAnimations={allowAnimations}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔐 Account Login Prompt Component
const AccountLoginPrompt: React.FC = () => {
  const handleLogin = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="min-h-[60vh] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full flex items-center justify-center mx-auto">
          <User className="w-12 h-12 text-orange-500 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Inicia Sesión para Acceder a tu Cuenta
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Gestiona tu perfil, pedidos, direcciones y configuración desde un
            solo lugar
          </p>
        </div>
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

// 🎯 Account Header Component
interface AccountHeaderProps {
  user: UserProfile;
  allowAnimations: boolean;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({
  user,
  allowAnimations,
}) => {
  const getTierColor = (tier: UserProfile["tier"]) => {
    switch (tier) {
      case "platinum":
        return "from-purple-600 to-indigo-600";
      case "gold":
        return "from-yellow-500 to-orange-500";
      case "silver":
        return "from-gray-400 to-gray-500";
      default:
        return "from-amber-700 to-orange-700";
    }
  };

  const getTierLabel = (tier: UserProfile["tier"]) => {
    switch (tier) {
      case "platinum":
        return "Platino";
      case "gold":
        return "Oro";
      case "silver":
        return "Plata";
      default:
        return "Bronce";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className={cn(
            "space-y-4",
            allowAnimations && "animate-customerFadeInUp"
          )}
        >
          {/* User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>

              {/* User Details */}
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {user.firstName} {user.lastName}
                  </h1>
                  {/* Tier Badge */}
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r",
                      getTierColor(user.tier)
                    )}
                  >
                    {getTierLabel(user.tier)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Miembro desde{" "}
                  {user.joinDate.toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Editar Perfil</span>
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  ¡Bienvenida de vuelta, {user.firstName}!
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Tienes 2 pedidos en camino y 5 productos en tu wishlist
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 📊 Account Stats Component
interface AccountStatsProps {
  orders: Order[];
  addresses: Address[];
  user: UserProfile;
  allowAnimations: boolean;
}

const AccountStats: React.FC<AccountStatsProps> = ({
  orders,
  addresses,
  user: _user,
  allowAnimations,
}) => {
  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(
      (order) => order.status === "processing" || order.status === "shipped"
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    return {
      totalSpent,
      pendingOrders,
      completedOrders,
      totalAddresses: addresses.length,
    };
  }, [orders, addresses]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Total Spent */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              €{stats.totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Total Gastado
            </p>
          </div>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.pendingOrders}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Pedidos Pendientes
            </p>
          </div>
        </div>
      </div>

      {/* Completed Orders */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.completedOrders}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Pedidos Completados
            </p>
          </div>
        </div>
      </div>

      {/* Saved Addresses */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalAddresses}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Direcciones Guardadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🧭 Account Navigation Sidebar
interface AccountNavigationProps {
  sections: AccountSection[];
  activeSection: AccountSection["id"];
  onSectionChange: (sectionId: AccountSection["id"]) => void;
  allowAnimations: boolean;
}

const AccountNavigation: React.FC<AccountNavigationProps> = ({
  sections,
  activeSection,
  onSectionChange,
  allowAnimations,
}) => {
  return (
    <div
      className={cn(
        "w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm h-fit",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* Navigation Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span>Mi Cuenta</span>
        </h3>
      </div>

      {/* Navigation Items */}
      <div className="p-4">
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-left",
                  isActive
                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  />
                  <span className="font-medium">{section.label}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {section.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      {section.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isActive ? "rotate-90 text-orange-600" : "text-gray-400"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// 📄 Account Content Component
interface AccountContentProps {
  activeSection: AccountSection["id"];
  user: UserProfile;
  orders: Order[];
  addresses: Address[];
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  allowAnimations: boolean;
}

const AccountContent: React.FC<AccountContentProps> = ({
  activeSection,
  user,
  orders,
  addresses,
  isEditing,
  onEditToggle,
  allowAnimations,
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            user={user}
            isEditing={isEditing}
            onEditToggle={onEditToggle}
            allowAnimations={allowAnimations}
          />
        );
      case "orders":
        return (
          <OrdersSection orders={orders} allowAnimations={allowAnimations} />
        );
      case "addresses":
        return (
          <AddressesSection
            addresses={addresses}
            allowAnimations={allowAnimations}
          />
        );
      case "settings":
        return <SettingsSection allowAnimations={allowAnimations} />;
      case "security":
        return <SecuritySection allowAnimations={allowAnimations} />;
      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

// 👤 Profile Section Component
interface ProfileSectionProps {
  user: UserProfile;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  allowAnimations: boolean;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  isEditing,
  onEditToggle,
  allowAnimations,
}) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || "",
    birthDate: user.birthDate || "",
    gender: user.gender || "prefer_not_to_say",
  });

  const handleSave = useCallback(() => {
    // TODO: Implement API call to save profile
    console.log("Saving profile:", formData);
    onEditToggle(false);
  }, [formData, onEditToggle]);

  const handleCancel = useCallback(() => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      birthDate: user.birthDate || "",
      gender: user.gender || "prefer_not_to_say",
    });
    onEditToggle(false);
  }, [user, onEditToggle]);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm",
        allowAnimations && "animate-customerFadeInUp"
      )}
    >
      {/* Section Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Información Personal
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona tu información personal y preferencias de cuenta
            </p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSave}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onEditToggle(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                {user.firstName}
              </div>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Apellidos
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                {user.lastName}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{user.email}</span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+34 666 123 456"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{user.phone || "No especificado"}</span>
              </div>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Nacimiento
            </label>
            {isEditing ? (
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>
                  {user.birthDate
                    ? new Date(user.birthDate).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No especificado"}
                </span>
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Género
            </label>
            {isEditing ? (
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender:
                      (e.target.value as UserProfile["gender"]) ||
                      "prefer_not_to_say",
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer_not_to_say">Prefiero no decir</option>
              </select>
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
                {user.gender === "male"
                  ? "Masculino"
                  : user.gender === "female"
                  ? "Femenino"
                  : user.gender === "other"
                  ? "Otro"
                  : "Prefiero no decir"}
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
            Estado de la Cuenta
          </h3>
          <div className="flex items-center space-x-4 text-sm text-orange-700 dark:text-orange-300">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Email verificado</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>Miembro {user.tier === "gold" ? "Oro" : "Bronce"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Miembro desde {user.joinDate.getFullYear()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🛍️ Orders Section Component
interface OrdersSectionProps {
  orders: Order[];
  allowAnimations: boolean;
}

const OrdersSection: React.FC<OrdersSectionProps> = ({
  orders,
  allowAnimations,
}) => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "shipped":
        return "Enviado";
      case "processing":
        return "En proceso";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Historial de Pedidos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consulta el estado de tus pedidos y tracking
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Pedido {order.number}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.date.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      getStatusColor(order.status)
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    €{order.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.items.length} artículo
                    {order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4" />
                      <span>
                        {order.trackingNumber
                          ? `Tracking: ${order.trackingNumber}`
                          : "Sin número de tracking"}
                      </span>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Estimado:{" "}
                          {order.estimatedDelivery.toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                      >
                        {item.name} ({item.quantity})
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{order.items.length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                    Ver Detalles
                  </button>
                  {order.status === "delivered" && (
                    <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm">
                      Repetir Pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 📍 Addresses Section Component
interface AddressesSectionProps {
  addresses: Address[];
  allowAnimations: boolean;
}

const AddressesSection: React.FC<AddressesSectionProps> = ({
  addresses,
  allowAnimations,
}) => {
  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Direcciones de Envío
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestiona tus direcciones de envío y facturación
              </p>
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nueva Dirección</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative"
              >
                {address.isDefault && (
                  <div className="absolute top-2 right-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                    Por defecto
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      {address.type === "shipping" ? (
                        <Home className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <Building className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {address.label}
                    </h3>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {address.firstName} {address.lastName}
                  </p>
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p>{address.country}</p>
                  {address.phone && <p>📞 {address.phone}</p>}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors text-sm flex items-center space-x-1">
                    <Edit3 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  {!address.isDefault && (
                    <button className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors text-sm flex items-center space-x-1">
                      <Trash2 className="w-3 h-3" />
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ⚙️ Settings Section Component
interface SettingsSectionProps {
  allowAnimations: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  allowAnimations,
}) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    orderUpdates: true,
    newsletter: false,
    darkMode: false,
    language: "es",
    currency: "EUR",
  });

  const handleSettingChange = (
    key: keyof typeof settings,
    value: boolean | string
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Configuración de Cuenta
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personaliza tu experiencia de compra
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Notificaciones
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notificaciones por Email
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recibe updates sobre tus pedidos
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    handleSettingChange("emailNotifications", e.target.checked)
                  }
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notificaciones SMS
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recibe mensajes de texto sobre tus pedidos
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) =>
                    handleSettingChange("smsNotifications", e.target.checked)
                  }
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Emails de Marketing
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ofertas especiales y promociones
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) =>
                    handleSettingChange("marketingEmails", e.target.checked)
                  }
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Preferencias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingChange("language", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    handleSettingChange("currency", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔒 Security Section Component
interface SecuritySectionProps {
  allowAnimations: boolean;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  allowAnimations,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Seguridad de la Cuenta
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mantén tu cuenta segura actualizando tu contraseña
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Change Password */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Cambiar Contraseña
            </h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors">
                Actualizar Contraseña
              </button>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Autenticación de Dos Factores
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Protege tu cuenta con 2FA
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Añade una capa extra de seguridad a tu cuenta activando la
                    autenticación de dos factores.
                  </p>
                  <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Configurar 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Login Activity */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Actividad de Inicio de Sesión
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Sesión actual
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Madrid, España • Ahora
                    </p>
                  </div>
                </div>
                <Globe className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      iPhone • Safari
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Madrid, España • Hace 2 horas
                    </p>
                  </div>
                </div>
                <button className="text-red-600 dark:text-red-400 text-sm hover:underline">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
