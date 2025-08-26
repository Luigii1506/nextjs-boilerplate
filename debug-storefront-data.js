const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkStorefrontData() {
  console.log("🔍 Verificando datos del storefront en la DB...\n");

  try {
    // Verificar productos públicos
    const publicProducts = await prisma.product.findMany({
      where: {
        isPublic: true,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    console.log(`📦 Productos públicos encontrados: ${publicProducts.length}`);
    if (publicProducts.length > 0) {
      console.log("   Ejemplos:");
      publicProducts.slice(0, 3).forEach((p) => {
        console.log(
          `   - ${p.name} (${p.sku}) - $${
            p.publicPrice || p.price
          } - Categoría: ${p.category?.name}`
        );
      });
    }
    console.log();

    // Verificar categorías públicas
    const publicCategories = await prisma.category.findMany({
      where: {
        isPublic: true,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isPublic: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `🏷️ Categorías públicas encontradas: ${publicCategories.length}`
    );
    if (publicCategories.length > 0) {
      console.log("   Ejemplos:");
      publicCategories.slice(0, 3).forEach((c) => {
        console.log(`   - ${c.name} (${c._count.products} productos)`);
      });
    }
    console.log();

    // Verificar customers
    const customers = await prisma.customer.findMany();
    console.log(`👤 Customers encontrados: ${customers.length}`);
    if (customers.length > 0) {
      console.log("   Ejemplos:");
      customers.forEach((c) => {
        console.log(`   - ${c.firstName} ${c.lastName} (${c.email})`);
      });
    }
    console.log();

    // Verificar productos featured
    const featuredProducts = await prisma.product.findMany({
      where: {
        isPublic: true,
        isActive: true,
        featured: true,
      },
    });

    console.log(`⭐ Productos destacados: ${featuredProducts.length}`);
    console.log();
  } catch (error) {
    console.error("❌ Error verificando datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStorefrontData();
