# Second Test Assignment

## Overview

This project implements the “number discussion” assignment with a TypeScript/React frontend and an Express/Sequelize backend backed by PostgreSQL. Docker Compose is provided for local or deployment use so the client, server, and database can run together with minimal setup.

## Project Structure

- `client/` – React + Vite SPA for interacting with the discussion tree.
- `server/` – Express API (TypeScript) powered by PostgreSQL via Sequelize.
- `docker-compose.yml` – Orchestrates the services for deployment/local testing.

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Docker & Docker Compose (for containerised runs)

## Environment Variables

### Server

1. Copy `server/.env.example` to `server/.env`.
2. Adjust values as needed. The most important ones are:
   - `JWT_SECRET` – set to a strong random string.
   - `DATABASE_URL` OR `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

When running via Docker Compose the Postgres container exposes `postgres` as the hostname and the default credentials already match the example file, so you can keep the defaults.

### Client

1. Copy `client/.env.example` to `client/.env`.
2. Set `VITE_API_BASE_URL` to wherever the backend will be reachable (default `http://localhost:4000`).

## Local Development (without Docker)

1. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Ensure PostgreSQL is running and accessible using the credentials in `server/.env`.
3. From the `server` directory, initialise the schema (optional if Sequelize is set to sync on boot):
   ```bash
   npm run db:sync
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```
5. In a separate terminal, start the frontend (from `client`):
   ```bash
   npm run dev
   ```
6. Visit `http://localhost:5173` in a browser. The API runs on `http://localhost:4000`.

## Docker Compose

Build and run all services in one command:

```bash
docker compose up --build
```

Services:

- **Postgres**: exposed on `localhost:5432`
- **Server**: exposed on `http://localhost:4000`
- **Client**: served via nginx on `http://localhost:5173`

To stop:

```bash
docker compose down
```

Data is persisted in the `postgres_data` volume.

### Customising Vite API URL

The compose file passes `VITE_API_BASE_URL=http://localhost:4000` during the client build. If you move the server behind another domain/port, adjust the build argument:

```bash
docker compose build --build-arg VITE_API_BASE_URL=https://your-api.example.com client
docker compose up
```

## Testing / Type Checks

- Backend type checking: `cd server && npm run typecheck`
- Frontend linting/testing is not yet configured; tests can be added as needed.

## Deployment Notes

- The provided Dockerfiles generate production-ready images ({`server`, `client`}).
- Push the built images to your registry or let a platform such as Render, Fly.io, or Azure Containers build from this repo.
- Remember to provide environment variables (especially `JWT_SECRET` and database credentials) in your production environment.

## License

This assignment is prepared for Taskina Pty Ltd – Ellty department technical evaluation.

