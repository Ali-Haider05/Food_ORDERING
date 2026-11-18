# Food Ordering Backend

The backend uses Express and persistent, file-based NeDB. It serves health, authentication, catalog, checkout, and admin dashboard APIs.

## Installation and local setup

From the repository root in PowerShell, run:

```powershell
cd backend
npm ci
# Run this copy only if .env does not already exist.
Copy-Item .env.example .env
node -p "require('node:crypto').randomBytes(32).toString('hex')"
```

Put the generated value in `.env` as `JWT_SECRET`, then run `npm run dev` or `npm start`. Keep the same secret across restarts so issued tokens remain valid. Git ignores `.env`.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port. Defaults to `5000` locally. |
| `NODE_ENV` | Use `development` locally and `production` on Render. |
| `CLIENT_URL` | Comma-separated frontend origins with scheme and optional port. Omit trailing slashes. |
| `DATA_DIR` | Directory for all NeDB files, including `orders.db`. Relative paths resolve from `backend/`. Defaults to `./data`. |
| `JWT_SECRET` | Required signing secret. Startup rejects empty values and the example placeholders. |

## Authentication API

**POST `/api/auth/signup`** creates a user and returns HTTP 201. Names and emails are trimmed, emails are lowercased, and public accounts receive the `user` role. Passwords must contain at least 8 characters and fit bcrypt's 72-byte UTF-8 limit.

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "StrongPass123!"
}
```

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "JWT_TOKEN",
  "user": { "id": "USER_ID", "name": "Ali", "email": "ali@example.com", "role": "user" }
}
```

**POST `/api/auth/login`** returns HTTP 200 with the same token and user fields and the message `Login successful`.

```json
{
  "email": "ali@example.com",
  "password": "StrongPass123!"
}
```

**GET `/api/auth/me`** returns HTTP 200 with the current user. Send the token as `Authorization: Bearer JWT_TOKEN`. Tokens expire after seven days. The API looks up the current user and role in NeDB for authenticated requests.

```json
{
  "success": true,
  "user": { "id": "USER_ID", "name": "Ali", "email": "ali@example.com", "role": "user" }
}
```

| HTTP status | Meaning |
| --- | --- |
| 200 | Successful login, profile lookup, or health check |
| 201 | User created |
| 400 | Invalid request data |
| 401 | Invalid credentials or missing, invalid, or expired token |
| 403 | Admin access required by role middleware |
| 404 | API route not found |
| 409 | Duplicate email or category, or category still referenced by menu items |
| 429 | Authentication rate limit exceeded |
| 500 | Internal server error |

Errors use the following JSON shape.

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Signup allows 10 requests per IP in 15 minutes. Login uses a separate limit of 20 requests per IP in 15 minutes. Limits are process-local. A blocked request receives HTTP 429 and a Retry-After header. Health and profile requests do not use these limits.

## Seed a demo catalog

Stop the backend before seeding the same `DATA_DIR`. NeDB files should only be opened by one process at a time. In the ignored `.env` file, set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (12 characters minimum, 72 UTF-8 bytes maximum). `ADMIN_NAME` defaults to `Administrator`. Generate a new password for the admin account using a password manager.

From `backend/`, run:

```powershell
npm run seed
```

On an empty database this creates one admin, five categories, fifteen demo items, and four demo orders owned by the seeded admin. Demo orders are keyed so reruns preserve them. Reruns with the same admin email reuse the existing admin. A matching non-admin email aborts the command. The script reuses categories by normalized name and items by category and name. It preserves existing records and stores new admin passwords as bcrypt hashes. Run it separately from the web server and only against the intended database.

## Catalog API

| Endpoint | Access |
| --- | --- |
| `GET /api/categories` | Public |
| `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` | Admin Bearer token |
| `GET /api/menu`, `GET /api/menu/:id` | Public |
| `POST /api/menu`, `PUT /api/menu/:id`, `DELETE /api/menu/:id` | Admin Bearer token |

Category writes accept `{ "name": "Burgers" }`. A duplicate name or deletion of a referenced category returns HTTP 409. Menu writes require `name`, `description`, positive numeric `price`, HTTP(S) `image` URL, and `category` ID. The optional boolean `available` defaults to `true` for new items and retains its existing value on updates when omitted.

`GET /api/menu` accepts `search`, `category`, `available=true|false`, `page`, and `limit` together. Responses include `items` and `pagination` with `page`, `limit`, `total`, and `totalPages`. The default page size is 10 and the maximum is 100. Category and menu files are `categories.db` and `menu.db` under `DATA_DIR`.

## Orders and checkout

All order routes require `Authorization: Bearer JWT_TOKEN`. Admin routes also require an admin account.

| Endpoint | Access | Result |
| --- | --- | --- |
| `POST /api/orders` | Authenticated | Creates a pending order and returns HTTP 201 with `order` |
| `GET /api/orders/my` | Authenticated | Returns the caller's `orders`, newest first |
| `GET /api/orders` | Admin | Returns all `orders`, newest first |
| `PUT /api/orders/:id/status` | Admin | Updates the order and returns HTTP 200 with `order` |

Example checkout request:

```json
{
  "address": "12 Example Street, Sample City",
  "items": [
    { "menuItemId": "MENU_ITEM_ID", "quantity": 2 }
  ]
}
```

Use 1–50 distinct menu items, quantities from 1–99, and a delivery address of 5–500 characters after trimming. The server looks up each current menu price and availability. It rounds each unit price to cents before multiplying by quantity and stores the item name, price, and quantity with the order. Later catalog edits or deletions leave order history intact. Responses include `total`, each line's `unitPrice` and `subtotal`, the status, and timestamps. NeDB stores orders in `orders.db` under `DATA_DIR`.

Send `{ "status": "preparing" }` to update status. Allowed transitions are pending → preparing → delivered, or pending/preparing → cancelled. Delivered and cancelled orders are final. Invalid data or status values return HTTP 400. Missing items or orders return 404, unavailable items and invalid transitions return 409, and prices or totals that cannot be represented in cents return 422.

## Admin dashboard

`GET /api/admin/stats` requires an admin Bearer token and returns HTTP 200.

```json
{
  "success": true,
  "stats": {
    "totalOrders": 4,
    "deliveredRevenue": 27,
    "pendingOrders": 1,
    "totalUsers": 1,
    "totalMenuItems": 15
  }
}
```

Delivered revenue sums the stored totals of delivered orders. Pending orders count only the `pending` status. Total users includes admins, and total menu items includes unavailable items.

## Local verification

Run the integration tests from `backend/`. They create temporary NeDB files and use isolated test credentials.

```powershell
node --test scripts/auth.test.js scripts/catalog.test.js
```

With the server running, check health and test a profile token from a second terminal.

```powershell
curl.exe -i http://localhost:5000/api/health
curl.exe -i -H "Authorization: Bearer JWT_TOKEN" http://localhost:5000/api/auth/me
```

The health endpoint returns HTTP 200 with this body once the datastores and the user email index are ready.

```json
{
  "success": true,
  "message": "Food Ordering Backend is running",
  "database": "NeDB"
}
```

## Render deployment

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Set `JWT_SECRET` in the Render dashboard before deploying. Use a stable, separately generated production secret. Set `NODE_ENV=production`, `DATA_DIR=./data`, and `CLIENT_URL` to your actual frontend origin. Render supplies `PORT`, and the server binds to `0.0.0.0`.

Keep `TRUST_PROXY_HOPS=0` for direct local connections. The intended setting for a Render service reachable only through its managed ingress is `TRUST_PROXY_HOPS=1`, provided the rightmost `X-Forwarded-For` address is the client IP inserted by the trusted ingress. Express then trusts one hop and ignores earlier addresses supplied by callers. Verify this with requests from two known client IPs before enabling it. If the rightmost address is another proxy or requests can reach the service through a shorter path, leave the value at `0` until the topology is verified. With `0` behind Render, clients can share a rate-limit bucket. See [Render's proxy example](https://render.com/articles/how-to-implement-authentication-and-authorization) and [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies.html).

Render's default filesystem is ephemeral. Local user accounts may be lost after a restart or redeployment. For persistent accounts on a service with a persistent disk, set `DATA_DIR` to a directory on the disk. See [Render Web Services](https://render.com/docs/web-services) and [Render persistent disks](https://render.com/docs/disks).
