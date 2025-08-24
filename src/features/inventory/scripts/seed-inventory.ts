/**
 * 🌱 INVENTORY SEED SCRIPT
 * ======================
 *
 * Seeds the database with realistic inventory data:
 * - Categories (hierarchical structure)
 * - Suppliers (complete information)
 *
 * Usage: npm run seed:inventory
 *
 * Created: 2025-01-17 - Inventory Management Seed
 */

import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// 🏷️ REALISTIC CATEGORIES DATA
const CATEGORIES_SEED = [
  // 💻 TECHNOLOGY & ELECTRONICS
  {
    name: "Electrónicos",
    description: "Dispositivos electrónicos y tecnología",
    color: "#3B82F6", // Blue
    icon: "monitor",
    isActive: true,
    children: [
      {
        name: "Computadoras",
        description: "Laptops, desktops y componentes",
        color: "#1E40AF",
        icon: "laptop",
        isActive: true,
      },
      {
        name: "Smartphones",
        description: "Teléfonos móviles y accesorios",
        color: "#2563EB",
        icon: "smartphone",
        isActive: true,
      },
      {
        name: "Audio & Video",
        description: "Equipos de sonido y video",
        color: "#3730A3",
        icon: "headphones",
        isActive: true,
      },
    ],
  },

  // 👕 CLOTHING & FASHION
  {
    name: "Ropa y Moda",
    description: "Vestimenta y accesorios de moda",
    color: "#EC4899", // Pink
    icon: "shirt",
    isActive: true,
    children: [
      {
        name: "Ropa Masculina",
        description: "Vestimenta para hombres",
        color: "#BE185D",
        icon: "user",
        isActive: true,
      },
      {
        name: "Ropa Femenina",
        description: "Vestimenta para mujeres",
        color: "#C2185B",
        icon: "user",
        isActive: true,
      },
      {
        name: "Accesorios",
        description: "Bolsos, zapatos, joyas",
        color: "#AD1457",
        icon: "bag",
        isActive: true,
      },
    ],
  },

  // 🏠 HOME & GARDEN
  {
    name: "Hogar y Jardín",
    description: "Productos para el hogar y jardín",
    color: "#10B981", // Green
    icon: "home",
    isActive: true,
    children: [
      {
        name: "Muebles",
        description: "Mobiliario para el hogar",
        color: "#047857",
        icon: "sofa",
        isActive: true,
      },
      {
        name: "Decoración",
        description: "Elementos decorativos",
        color: "#059669",
        icon: "frame",
        isActive: true,
      },
      {
        name: "Jardín",
        description: "Herramientas y plantas de jardín",
        color: "#065F46",
        icon: "tree",
        isActive: true,
      },
    ],
  },

  // 🍔 FOOD & BEVERAGES
  {
    name: "Alimentos y Bebidas",
    description: "Productos alimenticios y bebidas",
    color: "#F59E0B", // Amber
    icon: "utensils",
    isActive: true,
    children: [
      {
        name: "Bebidas",
        description: "Refrescos, jugos y bebidas",
        color: "#D97706",
        icon: "coffee",
        isActive: true,
      },
      {
        name: "Snacks",
        description: "Aperitivos y botanas",
        color: "#B45309",
        icon: "cookie",
        isActive: true,
      },
      {
        name: "Productos Frescos",
        description: "Frutas, verduras y productos frescos",
        color: "#92400E",
        icon: "apple",
        isActive: true,
      },
    ],
  },

  // ⚽ SPORTS & FITNESS
  {
    name: "Deportes y Fitness",
    description: "Equipos deportivos y fitness",
    color: "#EF4444", // Red
    icon: "dumbbell",
    isActive: true,
    children: [
      {
        name: "Fitness",
        description: "Equipos de ejercicio y fitness",
        color: "#DC2626",
        icon: "activity",
        isActive: true,
      },
      {
        name: "Deportes de Equipo",
        description: "Fútbol, basketball, volleyball",
        color: "#B91C1C",
        icon: "users",
        isActive: true,
      },
    ],
  },

  // 📚 BOOKS & OFFICE
  {
    name: "Libros y Oficina",
    description: "Material de lectura y oficina",
    color: "#8B5CF6", // Purple
    icon: "book",
    isActive: true,
    children: [
      {
        name: "Libros",
        description: "Literatura, educativos, técnicos",
        color: "#7C3AED",
        icon: "book-open",
        isActive: true,
      },
      {
        name: "Material de Oficina",
        description: "Papelería y suministros de oficina",
        color: "#6D28D9",
        icon: "briefcase",
        isActive: true,
      },
    ],
  },
];

// 🚛 REALISTIC SUPPLIERS DATA
const SUPPLIERS_SEED = [
  // Technology Suppliers
  {
    name: "TechWorld Distribution",
    contactPerson: "Carlos Martínez",
    email: "carlos@techworld.mx",
    phone: "+52 55 1234-5678",
    addressLine1: "Av. Tecnológica 123",
    addressLine2: "Col. Silicon Valley",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "03100",
    country: "MX",
    website: "https://techworld.mx",
    taxId: "TWD850301ABC",
    paymentTerms: 30,
    rating: 4.8,
    isActive: true,
    notes:
      "Especialista en tecnología - Certificados: ISO9001, Apple Authorized Reseller",
  },
  {
    name: "Digital Solutions SA de CV",
    contactPerson: "Ana García",
    email: "ana.garcia@digitalsolutions.com.mx",
    phone: "+52 55 9876-5432",
    addressLine1: "Blvd. Digital 456",
    addressLine2: "Zona Tecnológica",
    city: "Guadalajara",
    state: "JAL",
    postalCode: "44100",
    country: "MX",
    website: "https://digitalsolutions.com.mx",
    taxId: "DSO901201DEF",
    paymentTerms: 15,
    rating: 4.5,
    isActive: true,
    notes: "Audio, Video y Gaming - Certificados: Samsung Partner, Sony Dealer",
  },

  // Fashion Suppliers
  {
    name: "Moda Moderna Textiles",
    contactPerson: "Ricardo Hernández",
    email: "ricardo@modamoderna.mx",
    phone: "+52 33 2345-6789",
    addressLine1: "Calle Moda 789",
    addressLine2: "Centro Textil",
    city: "León",
    state: "GTO",
    postalCode: "37000",
    country: "MX",
    website: "https://modamoderna.mx",
    taxId: "MMT750815GHI",
    paymentTerms: 45,
    rating: 4.6,
    isActive: true,
    notes:
      "Ropa masculina, femenina y accesorios - Certificados: Fair Trade, Organic Cotton",
  },
  {
    name: "Fashion Forward Import",
    contactPerson: "María López",
    email: "maria@fashionforward.mx",
    phone: "+52 81 3456-7890",
    addressLine1: "Plaza Fashion 321",
    addressLine2: "Zona Rosa",
    city: "Monterrey",
    state: "NL",
    postalCode: "64000",
    country: "MX",
    website: "https://fashionforward.mx",
    taxId: "FFI880920JKL",
    paymentTerms: 30,
    rating: 4.3,
    isActive: true,
    notes:
      "Ropa de temporada y accesorios premium - Certificados: Sustainable Fashion",
  },

  // Home & Garden Suppliers
  {
    name: "Casa y Jardín Distribuidora",
    contactPerson: "Luis Rodríguez",
    email: "luis@casayjardin.mx",
    phone: "+52 55 4567-8901",
    addressLine1: "Av. Hogar 654",
    addressLine2: "Zona Industrial",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "07800",
    country: "MX",
    website: "https://casayjardin.mx",
    taxId: "CJD920430MNO",
    paymentTerms: 60,
    rating: 4.7,
    isActive: true,
    notes:
      "Muebles, decoración y jardín - Certificados: FSC Certified, Green Building",
  },

  // Food & Beverages Suppliers
  {
    name: "Alimentos Frescos del Norte",
    contactPerson: "Patricia Jiménez",
    email: "patricia@alimentosfrescos.mx",
    phone: "+52 81 5678-9012",
    addressLine1: "Parque Industrial Alimentario 987",
    addressLine2: null,
    city: "Apodaca",
    state: "NL",
    postalCode: "66600",
    country: "MX",
    website: "https://alimentosfrescos.mx",
    taxId: "AFN830515PQR",
    paymentTerms: 15,
    rating: 4.9,
    isActive: true,
    notes:
      "Productos frescos, bebidas y snacks - Certificados: HACCP, Organic Certified, FDA Approved",
  },
  {
    name: "Bebidas Premium SA",
    contactPerson: "Jorge Morales",
    email: "jorge@bebidaspremium.mx",
    phone: "+52 33 6789-0123",
    addressLine1: "Zona Comercial 147",
    addressLine2: null,
    city: "Tlaquepaque",
    state: "JAL",
    postalCode: "45500",
    country: "MX",
    website: "https://bebidaspremium.mx",
    taxId: "BPS940625STU",
    paymentTerms: 30,
    rating: 4.4,
    isActive: true,
    notes: "Bebidas premium e importación - Certificados: ISO22000, Kosher",
  },

  // Sports & Fitness Suppliers
  {
    name: "Deportes Extremos México",
    contactPerson: "Fernando Castro",
    email: "fernando@deportesextremos.mx",
    phone: "+52 55 7890-1234",
    addressLine1: "Complejo Deportivo 258",
    addressLine2: "Col. Deportiva",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "03630",
    country: "MX",
    website: "https://deportesextremos.mx",
    taxId: "DEM870710VWX",
    paymentTerms: 45,
    rating: 4.5,
    isActive: true,
    notes:
      "Equipos fitness, deportes extremos y ropa deportiva - Certificados: Sports Equipment Certified",
  },

  // Books & Office Suppliers
  {
    name: "Papelería Corporativa Integral",
    contactPerson: "Sofía Ramírez",
    email: "sofia@papeleriacorporativa.mx",
    phone: "+52 55 8901-2345",
    addressLine1: "Centro Empresarial 369",
    addressLine2: "Col. Oficinas",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "11000",
    country: "MX",
    website: "https://papeleriacorporativa.mx",
    taxId: "PCI910820YZA",
    paymentTerms: 30,
    rating: 4.6,
    isActive: true,
    notes:
      "Material de oficina, papelería corporativa y libros técnicos - Certificados: FSC Paper, Green Office",
  },
];

// 🔧 SEED FUNCTIONS
async function seedCategories() {
  console.log("🏷️ Seeding categories...");

  let totalCreated = 0;

  for (const categoryData of CATEGORIES_SEED) {
    try {
      // Create parent category
      const parentCategory = await prisma.category.create({
        data: {
          id: uuidv4(),
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color,
          icon: categoryData.icon,
          isActive: categoryData.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      totalCreated++;
      console.log(`  ✅ Created category: ${parentCategory.name}`);

      // Create child categories
      if (categoryData.children) {
        for (const childData of categoryData.children) {
          const childCategory = await prisma.category.create({
            data: {
              id: uuidv4(),
              name: childData.name,
              description: childData.description,
              color: childData.color,
              icon: childData.icon,
              isActive: childData.isActive,
              parentId: parentCategory.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          totalCreated++;
          console.log(`    ✅ Created subcategory: ${childCategory.name}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error creating category ${categoryData.name}:`, error);
    }
  }

  console.log(`🎉 Successfully created ${totalCreated} categories!`);
}

async function seedSuppliers() {
  console.log("🚛 Seeding suppliers...");

  let totalCreated = 0;

  for (const supplierData of SUPPLIERS_SEED) {
    try {
      const supplier = await prisma.supplier.create({
        data: {
          id: uuidv4(),
          name: supplierData.name,
          contactPerson: supplierData.contactPerson,
          email: supplierData.email,
          phone: supplierData.phone,
          addressLine1: supplierData.addressLine1,
          addressLine2: supplierData.addressLine2,
          city: supplierData.city,
          state: supplierData.state,
          postalCode: supplierData.postalCode,
          country: supplierData.country,
          website: supplierData.website,
          taxId: supplierData.taxId,
          paymentTerms: supplierData.paymentTerms,
          rating: supplierData.rating,
          isActive: supplierData.isActive,
          notes: supplierData.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      totalCreated++;
      console.log(`  ✅ Created supplier: ${supplier.name}`);
    } catch (error) {
      console.error(`❌ Error creating supplier ${supplierData.name}:`, error);
    }
  }

  console.log(`🎉 Successfully created ${totalCreated} suppliers!`);
}

// 🚀 MAIN SEED FUNCTION
async function runInventorySeed() {
  console.log("🌱 Starting Inventory Seed...");
  console.log("=====================================");

  try {
    // Clear existing data (optional - uncomment if needed)
    // console.log('🧹 Clearing existing data...');
    // await prisma.product.deleteMany();
    // await prisma.supplier.deleteMany();
    // await prisma.category.deleteMany();

    // Seed categories first (products depend on them)
    await seedCategories();
    console.log("");

    // Seed suppliers
    await seedSuppliers();
    console.log("");

    console.log("🎊 Inventory seed completed successfully!");
    console.log("=====================================");

    // Show summary
    const categoriesCount = await prisma.category.count();
    const suppliersCount = await prisma.supplier.count();

    console.log("📊 SUMMARY:");
    console.log(`  📂 Categories: ${categoriesCount}`);
    console.log(`  🚛 Suppliers: ${suppliersCount}`);
    console.log("");
    console.log("✅ Ready to create products!");
  } catch (error) {
    console.error("💥 Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  runInventorySeed();
}

export { runInventorySeed };
