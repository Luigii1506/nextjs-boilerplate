/**
 * 🛠️ SupportTab - Professional Customer Support Center
 *
 * Zendesk/Intercom-inspired support system with:
 * - Interactive FAQ with search
 * - Live chat interface
 * - Ticket system with history
 * - Help categories organized
 * - Multiple contact options
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
  HelpCircle,
  MessageCircle,
  Ticket,
  BookOpen,
  Phone,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Tag,
  ExternalLink,
  Star,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Headphones,
  Zap,
  Shield,
  CreditCard,
  Package,
  ArrowRight,
  Plus,
  Filter,
  SortDesc,
  Eye,
  Building,
} from "lucide-react";

// Import Context and Types
import { useStorefrontContext } from "../../..";

// Define interfaces for support system
interface SupportSection {
  id: "faq" | "chat" | "tickets" | "categories" | "contact";
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  isExpanded?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  message: string;
  timestamp: Date;
  type: "text" | "image" | "file";
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdAt: Date;
  updatedAt: Date;
  agent?: string;
  messages: ChatMessage[];
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  articleCount: number;
  color: string;
  popular: boolean;
}

const SUPPORT_SECTIONS: SupportSection[] = [
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "chat", label: "Chat en Vivo", icon: MessageCircle, badge: 1 },
  { id: "tickets", label: "Mis Tickets", icon: Ticket, badge: 2 },
  { id: "categories", label: "Categorías", icon: BookOpen },
  { id: "contact", label: "Contacto", icon: Phone },
];

/**
 * 🛠️ Main SupportTab Component
 */
const SupportTab: React.FC = () => {
  const { customer, openLoginModal } = useStorefrontContext();

  // 🎯 Component State
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [allowAnimations, setAllowAnimations] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SupportSection["id"]>("faq");
  const [searchTerm, setSearchTerm] = useState("");

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

  // 📊 Mock FAQ data
  const mockFAQs: FAQItem[] = useMemo(
    () => [
      {
        id: "faq-1",
        question: "¿Cómo puedo rastrear mi pedido?",
        answer:
          "Puedes rastrear tu pedido desde la sección 'Mis Pedidos' en tu cuenta. También recibirás un email con el número de tracking una vez que tu pedido sea enviado. Simplemente haz clic en el enlace de seguimiento o introduce el número en nuestra página de rastreo.",
        category: "Pedidos",
        views: 1250,
        helpful: 45,
        notHelpful: 3,
        tags: ["tracking", "pedidos", "envío"],
      },
      {
        id: "faq-2",
        question: "¿Cuál es la política de devoluciones?",
        answer:
          "Ofrecemos devoluciones gratuitas dentro de 30 días de la compra. Los artículos deben estar en condición original con etiquetas. Para iniciar una devolución, ve a 'Mis Pedidos' y selecciona 'Devolver artículo'. Te proporcionaremos una etiqueta de envío gratuita.",
        category: "Devoluciones",
        views: 980,
        helpful: 67,
        notHelpful: 5,
        tags: ["devoluciones", "política", "reembolso"],
      },
      {
        id: "faq-3",
        question: "¿Qué métodos de pago aceptan?",
        answer:
          "Aceptamos todas las tarjetas de crédito principales (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, y transferencias bancarias. Todos los pagos son seguros y encriptados con tecnología SSL.",
        category: "Pagos",
        views: 756,
        helpful: 32,
        notHelpful: 2,
        tags: ["pagos", "tarjetas", "seguridad"],
      },
      {
        id: "faq-4",
        question: "¿Hacen envíos internacionales?",
        answer:
          "Sí, enviamos a más de 50 países. Los costos y tiempos de envío varían según el destino. Puedes ver las opciones de envío disponibles durante el checkout. Los pedidos internacionales pueden estar sujetos a aranceles y tasas locales.",
        category: "Envíos",
        views: 623,
        helpful: 28,
        notHelpful: 1,
        tags: ["envíos", "internacional", "costos"],
      },
      {
        id: "faq-5",
        question: "¿Cómo puedo cambiar o cancelar mi pedido?",
        answer:
          "Puedes cambiar o cancelar tu pedido hasta 1 hora después de realizarlo, siempre que no haya sido enviado. Ve a 'Mis Pedidos', selecciona el pedido y elige 'Modificar' o 'Cancelar'. Si ya fue enviado, puedes iniciarlo como devolución una vez recibido.",
        category: "Pedidos",
        views: 892,
        helpful: 41,
        notHelpful: 7,
        tags: ["cancelar", "modificar", "pedidos"],
      },
    ],
    []
  );

  // 📊 Mock tickets data
  const mockTickets: SupportTicket[] = useMemo(
    () => [
      {
        id: "ticket-001",
        subject: "Producto defectuoso recibido",
        description: "Recibí un iPhone con la pantalla agrietada",
        status: "pending",
        priority: "high",
        category: "Calidad del Producto",
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-16"),
        agent: "María González",
        messages: [
          {
            id: "msg-1",
            sender: "user",
            message:
              "Hola, recibí mi pedido pero el iPhone tiene la pantalla agrietada. ¿Pueden ayudarme?",
            timestamp: new Date("2025-01-15T10:30:00"),
            type: "text",
          },
          {
            id: "msg-2",
            sender: "agent",
            message:
              "Hola Ana, lamento mucho este inconveniente. Vamos a enviarle un reemplazo inmediatamente. ¿Podría enviarme fotos del daño?",
            timestamp: new Date("2025-01-16T09:15:00"),
            type: "text",
          },
        ],
      },
      {
        id: "ticket-002",
        subject: "Problema con el pago",
        description: "Mi tarjeta fue rechazada pero el dinero fue debitado",
        status: "resolved",
        priority: "medium",
        category: "Pagos",
        createdAt: new Date("2025-01-10"),
        updatedAt: new Date("2025-01-12"),
        agent: "Carlos Ruiz",
        messages: [
          {
            id: "msg-3",
            sender: "user",
            message:
              "Mi pago fue rechazado pero veo el cargo en mi cuenta bancaria",
            timestamp: new Date("2025-01-10T14:20:00"),
            type: "text",
          },
          {
            id: "msg-4",
            sender: "agent",
            message:
              "He verificado su cuenta y el reembolso ya fue procesado. Debería ver el dinero en 3-5 días hábiles.",
            timestamp: new Date("2025-01-12T11:45:00"),
            type: "text",
          },
        ],
      },
    ],
    []
  );

  // 📊 Mock help categories
  const mockCategories: HelpCategory[] = useMemo(
    () => [
      {
        id: "orders",
        name: "Pedidos y Envíos",
        description: "Todo sobre tu pedido, tracking, envíos y entregas",
        icon: Package,
        articleCount: 23,
        color: "from-blue-500 to-cyan-500",
        popular: true,
      },
      {
        id: "payments",
        name: "Pagos y Facturación",
        description: "Métodos de pago, facturas y problemas de cobro",
        icon: CreditCard,
        articleCount: 15,
        color: "from-green-500 to-emerald-500",
        popular: true,
      },
      {
        id: "returns",
        name: "Devoluciones y Reembolsos",
        description: "Políticas de devolución, intercambios y reembolsos",
        icon: ArrowRight,
        articleCount: 12,
        color: "from-orange-500 to-red-500",
        popular: false,
      },
      {
        id: "account",
        name: "Mi Cuenta",
        description: "Gestión de perfil, contraseñas y configuración",
        icon: User,
        articleCount: 18,
        color: "from-purple-500 to-pink-500",
        popular: false,
      },
      {
        id: "technical",
        name: "Soporte Técnico",
        description: "Problemas técnicos, errores y funcionamiento",
        icon: Zap,
        articleCount: 9,
        color: "from-yellow-500 to-orange-500",
        popular: false,
      },
      {
        id: "security",
        name: "Seguridad y Privacidad",
        description: "Protección de datos, seguridad y privacidad",
        icon: Shield,
        articleCount: 7,
        color: "from-gray-500 to-slate-500",
        popular: false,
      },
    ],
    []
  );

  // 🎯 Section Navigation Handler
  const handleSectionChange = useCallback((sectionId: SupportSection["id"]) => {
    setActiveSection(sectionId);
    setSearchTerm(""); // Reset search when changing sections
  }, []);

  // Loading State for empty first render
  if (isFirstRender) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-green-600 rounded-full animate-pulse flex items-center justify-center mx-auto">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cargando Centro de Ayuda...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Preparando recursos de soporte
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Support Header */}
      <SupportHeader
        activeSection={activeSection}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        allowAnimations={allowAnimations}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Support Stats */}
        <SupportStats
          faqs={mockFAQs}
          tickets={mockTickets}
          categories={mockCategories}
          allowAnimations={allowAnimations}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar Navigation */}
          <SupportNavigation
            sections={SUPPORT_SECTIONS}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            allowAnimations={allowAnimations}
          />

          {/* Support Content */}
          <div className="flex-1">
            <SupportContent
              activeSection={activeSection}
              searchTerm={searchTerm}
              faqs={mockFAQs}
              tickets={mockTickets}
              categories={mockCategories}
              customer={customer}
              onLoginPrompt={openLoginModal}
              allowAnimations={allowAnimations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Support Header Component
interface SupportHeaderProps {
  activeSection: SupportSection["id"];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  allowAnimations: boolean;
}

const SupportHeader: React.FC<SupportHeaderProps> = ({
  activeSection,
  searchTerm,
  onSearchChange,
  allowAnimations,
}) => {
  const getSectionTitle = (section: SupportSection["id"]) => {
    switch (section) {
      case "faq":
        return "Centro de Preguntas Frecuentes";
      case "chat":
        return "Chat en Vivo";
      case "tickets":
        return "Mis Tickets de Soporte";
      case "categories":
        return "Categorías de Ayuda";
      case "contact":
        return "Información de Contacto";
      default:
        return "Centro de Ayuda";
    }
  };

  const getSectionDescription = (section: SupportSection["id"]) => {
    switch (section) {
      case "faq":
        return "Encuentra respuestas rápidas a las preguntas más comunes";
      case "chat":
        return "Conversa en tiempo real con nuestros especialistas";
      case "tickets":
        return "Gestiona y revisa tus consultas de soporte";
      case "categories":
        return "Explora nuestras guías organizadas por tema";
      case "contact":
        return "Múltiples formas de ponerte en contacto con nosotros";
      default:
        return "Tu centro personalizado de atención al cliente";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className={cn(
            "space-y-6",
            allowAnimations && "animate-customerFadeInUp"
          )}
        >
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Logo Especializado */}
              <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-green-600 rounded-full flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>

              {/* Section Details */}
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {getSectionTitle(activeSection)}
                  </h1>
                  {/* Status Badge */}
                  <div className="px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r from-teal-600 to-green-600">
                    24/7 Disponible
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getSectionDescription(activeSection)}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Llamar Ahora</span>
              </button>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Chat en Vivo</span>
              </button>
            </div>
          </div>

          {/* Global Search Bar */}
          {(activeSection === "faq" || activeSection === "categories") && (
            <div className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 text-center mb-4">
                  ¿En qué podemos ayudarte?
                </h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={
                      activeSection === "faq"
                        ? "Buscar en preguntas frecuentes..."
                        : "Buscar en categorías de ayuda..."
                    }
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-gray-500"
                  />
                </div>
                <p className="text-sm text-teal-700 dark:text-teal-300 text-center mt-3">
                  Escribe tu duda y encontraremos la mejor respuesta para ti
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 📊 Support Stats Component
interface SupportStatsProps {
  faqs: FAQItem[];
  tickets: SupportTicket[];
  categories: HelpCategory[];
  allowAnimations: boolean;
}

const SupportStats: React.FC<SupportStatsProps> = ({
  faqs,
  tickets,
  categories,
  allowAnimations,
}) => {
  const stats = useMemo(() => {
    const totalFAQs = faqs.length;
    const openTickets = tickets.filter(
      (t) => t.status === "open" || t.status === "pending"
    ).length;
    const avgResponseTime = "2 horas"; // Mock data
    const totalArticles = categories.reduce(
      (sum, cat) => sum + cat.articleCount,
      0
    );

    return {
      totalFAQs,
      openTickets,
      avgResponseTime,
      totalArticles,
    };
  }, [faqs, tickets, categories]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
        allowAnimations && "animate-customerFadeInUp customer-stagger-1"
      )}
    >
      {/* FAQ Count */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
              {stats.totalFAQs}
            </p>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              Preguntas Frecuentes
            </p>
          </div>
        </div>
      </div>

      {/* Active Tickets */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Ticket className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.openTickets}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Tickets Activos
            </p>
          </div>
        </div>
      </div>

      {/* Response Time */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.avgResponseTime}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Tiempo Respuesta
            </p>
          </div>
        </div>
      </div>

      {/* Total Articles */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalArticles}
            </p>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Artículos de Ayuda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🧭 Support Navigation Sidebar
interface SupportNavigationProps {
  sections: SupportSection[];
  activeSection: SupportSection["id"];
  onSectionChange: (sectionId: SupportSection["id"]) => void;
  allowAnimations: boolean;
}

const SupportNavigation: React.FC<SupportNavigationProps> = ({
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
          <HelpCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>Centro de Ayuda</span>
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
                    ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
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
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isActive ? "rotate-90 text-teal-600" : "text-gray-400"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contact Summary */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
          <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-2 text-sm">
            ¿Necesitas ayuda inmediata?
          </h4>
          <div className="space-y-2 text-xs text-teal-700 dark:text-teal-300">
            <div className="flex items-center space-x-2">
              <Phone className="w-3 h-3" />
              <span>+34 900 123 456</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3 h-3" />
              <span>soporte@tienda.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-3 h-3" />
              <span>Chat disponible 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 📄 Support Content Component
interface SupportContentProps {
  activeSection: SupportSection["id"];
  searchTerm: string;
  faqs: FAQItem[];
  tickets: SupportTicket[];
  categories: HelpCategory[];
  customer: any;
  onLoginPrompt: () => void;
  allowAnimations: boolean;
}

const SupportContent: React.FC<SupportContentProps> = ({
  activeSection,
  searchTerm,
  faqs,
  tickets,
  categories,
  customer,
  onLoginPrompt,
  allowAnimations,
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case "faq":
        return (
          <FAQSection
            faqs={faqs}
            searchTerm={searchTerm}
            allowAnimations={allowAnimations}
          />
        );
      case "chat":
        return (
          <ChatSection
            customer={customer}
            onLoginPrompt={onLoginPrompt}
            allowAnimations={allowAnimations}
          />
        );
      case "tickets":
        return (
          <TicketsSection
            tickets={tickets}
            customer={customer}
            onLoginPrompt={onLoginPrompt}
            allowAnimations={allowAnimations}
          />
        );
      case "categories":
        return (
          <CategoriesSection
            categories={categories}
            searchTerm={searchTerm}
            allowAnimations={allowAnimations}
          />
        );
      case "contact":
        return <ContactSection allowAnimations={allowAnimations} />;
      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};

// ❓ FAQ Section Component
interface FAQSectionProps {
  faqs: FAQItem[];
  searchTerm: string;
  allowAnimations: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({
  faqs,
  searchTerm,
  allowAnimations,
}) => {
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());

  const filteredFAQs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;

    const search = searchTerm.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(search) ||
        faq.answer.toLowerCase().includes(search) ||
        faq.category.toLowerCase().includes(search) ||
        faq.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  }, [faqs, searchTerm]);

  const toggleFAQ = useCallback((faqId: string) => {
    setExpandedFAQs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(faqs.map((faq) => faq.category)));
    return cats.map((cat) => ({
      name: cat,
      count: faqs.filter((faq) => faq.category === cat).length,
    }));
  }, [faqs]);

  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      {/* FAQ Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Categorías de Preguntas
        </h3>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center space-x-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-3 py-2 rounded-lg border border-teal-200 dark:border-teal-800"
            >
              <span className="font-medium">{category.name}</span>
              <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Se encontraron{" "}
            <span className="font-semibold text-teal-600">
              {filteredFAQs.length}
            </span>{" "}
            resultados para &ldquo;
            <span className="font-medium">{searchTerm}</span>&rdquo;
          </p>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedFAQs.has(faq.id);

            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {faq.question}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {faq.category}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{faq.views} vistas</span>
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4 mb-4">
                      {faq.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Helpful Rating */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ¿Fue útil esta respuesta?
                      </p>
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{faq.helpful}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-sm">{faq.notHelpful}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No encontramos preguntas frecuentes que coincidan con tu búsqueda
            </p>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto">
              <MessageCircle className="w-4 h-4" />
              <span>Contactar Soporte</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 💬 Chat Section Component
interface ChatSectionProps {
  customer: any;
  onLoginPrompt: () => void;
  allowAnimations: boolean;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  customer,
  onLoginPrompt,
  allowAnimations,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "agent",
      message:
        "¡Hola! Soy María, tu especialista en atención al cliente. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: newMessage,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        message:
          "Gracias por tu mensaje. Un especialista revisará tu consulta y te responderá en breve. ¿Hay algo más específico en lo que pueda ayudarte?",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 2000);
  }, [newMessage]);

  if (!customer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <MessageCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Inicia Sesión para Chat en Vivo
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Para brindarte un mejor servicio, necesitamos que inicies sesión antes
          de comenzar el chat
        </p>
        <button
          onClick={onLoginPrompt}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <User className="w-4 h-4" />
          <span>Iniciar Sesión</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Chat con María González
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                • En línea - Tiempo de respuesta ~2 min
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
              Conectado
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-3 rounded-lg",
                  message.sender === "user"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                )}
              >
                <p className="text-sm">{message.message}</p>
                <p
                  className={cn(
                    "text-xs mt-1",
                    message.sender === "user"
                      ? "text-teal-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {message.timestamp.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-gray-500"
            />
            <button
              onClick={sendMessage}
              className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Presiona Enter para enviar • Respuesta típica en 2-5 minutos
          </p>
        </div>
      </div>
    </div>
  );
};

// 🎫 Tickets Section Component
interface TicketsSectionProps {
  tickets: SupportTicket[];
  customer: any;
  onLoginPrompt: () => void;
  allowAnimations: boolean;
}

const TicketsSection: React.FC<TicketsSectionProps> = ({
  tickets,
  customer,
  onLoginPrompt,
  allowAnimations,
}) => {
  const getStatusColor = (status: SupportTicket["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: SupportTicket["priority"]) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 dark:text-red-400";
      case "high":
        return "text-orange-600 dark:text-orange-400";
      case "medium":
        return "text-yellow-600 dark:text-yellow-400";
      case "low":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  if (!customer) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
        <Ticket className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Inicia Sesión para Ver tus Tickets
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Necesitas una cuenta para crear y gestionar tickets de soporte
        </p>
        <button
          onClick={onLoginPrompt}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
        >
          <User className="w-4 h-4" />
          <span>Iniciar Sesión</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      {/* Tickets Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Mis Tickets de Soporte
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona todas tus consultas de soporte en un solo lugar
            </p>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Ticket</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {ticket.subject}
                    </h4>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        getStatusColor(ticket.status)
                      )}
                    >
                      {ticket.status === "open"
                        ? "Abierto"
                        : ticket.status === "pending"
                        ? "Pendiente"
                        : ticket.status === "resolved"
                        ? "Resuelto"
                        : "Cerrado"}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        getPriorityColor(ticket.priority)
                      )}
                    >
                      {ticket.priority === "urgent"
                        ? "🔴 Urgente"
                        : ticket.priority === "high"
                        ? "🟠 Alta"
                        : ticket.priority === "medium"
                        ? "🟡 Media"
                        : "🟢 Baja"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {ticket.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Creado: {ticket.createdAt.toLocaleDateString("es-ES")}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Actualizado:{" "}
                        {ticket.updatedAt.toLocaleDateString("es-ES")}
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Tag className="w-3 h-3" />
                      <span>{ticket.category}</span>
                    </span>
                    {ticket.agent && (
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Agente: {ticket.agent}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors text-sm">
                    Ver Conversación
                  </button>
                  {ticket.status !== "closed" && (
                    <button className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors text-sm">
                      Cerrar Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Messages Preview */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Últimos mensajes:
                </h5>
                <div className="space-y-2">
                  {ticket.messages.slice(-2).map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        message.sender === "user"
                          ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800"
                          : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            message.sender === "user"
                              ? "text-teal-700 dark:text-teal-300"
                              : "text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {message.sender === "user"
                            ? "Tú"
                            : ticket.agent || "Agente"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {message.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tienes tickets de soporte
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cuando tengas alguna consulta, puedes crear un nuevo ticket aquí
            </p>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto">
              <Plus className="w-4 h-4" />
              <span>Crear Primer Ticket</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 📚 Categories Section Component
interface CategoriesSectionProps {
  categories: HelpCategory[];
  searchTerm: string;
  allowAnimations: boolean;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  searchTerm,
  allowAnimations,
}) => {
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const search = searchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(search) ||
        cat.description.toLowerCase().includes(search)
    );
  }, [categories, searchTerm]);

  const popularCategories = categories.filter((cat) => cat.popular);

  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      {/* Popular Categories */}
      {!searchTerm && popularCategories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Categorías Más Populares</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className={cn(
                    "p-4 rounded-lg border-2 border-transparent hover:border-teal-200 dark:hover:border-teal-800 transition-colors cursor-pointer bg-gradient-to-br",
                    category.color,
                    "from-opacity-10 to-opacity-20"
                  )}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                        category.color
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.articleCount} artículos
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchTerm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Se encontraron{" "}
            <span className="font-semibold text-teal-600">
              {filteredCategories.length}
            </span>{" "}
            categorías para &ldquo;
            <span className="font-medium">{searchTerm}</span>&rdquo;
          </p>
        </div>
      )}

      {/* All Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {searchTerm ? "Resultados de Búsqueda" : "Todas las Categorías"}
        </h3>

        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  className="group border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-teal-300 dark:hover:border-teal-600"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br group-hover:scale-110 transition-transform",
                        category.color
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {category.name}
                      </h4>
                      {category.popular && (
                        <span className="inline-flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <Star className="w-3 h-3" />
                          <span>Popular</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {category.articleCount} artículos
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron categorías
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 📞 Contact Section Component
interface ContactSectionProps {
  allowAnimations: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ allowAnimations }) => {
  return (
    <div
      className={cn("space-y-6", allowAnimations && "animate-customerFadeInUp")}
    >
      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Chat */}
        <div className="bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-teal-900 dark:text-teal-100">
                Chat en Vivo
              </h3>
              <p className="text-sm text-teal-700 dark:text-teal-300">
                Disponible 24/7
              </p>
            </div>
          </div>
          <p className="text-sm text-teal-800 dark:text-teal-200 mb-4">
            Conecta instantáneamente con nuestros especialistas para resolver
            tus dudas en tiempo real.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-teal-600 dark:text-teal-400">
              Tiempo típico de respuesta: 2-5 min
            </span>
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Iniciar Chat
            </button>
          </div>
        </div>

        {/* Phone Support */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Llamada Telefónica
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Lun-Vie 9:00-18:00
              </p>
            </div>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            Habla directamente con nuestros especialistas para soporte
            personalizado.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              +34 900 123 456
            </span>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Llamar Ahora
            </button>
          </div>
        </div>
      </div>

      {/* Email Contact */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Soporte por Email
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Para consultas detalladas y seguimiento
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Soporte General
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              soporte@tienda.com
            </p>
            <span className="text-xs text-green-600 dark:text-green-400">
              Respuesta en ~24h
            </span>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Soporte Técnico
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              tecnico@tienda.com
            </p>
            <span className="text-xs text-orange-600 dark:text-orange-400">
              Respuesta en ~12h
            </span>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Ventas & Facturación
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              ventas@tienda.com
            </p>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              Respuesta en ~6h
            </span>
          </div>
        </div>
      </div>

      {/* Office Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
          <Building className="w-5 h-5 text-gray-600" />
          <span>Nuestras Oficinas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Oficina Principal - Madrid
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Calle Serrano 123, 2ª Planta</p>
              <p>28006 Madrid, España</p>
              <p>Tel: +34 91 123 45 67</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Centro de Distribución - Barcelona
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Av. Diagonal 456</p>
              <p>08036 Barcelona, España</p>
              <p>Tel: +34 93 987 65 43</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Horario de Atención:</strong> Lunes a Viernes, 9:00 - 18:00
            (CET)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportTab;
