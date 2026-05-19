import { isWrapperMode } from "@/lib/auth";

const ADMIN_UNLOCK_KEY = "disjointed_admin_unlocked";

function getAdminStorage() {
  return isWrapperMode() ? window.localStorage : window.sessionStorage;
}

export function isAdminUnlocked() {
  return getAdminStorage().getItem(ADMIN_UNLOCK_KEY) === "true";
}

export function setAdminUnlocked(value: boolean) {
  if (value) {
    getAdminStorage().setItem(ADMIN_UNLOCK_KEY, "true");
    return;
  }

  getAdminStorage().removeItem(ADMIN_UNLOCK_KEY);
}
