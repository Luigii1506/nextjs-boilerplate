# 💳 Core Payments Infrastructure

> **Infraestructura de pagos compartida** - Stripe como servicio central reutilizable

## 📋 Visión General

El módulo `core/payments` proporciona una infraestructura de pagos centralizada basada en Stripe que puede ser utilizada por **múltiples features** del boilerplate:

- ✅ **Storefront** (Tienda e-commerce)
- ✅ **POS** (Punto de venta)
- ✅ **Subscriptions** (Membresías y suscripciones)
- ✅ **Donations** (Donaciones)
- ✅ Cualquier otro feature que requiera procesar pagos

## 🏗️ Arquitectura

### ¿Por qué Core y no Feature Flag?

**Stripe es infraestructura, no una feature opcional:**

| Aspecto | Como Feature | Como Core Infrastructure ✅ |
|---------|-------------|----------------------------|
| **Reutilización** | Duplicado en cada feature | Una sola implementación |
| **Mantenimiento** | Múltiples lugares | Un solo lugar |
| **Configuración** | Dispersa | Centralizada en ENV |
| **Webhooks** | Endpoint por feature | Un solo endpoint |
| **Types** | Inconsistente | Consistente |
| **Testing** | Testear por feature | Tests centralizados |

### Estructura de Directorios

```
src/core/payments/
├── stripe/                      # Stripe SDK wrappers
│   ├── client.ts               # Browser-side (loadStripe)
│   ├── server.ts               # Server-side (Payment Intents, Customers, etc.)
│   └── config.ts               # Configuration & constants
│
├── components/                  # React components
│   ├── StripePaymentForm.tsx   # Form de pago con Stripe Elements
│   ├── StripeElementsWrapper.tsx  # Provider wrapper
│   └── index.ts
│
├── hooks/                       # React hooks
│   ├── useStripePayment.ts     # Hook para manejar pagos
│   └── index.ts
│
├── types/                       # TypeScript types
│   └── stripe.ts               # Stripe type definitions
│
├── index.ts                     # Barrel exports
└── README.md                    # Esta documentación
```

## 🚀 Uso Rápido

### 1. Crear Payment Intent (Server-side)

```typescript
// En tu server action o API route
import { createPaymentIntent } from "@/core/payments";

export async function createCheckoutPayment(amount: number) {
  const result = await createPaymentIntent({
    amount, // en dólares (ej: 19.99)
    currency: "usd",
    metadata: {
      orderId: "order_123",
      userId: "user_456",
    },
  });

  if (result.success) {
    return result.clientSecret; // Para Stripe Elements
  }
}
```

### 2. Mostrar Payment Form (Client-side)

```typescript
// En tu componente React
import { StripeElementsWrapper, StripePaymentForm } from "@/core/payments";

export function CheckoutPayment({ clientSecret, amount }) {
  return (
    <StripeElementsWrapper
      clientSecret={clientSecret}
      amount={amount}
      currency="usd"
    >
      <StripePaymentForm
        amount={amount}
        currency="usd"
        customerEmail="customer@example.com"
        onPaymentSuccess={(paymentIntentId) => {
          console.log("✅ Pago exitoso:", paymentIntentId);
          // Crear orden, enviar email, etc.
        }}
        onPaymentError={(error) => {
          console.error("❌ Error en pago:", error);
        }}
      />
    </StripeElementsWrapper>
  );
}
```

### 3. Usar el Hook (Avanzado)

```typescript
// Hook para control granular del proceso de pago
import { useStripePayment } from "@/core/payments";

export function CustomPaymentFlow() {
  const { state, createIntent, markSucceeded } = useStripePayment({
    onPaymentSuccess: (id) => {
      console.log("Payment succeeded:", id);
    },
  });

  const handleCheckout = async () => {
    await createIntent({
      amount: 99.99,
      currency: "usd",
      metadata: { orderId: "123" },
    });
  };

  return (
    <div>
      {state.isCreating && <p>Inicializando pago...</p>}
      {state.error && <p>Error: {state.error}</p>}
      <button onClick={handleCheckout}>Pagar</button>
    </div>
  );
}
```

## 🔧 Configuración

### Variables de Entorno

Las variables de Stripe ya están configuradas en `core/config/environment.ts`:

```bash
# .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

La configuración se obtiene automáticamente del ENV:

```typescript
import { getStripeConfig, isStripeConfigured } from "@/core/payments";

const config = getStripeConfig();
// {
//   publishableKey: "pk_test_...",
//   secretKey: "sk_test_...",
//   webhookSecret: "whsec_..."
// }
```

## 🔔 Webhooks

El webhook de Stripe está centralizado en **un solo endpoint** para todas las features:

```
POST /api/webhooks/stripe
```

### Eventos Manejados:

- ✅ `payment_intent.succeeded` - Pago exitoso
- ✅ `payment_intent.payment_failed` - Pago fallido
- ✅ `payment_intent.canceled` - Pago cancelado
- ✅ `charge.refunded` - Reembolso procesado
- ✅ `customer.created` - Cliente creado
- ✅ `customer.updated` - Cliente actualizado
- ✅ `customer.deleted` - Cliente eliminado

### Extender Webhooks para tu Feature:

El webhook handler en `/api/webhooks/stripe/route.ts` tiene TODOs donde puedes agregar lógica específica:

```typescript
// En handlePaymentIntentSucceeded
// TODO: Update order status in database
// TODO: Send confirmation email
// TODO: Trigger fulfillment process

// Para tu feature:
if (paymentIntent.metadata.source === "pos") {
  await handlePOSPaymentSuccess(paymentIntent);
}
```

## 📚 API Reference

### Server Functions

#### `createPaymentIntent(params)`

Crea un Payment Intent de Stripe.

```typescript
const result = await createPaymentIntent({
  amount: 99.99,        // Dólares
  currency: "usd",      // Código de moneda
  customerId: "cus_...", // Stripe Customer ID (opcional)
  description: "Order #123",
  metadata: {
    orderId: "123",
    source: "storefront"
  }
});
```

#### `retrievePaymentIntent(id)`

Obtiene un Payment Intent por ID.

```typescript
const result = await retrievePaymentIntent("pi_...");
```

#### `createStripeCustomer(params)`

Crea un cliente en Stripe.

```typescript
const result = await createStripeCustomer({
  email: "user@example.com",
  name: "John Doe",
  metadata: { userId: "user_123" }
});
```

#### `attachPaymentMethod(paymentMethodId, customerId)`

Adjunta un método de pago a un cliente.

```typescript
await attachPaymentMethod("pm_...", "cus_...");
```

#### `createRefund(paymentIntentId, amount?, reason?)`

Crea un reembolso.

```typescript
await createRefund(
  "pi_...",
  50.00, // Opcional: reembolso parcial
  "requested_by_customer"
);
```

### Client Functions

#### `getStripeClient()`

Obtiene instancia de Stripe.js (browser).

```typescript
const stripe = await getStripeClient();
```

### Components

#### `<StripeElementsWrapper>`

Wrapper que provee contexto de Stripe Elements.

**Props:**
- `clientSecret: string` - Client secret del Payment Intent
- `amount: number` - Monto en dólares (para display)
- `currency?: string` - Código de moneda (default: "usd")

#### `<StripePaymentForm>`

Formulario de pago completo con validación.

**Props:**
- `amount: number` - Monto en dólares
- `currency?: string` - Código de moneda
- `customerEmail: string` - Email del cliente
- `customerName?: string` - Nombre del cliente
- `onPaymentSuccess: (paymentIntentId) => void`
- `onPaymentError: (error) => void`
- `usePaymentElement?: boolean` - Usar PaymentElement (recomendado)

### Hooks

#### `useStripePayment(options)`

Hook para manejar el ciclo de vida de un pago.

**Options:**
- `onPaymentIntentCreated?: (clientSecret, id) => void`
- `onPaymentSuccess?: (id) => void`
- `onPaymentError?: (error) => void`

**Returns:**
- `state: PaymentState` - Estado actual
- `createIntent: (params) => Promise<void>` - Crear Payment Intent
- `markSucceeded: (id) => void` - Marcar como exitoso
- `markFailed: (error) => void` - Marcar como fallido
- `reset: () => void` - Resetear estado

## 🎨 Utilities

### Conversión de Montos

```typescript
import { dollarsToCents, centsToDollars, formatStripeAmount } from "@/core/payments";

// Dólares a centavos (Stripe usa centavos)
const cents = dollarsToCents(19.99); // 1999

// Centavos a dólares
const dollars = centsToDollars(1999); // 19.99

// Formatear para display
const formatted = formatStripeAmount(1999); // "$19.99"
```

### Manejo de Errores

```typescript
import { getStripeErrorMessage, STRIPE_ERROR_MESSAGES } from "@/core/payments";

const userMessage = getStripeErrorMessage("card_declined");
// "Tu tarjeta fue rechazada. Por favor, intenta con otra tarjeta."
```

## 🧪 Testing

### Test Cards

```typescript
// Pago exitoso
const successCard = "4242 4242 4242 4242";

// Pago rechazado
const declinedCard = "4000 0000 0000 9995";

// Requiere 3D Secure
const secureCard = "4000 0025 0000 3155";
```

### Configuración de Test

1. Usa keys de test (`pk_test_...` y `sk_test_...`)
2. Usa test cards de Stripe
3. Verifica webhooks con Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 📖 Ejemplos de Uso por Feature

### Ejemplo 1: Storefront (E-commerce)

```typescript
// features/checkout/server/actions.ts
import { createPaymentIntent } from "@/core/payments";

export async function createOrderPayment(orderId: string, amount: number) {
  return await createPaymentIntent({
    amount,
    currency: "usd",
    metadata: {
      orderId,
      source: "storefront",
    },
  });
}
```

### Ejemplo 2: POS (Punto de Venta)

```typescript
// features/pos/server/actions.ts
import { createPaymentIntent } from "@/core/payments";

export async function processPOSTransaction(
  terminalId: string,
  amount: number
) {
  return await createPaymentIntent({
    amount,
    currency: "usd",
    metadata: {
      terminalId,
      source: "pos",
      cashier: "employee_123",
    },
  });
}
```

### Ejemplo 3: Subscriptions

```typescript
// features/subscriptions/server/actions.ts
import { createStripeCustomer, attachPaymentMethod } from "@/core/payments";

export async function setupSubscription(userId: string, email: string) {
  // 1. Crear customer en Stripe
  const customer = await createStripeCustomer({
    email,
    metadata: { userId },
  });

  // 2. Crear subscription con Stripe API
  // ...
}
```

## 🔒 Seguridad

### ✅ Buenas Prácticas:

1. **Nunca expongas el Secret Key al cliente**
   - Solo usa `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` en el browser
   - `STRIPE_SECRET_KEY` solo en server-side

2. **Verifica webhooks siempre**
   - El handler ya implementa verificación de firma
   - Nunca confíes en webhooks sin verificar

3. **Valida montos en el servidor**
   - No confíes en montos enviados desde el cliente
   - Recalcula totales en server actions

4. **Usa metadata para trazabilidad**
   ```typescript
   metadata: {
     orderId: "123",
     userId: "456",
     source: "storefront",
     timestamp: new Date().toISOString()
   }
   ```

## 🚀 Próximos Pasos

### Para Implementar en un Feature:

1. **Importa las funciones necesarias:**
   ```typescript
   import { createPaymentIntent, StripePaymentForm } from "@/core/payments";
   ```

2. **Crea Payment Intent en tu server action**

3. **Muestra el form de pago en tu UI**

4. **Maneja el success/error en callbacks**

5. **(Opcional) Extiende webhooks para lógica específica**

### Funcionalidades Futuras:

- [ ] Apple Pay / Google Pay
- [ ] Subscripciones (Stripe Billing)
- [ ] Pagos recurrentes
- [ ] Múltiples monedas
- [ ] Stripe Connect (marketplaces)
- [ ] Pagos diferidos (split payments)

## 📞 Soporte

### Recursos:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Events](https://stripe.com/docs/webhooks)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)

### Debugging:

Ver logs en consola con prefijo `[STRIPE]`:
- `💳 [STRIPE SERVER]` - Operaciones server-side
- `⚠️ [STRIPE CLIENT]` - Operaciones client-side
- `🔔 [STRIPE WEBHOOK]` - Eventos de webhooks

---

**💡 Tip:** Este módulo es **infraestructura compartida**. Cualquier feature que necesite procesar pagos debe usar `@/core/payments` en lugar de implementar Stripe directamente.
