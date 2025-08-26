/**
 * 🛒 STOREFRONT SEED SCRIPT
 * ========================
 *
 * Seeds the database with realistic storefront data:
 * - Runs inventory seed first (categories + suppliers)
 * - Creates products with storefront public fields
 * - Creates test customers
 * - Sets up sample carts and wishlists
 * - Creates product reviews
 *
 * Usage: npm run seed:storefront
 *
 * Created: 2025-01-17 - Storefront Seed
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

// 🛍️ REALISTIC PRODUCTS DATA FOR STOREFRONT
const PRODUCTS_SEED = [
  // 💻 ELECTRONICS - Computers
  {
    sku: "LAP-001",
    name: 'MacBook Pro M3 14"',
    description: "Laptop profesional con chip M3, 16GB RAM, 512GB SSD",
    price: 45999.0,
    cost: 38000.0,
    publicPrice: 42999.0,
    publicDescription:
      "La laptop más potente de Apple con el revolucionario chip M3. Perfecta para profesionales creativos y desarrolladores.",
    stock: 15,
    minStock: 5,
    unit: "pieza",
    barcode: "194252716465",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
    ],
    publicImages: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
      "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=800",
    ],
    tags: ["apple", "laptop", "m3", "profesional"],
    isPublic: true,
    featured: true,
    seoTitle: 'MacBook Pro M3 14" - La Laptop Más Potente | TechStore',
    seoDescription:
      "MacBook Pro M3 con 16GB RAM y 512GB SSD. Envío gratis y garantía. La mejor laptop para profesionales.",
    seoKeywords: ["macbook", "apple", "m3", "laptop", "profesional"],
    category: "Computadoras",
  },
  {
    sku: "LAP-002",
    name: "Dell XPS 13 Plus",
    description: "Ultrabook premium con Intel i7, 16GB RAM, 1TB SSD",
    price: 32999.0,
    cost: 27000.0,
    publicPrice: 29999.0,
    publicDescription:
      "Ultrabook elegante y potente con pantalla InfinityEdge. Ideal para productividad y entretenimiento.",
    stock: 12,
    minStock: 3,
    unit: "pieza",
    barcode: "884116381234",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    ],
    publicImages: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    ],
    tags: ["dell", "intel", "i7", "ultrabook"],
    isPublic: true,
    featured: true,
    seoTitle: "Dell XPS 13 Plus - Ultrabook Premium | TechStore",
    seoDescription:
      "Dell XPS 13 Plus con Intel i7 y pantalla InfinityEdge. El equilibrio perfecto entre rendimiento y portabilidad.",
    seoKeywords: ["dell", "xps", "ultrabook", "intel", "i7"],
    category: "Computadoras",
  },

  // 📱 SMARTPHONES
  {
    sku: "PHN-001",
    name: "iPhone 15 Pro Max 256GB",
    description: "Smartphone premium con chip A17 Pro, cámara triple 48MP",
    price: 28999.0,
    cost: 24000.0,
    publicPrice: 26999.0,
    publicDescription:
      "El iPhone más avanzado hasta la fecha. Chip A17 Pro, titanio aerospace grade y sistema de cámara profesional.",
    stock: 25,
    minStock: 10,
    unit: "pieza",
    barcode: "194253433521",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    ],
    publicImages: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    ],
    tags: ["iphone", "apple", "a17", "titanio"],
    isPublic: true,
    featured: true,
    seoTitle: "iPhone 15 Pro Max 256GB - El iPhone Más Avanzado | TechStore",
    seoDescription:
      "iPhone 15 Pro Max con chip A17 Pro y titanio. Cámara profesional 48MP. Compra con envío gratis.",
    seoKeywords: ["iphone", "15", "pro", "max", "a17", "apple"],
    category: "Smartphones",
  },
  {
    sku: "PHN-002",
    name: "Samsung Galaxy S24 Ultra 512GB",
    description: "Smartphone Android flagship con S Pen, cámara 200MP",
    price: 26999.0,
    cost: 22000.0,
    publicPrice: 24999.0,
    publicDescription:
      "El smartphone más completo de Samsung. S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X.",
    stock: 18,
    minStock: 8,
    unit: "pieza",
    barcode: "887276712345",
    images: [
      "https://images.unsplash.com/photo-1610792516307-ea5aef8c4d05?w=800",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800",
    ],
    publicImages: [
      "https://images.unsplash.com/photo-1610792516307-ea5aef8c4d05?w=800",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800",
    ],
    tags: ["samsung", "galaxy", "s24", "s-pen"],
    isPublic: true,
    featured: true,
    seoTitle: "Samsung Galaxy S24 Ultra 512GB - Smartphone Premium | TechStore",
    seoDescription:
      "Galaxy S24 Ultra con S Pen y cámara 200MP. El smartphone para productividad y fotografía profesional.",
    seoKeywords: ["samsung", "galaxy", "s24", "ultra", "s-pen"],
    category: "Smartphones",
  },

  // 🎧 AUDIO & VIDEO
  {
    sku: "AUD-001",
    name: "AirPods Pro 2da Gen",
    description: "Audífonos inalámbricos con cancelación activa de ruido",
    price: 5999.0,
    cost: 4800.0,
    publicPrice: 5499.0,
    publicDescription:
      "Los mejores audífonos inalámbricos de Apple. Cancelación de ruido adaptativa y audio espacial personalizado.",
    stock: 45,
    minStock: 15,
    unit: "pieza",
    barcode: "194253218634",
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800",
    ],
    publicImages: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800",
    ],
    tags: ["airpods", "apple", "wireless", "noise-cancelling"],
    isPublic: true,
    featured: true,
    seoTitle: "AirPods Pro 2da Gen - Cancelación de Ruido | TechStore",
    seoDescription:
      "AirPods Pro con cancelación adaptativa de ruido. La mejor experiencia de audio inalámbrica de Apple.",
    seoKeywords: ["airpods", "pro", "apple", "wireless", "noise-cancelling"],
    category: "Audio & Video",
  },

  // 👕 CLOTHING - Men's
  {
    sku: "CLO-001",
    name: "Camisa Oxford Azul Premium",
    description: "Camisa de vestir de algodón 100%, corte slim fit",
    price: 899.0,
    cost: 450.0,
    publicPrice: 799.0,
    publicDescription:
      "Camisa Oxford clásica de algodón premium. Perfecta para oficina o eventos formales. Disponible en varias tallas.",
    stock: 30,
    minStock: 10,
    unit: "pieza",
    barcode: "7501234567890",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
    ],
    publicImages: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
    ],
    tags: ["camisa", "oxford", "algodón", "slim-fit"],
    isPublic: true,
    featured: false,
    seoTitle: "Camisa Oxford Azul Premium - Algodón 100% | FashionStore",
    seoDescription:
      "Camisa Oxford de algodón premium, corte slim fit. Ideal para oficina. Envío gratis en pedidos mayores a $500.",
    seoKeywords: ["camisa", "oxford", "algodón", "premium", "azul"],
    category: "Ropa Masculina",
  },

  // 🏠 HOME & GARDEN
  {
    sku: "HOM-001",
    name: "Cafetera Espresso Automática",
    description: "Cafetera profesional con molinillo integrado, 15 bares",
    price: 8999.0,
    cost: 6500.0,
    publicPrice: 7999.0,
    publicDescription:
      "Cafetera espresso profesional con molinillo de cerámica. Prepara café de barista desde casa con un solo toque.",
    stock: 8,
    minStock: 2,
    unit: "pieza",
    barcode: "8801643765432",
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
      "https://images.unsplash.com/photo-1572119818892-6290abd8adad?w=800",
    ],
    publicImages: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800",
      "https://images.unsplash.com/photo-1572119818892-6290abd8adad?w=800",
    ],
    tags: ["cafetera", "espresso", "automática", "molinillo"],
    isPublic: true,
    featured: true,
    seoTitle: "Cafetera Espresso Automática con Molinillo | HomeStore",
    seoDescription:
      "Cafetera profesional con molinillo integrado. Café de barista en casa. Garantía 2 años y envío gratis.",
    seoKeywords: ["cafetera", "espresso", "automática", "molinillo", "café"],
    category: "Hogar y Jardín",
  },
];

// 👤 TEST CUSTOMERS DATA
const CUSTOMERS_SEED = [
  {
    email: "ana.martinez@example.com",
    firstName: "Ana",
    lastName: "Martínez",
    phone: "+52155512345678",
    tier: "GOLD",
    totalSpent: 45000.0,
    totalOrders: 12,
    marketingEmails: true,
    smsNotifications: true,
    addresses: [
      {
        type: "SHIPPING",
        label: "Casa",
        firstName: "Ana",
        lastName: "Martínez",
        street: "Av. Reforma 123, Col. Centro",
        city: "Ciudad de México",
        state: "CDMX",
        zipCode: "06000",
        country: "MX",
        phone: "+52155512345678",
        isDefault: true,
      },
    ],
  },
  {
    email: "carlos.rodriguez@example.com",
    firstName: "Carlos",
    lastName: "Rodríguez",
    phone: "+52155587654321",
    tier: "SILVER",
    totalSpent: 18500.0,
    totalOrders: 5,
    marketingEmails: true,
    smsNotifications: false,
    addresses: [
      {
        type: "BOTH",
        label: "Oficina",
        firstName: "Carlos",
        lastName: "Rodríguez",
        street: "Insurgentes Sur 456, Col. Roma Norte",
        city: "Ciudad de México",
        state: "CDMX",
        zipCode: "06700",
        country: "MX",
        phone: "+52155587654321",
        isDefault: true,
      },
    ],
  },
  {
    email: "maria.lopez@example.com",
    firstName: "María",
    lastName: "López",
    phone: "+52155511111111",
    tier: "BRONZE",
    totalSpent: 3200.0,
    totalOrders: 2,
    marketingEmails: false,
    smsNotifications: true,
    addresses: [
      {
        type: "SHIPPING",
        label: "Casa",
        firstName: "María",
        lastName: "López",
        street: "Calle Morelos 789, Col. Centro",
        city: "Guadalajara",
        state: "Jalisco",
        zipCode: "44100",
        country: "MX",
        phone: "+52155511111111",
        isDefault: true,
      },
    ],
  },
];

// ⭐ PRODUCT REVIEWS DATA
const REVIEWS_SEED = [
  {
    productSku: "LAP-001", // MacBook Pro
    customerEmail: "ana.martinez@example.com",
    rating: 5,
    title: "Excelente laptop para trabajo profesional",
    content:
      "La MacBook Pro M3 superó mis expectativas. La batería dura todo el día y el rendimiento es excepcional para edición de video y desarrollo. La pantalla es increíble.",
    isVerifiedPurchase: true,
  },
  {
    productSku: "LAP-001", // MacBook Pro
    customerEmail: "carlos.rodriguez@example.com",
    rating: 4,
    title: "Muy buena pero costosa",
    content:
      "Gran rendimiento y calidad de construcción. El chip M3 es muy rápido. Solo el precio es elevado, pero vale la pena para uso profesional.",
    isVerifiedPurchase: true,
  },
  {
    productSku: "PHN-001", // iPhone 15 Pro Max
    customerEmail: "maria.lopez@example.com",
    rating: 5,
    title: "El mejor iPhone que he tenido",
    content:
      "Cámara increíble, batería que dura más de un día completo. El material titanio se siente premium. Definitivamente recomendado.",
    isVerifiedPurchase: true,
  },
  {
    productSku: "AUD-001", // AirPods Pro
    customerEmail: "ana.martinez@example.com",
    rating: 4,
    title: "Buen audio y cancelación de ruido",
    content:
      "Los AirPods Pro tienen excelente calidad de audio y la cancelación de ruido funciona muy bien. Se conectan instantáneamente con todos mis dispositivos Apple.",
    isVerifiedPurchase: true,
  },
];

// 🛠️ HELPER FUNCTIONS
async function runInventorySeed() {
  console.log("🌱 Running inventory seed first...");
  try {
    execSync("npx tsx src/features/inventory/scripts/seed-inventory.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    console.log("✅ Inventory seed completed");
  } catch (error) {
    console.error("❌ Inventory seed failed:", error);
    throw error;
  }
}

async function seedProducts() {
  console.log("📦 Seeding storefront products...");

  let createdCount = 0;

  for (const productData of PRODUCTS_SEED) {
    try {
      // Find category by name
      const category = await prisma.category.findFirst({
        where: { name: productData.category },
      });

      if (!category) {
        console.warn(
          `⚠️ Category '${productData.category}' not found for product ${productData.sku}`
        );
        continue;
      }

      // Get a random supplier (optional)
      const suppliers = await prisma.supplier.findMany({ take: 5 });
      const randomSupplier =
        suppliers[Math.floor(Math.random() * suppliers.length)];

      const product = await prisma.product.create({
        data: {
          sku: productData.sku,
          name: productData.name,
          description: productData.description,
          categoryId: category.id,
          price: productData.price,
          cost: productData.cost,
          stock: productData.stock,
          minStock: productData.minStock,
          unit: productData.unit,
          barcode: productData.barcode,
          images: productData.images,
          tags: productData.tags,
          isActive: true,
          supplierId: randomSupplier?.id || null,

          // 🛍️ Storefront public fields
          isPublic: productData.isPublic,
          publicPrice: productData.publicPrice,
          publicDescription: productData.publicDescription,
          publicImages: productData.publicImages,
          seoTitle: productData.seoTitle,
          seoDescription: productData.seoDescription,
          seoKeywords: productData.seoKeywords,
          featured: productData.featured,
        },
      });

      createdCount++;
      console.log(`  ✅ Created product: ${product.name} (${product.sku})`);
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(
          `  ⚠️ Product ${productData.sku} already exists, skipping...`
        );
      } else {
        console.error(
          `  ❌ Error creating product ${productData.sku}:`,
          error.message
        );
      }
    }
  }

  console.log(`🎉 Successfully created ${createdCount} products!`);
}

async function seedCustomers() {
  console.log("👤 Seeding test customers...");

  let createdCount = 0;

  for (const customerData of CUSTOMERS_SEED) {
    try {
      const customer = await prisma.customer.create({
        data: {
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone,
          tier: customerData.tier as any,
          totalSpent: customerData.totalSpent,
          totalOrders: customerData.totalOrders,
          marketingEmails: customerData.marketingEmails,
          smsNotifications: customerData.smsNotifications,
          joinDate: new Date(),
          addresses: {
            create: customerData.addresses,
          },
        },
      });

      createdCount++;
      console.log(
        `  ✅ Created customer: ${customer.firstName} ${customer.lastName} (${customer.email})`
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(
          `  ⚠️ Customer ${customerData.email} already exists, skipping...`
        );
      } else {
        console.error(
          `  ❌ Error creating customer ${customerData.email}:`,
          error.message
        );
      }
    }
  }

  console.log(`🎉 Successfully created ${createdCount} customers!`);
}

async function seedReviews() {
  console.log("⭐ Seeding product reviews...");

  let createdCount = 0;

  for (const reviewData of REVIEWS_SEED) {
    try {
      // Find product by SKU
      const product = await prisma.product.findUnique({
        where: { sku: reviewData.productSku },
      });

      if (!product) {
        console.warn(
          `  ⚠️ Product ${reviewData.productSku} not found for review`
        );
        continue;
      }

      // Find customer by email
      const customer = await prisma.customer.findUnique({
        where: { email: reviewData.customerEmail },
      });

      if (!customer) {
        console.warn(
          `  ⚠️ Customer ${reviewData.customerEmail} not found for review`
        );
        continue;
      }

      const review = await prisma.productReview.create({
        data: {
          productId: product.id,
          customerId: customer.id,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          isVerifiedPurchase: reviewData.isVerifiedPurchase,
          isPublished: true,
          helpfulCount: Math.floor(Math.random() * 10), // Random helpful count
          unhelpfulCount: Math.floor(Math.random() * 3), // Random unhelpful count
        },
      });

      createdCount++;
      console.log(
        `  ✅ Created review for ${product.name} by ${customer.firstName}`
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(
          `  ⚠️ Review already exists for product ${reviewData.productSku} by ${reviewData.customerEmail}`
        );
      } else {
        console.error(`  ❌ Error creating review:`, error.message);
      }
    }
  }

  console.log(`🎉 Successfully created ${createdCount} reviews!`);
}

async function updateCategoriesForStorefront() {
  console.log("🏷️ Updating categories for storefront...");

  const categoriesToUpdate = [
    "Electrónicos",
    "Computadoras",
    "Smartphones",
    "Audio & Video",
    "Ropa y Moda",
    "Ropa Masculina",
    "Ropa Femenina",
    "Accesorios",
    "Hogar y Jardín",
  ];

  for (const categoryName of categoriesToUpdate) {
    try {
      await prisma.category.updateMany({
        where: { name: categoryName },
        data: {
          isPublic: true,
          featured: ["Electrónicos", "Ropa y Moda", "Hogar y Jardín"].includes(
            categoryName
          ),
          publicDescription: `Descubre nuestra increíble selección de ${categoryName.toLowerCase()} con los mejores precios y calidad garantizada.`,
          seoTitle: `${categoryName} - Los Mejores Productos | TechStore`,
          seoDescription: `Encuentra los mejores productos de ${categoryName.toLowerCase()} con envío gratis y garantía. Calidad premium a precios increíbles.`,
          seoKeywords: [
            categoryName.toLowerCase(),
            "calidad",
            "premium",
            "envío gratis",
          ],
        },
      });

      console.log(`  ✅ Updated category: ${categoryName}`);
    } catch (error) {
      console.error(`  ❌ Error updating category ${categoryName}:`, error);
    }
  }
}

async function createSampleWishlistAndCart() {
  console.log("💖 Creating sample wishlist and cart data...");

  try {
    // Find customers and products
    const customers = await prisma.customer.findMany({ take: 2 });
    const products = await prisma.product.findMany({
      where: { isPublic: true },
      take: 5,
    });

    if (customers.length === 0 || products.length === 0) {
      console.log(
        "  ⚠️ Not enough customers or products for wishlist/cart data"
      );
      return;
    }

    // Create wishlist items for first customer
    const customer1 = customers[0];
    await prisma.wishlistItem.createMany({
      data: [
        { customerId: customer1.id, productId: products[0].id },
        { customerId: customer1.id, productId: products[1].id },
        { customerId: customer1.id, productId: products[2].id },
      ],
      skipDuplicates: true,
    });

    // Create cart for second customer
    if (customers.length > 1) {
      const customer2 = customers[1];
      const cart = await prisma.cart.create({
        data: {
          customerId: customer2.id,
          subtotal: 0,
          taxAmount: 0,
          total: 0,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Add some items to cart
      const cartItems = [];
      for (let i = 0; i < Math.min(3, products.length); i++) {
        const product = products[i];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = product.publicPrice || product.price;

        cartItems.push({
          cartId: cart.id,
          productId: product.id,
          quantity,
          unitPrice,
          total: unitPrice * quantity,
        });
      }

      await prisma.cartItem.createMany({
        data: cartItems,
        skipDuplicates: true,
      });

      // Update cart totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          subtotal,
          taxAmount: subtotal * 0.16, // 16% tax
          total: subtotal * 1.16,
        },
      });
    }

    console.log("  ✅ Created sample wishlist and cart data");
  } catch (error) {
    console.error("  ❌ Error creating wishlist/cart data:", error);
  }
}

// 🚀 MAIN SEED FUNCTION
async function runStorefrontSeed() {
  console.log("🛒 Starting Storefront Seed...");
  console.log("=====================================");

  try {
    // 1. Run inventory seed first (categories + suppliers)
    await runInventorySeed();
    console.log("");

    // 2. Update categories for storefront
    await updateCategoriesForStorefront();
    console.log("");

    // 3. Create storefront products
    await seedProducts();
    console.log("");

    // 4. Create test customers
    await seedCustomers();
    console.log("");

    // 5. Create product reviews
    await seedReviews();
    console.log("");

    // 6. Create sample wishlist and cart data
    await createSampleWishlistAndCart();
    console.log("");

    console.log("🎊 Storefront seed completed successfully!");
    console.log("=====================================");

    // Show summary
    const stats = await Promise.all([
      prisma.category.count({ where: { isPublic: true } }),
      prisma.product.count({ where: { isPublic: true } }),
      prisma.customer.count(),
      prisma.productReview.count(),
      prisma.wishlistItem.count(),
      prisma.cartItem.count(),
    ]);

    const [
      publicCategories,
      publicProducts,
      customers,
      reviews,
      wishlistItems,
      cartItems,
    ] = stats;

    console.log("📊 STOREFRONT SUMMARY:");
    console.log(`  🏷️ Public Categories: ${publicCategories}`);
    console.log(`  📦 Public Products: ${publicProducts}`);
    console.log(`  👤 Customers: ${customers}`);
    console.log(`  ⭐ Reviews: ${reviews}`);
    console.log(`  💖 Wishlist Items: ${wishlistItems}`);
    console.log(`  🛒 Cart Items: ${cartItems}`);
    console.log("");
    console.log("✅ Storefront ready for testing!");
    console.log("🌐 Visit: http://localhost:3002/store");
  } catch (error) {
    console.error("💥 Storefront seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  runStorefrontSeed();
}

export default runStorefrontSeed;
