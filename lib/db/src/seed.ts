import { pool } from "./client";
import { ensureDefaultCatalog } from "./catalog-seed";

async function seed() {
  console.log("Seeding default catalog if needed...");

  const result = await ensureDefaultCatalog();

  if (result.seeded) {
    console.log(
      `Seeded ${result.products} products across ${result.categories} categories.`,
    );
  } else {
    console.log(
      `Skipped seeding because the catalog already has ${result.products} product(s).`,
    );
  }

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
