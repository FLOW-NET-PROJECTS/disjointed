import { useEffect, useState } from "react";

export type PushStatus = "unsupported" | "denied" | "default" | "subscribed";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>("default");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") setStatus("denied");
    else if (Notification.permission === "granted") setStatus("subscribed");
  }, []);

  async function subscribe(vapidPublicKey: string): Promise<PushSubscriptionJSON | null> {
    if (!("serviceWorker" in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setStatus("subscribed");
        return existing.toJSON();
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
      });
      setStatus("subscribed");
      return sub.toJSON();
    } catch {
      setStatus("denied");
      return null;
    }
  }

  async function requestAndSubscribe(vapidPublicKey: string): Promise<PushSubscriptionJSON | null> {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return null;
    }
    return subscribe(vapidPublicKey);
  }

  return { status, requestAndSubscribe, subscribe };
}
