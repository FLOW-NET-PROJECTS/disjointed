import { Router, type IRouter } from "express";
import path from "path";
import fs from "fs";
import { UploadImageBody } from "@workspace/api-zod";

const router: IRouter = Router();

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

router.post("/uploads/image", async (req, res): Promise<void> => {
  const parsed = UploadImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { imageData } = parsed.data;

  const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches) {
    res.status(400).json({ error: "Invalid image data format" });
    return;
  }

  const mimeType = matches[1];
  if (!mimeType.startsWith("image/")) {
    res.status(400).json({ error: "Only image uploads are supported." });
    return;
  }

  // Railway deploys run on ephemeral disk, so returning the inline data URL
  // keeps product images durable across restarts and instance swaps.
  res.json({ url: imageData });
});

router.get("/uploads/:filename", (req, res): void => {
  const filename = req.params.filename;
  if (typeof filename !== "string") {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const sanitized = path.basename(filename);
  const filepath = path.join(UPLOADS_DIR, sanitized);
  if (!fs.existsSync(filepath)) {
    res.redirect("/icon-512.jpg");
    return;
  }
  res.sendFile(filepath);
});

export default router;
