import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getServerFeatureFlags,
  type FeatureFlagContext,
} from "@/core/config/server-feature-flags";

// Rutas que requieren autenticación
const protectedRoutes = [
  "/dashboard",
  "/user-dashboard",
  "/profile",
  "/settings",
];

// 🎛️ Rutas que necesitan evaluación de feature flags (Enterprise pattern)
const FEATURE_FLAG_ROUTES = [
  "/dashboard",
  "/files",
  "/users",
  "/feature-flags",
  "/user-dashboard",
];

// Rutas solo para admin
const adminRoutes = ["/dashboard"];

// Rutas solo para usuarios regulares
const userRoutes = ["/user-dashboard"];

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

  // Verificar si hay sesión activa y obtener información del usuario
  const sessionInfo = await checkSession(request);
  const isAuthenticated = sessionInfo.isAuthenticated;
  const userRole = sessionInfo.role;
  const userId = sessionInfo.userId;
  const userEmail = sessionInfo.email;
  const isAdmin = userRole === "admin" || userRole === "super_admin";

  // 🎯 ENTERPRISE FEATURE FLAGS EVALUATION (Edge Performance)
  let featureFlags: Record<string, boolean> = {};
  const needsFeatureFlags = FEATURE_FLAG_ROUTES.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  if (needsFeatureFlags) {
    try {
      // 🚀 Build context for feature flag evaluation
      const flagContext: FeatureFlagContext = {
        userId,
        userRole,
        userEmail,
        country: request.geo?.country || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      };

      // ⚡ Evaluate feature flags at Edge (ultra-fast)
      featureFlags = await getServerFeatureFlags(flagContext);
    } catch (error) {
      console.error("[Middleware] Feature flags evaluation failed:", error);
      // Continue with empty flags - Server Components will use fallback
    }
  }

  // 🔒 RUTAS PROTEGIDAS: Requieren autenticación
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirigir a login si no está autenticado
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 👑 RUTAS DE ADMIN: Solo para administradores
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (!isAdmin) {
        // Si no es admin, redirigir al dashboard de usuario
        return NextResponse.redirect(new URL("/user-dashboard", request.url));
      }
    }

    // 👤 RUTAS DE USUARIO: Solo para usuarios regulares (redirigir admin a su dashboard)
    if (userRoutes.some((route) => pathname.startsWith(route))) {
      if (isAdmin) {
        // Si es admin, redirigir al dashboard de admin
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // 🎯 Create response with feature flags (Enterprise pattern)
    const response = NextResponse.next();

    // 📍 Pass current pathname for Server Component navigation
    response.headers.set("x-pathname", pathname);

    if (needsFeatureFlags && Object.keys(featureFlags).length > 0) {
      // 📤 Pass feature flags to Server Components via headers
      response.headers.set("x-feature-flags", JSON.stringify(featureFlags));

      // 🍪 Also set as cookie for client-side access if needed
      response.cookies.set("feature-flags", JSON.stringify(featureFlags), {
        httpOnly: false, // Allow client access for dev tools
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60, // 5 minutes
        path: "/",
      });
    }

    return response;
  }

  // 🚫 RUTAS DE AUTH: No accesibles si ya está logueado
  if (authRoutes.some((route) => pathname === route)) {
    if (isAuthenticated) {
      // Redirigir donde el usuario quería ir originalmente o a su dashboard apropiado
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

      if (callbackUrl) {
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }

      // Redirigir al dashboard apropiado según el rol
      const dashboardUrl = isAdmin ? "/dashboard" : "/user-dashboard";
      return NextResponse.redirect(new URL(dashboardUrl, request.url));
    }

    // 🎯 Create response with feature flags for auth routes too
    return createResponseWithFeatureFlags(
      featureFlags,
      needsFeatureFlags,
      pathname
    );
  }

  // 🌐 RUTAS PÚBLICAS: Siempre accesibles
  if (publicRoutes.some((route) => pathname === route)) {
    return createResponseWithFeatureFlags(
      featureFlags,
      needsFeatureFlags,
      pathname
    );
  }

  // Por defecto, permitir acceso con feature flags
  return createResponseWithFeatureFlags(
    featureFlags,
    needsFeatureFlags,
    pathname
  );
}

// 🎯 Helper function to create responses with feature flags (Enterprise pattern)
function createResponseWithFeatureFlags(
  featureFlags: Record<string, boolean>,
  needsFeatureFlags: boolean,
  pathname?: string
): NextResponse {
  const response = NextResponse.next();

  // 📍 Pass current pathname for Server Component navigation
  if (pathname) {
    response.headers.set("x-pathname", pathname);
  }

  if (needsFeatureFlags && Object.keys(featureFlags).length > 0) {
    // 📤 Pass feature flags to Server Components via headers
    response.headers.set("x-feature-flags", JSON.stringify(featureFlags));

    // 🍪 Also set as cookie for client-side access if needed
    response.cookies.set("feature-flags", JSON.stringify(featureFlags), {
      httpOnly: false, // Allow client access for dev tools
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5 * 60, // 5 minutes
      path: "/",
    });
  }

  return response;
}

// Función para verificar la sesión con better-auth (Enterprise enhanced)
async function checkSession(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  role?: string;
  userId?: string;
  email?: string;
}> {
  try {
    const sessionToken = request.cookies.get(
      "better-auth.session_token"
    )?.value;

    if (!sessionToken) {
      return { isAuthenticated: false };
    }

    // Verificar con la API de better-auth
    const response = await fetch(new URL("/api/auth/session", request.url), {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    });

    if (response.ok) {
      const session = await response.json();
      if (session.user) {
        return {
          isAuthenticated: true,
          role: session.user.role || "user",
          userId: session.user.id,
          email: session.user.email,
        };
      }
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error("Error checking session:", error);
    return { isAuthenticated: false };
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
