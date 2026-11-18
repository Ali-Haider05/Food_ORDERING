# Food Ordering Backend

Phase 1 sets up Express and a persistent NeDB datastore. The server starts listening after NeDB loads successfully.

## Local development

Run these commands from the repository root in PowerShell.

```powershell
cd backend
Copy-Item .env.example .env # Skip this if .env already exists.
npm ci
npm run dev
```

Use `npm start` to run without nodemon. In a second terminal, check the API:

```powershell
curl.exe -i http://localhost:5000/api/health
```

A successful request returns HTTP 200 with this body:

```json
{
  "success": true,
  "message": "Food Ordering Backend is running",
  "database": "NeDB"
}
```

Set `CLIENT_URL` to a comma-separated list of allowed frontend origins. Use scheme, hostname, and optional port, without a trailing slash. Relative `DATA_DIR` values are resolved from `backend/`. NeDB creates `test.db` in that directory. `JWT_SECRET` is reserved for a later phase.

## Render deployment

| Setting | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Set `NODE_ENV=production`, `DATA_DIR=./data`, and `CLIENT_URL` to your frontend's actual Vercel origin, for example `https://your-frontend.vercel.app`. Add any additional origins separated by commas. Render provides `PORT`, and the server binds to `0.0.0.0`.

NeDB runs in the web service process. Render's default filesystem is ephemeral, so local database contents may be lost after a restart or redeployment. See [Render Web Services](https://render.com/docs/web-services) and [Render's filesystem FAQ](https://render.com/docs/faq).
