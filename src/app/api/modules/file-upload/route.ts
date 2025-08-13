// 🔌 UPLOADS API ROUTE
// ===================
// API principal para CRUD de archivos

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/core/auth/server/auth";
import {
  getFilesAction,
  uploadFileAction,
  uploadMultipleFilesAction,
} from "@/modules/file-upload/server/actions";
import type { UploadProvider } from "@/modules/file-upload/types";

// ✅ GET - Obtener archivos del usuario con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      userId: session.user.id,
      search: searchParams.get("search") || undefined,
      provider: (searchParams.get("provider") as UploadProvider) || undefined,
      mimeType: searchParams.get("mimeType") || undefined,
      isPublic: searchParams.get("isPublic") === "true" ? true : undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      offset:
        (parseInt(searchParams.get("page") || "1") - 1) *
        parseInt(searchParams.get("limit") || "20"),
    };

    const result = await getFilesAction(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      files: result.data,
      total: result.data?.length || 0,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ✅ POST - Subir archivo y crear registro
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const providerInput = (formData.get("provider") as string) || "local";
    const provider = (providerInput === "cloudinary" ? "s3" : providerInput) as
      | "local"
      | "s3";
    const categoryId = formData.get("categoryId") as string | undefined;

    const result = await uploadFileAction(
      formData,
      session.user.id,
      provider,
      categoryId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ✅ Filtros via PUT (para filtros complejos)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const filters = {
      userId: session.user.id,
      ...body,
      offset: ((body.page || 1) - 1) * (body.limit || 20),
    };

    const result = await getFilesAction(filters);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      files: result.data,
      total: result.data?.length || 0,
      page: body.page || 1,
      limit: body.limit || 20,
    });
  } catch (error) {
    console.error("Error filtering uploads:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
