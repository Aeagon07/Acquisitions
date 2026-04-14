# Acquisitions API Docker Setup (Neon Local + Neon Cloud)

This project is dockerized with two separate runtime modes:

- Development: app + Neon Local proxy in Docker Compose (ephemeral Neon branches)
- Production: app container connects directly to Neon Cloud using `DATABASE_URL`


## Public Docker Hub repo 
- docker push rushikesh27052005/acquisitions:tagname
## Files added

- `Dockerfile`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `.env.development`
- `.env.production`

## 1) Development (Neon Local via Docker)

Run all app-specific `npm` commands from the `Acquisitions` directory, or use the root-level wrapper `package.json` from `C:\Devops Project JSM`.

Development Compose starts:

- `app` (Express API container)
- `neon-local` (Neon Local proxy container)

The app uses this local proxy connection string:

- `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`

This is equivalent to your requested `postgres://user:password@neon-local:5432/dbname`, using Neon Local's default credentials.

### Configure `.env.development`

Update these values in `.env.development` before running:

- `NEON_API_KEY`
- `NEON_PROJECT_ID`
- optional `PARENT_BRANCH_ID` (if omitted, Neon default branch is used as parent)
- `JWT_SECRET` (generate one locally with `npm run jwt:secret`)
- `ARCJET_KEY`

`NEON_LOCAL=true`, `DRIVER=serverless`, and `NEON_LOCAL_FETCH_ENDPOINT=http://neon-local:5432/sql` are already set so `@neondatabase/serverless` works against Neon Local.

If Neon Local fails with `401 Unauthorized`, the Docker setup is fine but `NEON_API_KEY` or `NEON_PROJECT_ID` is still a placeholder or invalid.

### Run development stack

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development up --build
```

Or from the repo root:

```bash
npm run dev:docker
```

To stop and remove containers:

```bash
docker compose -f docker-compose.dev.yml --env-file .env.development down
```

Neon Local creates ephemeral branches automatically. With `DELETE_BRANCH=true` (default), those branches are removed when the Neon Local container stops.

## 2) Production (Neon Cloud serverless database)

Production Compose starts only the `app` container.  
The database remains Neon Cloud (managed/serverless), so no Neon Local proxy runs in production.

This satisfies the production requirement by connecting the app to the managed Neon serverless database through `DATABASE_URL`. Neon Cloud itself is not a Docker service and is not run inside Compose.

### Configure `.env.production`

Set:

- `DATABASE_URL=postgres://...neon.tech...`
- `JWT_SECRET` (generate one and store it in your secret manager)
- `ARCJET_KEY`
- `PORT` / `LOG_LEVEL` as needed

`NEON_LOCAL=false` is set for production mode.

### Run production stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

Or from the repo root:

```bash
npm run prod:docker
```

Stop:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

## 3) Environment switching (`DATABASE_URL`)

The same app switches DB target only by env file:

- Development (`.env.development`)
  - `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`
  - `NEON_LOCAL=true`
- Production (`.env.production`)
  - `DATABASE_URL=postgres://<user>:<password>@<host>.neon.tech/<db>?sslmode=require`
  - `NEON_LOCAL=false`

`src/config/database.js` detects `NEON_LOCAL=true` and configures the serverless driver endpoint to `http://neon-local:5432/sql`.

## 4) Security notes

JWT flow:

- `JWT_SECRET` is your server-side signing key and must be set before startup
- JWT tokens are created automatically during sign-up/sign-in using that secret
- the generated user token is not a replacement for `JWT_SECRET`

- Do not commit real values in `.env`, `.env.development`, or `.env.production`
- Inject production secrets through your deployment platform, CI/CD variables, or secret manager
- `.gitignore` should include both `.env` and `.env.*`
