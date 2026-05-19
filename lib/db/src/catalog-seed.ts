import { sql } from "drizzle-orm";
import { db } from "./client";
import { categoriesTable, productsTable } from "./schema";

type DefaultCategorySeed = {
  name: string;
};

type DefaultProductSeed = {
  name: string;
  description: string;
  price: string;
  thcLevel: string | null;
  cbdLevel: string | null;
  strain: string | null;
  weight: string;
  imageUrl: string;
  available: boolean;
  stock: number;
  category: string;
};

export const defaultCatalogCategories: DefaultCategorySeed[] = [
  { name: "Flower" },
  { name: "Pre-Rolls" },
  { name: "Edibles" },
  { name: "Concentrates" },
  { name: "CBD" },
];

export const defaultCatalogProducts: DefaultProductSeed[] = [
  {
    name: "OG Kush",
    description:
      "A timeless classic with a pungent earthy pine aroma and heavy-handed euphoria. Perfect for unwinding after a long day.",
    price: "180.00",
    thcLevel: "22.50",
    cbdLevel: "0.30",
    strain: "Indica",
    weight: "3.5g",
    imageUrl:
      "https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 25,
    category: "Flower",
  },
  {
    name: "Durban Poison",
    description:
      "South Africa's pride. A pure sativa landrace with sweet anise and earthy tones. Energising, creative, uplifting.",
    price: "160.00",
    thcLevel: "20.00",
    cbdLevel: "0.20",
    strain: "Sativa",
    weight: "3.5g",
    imageUrl:
      "https://images.unsplash.com/photo-1578922746465-3a31f5591476?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 30,
    category: "Flower",
  },
  {
    name: "Wedding Cake",
    description:
      "A potent hybrid with rich, tangy flavour and earthy pepper notes. Delivers a relaxed, happy euphoria.",
    price: "220.00",
    thcLevel: "25.00",
    cbdLevel: "0.10",
    strain: "Hybrid",
    weight: "3.5g",
    imageUrl:
      "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 18,
    category: "Flower",
  },
  {
    name: "Blue Dream",
    description:
      "A crowd favourite hybrid. Sweet berry aroma meets full-body relaxation and gentle cerebral invigoration.",
    price: "175.00",
    thcLevel: "18.50",
    cbdLevel: "0.50",
    strain: "Hybrid",
    weight: "3.5g",
    imageUrl:
      "https://images.unsplash.com/photo-1516651029879-bcd4e5e4d672?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 22,
    category: "Flower",
  },
  {
    name: "Purple Haze",
    description:
      "Legendary sativa-dominant strain with sweet, earthy and berry notes. Cerebral buzz and heightened sensory awareness.",
    price: "185.00",
    thcLevel: "19.50",
    cbdLevel: "0.20",
    strain: "Sativa",
    weight: "3.5g",
    imageUrl:
      "https://images.unsplash.com/photo-1545601445-4d6a0a3e9145?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 15,
    category: "Flower",
  },
  {
    name: "Bubba Kush",
    description:
      "Heavy indica with tranquilising effects. Chocolate and coffee undertones with a deeply sedative, couch-lock finish.",
    price: "190.00",
    thcLevel: "23.00",
    cbdLevel: "0.10",
    strain: "Indica",
    weight: "3.5g",
    imageUrl:
      "https://images.unsplash.com/photo-1609878658174-45e6a66a9fe1?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 12,
    category: "Flower",
  },
  {
    name: "Gorilla Glue #4",
    description:
      "Award-winning hybrid. Earthy pine and sour notes. Produces heavy-handed euphoria and relaxation. Notoriously potent.",
    price: "210.00",
    thcLevel: "27.00",
    cbdLevel: "0.05",
    strain: "Hybrid",
    weight: "3.5g",
    imageUrl:
      "https://images.unsplash.com/photo-1556909212-d5a1d7e20e0e?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 8,
    category: "Flower",
  },
  {
    name: "OG Kush Pre-Roll 2-Pack",
    description:
      "Two perfectly rolled OG Kush joints. Ready to light, ready to vibe. Each weighs 1g for consistent burning.",
    price: "120.00",
    thcLevel: "22.50",
    cbdLevel: null,
    strain: "Indica",
    weight: "2 x 1g",
    imageUrl:
      "https://images.unsplash.com/photo-1574871786514-813b97e8b3dc?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 40,
    category: "Pre-Rolls",
  },
  {
    name: "Durban Poison Pre-Roll 3-Pack",
    description:
      "Three crisp, premium Durban Poison joints. Daytime energy in a convenient pre-roll pack.",
    price: "150.00",
    thcLevel: "20.00",
    cbdLevel: null,
    strain: "Sativa",
    weight: "3 x 1g",
    imageUrl:
      "https://images.unsplash.com/photo-1574871786514-813b97e8b3dc?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 35,
    category: "Pre-Rolls",
  },
  {
    name: "Sunset Sherbet Infused Pre-Roll",
    description:
      "A single luxury infused pre-roll coated in kief. Smooth, flavourful burn with a sweet, fruity finish.",
    price: "95.00",
    thcLevel: "30.00",
    cbdLevel: null,
    strain: "Hybrid",
    weight: "1.2g",
    imageUrl:
      "https://images.unsplash.com/photo-1574871786514-813b97e8b3dc?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 20,
    category: "Pre-Rolls",
  },
  {
    name: "Dark Chocolate Bar 100mg",
    description:
      "70% single-origin dark chocolate infused with 100mg THC. 10 segments of 10mg each. Slow, luxurious onset.",
    price: "130.00",
    thcLevel: null,
    cbdLevel: null,
    strain: null,
    weight: "50g",
    imageUrl:
      "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 28,
    category: "Edibles",
  },
  {
    name: "Mango Gummy Bears 50mg",
    description:
      "Tropical mango gummies infused with 50mg THC total. 10 bears, 5mg each. Fun, fruity, and perfectly dosed.",
    price: "95.00",
    thcLevel: null,
    cbdLevel: null,
    strain: null,
    weight: "60g",
    imageUrl:
      "https://images.unsplash.com/photo-1582396737631-3fa7cf7e3b3e?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 45,
    category: "Edibles",
  },
  {
    name: "Salted Caramel Bites 75mg",
    description:
      "Hand-crafted sea-salted caramel bites, 75mg THC across 15 pieces. The perfect after-dinner treat.",
    price: "115.00",
    thcLevel: null,
    cbdLevel: null,
    strain: null,
    weight: "45g",
    imageUrl:
      "https://images.unsplash.com/photo-1621481570823-d5f6f59f3fda?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 18,
    category: "Edibles",
  },
  {
    name: "Golden Live Resin 1g",
    description:
      "Fresh-frozen extraction preserving full terpene profile. Bright, citrus-forward aroma with an incredibly clean, potent high.",
    price: "380.00",
    thcLevel: "75.00",
    cbdLevel: "1.20",
    strain: "Hybrid",
    weight: "1g",
    imageUrl:
      "https://images.unsplash.com/photo-1603909223518-b7e15d0a2ef2?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 10,
    category: "Concentrates",
  },
  {
    name: "Indica Wax Badder 1g",
    description:
      "Creamy, whipped wax concentrate with an earthy kush profile. Ideal for dabbing or bowl topping.",
    price: "290.00",
    thcLevel: "68.00",
    cbdLevel: "0.50",
    strain: "Indica",
    weight: "1g",
    imageUrl:
      "https://images.unsplash.com/photo-1603909223518-b7e15d0a2ef2?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 7,
    category: "Concentrates",
  },
  {
    name: "Full Spectrum CBD Oil 1000mg",
    description:
      "Premium hemp-derived full spectrum oil. 1000mg CBD per 30ml bottle. Zero psychoactive effects, pure wellness.",
    price: "480.00",
    thcLevel: "0.10",
    cbdLevel: "33.30",
    strain: "CBD",
    weight: "30ml",
    imageUrl:
      "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 22,
    category: "CBD",
  },
  {
    name: "CBD Gummies 300mg",
    description:
      "30 mixed berry gummies, 10mg CBD each. Third-party tested, non-intoxicating, and genuinely relaxing.",
    price: "230.00",
    thcLevel: "0.00",
    cbdLevel: "10.00",
    strain: "CBD",
    weight: "120g",
    imageUrl:
      "https://images.unsplash.com/photo-1582396737631-3fa7cf7e3b3e?auto=format&fit=crop&w=600&q=80",
    available: true,
    stock: 33,
    category: "CBD",
  },
];

export type DefaultCatalogSeedResult = {
  seeded: boolean;
  categories: number;
  products: number;
};

export async function ensureDefaultCatalog(): Promise<DefaultCatalogSeedResult> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(2026)`);

    const [categoryTotals] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(categoriesTable);
    const [productTotals] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable);

    const existingCategoryCount = categoryTotals?.count ?? 0;
    const existingProductCount = productTotals?.count ?? 0;

    if (existingProductCount > 0) {
      return {
        seeded: false,
        categories: existingCategoryCount,
        products: existingProductCount,
      };
    }

    if (existingCategoryCount === 0) {
      await tx
        .insert(categoriesTable)
        .values(defaultCatalogCategories)
        .onConflictDoNothing();
    }

    const categories = await tx
      .select({ id: categoriesTable.id, name: categoriesTable.name })
      .from(categoriesTable);
    const categoryMap = new Map(categories.map((category) => [category.name, category.id]));

    const productsToInsert = defaultCatalogProducts.map(({ category, ...product }) => ({
      ...product,
      categoryId: categoryMap.get(category) ?? null,
    }));

    await tx.insert(productsTable).values(productsToInsert);

    return {
      seeded: true,
      categories: categories.length,
      products: productsToInsert.length,
    };
  });
}
