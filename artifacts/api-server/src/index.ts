import { ensureDefaultCatalog } from "@workspace/db/catalog-seed";
import app from "./app";
import { ensureAuthStorage } from "./lib/auth";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  await ensureAuthStorage();
  const catalog = await ensureDefaultCatalog();

  if (catalog.seeded) {
    logger.info(catalog, "Seeded default catalog for empty database");
  } else {
    logger.info(catalog, "Catalog already populated; skipping default seed");
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Server startup failed");
  process.exit(1);
});
