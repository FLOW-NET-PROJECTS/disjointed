import { Router, type IRouter } from "express";
import {
  clearSession,
  createSession,
  createUser,
  findUserByIdNumber,
  findUserByUsername,
  getAuthenticatedUser,
  normalizeUsername,
  verifyPassword,
} from "../lib/auth";

const router: IRouter = Router();

type RegisterBody = {
  fullName: string;
  idNumber: string;
  username: string;
  password: string;
};

type LoginBody = {
  username: string;
  password: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseRegisterBody(body: unknown): { data?: RegisterBody; error?: string } {
  if (!isObject(body)) {
    return { error: "Invalid registration details." };
  }

  const fullName = getTrimmedString(body.fullName);
  const idNumber = getTrimmedString(body.idNumber);
  const username = getTrimmedString(body.username);
  const password = typeof body.password === "string" ? body.password : "";

  if (fullName.length < 2 || fullName.length > 120) {
    return { error: "Please enter your full name." };
  }

  if (idNumber.length < 6 || idNumber.length > 32) {
    return { error: "Please enter a valid ID number." };
  }

  if (username.length < 3 || username.length > 32 || !/^[a-zA-Z0-9._-]+$/.test(username)) {
    return { error: "Username can only use letters, numbers, dots, dashes, and underscores." };
  }

  if (password.length < 6 || password.length > 128) {
    return { error: "Password must be at least 6 characters long." };
  }

  return {
    data: {
      fullName,
      idNumber,
      username,
      password,
    },
  };
}

function parseLoginBody(body: unknown): { data?: LoginBody; error?: string } {
  if (!isObject(body)) {
    return { error: "Invalid login details." };
  }

  const username = getTrimmedString(body.username);
  const password = typeof body.password === "string" ? body.password : "";

  if (username.length < 3 || username.length > 32) {
    return { error: "Enter your username to continue." };
  }

  if (password.length < 6 || password.length > 128) {
    return { error: "Enter your password to continue." };
  }

  return {
    data: {
      username,
      password,
    },
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = parseRegisterBody(req.body);
  if (!parsed.data) {
    res.status(400).json({ error: parsed.error ?? "Invalid registration details." });
    return;
  }

  const existingUser = await findUserByUsername(parsed.data.username);
  if (existingUser) {
    res.status(409).json({ error: "That username is already registered." });
    return;
  }

  const existingId = await findUserByIdNumber(parsed.data.idNumber);
  if (existingId) {
    res.status(409).json({ error: "That ID number is already registered." });
    return;
  }

  const user = await createUser(parsed.data);
  const token = await createSession(user.id);

  res.status(201).json({ user, token });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = parseLoginBody(req.body);
  if (!parsed.data) {
    res.status(400).json({ error: parsed.error ?? "Invalid login details." });
    return;
  }

  const user = await findUserByUsername(parsed.data.username);
  if (!user) {
    res.status(401).json({ error: "Incorrect username or password." });
    return;
  }

  const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!validPassword) {
    res.status(401).json({ error: "Incorrect username or password." });
    return;
  }

  const token = await createSession(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      idNumber: user.idNumber,
      username: normalizeUsername(user.username),
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  res.json({ user });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (token) {
    await clearSession(token);
  }

  res.status(204).send();
});

export default router;
