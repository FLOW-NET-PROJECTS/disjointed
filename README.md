# disjointed

Railway-ready pnpm monorepo with:
- Vite frontend in `artifacts/disjointed`
- Express API in `artifacts/api-server`
- Drizzle/Postgres database layer in `lib/db`

## Deployment shape

This repo is set up to run on Railway as a **single service**:
- Railway builds the frontend and API
- the Express server serves the built frontend files
- Postgres should be provided by **Supabase** using `DATABASE_URL`

## Files already prepared for Railway

- `railway.json`
- `Procfile`
- `.env.example`

## Required environment variables

Copy `.env.example` and set the real values in Railway:

- `DATABASE_URL` - Supabase Postgres connection string
- `BASE_PATH` - usually `/`
- `NODE_ENV` - `production`
- `PORT` - Railway injects this automatically
- `LOG_LEVEL` - usually `info`

Optional:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

## Railway deploy steps

1. Create a new Railway project.
2. Point it at this GitHub repo.
3. Add the environment variables from `.env.example`.
4. Set `DATABASE_URL` to the Supabase Postgres URI.
5. Deploy.

Railway will use:
- build command from `railway.json`
- start command from `railway.json`
- healthcheck path `/api/healthz`

## Database setup

Before first production use, push the schema to the target database:

```bash
corepack pnpm run db:push
```

Force push if you intentionally need it:

```bash
corepack pnpm run db:push:force
```

## Local commands

Install:

```bash
corepack pnpm install --frozen-lockfile
```

Build everything:

```bash
corepack pnpm run build:railway
```

Start the Railway-style server locally:

```bash
$env:PORT=3000
corepack pnpm run start:railway
```

## Notes

- The API build has been verified locally.
- On this Windows shell, the frontend build can fail if npm/pnpm skipped Rollup's optional native package during install. That is a local install issue, not a Railway Linux deploy requirement.
- If local frontend build fails with a missing Rollup native module, remove `node_modules` and reinstall with pnpm.
