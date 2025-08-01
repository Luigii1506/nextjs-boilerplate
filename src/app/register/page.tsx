"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePublicPage } from "@/hooks/useAuth";
import type { FormEvent } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();
  const { isLoading: authLoading } = usePublicPage();

  /**
   * Maneja el envío del formulario de registro.
   * @param event El evento del formulario, tipado como FormEvent<HTMLFormElement>.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Previene el envío del formulario por defecto
    setError(""); // Limpiar errores previos
    setLoading(true);

    const formData = new FormData(event.currentTarget); // Usar event.currentTarget para un mejor tipado
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Validación básica de los datos del formulario antes de llamar a la API
    if (!email || !password || !name) {
      setError("Todos los campos son obligatorios.");
      setLoading(false);
      return;
    }

    // Validación de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      // Llamada a la función de registro de Better Auth
      const response = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard", // URL para redirigir después de la verificación
      });

      if (response.data) {
        // Registro exitoso
        console.log("Registro exitoso:", response.data);
        setSuccess(true);
      } else if (response.error) {
        // Error en el registro
        console.error("Error de registro:", response.error);
        setError(response.error.message || "Error al registrar usuario");
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

  // Si el registro fue exitoso, mostrar mensaje de confirmación
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
              ¡Registro Exitoso!
            </h2>
            <p className="text-gray-600 mb-4">
              Tu cuenta ha sido creada exitosamente.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Revisa tu correo electrónico para verificar tu cuenta y completar
              el registro.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 text-center"
            >
              Ir al Login
            </Link>

            <button
              onClick={() => {
                setSuccess(false);
                setError("");
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Registrar otra cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex flex-col gap-6 p-8 bg-white shadow-md rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Crear Cuenta</h2>

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
          <input
            type="text"
            name="name"
            placeholder="Nombre Completo"
            required
            disabled={loading}
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
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
            placeholder="Contraseña (mínimo 6 caracteres)"
            required
            disabled={loading}
            minLength={6}
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
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        {/* Enlaces adicionales */}
        <div className="text-center text-sm border-t pt-4">
          <div className="text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
