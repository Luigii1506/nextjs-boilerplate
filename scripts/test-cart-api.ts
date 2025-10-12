/**
 * API test to verify cart operations work without loops
 */

import { addToCartAction, getCartAction } from "../src/features/cart/server/actions";

async function testCartOperations() {
  console.log("🧪 Testing cart operations directly...\n");

  // Test with session ID (guest user)
  const sessionId = `test_session_${Date.now()}`;
  console.log(`📋 Using sessionId: ${sessionId}\n`);

  try {
    // Step 1: Get initial cart (should be empty)
    console.log("1️⃣ Getting initial cart...");
    const initialCart = await getCartAction({ sessionId });
    console.log("Initial cart:", {
      success: initialCart.success,
      hasData: !!initialCart.data,
      itemCount: initialCart.data?.items?.length || 0
    });

    // Step 2: Add first item
    console.log("\n2️⃣ Adding first item to cart...");
    const productId1 = "cmesx2xus0009iy40c640uoi2"; // Example product ID
    const addResult1 = await addToCartAction({
      productId: productId1,
      quantity: 1,
      sessionId
    });
    console.log("Add result 1:", {
      success: addResult1.success,
      itemCount: addResult1.data?.cart?.items?.length || 0,
      error: addResult1.error
    });

    if (!addResult1.success) {
      console.error("❌ Failed to add first item:", addResult1.error);
      return;
    }

    // Step 3: Add second item (this is where the loop happened)
    console.log("\n3️⃣ Adding second item to cart...");
    const productId2 = "cmesx2xus000aiy40kxcrfqv9"; // Another product ID
    const addResult2 = await addToCartAction({
      productId: productId2,
      quantity: 1,
      sessionId
    });
    console.log("Add result 2:", {
      success: addResult2.success,
      itemCount: addResult2.data?.cart?.items?.length || 0,
      error: addResult2.error
    });

    if (!addResult2.success) {
      console.error("❌ Failed to add second item:", addResult2.error);
      return;
    }

    // Step 4: Final cart state
    console.log("\n4️⃣ Getting final cart state...");
    const finalCart = await getCartAction({ sessionId });
    console.log("Final cart:", {
      success: finalCart.success,
      itemCount: finalCart.data?.items?.length || 0,
      items: finalCart.data?.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        name: item.product?.name
      }))
    });

    console.log("\n✅ Cart operations completed successfully!");
    console.log("No infinite loop detected in server actions.");

  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
  }
}

// Run the test
testCartOperations().then(() => {
  console.log("\n🏁 Test completed");
  process.exit(0);
}).catch(error => {
  console.error("Test error:", error);
  process.exit(1);
});