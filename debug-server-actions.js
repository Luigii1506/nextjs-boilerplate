const {
  getStorefrontDataAction,
} = require("./src/features/storefront/server/actions");

async function testServerActions() {
  console.log("🔍 Probando server actions del storefront...\n");

  try {
    const result = await getStorefrontDataAction({
      customerId: undefined,
      sessionId: undefined,
      featuredProductsLimit: 8,
      featuredCategoriesLimit: 6,
    });

    console.log("📊 Resultado de getStorefrontDataAction:");
    console.log(`   - Products: ${result.products?.length || 0}`);
    console.log(`   - Categories: ${result.categories?.length || 0}`);
    console.log(
      `   - Featured Products: ${result.featuredProducts?.length || 0}`
    );
    console.log(`   - Stats: ${result.stats ? "Present" : "Missing"}`);
    console.log(`   - Is Loading: ${result.isLoading}`);
    console.log(`   - Is Error: ${result.isError}`);
    console.log(`   - Error: ${result.error || "None"}`);

    if (result.products && result.products.length > 0) {
      console.log("\n📦 Primeros 3 productos:");
      result.products.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - $${p.publicPrice || p.price}`);
      });
    }

    if (result.categories && result.categories.length > 0) {
      console.log("\n🏷️ Primeras 3 categorías:");
      result.categories.slice(0, 3).forEach((c, i) => {
        console.log(
          `   ${i + 1}. ${c.name} (${c.productCount || 0} productos)`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error probando server actions:", error);
  }
}

testServerActions();
