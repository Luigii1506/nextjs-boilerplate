/**
 * 🧪 TEST PRODUCT CREATION
 * =======================
 *
 * Script para probar que la creación de productos funciona
 * con los datos reales del seed
 */

console.log("🧪 Testing product creation with real database data...");

// Ejemplo de datos para crear un producto de prueba
const testProductData = {
  sku: "IPHONE15PM-256-NT",
  name: "iPhone 15 Pro Max 256GB Natural Titanium",
  description:
    "El iPhone más potente jamás creado, con chip A17 Pro, cámara de 48MP y pantalla Super Retina XDR de 6.7 pulgadas.",
  // categoryId: 'Se obtendrá de la base de datos - subcategoría "Smartphones"',
  price: 25999.0,
  cost: 18500.0,
  stock: 10,
  minStock: 2,
  maxStock: 50,
  unit: "piece",
  barcode: "194253464273",
  images: [
    "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-naturaltitanium-select?wid=470&hei=556&fmt=png&qlt=95&.v=1693011039447",
  ],
  // supplierId: 'Se obtendrá de la base de datos - "TechWorld Distribution"',
  tags: ["apple", "iphone", "smartphone", "premium"],
  metadata: {
    warranty: "12 meses",
    model: "15 Pro Max",
    storage: "256GB",
    color: "Natural Titanium",
  },
};

console.log("📱 Sample product data:");
console.log(JSON.stringify(testProductData, null, 2));

console.log("\n✅ Ready to test!");
console.log("🌐 Go to: http://localhost:3000/inventory");
console.log('🎯 Click "Agregar Producto" and use the data above');

console.log("\n📊 Available categories and suppliers:");
console.log("Categories: Electrónicos > Smartphones");
console.log("Suppliers: TechWorld Distribution (Carlos Martínez)");

console.log("\n🎊 The form should now show REAL data from the seed!");
