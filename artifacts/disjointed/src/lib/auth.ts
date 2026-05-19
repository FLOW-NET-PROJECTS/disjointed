export type AuthUser = {
  id: number;
  fullName: string;
  idNumber: string;
  username: string;
  createdAt: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

type AuthMode = "login" | "register";

const LOCAL_AUTH_STORAGE_KEY = "disjointed_user_auth_local";
const SESSION_AUTH_STORAGE_KEY = "disjointed_user_auth_session";

function getApiErrorMessage(data: ApiErrorPayload | null, fallback: string) {
  return data?.error || data?.message || fallback;
}

async function parseJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function authRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const data = await parseJsonSafe<T & ApiErrorPayload>(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Authentication request failed."));
  }

  if (data == null) {
    throw new Error("The server returned an empty response.");
  }

  return data as T;
}

export function isWrapperMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  const displayModeStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return displayModeStandalone || params.has("wrapper");
}

function getActiveStorage() {
  return isWrapperMode() ? window.localStorage : window.sessionStorage;
}

function getActiveStorageKey() {
  return isWrapperMode() ? LOCAL_AUTH_STORAGE_KEY : SESSION_AUTH_STORAGE_KEY;
}

export function readStoredAuth(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = getActiveStorage().getItem(getActiveStorageKey());
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function writeStoredAuth(session: AuthSession) {
  getActiveStorage().setItem(getActiveStorageKey(), JSON.stringify(session));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  getActiveStorage().removeItem(getActiveStorageKey());
}

export function buildAuthPath(next: string, mode: AuthMode = "register") {
  const params = new URLSearchParams();
  params.set("mode", mode);
  params.set("next", next);
  return `/auth?${params.toString()}`;
}

export async function registerUser(input: {
  fullName: string;
  idNumber: string;
  username: string;
  password: string;
}) {
  return authRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function loginUser(input: { username: string; password: string }) {
  return authRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export async function fetchCurrentUser(token: string) {
  return authRequest<{ user: AuthUser }>("/api/auth/me", {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export async function logoutUser(token: string) {
  await fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}
