import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import type { Request } from "express";
import { and, eq, gt, lte } from "drizzle-orm";
import { authSessionsTable, db, pool, usersTable } from "@workspace/db";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export type AuthUser = {
  id: number;
  fullName: string;
  idNumber: string;
  username: string;
  createdAt: string;
};

function normalizeIdNumber(value: string) {
  return value.replace(/\s+/g, "").trim();
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toAuthUser(user: typeof usersTable.$inferSelect): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    idNumber: user.idNumber,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function ensureAuthStorage() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      id_number TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx
    ON auth_sessions(user_id);
  `);

  await db.delete(authSessionsTable).where(lte(authSessionsTable.expiresAt, new Date()));
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  if (expectedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, derivedKey);
}

export async function createSession(userId: number) {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(authSessionsTable).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return rawToken;
}

function getBearerToken(req: Request) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim() || null;
}

export async function getAuthenticatedUser(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  const [session] = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      idNumber: usersTable.idNumber,
      username: usersTable.username,
      createdAt: usersTable.createdAt,
    })
    .from(authSessionsTable)
    .innerJoin(usersTable, eq(authSessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(authSessionsTable.tokenHash, hashToken(token)),
        gt(authSessionsTable.expiresAt, new Date()),
      ),
    );

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    fullName: session.fullName,
    idNumber: session.idNumber,
    username: session.username,
    createdAt: session.createdAt.toISOString(),
  };
}

export async function clearSession(token: string) {
  await db
    .delete(authSessionsTable)
    .where(eq(authSessionsTable.tokenHash, hashToken(token)));
}

export async function findUserByUsername(username: string) {
  const normalized = normalizeUsername(username);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, normalized));

  return user ?? null;
}

export async function findUserByIdNumber(idNumber: string) {
  const normalized = normalizeIdNumber(idNumber);
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.idNumber, normalized));

  return user ?? null;
}

export async function createUser(input: {
  fullName: string;
  idNumber: string;
  username: string;
  password: string;
}) {
  const [user] = await db
    .insert(usersTable)
    .values({
      fullName: input.fullName.trim(),
      idNumber: normalizeIdNumber(input.idNumber),
      username: normalizeUsername(input.username),
      passwordHash: await hashPassword(input.password),
    })
    .returning();

  return toAuthUser(user);
}
