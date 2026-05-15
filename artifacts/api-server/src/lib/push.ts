import webpush from "web-push";
import { logger } from "./logger";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@disjointed.app";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export type PushSub = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

export async function sendPush(subscription: PushSub, payload: object): Promise<void> {
  if (!publicKey || !privateKey) return;
  try {
    await webpush.sendNotification(
      subscription as Parameters<typeof webpush.sendNotification>[0],
      JSON.stringify(payload),
    );
  } catch (err: any) {
    logger.warn({ err: err?.message, endpoint: subscription.endpoint }, "Push notification failed");
  }
}
