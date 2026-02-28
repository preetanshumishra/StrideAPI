# Stride API

Backend API for the Stride smart errand management and personal place saving platform. Built with Node.js, Express, TypeScript, and MongoDB.

## Overview

StrideAPI powers the Stride ecosystem with intelligent errand routing, place management, geofencing-driven nearby search, and visit detection. It provides JWT-based authentication with refresh token rotation and token theft detection, Haversine-based proximity search, and nearest-neighbor errand route optimization.

The mobile clients (iOS + Android) use the Woosmap Geofencing SDK to detect visits and geofence entries, then call this API to record the results.

## Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express 5.x
- **Language:** TypeScript 5.9.x (strict mode)
- **Database:** MongoDB 9.x with Mongoose 9.x
- **Authentication:** JWT (HS256) — access tokens (7d) + refresh tokens (30d) with rotation
- **Password Hashing:** bcryptjs (10 salt rounds)
- **API Docs:** Swagger/OpenAPI 3.0 (swagger-jsdoc + swagger-ui-express)
- **Security:** helmet, express-rate-limit, custom MongoDB sanitization
- **Validation:** validator.js
- **Testing:** Jest 30.x + Supertest + mongodb-memory-server
- **Deployment:** Google Cloud Run

## Project Structure

```
StrideAPI/
├── src/
│   ├── index.ts                     # Entry point: middleware, routes, server startup
│   ├── config/
│   │   ├── database.ts              # MongoDB connection (Mongoose)
│   │   └── swagger.ts               # OpenAPI 3.0 spec configuration
│   ├── middleware/
│   │   └── auth.ts                  # JWT Bearer token validation
│   ├── models/
│   │   ├── User.ts                  # User schema with hashed passwords + refresh token storage
│   │   ├── Place.ts                 # Saved place schema (lat/lng, visits, collections)
│   │   ├── Errand.ts                # Errand schema (priority, deadline, recurring, linked place)
│   │   └── Collection.ts            # Place collection schema
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── places.ts
│   │   ├── errands.ts
│   │   ├── collections.ts
│   │   └── nearby.ts
│   ├── controllers/
│   │   ├── authController.ts        # Register, login, refresh, logout, profile, preferences
│   │   ├── placeController.ts       # Place CRUD + visit recording
│   │   ├── errandController.ts      # Errand CRUD + smart routing algorithm
│   │   ├── collectionController.ts  # Collection CRUD
│   │   └── nearbyController.ts      # Haversine-based nearby search
│   ├── utils/
│   │   ├── jwt.ts                   # Token generation and verification
│   │   ├── hash.ts                  # SHA-256 (for refresh token storage)
│   │   ├── haversine.ts             # Great-circle distance in km
│   │   ├── sanitize.ts              # MongoDB operator injection protection
│   │   ├── errorResponse.ts         # Dev/prod error message formatting
│   │   ├── tokenStorage.ts          # Session management (max 5 per user, hash-only)
│   │   └── validateObjectId.ts      # MongoDB ObjectId validation
│   └── __tests__/
│       └── *.test.ts                # Jest + Supertest integration tests
├── .env.example
├── cloudbuild.yaml                  # Google Cloud Build (auto-deploy on push to master)
├── jest.config.ts
├── tsconfig.json
├── MONGODB_ATLAS_SETUP.md
└── package.json
```

## Setup

### Prerequisites

- Node.js 20.x
- npm 10.x
- MongoDB (local) or MongoDB Atlas

### Installation

```bash
cd StrideAPI
npm install
cp .env.example .env   # then fill in your values
npm run dev            # starts on http://localhost:5001
```

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/stride
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens |
| `PORT` | No | Server port (default: 5001) |
| `NODE_ENV` | No | `development` / `test` / `production` |
| `CORS_ORIGIN` | No | Allowed CORS origins |

> **Note:** macOS AirPlay Receiver occupies port 5000 — always set `PORT=5001`.

## Commands

```bash
npm run dev     # Development server with hot reload (nodemon + ts-node)
npm run build   # Compile TypeScript → dist/
npm start       # Run compiled production build
npm test        # Run tests (Jest + in-memory MongoDB, no local DB needed)
```

## API Endpoints

All endpoints except auth and health require `Authorization: Bearer <access_token>`.

Interactive docs: [`http://localhost:5001/api-docs`](http://localhost:5001/api-docs)
Production docs: [`https://strideapi-1048111785674.us-central1.run.app/api-docs`](https://strideapi-1048111785674.us-central1.run.app/api-docs)

### Authentication — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user *(rate limited: 10/15min)* |
| POST | `/login` | No | Login — returns `accessToken` + `refreshToken` *(rate limited: 10/15min)* |
| POST | `/refresh` | No | Rotate refresh token — returns new pair *(rate limited: 30/15min)* |
| POST | `/logout` | Yes | Revoke current refresh token |
| GET | `/profile` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update name / email |
| POST | `/change-password` | Yes | Change password — invalidates all sessions |
| DELETE | `/account` | Yes | Delete account and all associated data |
| GET | `/preferences` | Yes | Get notification/geofencing preferences |
| POST | `/preferences` | Yes | Save notification/geofencing preferences |

### Places — `/api/v1/places`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create saved place |
| GET | `/` | List all places (filterable: `category`, `collectionId`) |
| GET | `/:id` | Get single place |
| PUT | `/:id` | Update place |
| PATCH | `/:id/visit` | Record a visit — increments `visitCount`, updates `lastVisited` |
| DELETE | `/:id` | Delete place |

> `PATCH /:id/visit` is called by the mobile SDK integration when the Woosmap Geofencing SDK detects a dwell visit at a saved place.

### Errands — `/api/v1/errands`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create errand (supports recurring schedules) |
| GET | `/` | List errands (filterable: `status`, `category`) |
| GET | `/:id` | Get single errand |
| PUT | `/:id` | Update errand |
| PATCH | `/:id/complete` | Mark complete (records completion location) |
| DELETE | `/:id` | Delete errand |
| POST | `/route` | Smart route — nearest-neighbor ordering from `{ latitude, longitude, radiusKm }` |

### Collections — `/api/v1/collections`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create collection |
| GET | `/` | List all collections |
| GET | `/:id` | Get single collection |
| PUT | `/:id` | Update collection |
| DELETE | `/:id` | Delete collection (unlinks associated places) |

### Nearby — `/api/v1/nearby`

| Method | Path | Description |
|---|---|---|
| POST | `/` | Find saved places + pending errands within `{ latitude, longitude, radiusKm }` |

> Called by mobile clients on geofence entry (via Woosmap SDK) to surface actionable errands near the user's current location.

### System

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check (200 OK) |
| GET | `/api/v1` | API version info |
| GET | `/api-docs` | Swagger UI |
| GET | `/swagger.json` | OpenAPI specification |

### Response Envelope

All responses use a consistent wrapper:

```json
{
  "status": "success",
  "message": "Optional message",
  "data": { }
}
```

```json
{
  "status": "error",
  "message": "Descriptive in development, generic in production"
}
```

## Data Models

### User
```typescript
{
  email: string            // unique, validated
  password: string         // bcryptjs hashed — never returned in responses
  firstName: string        // max 50 chars
  lastName: string         // max 50 chars
  preferences: {
    errandNotifications: boolean  // default: true
    visitDetection: boolean       // default: true
    geofenceAlerts: boolean       // default: true
  }
  refreshTokens: [{ tokenHash: string, createdAt: Date }]
  // SHA-256 hashes only; max 5 active sessions (oldest evicted)
}
```

### Place
```typescript
{
  name: string             // max 100 chars
  address: string
  latitude: number         // used for Haversine proximity matching
  longitude: number
  category: string         // user-defined (e.g. "pharmacy", "coffee")
  tags: string[]
  notes: string
  personalRating: number   // 1–5
  collectionId: ObjectId
  visitCount: number       // auto-incremented via PATCH /:id/visit
  lastVisited: Date
  source: "manual" | "auto-suggested" | "from-errand"
  userId: ObjectId         // indexed
}
```

### Errand
```typescript
{
  title: string            // max 200 chars
  category: string
  linkedPlaceId: ObjectId  // links errand to a saved place
  priority: "low" | "medium" | "high"
  deadline: Date
  recurring: { enabled: boolean, intervalDays: number, nextDue: Date }
  status: "pending" | "done"
  completedAt: Date
  completedAtPlaceId: ObjectId
  userId: ObjectId         // indexed
}
```

### Collection
```typescript
{
  name: string             // max 100 chars
  icon: string             // emoji, default "📁"
  shared: boolean          // reserved for future sharing features
  userId: ObjectId         // indexed
}
```

## Architecture

### Authentication
- Access tokens expire in **7 days**, sent as `Authorization: Bearer <token>`
- Refresh tokens expire in **30 days**, stored as SHA-256 hashes (raw token never stored)
- Max **5 active sessions** per user — oldest evicted when exceeded
- **Token theft detection:** if a revoked refresh token is presented, all sessions for that user are immediately invalidated

### Smart Errand Routing (`POST /errands/route`)
Accepts `{ latitude, longitude, radiusKm }`. Returns pending errands with a linked place within the radius, ordered by a **nearest-neighbor greedy algorithm** using the Haversine formula — minimizing total travel distance.

### Nearby Search (`POST /nearby`)
Accepts `{ latitude, longitude, radiusKm }`. Returns:
- All saved places within the radius (Haversine filtered)
- Pending errands linked to those places

Used by the Woosmap SDK geofence entry callback on mobile to surface actionable errands.

### Visit Recording (`PATCH /places/:id/visit`)
Increments `visitCount` and sets `lastVisited`. Called by mobile clients after the Woosmap SDK detects a dwell visit at a saved place location.

### Security

| Layer | Implementation |
|---|---|
| Authentication | JWT Bearer, middleware on all protected routes |
| Rate limiting | Global 100 req/15min; `/auth` 10 req/15min; `/auth/refresh` 30 req/15min |
| Security headers | helmet |
| NoSQL injection | Custom `sanitize()` strips `$` and `.` from all request body keys |
| Password storage | bcryptjs 10 rounds, `select: false` in schema |
| Token storage | SHA-256 hashes only — raw tokens never persisted |
| Input validation | validator.js (email/URL), manual length/range checks |

## Testing

Tests use `mongodb-memory-server` — no local MongoDB installation required.

```bash
npm test                                    # Run all tests
npm test -- --testPathPattern auth         # Filter by filename
npm test -- --coverage                     # With coverage report
```

Tests live in `src/__tests__/` and use Jest + Supertest for full HTTP request/response coverage.

## Deployment

### Production
- **URL:** `https://strideapi-1048111785674.us-central1.run.app`
- **Platform:** Google Cloud Run
- **Database:** MongoDB Atlas
- **CI/CD:** Push to `master` → Cloud Build (`cloudbuild.yaml`) → auto-deploy

### Health Check
```bash
curl https://strideapi-1048111785674.us-central1.run.app/health
# → 200 OK
```

## Stride Ecosystem

This project is part of the Stride smart errand and place management ecosystem:

- **[StrideiOS](https://github.com/preetanshumishra/StrideiOS)** — Native iOS app (Swift 6 + SwiftUI + Woosmap Geofencing SDK)
- **[StrideAndroid](https://github.com/preetanshumishra/StrideAndroid)** — Native Android app (Kotlin + Jetpack Compose + Woosmap Geofencing SDK)

## License

MIT

## Author

Preetanshu Mishra
