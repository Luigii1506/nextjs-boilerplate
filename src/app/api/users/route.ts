// 👥 API USERS ADMIN
// =================
// Endpoint para administrar usuarios del sistema

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/server/auth";

// 📊 GET - Obtener lista de usuarios
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden ver usuarios
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const searchValue = searchParams.get("searchValue") || "";
    const searchField = searchParams.get("searchField") || "email";

    // Por ahora delegamos al cliente de auth para mantener consistencia
    // En una implementación real, esto podría ir directo a la base de datos
    const users = await auth.api.listUsers({
      query: {
        limit,
        offset,
        ...(searchValue && {
          searchValue,
          searchField: searchField as "email" | "name",
          searchOperator: "contains" as const,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      users: users.users,
      total: users.total,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 📝 POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden crear usuarios
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Permisos insuficientes" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validar entrada
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email y password son requeridos" },
        { status: 400 }
      );
    }

    // Crear usuario usando Better Auth
    const newUser = await auth.api.createUser({
      body: {
        email,
        name,
        password,
        role: role || "user",
      },
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      createdBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
