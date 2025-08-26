const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkCategoryProps() {
  try {
    const category = await prisma.category.findFirst({
      where: { isPublic: true },
    });

    console.log("✅ Category properties:", Object.keys(category));
    console.log("✅ Sample category:", category);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategoryProps();
