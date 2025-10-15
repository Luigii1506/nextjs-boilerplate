/**
 * 🌱 E-COMMERCE COMPLETE SEED SCRIPT
 * ==================================
 *
 * Seeds the database with complete e-commerce data:
 * - Updates products with visibility, channels, sale prices
 * - Creates promotions (2x1, 3x2, percentage discounts)
 * - Creates coupons (welcome codes, seasonal discounts)
 *
 * Usage: npm run seed:ecommerce-complete
 *
 * Created: 2025-01-17 - E-Commerce Complete Foundation
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🎁 PROMOTIONS SEED DATA
const PROMOTIONS_SEED = [
  // 🔥 BOGO Promotion - 2x1 en Electrónicos
  {
    name: "2x1 en Electrónicos Seleccionados",
    description: "Lleva 2 productos electrónicos y paga solo 1",
    type: "BOGO" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 50, // 50% off on second item
    appliesTo: "SPECIFIC_CATEGORIES" as const,
    promoConfig: {
      buy: 2,
      get: 1,
      discountPercent: 100, // Second item is 100% off
    },
    availableChannels: ["ONLINE" as const, "POS" as const],
    isActive: true,
    isPriority: false,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-12-31"),
    maxUsesTotal: 1000,
    maxUsesPerUser: 5,
  },

  // 🎉 Buy X Get Y - 3x2 en Ropa
  {
    name: "3x2 en Toda la Ropa",
    description: "Compra 3 prendas y la de menor valor es gratis",
    type: "BUY_X_GET_Y" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 100, // 100% off on cheapest
    appliesTo: "SPECIFIC_CATEGORIES" as const,
    promoConfig: {
      buy: 3,
      get: 1,
      discountPercent: 100, // Cheapest item is free
      applyToLowest: true,
    },
    availableChannels: ["ONLINE" as const, "POS" as const],
    isActive: true,
    isPriority: false,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-06-30"),
    maxUsesTotal: 500,
    maxUsesPerUser: 3,
  },

  // 💸 Percentage Discount - 20% en Hogar
  {
    name: "20% de Descuento en Hogar y Jardín",
    description: "Ahorra 20% en todos los productos de hogar",
    type: "PERCENTAGE" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 20,
    appliesTo: "SPECIFIC_CATEGORIES" as const,
    minPurchaseAmount: 500,
    availableChannels: ["ONLINE" as const],
    isActive: true,
    isPriority: false,
    startAt: new Date("2025-01-15"),
    endAt: new Date("2025-03-31"),
  },

  // 🚚 Free Shipping
  {
    name: "Envío Gratis en Compras Mayores a $999",
    description: "Obtén envío gratis en tu pedido",
    type: "FREE_SHIPPING" as const,
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 0, // Will be calculated based on shipping cost
    appliesTo: "ENTIRE_ORDER" as const,
    minPurchaseAmount: 999,
    availableChannels: ["ONLINE" as const],
    isActive: true,
    isPriority: true, // Apply first
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-12-31"),
  },

  // 💰 Fixed Amount - $100 descuento
  {
    name: "$100 de Descuento en Deportes",
    description: "Obtén $100 de descuento en productos deportivos",
    type: "FIXED_AMOUNT" as const,
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 100,
    appliesTo: "SPECIFIC_CATEGORIES" as const,
    minPurchaseAmount: 1000,
    availableChannels: ["ONLINE" as const, "POS" as const],
    isActive: true,
    isPriority: false,
    startAt: new Date("2025-02-01"),
    endAt: new Date("2025-04-30"),
    maxUsesTotal: 200,
  },

  // 🎁 Bundle Discount
  {
    name: "Pack de Bienvenida - Ahorra 15%",
    description: "Compra laptop + mouse + teclado y ahorra 15%",
    type: "BUNDLE" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 15,
    appliesTo: "SPECIFIC_PRODUCTS" as const,
    promoConfig: {
      bundleProducts: [], // Will be filled with product IDs
      requiredCount: 3,
    },
    availableChannels: ["ONLINE" as const],
    isActive: true,
    isPriority: false,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-12-31"),
    maxUsesPerUser: 1,
  },
];

// 🎟️ COUPONS SEED DATA
const COUPONS_SEED = [
  // 👋 Welcome Coupon
  {
    code: "BIENVENIDO25",
    name: "Cupón de Bienvenida",
    description: "25% de descuento en tu primera compra",
    type: "FIRST_ORDER" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 25,
    appliesTo: "ALL_PRODUCTS" as const,
    minPurchaseAmount: 500,
    maxDiscountAmount: 500, // Max $500 discount
    maxUsesTotal: null, // Unlimited
    maxUsesPerUser: 1, // Once per user
    availableChannels: ["ONLINE" as const],
    isActive: true,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-12-31"),
  },

  // 🌟 Seasonal Coupon
  {
    code: "VERANO2025",
    name: "Descuento de Verano",
    description: "$200 de descuento en compras superiores a $2,000",
    type: "FIXED_AMOUNT" as const,
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 200,
    appliesTo: "ALL_PRODUCTS" as const,
    minPurchaseAmount: 2000,
    maxUsesTotal: 1000,
    maxUsesPerUser: 2,
    availableChannels: ["ONLINE" as const],
    isActive: true,
    startAt: new Date("2025-06-01"),
    endAt: new Date("2025-08-31"),
  },

  // 💝 Valentine's Day
  {
    code: "AMOR15",
    name: "San Valentín 15% OFF",
    description: "15% de descuento en productos seleccionados",
    type: "PERCENTAGE" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 15,
    appliesTo: "SPECIFIC_CATEGORIES" as const,
    minPurchaseAmount: 300,
    maxDiscountAmount: 300,
    maxUsesTotal: 500,
    maxUsesPerUser: 1,
    availableChannels: ["ONLINE" as const],
    isActive: false, // Will be activated near Valentine's
    startAt: new Date("2025-02-10"),
    endAt: new Date("2025-02-15"),
  },

  // 🚚 Free Shipping Coupon
  {
    code: "ENVIOGRATIS",
    name: "Envío Gratis",
    description: "Envío gratis en tu pedido sin mínimo",
    type: "FREE_SHIPPING" as const,
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 0,
    appliesTo: "ENTIRE_ORDER" as const,
    maxUsesTotal: 100,
    maxUsesPerUser: 1,
    availableChannels: ["ONLINE" as const],
    isActive: true,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-03-31"),
  },

  // 🎂 Birthday Coupon
  {
    code: "CUMPLE20",
    name: "Descuento de Cumpleaños",
    description: "20% de descuento especial de cumpleaños",
    type: "PERCENTAGE" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 20,
    appliesTo: "ALL_PRODUCTS" as const,
    minPurchaseAmount: 400,
    maxDiscountAmount: 400,
    maxUsesTotal: null,
    maxUsesPerUser: 1,
    availableChannels: ["ONLINE" as const, "POS" as const],
    isActive: true,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-12-31"),
  },

  // 🎓 Student Discount
  {
    code: "ESTUDIANTE10",
    name: "Descuento Estudiante",
    description: "10% de descuento para estudiantes",
    type: "PERCENTAGE" as const,
    discountType: "PERCENTAGE" as const,
    discountValue: 10,
    appliesTo: "SPECIFIC_CATEGORIES" as const, // Electronics & Books
    maxUsesTotal: null,
    maxUsesPerUser: 5, // Can use multiple times
    availableChannels: ["ONLINE" as const, "POS" as const],
    isActive: true,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-12-31"),
  },

  // 🏪 Loyalty Coupon
  {
    code: "VIP50",
    name: "Cupón VIP",
    description: "$50 de descuento para clientes frecuentes",
    type: "FIXED_AMOUNT" as const,
    discountType: "FIXED_AMOUNT" as const,
    discountValue: 50,
    appliesTo: "ALL_PRODUCTS" as const,
    minPurchaseAmount: 1000,
    maxUsesTotal: 50, // Limited availability
    maxUsesPerUser: 1,
    availableChannels: ["ONLINE" as const],
    isActive: true,
    startAt: new Date("2025-01-01"),
    endAt: new Date("2025-06-30"),
  },
];

// 🔧 SEED FUNCTIONS

async function updateProductsWithEcommerceFields() {
  console.log("📦 Updating products with e-commerce complete fields...");

  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    let updatedCount = 0;

    for (const product of products) {
      // Determine visibility based on isActive and isPublic
      let visibility: "HIDDEN" | "PUBLIC" | "INTERNAL" | "COMING_SOON" | "DISCONTINUED" = "PUBLIC";

      if (!product.isActive) {
        visibility = "DISCONTINUED";
      } else if (!product.isPublic) {
        visibility = "INTERNAL";
      } else if (Math.random() < 0.1) {
        // 10% of products are coming soon
        visibility = "COMING_SOON";
      }

      // Determine available channels
      // 80% available on both, 10% ONLINE only, 10% POS only
      const rand = Math.random();
      let availableChannels: ("ONLINE" | "POS")[] = [];

      if (rand < 0.8) {
        availableChannels = ["ONLINE", "POS"];
      } else if (rand < 0.9) {
        availableChannels = ["ONLINE"];
      } else {
        availableChannels = ["POS"];
      }

      // Add sale price for some products (30% of products on sale)
      const onSale = Math.random() < 0.3;
      const salePrice = onSale
        ? Number(product.price) * 0.85 // 15% off
        : null;

      const saleStartAt = onSale ? new Date("2025-01-01") : null;
      const saleEndAt = onSale ? new Date("2025-06-30") : null;

      // Add volume pricing for some products
      const hasVolumePricing = Math.random() < 0.2; // 20% have volume pricing
      const volumePricing = hasVolumePricing
        ? [
            { min: 10, price: Number(product.price) * 0.95 }, // 5% off for 10+
            { min: 50, price: Number(product.price) * 0.90 }, // 10% off for 50+
            { min: 100, price: Number(product.price) * 0.85 }, // 15% off for 100+
          ]
        : null;

      // Update product
      await prisma.product.update({
        where: { id: product.id },
        data: {
          visibility,
          availableChannels,
          salePrice,
          saleStartAt,
          saleEndAt,
          volumePricing: volumePricing as any,
        },
      });

      updatedCount++;
    }

    console.log(`  ✅ Updated ${updatedCount} products with e-commerce fields`);
  } catch (error) {
    console.error("❌ Error updating products:", error);
    throw error;
  }
}

async function seedPromotions() {
  console.log("🎁 Seeding promotions...");

  let totalCreated = 0;

  // Get some categories to assign to promotions
  const electronics = await prisma.category.findFirst({
    where: { name: "Electrónicos" },
  });
  const clothing = await prisma.category.findFirst({
    where: { name: "Ropa y Moda" },
  });
  const home = await prisma.category.findFirst({
    where: { name: "Hogar y Jardín" },
  });
  const sports = await prisma.category.findFirst({
    where: { name: "Deportes y Fitness" },
  });

  for (const promoData of PROMOTIONS_SEED) {
    try {
      // Assign target categories based on promotion name
      let targetCategoryIds: string[] = [];

      if (promoData.name.includes("Electrónicos") && electronics) {
        targetCategoryIds = [electronics.id];
      } else if (promoData.name.includes("Ropa") && clothing) {
        targetCategoryIds = [clothing.id];
      } else if (promoData.name.includes("Hogar") && home) {
        targetCategoryIds = [home.id];
      } else if (promoData.name.includes("Deportes") && sports) {
        targetCategoryIds = [sports.id];
      }

      const promotion = await prisma.promotion.create({
        data: {
          name: promoData.name,
          description: promoData.description,
          type: promoData.type,
          discountType: promoData.discountType,
          discountValue: promoData.discountValue,
          appliesTo: promoData.appliesTo,
          targetCategoryIds,
          promoConfig: promoData.promoConfig as any,
          minPurchaseAmount: promoData.minPurchaseAmount,
          minQuantity: undefined,
          maxUsesTotal: promoData.maxUsesTotal,
          maxUsesPerUser: promoData.maxUsesPerUser,
          availableChannels: promoData.availableChannels,
          isActive: promoData.isActive,
          isPriority: promoData.isPriority,
          startAt: promoData.startAt,
          endAt: promoData.endAt,
        },
      });

      totalCreated++;
      console.log(`  ✅ Created promotion: ${promotion.name}`);
    } catch (error) {
      console.error(`❌ Error creating promotion ${promoData.name}:`, error);
    }
  }

  console.log(`🎉 Successfully created ${totalCreated} promotions!`);
}

async function seedCoupons() {
  console.log("🎟️ Seeding coupons...");

  let totalCreated = 0;

  // Get some categories for targeted coupons
  const clothing = await prisma.category.findFirst({
    where: { name: "Ropa y Moda" },
  });
  const electronics = await prisma.category.findFirst({
    where: { name: "Electrónicos" },
  });
  const books = await prisma.category.findFirst({
    where: { name: "Libros y Oficina" },
  });

  for (const couponData of COUPONS_SEED) {
    try {
      // Assign target categories for specific coupons
      let targetCategoryIds: string[] = [];

      if (couponData.code === "AMOR15" && clothing) {
        targetCategoryIds = [clothing.id];
      } else if (couponData.code === "ESTUDIANTE10") {
        if (electronics && books) {
          targetCategoryIds = [electronics.id, books.id];
        }
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: couponData.code,
          name: couponData.name,
          description: couponData.description,
          type: couponData.type,
          discountType: couponData.discountType,
          discountValue: couponData.discountValue,
          appliesTo: couponData.appliesTo,
          targetCategoryIds,
          minPurchaseAmount: couponData.minPurchaseAmount,
          maxDiscountAmount: couponData.maxDiscountAmount,
          maxUsesTotal: couponData.maxUsesTotal,
          maxUsesPerUser: couponData.maxUsesPerUser,
          availableChannels: couponData.availableChannels,
          isActive: couponData.isActive,
          startAt: couponData.startAt,
          endAt: couponData.endAt,
        },
      });

      totalCreated++;
      console.log(`  ✅ Created coupon: ${coupon.code} (${coupon.name})`);
    } catch (error) {
      console.error(`❌ Error creating coupon ${couponData.code}:`, error);
    }
  }

  console.log(`🎉 Successfully created ${totalCreated} coupons!`);
}

// 🚀 MAIN SEED FUNCTION
async function runEcommerceCompleteSeed() {
  console.log("🌱 Starting E-Commerce Complete Seed...");
  console.log("=====================================");

  try {
    // Step 1: Update existing products with new fields
    await updateProductsWithEcommerceFields();
    console.log("");

    // Step 2: Create promotions
    await seedPromotions();
    console.log("");

    // Step 3: Create coupons
    await seedCoupons();
    console.log("");

    console.log("🎊 E-Commerce Complete seed finished successfully!");
    console.log("=====================================");

    // Show summary
    const productsCount = await prisma.product.count();
    const promotionsCount = await prisma.promotion.count();
    const couponsCount = await prisma.coupon.count();

    console.log("📊 SUMMARY:");
    console.log(`  📦 Products updated: ${productsCount}`);
    console.log(`  🎁 Promotions: ${promotionsCount}`);
    console.log(`  🎟️  Coupons: ${couponsCount}`);
    console.log("");
    console.log("✅ Ready to implement PricingEngine!");
  } catch (error) {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  runEcommerceCompleteSeed();
}

export { runEcommerceCompleteSeed };
