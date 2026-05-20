# Pokémon Collections

Full-stack app for building Pokémon lists with a couple of validation rules. Pokémon data comes from [PokeAPI v2](https://pokeapi.co/docs/v2#pokemon). Saved lists live in MongoDB.

## Stack

- NestJS + TypeScript (API)
- React + Vite + Tailwind (UI)
- MongoDB

Lists are stored as documents with a snapshot of each Pokémon (`id`, `name`, `weight`). Uniqueness for the “3 species” rule is checked by Pokémon `id` from the catalogue.

## Architecture

### Layers

- **Frontend (React)** — UI only; talks to our API, not PokeAPI directly (avoids CORS and keeps one integration point).
- **Backend (NestJS)** — REST API, validation, PokeAPI client, in-memory search index.
- **MongoDB** — only user-created lists. Pokémon catalogue data is **not** stored in the database.

### PokeAPI usage

PokeAPI is used in three different ways:

| Use case | Endpoint | Notes |
|----------|----------|--------|
| Browse catalogue (paginated grid) | `GET /pokemon?limit=&offset=` | Backend loads a page from PokeAPI, then fetches full details per row (sprite, weight). Results are cached in memory per `id` for the process lifetime. |
| Search by name | `GET /pokemon/search?q=` | See below — **not** a PokeAPI feature. |
| Save / validate list | `GET /pokemon/{id}` | Batch fetch by selected ids; weights come from API at save time. |

### Search (no native PokeAPI search)

PokeAPI exposes a **paginated list** of Pokémon (`name` + `url`), not a name search endpoint. Calling the API on every keystroke would be slow and easy to rate-limit.

Approach on the backend (`PokemonIndexCacheService`):

1. On startup (and on first search if preload failed), fetch once:  
   `GET https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0`
2. Keep a lightweight in-memory list: `{ id, name, url }` only — no sprites, no weight in the index.
3. `GET /pokemon/search?q=pika` filters that list in memory (`name.includes(query)`, case-insensitive), returns up to 20 matches.
4. Further requests reuse the same cache; PokeAPI is not called again for search.

On the frontend:

- Debounced input (300 ms, minimum 2 characters) calls `/pokemon/search`.
- Search results show name only; choosing a Pokémon triggers `GET /pokemon/:id` for sprite and weight (same as catalogue cards).
- Clearing the search field returns to the normal paginated catalogue (`GET /pokemon?limit=&offset=`).

MongoDB is intentionally **not** used for the search index — the assignment only requires persisting user lists, and an in-memory index is enough for a test app.

### Saved lists

Each list document stores a **snapshot** of selected Pokémon (`id`, `name`, `weight`) so export/download and list view do not depend on PokeAPI staying unchanged. Sprites on the detail page use the public sprite CDN URL derived from `id`.

Validation (≥3 unique ids, total weight ≤ 1300 hg) runs on the server after re-fetching Pokémon from PokeAPI by id, so the client cannot bypass rules.

### Docker

- **mongo** — data volume for lists.
- **backend** — Node image; dependencies installed at build time in the monorepo root, then compiled `dist/` + `node_modules` copied into the runtime image (pnpm workspace layout).
- **frontend** — Vite build in Node stage; **nginx** serves static `dist/` and `try_files` → `index.html` for client-side routing. API URL is baked in at build via `VITE_API_URL`.

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

## Build with Docker

From the directory that contains `docker-compose.yaml` (now it's `root`):

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000 |
| MongoDB | localhost:27017 |

## Build for local dev

Requirements: Node 22+, pnpm 10+, Docker for Mongo.

From the directory that contains `docker-compose.yaml` (now it's `root`):

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
