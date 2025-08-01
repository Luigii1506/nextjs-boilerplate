"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePublicPage } from "@/hooks/useAuth";
import type { FormEvent } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { isLoading: authLoading } = usePublicPage();

  /**
   * Maneja el envío del formulario de login.
   * @param event El evento del formulario, tipado como FormEvent<HTMLFormElement>.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previene el envío del formulario por defecto
    setError(""); // Limpiar errores previos
    setLoading(true);

    const formData = new FormData(event.currentTarget); // Usar event.currentTarget para un mejor tipado
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validación básica de los datos del formulario antes de llamar a la API
    if (!email || !password) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      // Obtener la URL de callback de los parámetros de búsqueda
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || "/dashboard";

      // Llamada a la función de login de Better Auth
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.data) {
        // Login exitoso
        console.log("Login exitoso:", response.data);
        router.push(callbackUrl); // Redirige a donde quería ir originalmente
      } else if (response.error) {
        // Error en el login
        console.error("Error de login:", response.error);
        setError(response.error.message || "Error al iniciar sesión");
      }
    } catch (err: unknown) {
      // Usar 'unknown' y un type guard para manejar errores inesperados de manera segura
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

  /**
   * Maneja el login con Google
   */
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || "/dashboard";

      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl, // Redirige después del login exitoso
      });

      if (response.error) {
        setError(
          `Error al iniciar sesión con Google: ${response.error.message}`
        );
      }
    } catch (err) {
      console.error("Error con Google login:", err);
      setError("Error al conectar con Google");
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

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col gap-6 p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h2>

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

        {/* Formulario de email y contraseña */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            required
            disabled={loading}
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            disabled={loading}
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
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
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">o</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Login con Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2 border border-gray-300 p-3 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:bg-gray-100"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? "Conectando..." : "Continuar con Google"}
        </button>

        {/* Enlaces adicionales */}
        <div className="flex flex-col gap-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <div className="text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
