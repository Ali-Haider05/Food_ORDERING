# Food Ordering Backend

The backend uses Express and persistent, file-based NeDB. It serves the health check and JWT authentication routes.

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
| `DATA_DIR` | Directory for `test.db` and `users.db`. Relative paths resolve from `backend/`. Defaults to `./data`. |
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
| 409 | Email already registered |
| 500 | Internal server error |

Errors use the following JSON shape.

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Local verification

Run the integration tests from `backend/`. The suite creates temporary NeDB files and uses isolated test credentials.

```powershell
node --test scripts/auth.test.js
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

Render's default filesystem is ephemeral. Local user accounts may be lost after a restart or redeployment. For persistent accounts on a service with a persistent disk, set `DATA_DIR` to a directory on the disk. See [Render Web Services](https://render.com/docs/web-services) and [Render persistent disks](https://render.com/docs/disks).
