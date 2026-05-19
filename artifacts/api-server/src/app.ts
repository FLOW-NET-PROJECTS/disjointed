import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api", router);

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const clientDistDir = path.resolve(
  runtimeDir,
  "..",
  "..",
  "disjointed",
  "dist",
  "public",
);
const clientIndexPath = path.join(clientDistDir, "index.html");

if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientDistDir, { index: false }));

  app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(clientIndexPath);
  });
} else {
  logger.warn(
    { clientDistDir },
    "Frontend build output not found. API will start without static site hosting.",
  );
}

export default app;
