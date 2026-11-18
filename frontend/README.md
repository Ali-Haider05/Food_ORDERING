# BIIT Food Hub frontend

React and Vite storefront for browsing the live menu, placing orders, and tracking order status. Admins manage categories, menu items, and order status, and view reported dashboard totals.

## Local development

From `frontend/`, copy `.env.example` to the ignored `.env` file. The example points to the live Render API. For local development against a local API, set `VITE_API_URL=http://localhost:5000/api`.

```sh
npm ci
npm run dev
npm test
npm run build
```

Create a customer account through signup. Admin sign-in requires an account provisioned on the backend. The client validates saved tokens with `GET /auth/me`. Checkout sends the delivery address and menu item quantities, and the confirmation shows the total returned by the API.

## Vercel

Use the Vite preset with Root Directory `frontend`, Install Command `npm ci`, Build Command `npm run build`, and Output Directory `dist`. Set `VITE_API_URL=https://food-ordering-s8ga.onrender.com/api` in Vercel. Add the exact frontend origin to Render's `CLIENT_URL` before testing in a browser. Only public configuration belongs in Vite variables. The included `vercel.json` routes direct visits through React Router.
