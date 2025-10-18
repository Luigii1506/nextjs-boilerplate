/**
 * 📦 INVENTORY SCHEMAS
 * ===================
 *
 * Schemas Zod para validación de datos del módulo inventory
 * Validaciones client-side y server-side unificadas
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

import { z } from "zod";

// 🏷️ Base Schemas
const stringRequired = (field: string) =>
  z.string().min(1, `${field} es requerido`);
const numberPositive = (field: string) =>
  z.number().positive(`${field} debe ser positivo`);
const numberNonNegative = (field: string) =>
  z.number().min(0, `${field} no puede ser negativo`);

// 📦 PRODUCT SCHEMAS
export const createProductSchema = z
  .object({
    sku: stringRequired("SKU")
      .min(2, "SKU debe tener al menos 2 caracteres")
      .max(50, "SKU no puede exceder 50 caracteres")
      .regex(
        /^[A-Z0-9-_]+$/i,
        "SKU solo puede contener letras, números, guiones y guiones bajos"
      ),

    name: stringRequired("Nombre del producto")
      .min(2, "Nombre debe tener al menos 2 caracteres")
      .max(200, "Nombre no puede exceder 200 caracteres"),

    description: z
      .string()
      .max(1000, "Descripción no puede exceder 1000 caracteres")
      .optional(),

    categoryId: stringRequired("Categoría"),

    price: numberPositive("Precio de venta").max(
      999999.99,
      "Precio no puede exceder $999,999.99"
    ),

    cost: numberNonNegative("Costo").max(
      999999.99,
      "Costo no puede exceder $999,999.99"
    ),

    stock: numberNonNegative("Stock inicial")
      .int("Stock debe ser un número entero")
      .max(999999, "Stock no puede exceder 999,999")
      .default(0),

    minStock: numberNonNegative("Stock mínimo")
      .int("Stock mínimo debe ser un número entero")
      .max(9999, "Stock mínimo no puede exceder 9,999")
      .default(0),

    maxStock: z
      .number()
      .int("Stock máximo debe ser un número entero")
      .positive("Stock máximo debe ser positivo")
      .max(999999, "Stock máximo no puede exceder 999,999")
      .optional()
      .nullable(),

    unit: z
      .string()
      .min(1, "Unidad de medida es requerida")
      .max(20, "Unidad no puede exceder 20 caracteres")
      .default("piece"),

    barcode: z
      .string()
      .min(5, "Código de barras debe tener al menos 5 caracteres")
      .max(50, "Código de barras no puede exceder 50 caracteres")
      .regex(
        /^[0-9A-Z-]+$/,
        "Código de barras solo puede contener números, letras mayúsculas y guiones"
      )
      .optional()
      .nullable(),

    images: z
      .array(z.string().url("Cada imagen debe ser una URL válida"))
      .max(10, "No se pueden agregar más de 10 imágenes")
      .default([]),

    supplierId: z.string().optional().nullable(),

    tags: z
      .array(
        z
          .string()
          .min(1, "Tag no puede estar vacío")
          .max(30, "Tag no puede exceder 30 caracteres")
      )
      .max(20, "No se pueden agregar más de 20 tags")
      .default([]),

    metadata: z
      .record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean(), z.null()])
      )
      .optional()
      .nullable(),
  })
  .refine((data) => !data.maxStock || data.maxStock >= data.minStock, {
    message: "Stock máximo debe ser mayor o igual al stock mínimo",
    path: ["maxStock"],
  })
  .refine((data) => data.price >= data.cost, {
    message: "Precio de venta debe ser mayor o igual al costo",
    path: ["price"],
  });

export const updateProductSchema = createProductSchema.partial().extend({
  id: stringRequired("ID del producto"),
  isActive: z.boolean().optional(),
});

// 🏷️ CATEGORY SCHEMAS
export const createCategorySchema = z.object({
  name: stringRequired("Nombre de la categoría")
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres"),

  description: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),

  parentId: z.string().optional().nullable(),

  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "Color debe ser un código hexadecimal válido (#RRGGBB)"
    )
    .optional()
    .nullable(),

  icon: z
    .string()
    .max(50, "Nombre del ícono no puede exceder 50 caracteres")
    .optional()
    .nullable(),

  sortOrder: z
    .number()
    .int("Orden debe ser un número entero")
    .min(0, "Orden no puede ser negativo")
    .max(9999, "Orden no puede exceder 9,999")
    .default(0),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: stringRequired("ID de la categoría"),
  isActive: z.boolean().optional(),
});

// 🚛 SUPPLIER SCHEMAS
export const createSupplierSchema = z.object({
  name: stringRequired("Nombre del proveedor")
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(200, "Nombre no puede exceder 200 caracteres"),

  contactPerson: z
    .string()
    .min(2, "Persona de contacto debe tener al menos 2 caracteres")
    .max(100, "Persona de contacto no puede exceder 100 caracteres")
    .optional(),

  email: z
    .string()
    .email("Email debe ser válido")
    .max(255, "Email no puede exceder 255 caracteres")
    .optional()
    .nullable(),

  phone: z
    .string()
    .max(20, "Teléfono no puede exceder 20 caracteres")
    .regex(
      /^[\d\s\-\+\(\)]*$/,
      "Teléfono solo puede contener números, espacios, guiones, paréntesis y +"
    )
    .optional()
    .or(z.literal("")),

  website: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Sitio web debe ser una URL válida o vacío",
    })
    .max(255, "URL no puede exceder 255 caracteres")
    .optional(),

  taxId: z
    .string()
    .min(5, "RFC/NIT debe tener al menos 5 caracteres")
    .max(30, "RFC/NIT no puede exceder 30 caracteres")
    .regex(
      /^[A-Z0-9-]+$/,
      "RFC/NIT solo puede contener letras mayúsculas, números y guiones"
    )
    .optional()
    .nullable(),

  paymentTerms: z
    .number()
    .int("Términos de pago debe ser un número entero")
    .min(0, "Términos de pago no pueden ser negativos")
    .max(365, "Términos de pago no pueden exceder 365 días")
    .default(30),

  rating: z
    .number()
    .min(1, "Calificación mínima es 1")
    .max(5, "Calificación máxima es 5")
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(1000, "Notas no pueden exceder 1000 caracteres")
    .optional(),

  // 📍 Address fields
  addressLine1: z
    .string()
    .max(255, "Dirección línea 1 no puede exceder 255 caracteres")
    .optional(),

  addressLine2: z
    .string()
    .max(255, "Dirección línea 2 no puede exceder 255 caracteres")
    .optional(),

  city: z
    .string()
    .max(100, "Ciudad no puede exceder 100 caracteres")
    .optional(),

  state: z
    .string()
    .max(100, "Estado no puede exceder 100 caracteres")
    .optional(),

  postalCode: z
    .string()
    .max(20, "Código postal no puede exceder 20 caracteres")
    .optional()
    .or(z.literal("")),

  country: z
    .string()
    .length(2, "País debe ser un código ISO de 2 letras")
    .regex(/^[A-Z]{2}$/, "País debe ser un código ISO válido (ej: MX, US)")
    .optional()
    .default("MX"),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  id: stringRequired("ID del proveedor"),
  isActive: z.boolean().optional(),
});

// 📊 STOCK MOVEMENT SCHEMAS
export const stockMovementTypeSchema = z.enum(
  ["IN", "OUT", "ADJUSTMENT", "TRANSFER"],
  {
    errorMap: () => ({ message: "Tipo de movimiento inválido" }),
  }
);

export const createStockMovementSchema = z.object({
  productId: stringRequired("ID del producto"),

  type: stockMovementTypeSchema,

  quantity: z
    .number()
    .int("Cantidad debe ser un número entero")
    .min(1, "Cantidad debe ser al menos 1")
    .max(999999, "Cantidad no puede exceder 999,999"),

  reason: stringRequired("Motivo del movimiento")
    .min(3, "Motivo debe tener al menos 3 caracteres")
    .max(255, "Motivo no puede exceder 255 caracteres"),

  reference: z
    .string()
    .max(100, "Referencia no puede exceder 100 caracteres")
    .optional()
    .nullable(),

  userId: stringRequired("ID del usuario"),
});

// 🔍 FILTER SCHEMAS
export const stockStatusSchema = z.enum(
  ["IN_STOCK", "LOW_STOCK", "CRITICAL_STOCK", "OUT_OF_STOCK"],
  {
    errorMap: () => ({ message: "Estado de stock inválido" }),
  }
);

export const sortDirectionSchema = z.enum(["asc", "desc"], {
  errorMap: () => ({ message: "Dirección de ordenamiento inválida" }),
});

export const productFiltersSchema = z
  .object({
    search: z.string().max(255).optional(),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
    stockStatus: stockStatusSchema.optional(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    minStock: z.number().min(0).optional(),
    maxStock: z.number().min(0).optional(),
  })
  .refine(
    (data) =>
      !data.minPrice || !data.maxPrice || data.maxPrice >= data.minPrice,
    {
      message: "Precio máximo debe ser mayor o igual al precio mínimo",
      path: ["maxPrice"],
    }
  )
  .refine(
    (data) =>
      !data.minStock || !data.maxStock || data.maxStock >= data.minStock,
    {
      message: "Stock máximo debe ser mayor o igual al stock mínimo",
      path: ["maxStock"],
    }
  );

export const categoryFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const supplierFiltersSchema = z.object({
  search: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  minRating: z.number().min(1).max(5).optional(),
  country: z.string().length(2).optional(),
});

export const stockMovementFiltersSchema = z
  .object({
    productId: z.string().optional(),
    userId: z.string().optional(),
    type: stockMovementTypeSchema.optional(),
    dateFrom: z.date().optional(),
    dateTo: z.date().optional(),
  })
  .refine(
    (data) => !data.dateFrom || !data.dateTo || data.dateTo >= data.dateFrom,
    {
      message: "Fecha hasta debe ser posterior a fecha desde",
      path: ["dateTo"],
    }
  );

// 📄 PAGINATION SCHEMA
export const paginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().max(50).optional(),
  sortDirection: sortDirectionSchema.default("asc"),
});

// 🧮 BULK OPERATIONS SCHEMAS
export const bulkUpdateProductsSchema = z.object({
  ids: z.array(z.string()).min(1, "Debe seleccionar al menos un producto"),
  updates: z.object({
    categoryId: z.string().optional(),
    supplierId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "Debe seleccionar al menos un elemento"),
  force: z.boolean().default(false), // Para forzar eliminación con relaciones
});

// 📊 IMPORT/EXPORT SCHEMAS
export const importProductsSchema = z
  .array(
    createProductSchema.omit({ categoryId: true }).extend({
      categoryName: z.string(), // Se resolverá a categoryId
    })
  )
  .min(1, "Debe importar al menos un producto")
  .max(1000, "No se pueden importar más de 1000 productos a la vez");

// 🔧 UTILITY FUNCTIONS
export function validateSku(
  sku: string,
  existingSkus: string[] = []
): { isValid: boolean; error?: string } {
  try {
    // Validación básica del schema
    createProductSchema.shape.sku.parse(sku);

    // Verificar unicidad
    if (existingSkus.includes(sku.toLowerCase())) {
      return { isValid: false, error: "SKU ya existe en el sistema" };
    }

    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || "SKU inválido",
      };
    }
    return { isValid: false, error: "Error validando SKU" };
  }
}

export function validateBarcode(
  barcode: string,
  existingBarcodes: string[] = []
): { isValid: boolean; error?: string } {
  if (!barcode) return { isValid: true }; // Barcode is optional

  try {
    createProductSchema.shape.barcode.parse(barcode);

    if (existingBarcodes.includes(barcode)) {
      return {
        isValid: false,
        error: "Código de barras ya existe en el sistema",
      };
    }

    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || "Código de barras inválido",
      };
    }
    return { isValid: false, error: "Error validando código de barras" };
  }
}

// 📋 FORM VALIDATION UTILITIES
export type FormValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export function validateProductForm(data: unknown): FormValidationResult {
  try {
    createProductSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return {
      isValid: false,
      errors: { _form: "Error de validación desconocido" },
    };
  }
}

// Note: All schemas are already exported above individually
// No need for additional exports to avoid duplication
