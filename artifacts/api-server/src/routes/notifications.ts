import { Router, type IRouter } from "express";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendPush, type PushSub } from "../lib/push";

const router: IRouter = Router();

router.get("/notifications/vapid-public-key", (_req, res): void => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? "" });
});

router.post("/notifications/subscribe-admin", async (req, res): Promise<void> => {
  const { endpoint, keys, expirationTime } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    res.status(400).json({ error: "Invalid subscription object" });
    return;
  }

  await db
    .insert(pushSubscriptionsTable)
    .values({ endpoint, keys })
    .onConflictDoUpdate({ target: pushSubscriptionsTable.endpoint, set: { keys } });

  res.status(201).json({ ok: true });
});

export default router;
