import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/profile", "/settings"];

// Rutas que NO deben ser accesibles si ya estás logueado
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Rutas públicas (accesibles para todos)
const publicRoutes = ["/", "/about", "/contact"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // archivos estáticos
  ) {
    return NextResponse.next();
  }

  // Verificar si hay sesión activa
  const isAuthenticated = await checkSession(request);

  // 🔒 RUTAS PROTEGIDAS: Requieren autenticación
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 🚫 RUTAS DE AUTH: No accesibles si ya está logueado
  if (authRoutes.some((route) => pathname === route)) {
    if (isAuthenticated) {
      // Redirigir donde el usuario quería ir originalmente o al home
      const callbackUrl =
        request.nextUrl.searchParams.get("callbackUrl") || "/";
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.next();
  }

  // 🌐 RUTAS PÚBLICAS: Siempre accesibles
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Por defecto, permitir acceso
  return NextResponse.next();
}

// Función para verificar la sesión con better-auth
async function checkSession(request: NextRequest): Promise<boolean> {
  try {
    const sessionToken = request.cookies.get(
      "better-auth.session_token"
    )?.value;

    if (!sessionToken) {
      return false;
    }

    // Verificar con la API de better-auth
    const response = await fetch(new URL("/api/auth/session", request.url), {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    if (response.ok) {
      const session = await response.json();
      return !!session.user;
    }

    return false;
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
