# ZYRAVA Admin

A React + Tailwind + HeroUI console for the existing **`zyrava-server`**. It gives you read-only analytics for users, locations, acquisition/UTM, devices and browsers, plus a guarded delete flow.

There is **no second backend** and **no MongoDB connection string in the browser**. Every `/api/admin/*` route is mounted inside the existing Express server, which already owns the Mongo connection.

```
zyrava-admin/client  ──HTTP──▶  zyrava-server (/api/admin)  ──▶  MongoDB
      (React SPA)               (existing Express process)
```

## What you get

| Page | What it shows |
| --- | --- |
| Overview | Total users, new signups, visits, unique visitors, plays, active sessions, traffic/signup chart, acquisition sources, campaigns, devices, browsers, countries, cities, recent activity |
| Audience | Visits, unique visitors, countries, cities, UTM source/medium/campaign, referrers, landing pages, languages, regions, device/browser/OS mix |
| Visitor log | Searchable, filterable, paginated raw visits with geolocation and parsed device details |
| Users | Search, sort, filter, paginated accounts with latest location/device and library counts |
| User detail | Sessions, likes, playlists, known songs, top tracks/artists, searches, event mix, recent timeline |
| Content | Top liked songs, most played, playlist leaders, search phrases, recent events, event mix |
| Sessions | Every refresh session with location, device, expiry, revoke action |
| System | MongoDB health, collection counts, runtime config, process/cache state |

All report pages poll their endpoint every **5 seconds** (paused while the tab is hidden), and the server caches aggregations for 5 seconds so fresh data never hammers MongoDB.

## Prerequisites

- Node.js 20+ (the existing server uses ESM)
- The `zyrava-server` checkout next to this folder
- A working `MONGO_URI` in `zyrava-server/.env`

## 1. Configure zyrava-server

Add these to **`zyrava-server/.env`** (never to the client):

```dotenv
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=use-a-long-unique-password
ADMIN_JWT_SECRET=<64 random hex chars>
ADMIN_SESSION_HOURS=12

# Set to false for a strictly read-only console.
ADMIN_ALLOW_DELETE=true

# How long dashboard aggregations are cached, in ms.
ADMIN_CACHE_TTL_MS=5000
```

Generate the secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

If `ADMIN_JWT_SECRET` is omitted, the server falls back to `JWT_ACCESS_SECRET`. The e-mail and password are compared **on the server**; the browser only ever receives a short-lived admin JWT.

Restart `zyrava-server` after changing any of these values.

> The seeded local credentials currently in `zyrava-server/.env` are `admin@gmail.com` / `admin@123`. Change that password before sharing or deploying.

## 2. Run the console

```bash
cd zyrava-admin
npm install
npm run dev
```

Open <http://localhost:5173>. The admin panel uses Vite’s same-origin `/api/admin` proxy to `https://zyrava-server.onrender.com`; a local backend is not required. Vite forwards requests server-to-server so localhost does not need to be added to the hosted API’s CORS allowlist. Admin bearer authentication still applies. Production builds connect directly to the hosted URL.

Production build:

```bash
cd zyrava-admin
npm run build
```

## Deployment

### Split deployment (simplest)

- Keep the API on Render (`https://zyrava-server.onrender.com`).
- The SPA defaults to this server. Set `VITE_API_URL` only when overriding it.
- Add the deployed SPA origin to `CLIENT_ORIGINS` in `zyrava-server/.env`.

```bash
VITE_API_URL=https://zyrava-server.onrender.com npm run build
```

### Single deployment

The existing server can host the SPA at `/admin`:

```bash
cd zyrava-admin
VITE_API_URL= npm run build:server        # Same-origin API, VITE_BASE=/admin/
```

Copy or point `ADMIN_CLIENT_DIST` at the built folder on the server:

```dotenv
ADMIN_CLIENT_DIST=/absolute/path/to/zyrava-admin/client/dist
```

Then `/admin` serves the SPA and `/api/admin` serves its data from the same origin.

## API surface

All routes except login require `Authorization: Bearer <admin token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/admin/auth/login` | Exchange admin credentials for a JWT |
| GET | `/api/admin/auth/me` | Validate the current token |
| GET | `/api/admin/overview?range=30d` | Dashboard payload |
| GET | `/api/admin/users` | Paginated accounts (`page`, `limit`, `q`, `sort`, `type`) |
| GET | `/api/admin/users/:id` | Account detail |
| DELETE | `/api/admin/users/:id` | Delete account + related data (`{ "confirm": "DELETE" }`) |
| DELETE | `/api/admin/users/:id/sessions` | Revoke all sessions (`{ "confirm": "REVOKE" }`) |
| GET | `/api/admin/visits` | Raw arrivals (`page`, `limit`, `q`, `source`, `country`, `range`) |
| GET | `/api/admin/visits/meta` | Filter values for the visitor log |
| GET | `/api/admin/audience` | Acquisition and geography analytics |
| GET | `/api/admin/content` | Library and listening analytics |
| GET | `/api/admin/sessions` | Refresh sessions (`page`, `limit`, `q`, `active`) |
| DELETE | `/api/admin/sessions/:id` | Revoke one session (`{ "confirm": "DELETE" }`) |
| GET | `/api/admin/system` | Database/process health |

Ranges: `7d`, `30d`, `90d`, `all` (capped to 12 months).

## Safety model

- Password hashes are never projected out of MongoDB.
- Deletes and revokes are disabled server-side with `ADMIN_ALLOW_DELETE=false`, regardless of the UI.
- Every destructive request needs a typed confirmation word.
- Deleting a user cascades through `sessions`, `liked_songs`, `playlists`, `history_events`, `known_songs`, then `users`.
- Admin tokens use their own issuer/audience and never mix with listener tokens.
- Login is rate-limited; aggregation responses are cached to protect a free-tier database.

## Why attribution is visit-level

`zyrava-server` records UTM/geolocation on **visits**, and visits are deliberately not linked to accounts. Acquisition reports therefore describe arrivals (anonymous devices), while user pages describe accounts. Device/browser/OS are parsed from the stored `userAgent` at read time, so parser upgrades apply retroactively without rewriting data.

## Environment (client)

`client/.env.example` documents the only client variable:

```dotenv
# Default: hosted backend. Explicitly empty = same origin (/api/admin).
VITE_API_URL=https://zyrava-server.onrender.com
# Only for the single-deployment build.
# VITE_BASE=/admin/
```
# zyrava-admin
