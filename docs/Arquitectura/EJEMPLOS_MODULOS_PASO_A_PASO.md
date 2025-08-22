# 🛠️ Ejemplos de Módulos Paso a Paso

## 🎯 Guía Práctica de Implementación

Esta guía muestra ejemplos concretos de cómo implementar módulos siguiendo nuestros estándares.

---

## 🚀 Ejemplo Completo: Módulo Simple (Notifications)

### **Paso 1: Crear Estructura**
```bash
mkdir -p src/features/notifications/components
touch src/features/notifications/{index.ts,notifications.types.ts,notifications.hooks.ts,notifications.actions.ts,notifications.screen.tsx}
```

### **Paso 2: Definir Tipos**
```typescript
// notifications.types.ts
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  userId: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}
```

### **Paso 3: Implementar Hooks**
```typescript
// notifications.hooks.ts
"use client";

import { useState, useEffect } from "react";
import { getNotificationsAction, markAsReadAction } from "./notifications.actions";
import type { Notification, NotificationFilters } from "./notifications.types";

export function useNotifications(filters?: NotificationFilters) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getNotificationsAction(filters);
      
      if (result.success) {
        setNotifications(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await markAsReadAction(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  return {
    notifications,
    isLoading,
    error,
    refresh: loadNotifications,
    markAsRead,
  };
}

export function useNotificationStats() {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    // Implementation here
    setIsLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, isLoading, refresh: loadStats };
}
```

### **Paso 4: Implementar Server Actions**
```typescript
// notifications.actions.ts
"use server";

import { prisma } from "@/core/database";
import { getCurrentUser } from "@/core/auth";
import type { Notification, NotificationFilters } from "./notifications.types";

export async function getNotificationsAction(filters?: NotificationFilters) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "No autorizado" };
    }

    const where: any = { userId: user.id };
    
    if (filters?.type) where.type = filters.type;
    if (filters?.read !== undefined) where.read = filters.read;
    if (filters?.dateFrom) where.createdAt = { gte: filters.dateFrom };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, data: notifications };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return { success: false, error: "Error al obtener notificaciones" };
  }
}

export async function markAsReadAction(notificationId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "No autorizado" };
    }

    await prisma.notification.update({
      where: { 
        id: notificationId,
        userId: user.id // Ensure user owns the notification
      },
      data: { read: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: "Error al marcar como leída" };
  }
}

export async function createNotificationAction(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'info'
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId,
        read: false,
      },
    });

    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: "Error al crear notificación" };
  }
}
```

### **Paso 5: Crear UI Principal**
```typescript
// notifications.screen.tsx
"use client";

import React from "react";
import { Bell, Check, X, Filter } from "lucide-react";
import { useNotifications } from "./notifications.hooks";
import { NotificationCard } from "./components/NotificationCard";
import type { NotificationFilters } from "./notifications.types";

export default function NotificationsScreen() {
  const [filters, setFilters] = React.useState<NotificationFilters>({});
  const { notifications, isLoading, error, refresh, markAsRead } = useNotifications(filters);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            🔔 Notificaciones
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestiona tus notificaciones
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Bell size={18} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-slate-500" />
          
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              type: e.target.value as any || undefined 
            }))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
          >
            <option value="">Todos los tipos</option>
            <option value="info">Info</option>
            <option value="success">Éxito</option>
            <option value="warning">Advertencia</option>
            <option value="error">Error</option>
          </select>

          <select
            value={filters.read === undefined ? '' : filters.read.toString()}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              read: e.target.value === '' ? undefined : e.target.value === 'true'
            }))}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
          >
            <option value="">Todas</option>
            <option value="false">No leídas</option>
            <option value="true">Leídas</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              No tienes notificaciones en este momento
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

### **Paso 6: Crear Componentes**
```typescript
// components/NotificationCard.tsx
import React from "react";
import { Check, Bell, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { Notification } from "../notifications.types";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    if (notification.read) return "bg-slate-50 dark:bg-slate-800/50";
    
    switch (notification.type) {
      case 'success': return "bg-green-50 dark:bg-green-900/20";
      case 'warning': return "bg-yellow-50 dark:bg-yellow-900/20";
      case 'error': return "bg-red-50 dark:bg-red-900/20";
      default: return "bg-blue-50 dark:bg-blue-900/20";
    }
  };

  return (
    <div className={`p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${getBgColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <h3 className={`font-medium ${notification.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {notification.title}
            </h3>
            <p className={`mt-1 text-sm ${notification.read ? 'text-slate-500 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
              {notification.message}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {!notification.read && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Check size={12} />
            Marcar leída
          </button>
        )}
      </div>
    </div>
  );
}
```

### **Paso 7: Crear Barrel Export**
```typescript
// index.ts
/**
 * 🔔 NOTIFICATIONS - PUBLIC API
 * =============================
 * 
 * Barrel export que define la API pública del módulo.
 * Solo exporta lo que otros módulos pueden usar.
 */

// 🪝 Hooks públicos
export {
  useNotifications,
  useNotificationStats,
} from "./notifications.hooks";

// 🚀 Server Actions públicos
export {
  getNotificationsAction,
  markAsReadAction,
  createNotificationAction,
} from "./notifications.actions";

// 📝 Tipos públicos
export type {
  Notification,
  NotificationType,
  NotificationFilters,
  NotificationStats,
} from "./notifications.types";

// 🎨 Componentes públicos
export { default as NotificationsScreen } from "./notifications.screen";
export { NotificationCard } from "./components/NotificationCard";
```

---

## 🏗️ Ejemplo Completo: Módulo Complejo (Orders)

### **Paso 1: Crear Estructura**
```bash
mkdir -p src/features/orders/{hooks,server,ui}
touch src/features/orders/{index.ts,types.ts,schemas.ts,constants.ts,utils.ts,config.ts}
touch src/features/orders/server/{actions.ts,queries.ts,services.ts,mappers.ts,validators.ts,index.ts}
touch src/features/orders/hooks/{useOrders.ts,useOrderFilters.ts,useOrderActions.ts,index.ts}
touch src/features/orders/ui/{OrdersList.tsx,OrderCard.tsx,OrderModal.tsx,OrderFilters.tsx,index.ts}
```

### **Paso 2: Definir Tipos Base**
```typescript
// types.ts
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  currency: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface OrderStats {
  total: number;
  byStatus: Record<OrderStatus, number>;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface CreateOrderData {
  customerId: string;
  items: Omit<OrderItem, 'id'>[];
  shippingAddress: Address;
  billingAddress: Address;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  shippingAddress?: Address;
  billingAddress?: Address;
}
```

### **Paso 3: Definir Constantes**
```typescript
// constants.ts
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmado',
  [ORDER_STATUS.PROCESSING]: 'Procesando',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregado',
  [ORDER_STATUS.CANCELLED]: 'Cancelado',
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'yellow',
  [ORDER_STATUS.CONFIRMED]: 'blue',
  [ORDER_STATUS.PROCESSING]: 'purple',
  [ORDER_STATUS.SHIPPED]: 'indigo',
  [ORDER_STATUS.DELIVERED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'red',
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  MXN: '$',
  GBP: '£',
};
```

### **Paso 4: Implementar Schemas**
```typescript
// schemas.ts
import { z } from "zod";

export const addressSchema = z.object({
  street: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  state: z.string().min(1, "El estado es requerido"),
  zipCode: z.string().min(1, "El código postal es requerido"),
  country: z.string().min(1, "El país es requerido"),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1, "El ID del producto es requerido"),
  productName: z.string().min(1, "El nombre del producto es requerido"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  total: z.number().min(0, "El total debe ser mayor o igual a 0"),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "El ID del cliente es requerido"),
  items: z.array(orderItemSchema).min(1, "Debe haber al menos un item"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
});

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
});

export const orderFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  customerId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  search: z.string().optional(),
});
```

### **Paso 5: Implementar Server Actions**
```typescript
// server/actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { getCurrentUser } from "@/core/auth";
import { createOrderSchema, updateOrderSchema } from "../schemas";
import { OrdersService } from "./services";
import { OrdersQueries } from "./queries";
import type { CreateOrderData, UpdateOrderData, OrderFilters } from "../types";

export async function getOrdersAction(filters?: OrderFilters) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return { success: false, error: "No autorizado" };
    }

    const orders = await OrdersQueries.getOrders(filters);
    return { success: true, data: orders };
  } catch (error) {
    console.error('Error getting orders:', error);
    return { success: false, error: "Error al obtener órdenes" };
  }
}

export async function getOrderByIdAction(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "No autorizado" };
    }

    const order = await OrdersQueries.getOrderById(orderId);
    if (!order) {
      return { success: false, error: "Orden no encontrada" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error('Error getting order:', error);
    return { success: false, error: "Error al obtener la orden" };
  }
}

export async function createOrderAction(data: CreateOrderData) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return { success: false, error: "No autorizado" };
    }

    // Validate data
    const validatedData = createOrderSchema.parse(data);

    // Create order using service
    const order = await OrdersService.createOrder(validatedData);

    // Revalidate cache
    revalidateTag('orders');

    return { success: true, data: order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al crear la orden" 
    };
  }
}

export async function updateOrderAction(orderId: string, data: UpdateOrderData) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return { success: false, error: "No autorizado" };
    }

    // Validate data
    const validatedData = updateOrderSchema.parse(data);

    // Update order using service
    const order = await OrdersService.updateOrder(orderId, validatedData);

    // Revalidate cache
    revalidateTag('orders');
    revalidateTag(`order-${orderId}`);

    return { success: true, data: order };
  } catch (error) {
    console.error('Error updating order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al actualizar la orden" 
    };
  }
}

export async function deleteOrderAction(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return { success: false, error: "No autorizado" };
    }

    await OrdersService.deleteOrder(orderId);

    // Revalidate cache
    revalidateTag('orders');

    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al eliminar la orden" 
    };
  }
}

export async function getOrderStatsAction() {
  try {
    const user = await getCurrentUser();
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return { success: false, error: "No autorizado" };
    }

    const stats = await OrdersQueries.getOrderStats();
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting order stats:', error);
    return { success: false, error: "Error al obtener estadísticas" };
  }
}
```

### **Paso 6: Implementar Barrel Exports**
```typescript
// index.ts
/**
 * 📦 ORDERS - PUBLIC API
 * ======================
 * 
 * Barrel export que define la API pública del módulo.
 * Solo exporta lo que otros módulos pueden usar.
 */

// 🪝 Hooks públicos
export {
  useOrders,
  useOrderFilters,
  useOrderActions,
} from "./hooks";

// 🏢 Server Actions públicos
export {
  getOrdersAction,
  getOrderByIdAction,
  createOrderAction,
  updateOrderAction,
  deleteOrderAction,
  getOrderStatsAction,
} from "./server";

// 📝 Tipos públicos
export type {
  Order,
  OrderItem,
  OrderStatus,
  OrderFilters,
  OrderStats,
  CreateOrderData,
  UpdateOrderData,
  Address,
} from "./types";

// ✅ Schemas públicos
export {
  createOrderSchema,
  updateOrderSchema,
  orderFiltersSchema,
} from "./schemas";

// 📋 Constantes públicas
export {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "./constants";

// 🎨 Componentes públicos
export { default as OrdersList } from "./ui/OrdersList";
export { default as OrderCard } from "./ui/OrderCard";
export { default as OrderModal } from "./ui/OrderModal";
```

---

## 🔄 Migración de Módulo Simple a Complejo

### **Ejemplo: Notifications → Complex Notifications**

#### **Antes (Simple)**
```
src/features/notifications/
├── index.ts
├── notifications.types.ts
├── notifications.hooks.ts
├── notifications.actions.ts
├── notifications.screen.tsx
└── components/
    └── NotificationCard.tsx
```

#### **Después (Complejo)**
```
src/features/notifications/
├── index.ts
├── types.ts                     # Consolidado
├── schemas.ts                   # Nuevo
├── constants.ts                 # Nuevo
├── utils.ts                     # Nuevo
├── hooks/                       # Expandido
│   ├── useNotifications.ts
│   ├── useNotificationFilters.ts
│   └── useNotificationActions.ts
├── server/                      # Expandido
│   ├── actions.ts
│   ├── queries.ts
│   ├── services.ts
│   └── mappers.ts
└── ui/                          # Expandido
    ├── NotificationsList.tsx
    ├── NotificationCard.tsx
    ├── NotificationModal.tsx
    └── NotificationFilters.tsx
```

#### **Pasos de Migración**
1. **Crear nuevas carpetas**: `hooks/`, `server/`, `ui/`
2. **Mover contenido existente**: Distribuir código en archivos específicos
3. **Consolidar tipos**: `notifications.types.ts` → `types.ts`
4. **Agregar nuevas capas**: `schemas.ts`, `constants.ts`, `utils.ts`
5. **Actualizar barrel export**: Reflejar nueva estructura
6. **Actualizar imports**: En archivos que usan el módulo

---

Esta guía proporciona ejemplos concretos y paso a paso para implementar módulos siguiendo nuestros estándares arquitectónicos.
