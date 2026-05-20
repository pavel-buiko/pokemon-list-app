# Pokémon Collections

Full-stack app for building Pokémon lists with a couple of validation rules. Pokémon data comes from [PokeAPI v2](https://pokeapi.co/docs/v2#pokemon). Saved lists live in MongoDB.

## Stack

- NestJS + TypeScript (API)
- React + Vite + Tailwind (UI)
- MongoDB

Lists are stored as documents with a snapshot of each Pokémon (`id`, `name`, `weight`). Uniqueness for the “3 species” rule is checked by Pokémon `id` from the catalogue.

## Rules (enforced on save)

- At least 3 different Pokémon (unique `id`)
- Total weight ≤ 1300 hg (PokeAPI `weight` field)

## Import / export

```json
{
  "version": 1,
  "name": "My team",
  "items": [
    { "id": 1, "name": "bulbasaur", "weight": 69 }
  ]
}
```

The client can load this JSON on the create page. The server still validates against PokeAPI when you save.

## Docker

From the directory that contains `docker-compose.yaml`:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000 |
| MongoDB | localhost:27017 |

## Local dev

Requirements: Node 22+, pnpm 10+, Docker for Mongo.

```bash
docker compose up mongo -d
```

Backend (`apps/backend`):

```bash
pnpm install
pnpm run start:dev
```

Runs on http://localhost:3000. Env: `MONGODB_URI` (default `mongodb://localhost:27017/pokemon-app`), `PORT`, `FRONTEND_URL`.

Frontend (`apps/frontend`):

```bash
cp .env.example .env
pnpm install
pnpm run dev
```

Runs on http://localhost:5173 (`VITE_API_URL` points at the API).

## API

| Method | Path |
|--------|------|
| GET | `/lists` |
| GET | `/lists/:id` |
| POST | `/lists` — body `{ name, pokemonIds }` |
| DELETE | `/lists/:id` |
| GET | `/lists/:id/export` |
| GET | `/pokemon?limit=&offset=` |
| GET | `/pokemon/search?q=` |
| GET | `/pokemon/:id` |

Validation failures: `400` with `{ message, errors? }`.
