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
  const base64Data = matches[2];
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));

  const url = `/api/uploads/${filename}`;
  res.json({ url });
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
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendFile(filepath);
});

export default router;
