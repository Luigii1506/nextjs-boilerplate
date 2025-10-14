/**
 * 💳 STRIPE SETUP FORM
 * =====================
 *
 * Form for saving payment methods WITHOUT charging (Setup Intent).
 * Used for adding cards to save for future purchases.
 *
 * @version 1.0.0 - PCI-Compliant Card Storage
 */

"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, CreditCard } from "lucide-react";

// Initialize Stripe with publishable key from environment
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

if (!publishableKey) {
  console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}

const stripePromise = loadStripe(publishableKey);

interface StripeSetupFormInnerProps {
  onSuccess: (paymentMethodId: string, customerId?: string) => void;
  onError: (error: string) => void;
  submitButtonText?: string;
}

/**
 * Inner form component (requires Stripe Elements context)
 */
function StripeSetupFormInner({
  onSuccess,
  onError,
  submitButtonText = "Guardar Tarjeta",
}: StripeSetupFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the setup
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: window.location.href,
        },
      });

      if (error) {
        onError(
          error.message || "Error al procesar la tarjeta. Intenta nuevamente."
        );
      } else if (setupIntent && setupIntent.status === "succeeded") {
        // Extract payment method ID and customer ID
        const paymentMethodId =
          typeof setupIntent.payment_method === "string"
            ? setupIntent.payment_method
            : setupIntent.payment_method?.id;

        if (paymentMethodId) {
          onSuccess(paymentMethodId, setupIntent.customer as string | undefined);
        } else {
          onError("No se pudo obtener el método de pago");
        }
      }
    } catch (error) {
      onError("Error al guardar la tarjeta");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <PaymentElement />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            {submitButtonText}
          </>
        )}
      </button>
    </form>
  );
}

interface StripeSetupFormProps extends StripeSetupFormInnerProps {
  clientSecret?: string; // If not provided, will fetch one
}

/**
 * Wrapper component that fetches Setup Intent and provides Stripe context
 */
export function StripeSetupForm({
  onSuccess,
  onError,
  submitButtonText,
  clientSecret: providedClientSecret,
}: StripeSetupFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(
    providedClientSecret || null
  );
  const [isLoading, setIsLoading] = useState(!providedClientSecret);

  // Fetch Setup Intent client secret
  useEffect(() => {
    if (providedClientSecret) {
      return;
    }

    const fetchSetupIntent = async () => {
      try {
        const response = await fetch("/api/stripe/setup-intent", {
          method: "POST",
        });

        const data = await response.json();

        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError(
            data.error ||
              "Error al inicializar el formulario. Intenta nuevamente."
          );
        }
      } catch (error) {
        onError("Error de conexión. Verifica tu internet e intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetupIntent();
  }, [providedClientSecret, onError]);

  if (isLoading || !clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#2563eb",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#dc2626",
            fontFamily: "system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
      }}
    >
      <StripeSetupFormInner
        onSuccess={onSuccess}
        onError={onError}
        submitButtonText={submitButtonText}
      />
    </Elements>
  );
}
