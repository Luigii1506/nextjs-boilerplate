export const runtime = "nodejs";

import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Acceso no autorizado",
  description: "No tienes permisos para ver esta página.",
};

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white shadow-sm rounded-2xl border border-slate-200 p-8 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center">
          <Shield className="w-7 h-7 text-red-600" />
        </div>

        <h1 className="text-2xl font-semibold text-slate-800">
          Acceso no autorizado
        </h1>
        <p className="mt-2 text-slate-600">
          No tienes permisos para acceder a esta sección. Si crees que es un
          error, contacta al administrador del sistema.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Código de estado: <span className="font-mono">403</span>
        </p>
      </div>
    </main>
  );
}
