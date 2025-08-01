"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePublicPage } from "@/hooks/useAuth";
import type { FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { isLoading: authLoading } = usePublicPage();

  /**
   * Maneja el envío del formulario de restablecimiento de contraseña.
   * @param event El evento del formulario, tipado como FormEvent<HTMLFormElement>.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previene el envío del formulario por defecto
    setError(""); // Limpiar errores previos
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const emailInput = formData.get("email") as string;
    setEmail(emailInput);

    // Validación básica del email
    if (!emailInput) {
      setError("El correo electrónico es obligatorio.");
      setLoading(false);
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    try {
      // Llamada a la función de restablecimiento de contraseña de Better Auth
      const response = await authClient.forgetPassword({
        email: emailInput,
        redirectTo: "/reset-password", // URL para redireccionar desde el email
      });

      if (response.data) {
        // Email enviado exitosamente
        console.log("Email de recuperación enviado:", response.data);
        setSuccess(true);
      } else if (response.error) {
        // Error al enviar email
        console.error("Error al enviar email:", response.error);
        if (response.error.message?.includes("User not found")) {
          setError("No se encontró una cuenta con ese correo electrónico.");
        } else {
          setError(
            response.error.message || "Error al enviar el email de recuperación"
          );
        }
      }
    } catch (err: unknown) {
      // Manejar errores inesperados
      console.error("Error inesperado:", err);
      if (err instanceof Error) {
        setError(`Ocurrió un error inesperado: ${err.message}`);
      } else {
        setError("Ocurrió un error desconocido.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Verificando estado de autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Si el email fue enviado exitosamente, mostrar mensaje de confirmación
  if (success) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col gap-6 p-8 bg-white shadow-md rounded-lg w-96 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Email Enviado!
            </h2>
            <p className="text-gray-600 mb-4">
              Hemos enviado un enlace de restablecimiento de contraseña a:
            </p>
            <p className="font-semibold text-blue-600 mb-6">{email}</p>
            <p className="text-sm text-gray-500 mb-6">
              Revisa tu bandeja de entrada y sigue las instrucciones para
              restablecer tu contraseña. El enlace expirará en 1 hora.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setError("");
              }}
              className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Enviar otro enlace
            </button>

            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col gap-6 p-8 bg-white shadow-md rounded-lg w-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-600 text-sm">
            No te preocupes, te ayudamos a recuperarla. Ingresa tu correo
            electrónico y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>
        </div>

        {/* Mostrar errores */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="ml-2 text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu-email@ejemplo.com"
              required
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        {/* Enlaces de navegación */}
        <div className="flex flex-col gap-2 text-center text-sm border-t pt-4">
          <div className="text-gray-600">
            ¿Recordaste tu contraseña?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Iniciar sesión
            </Link>
          </div>

          <div className="text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
