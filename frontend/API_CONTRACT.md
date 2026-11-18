# Backend API contract

Set `VITE_API_URL` to the backend URL ending in `/api`. The paths below are relative to that base. Protected endpoints use `Authorization: Bearer <token>`. Successful responses include `success: true`. Errors have `success: false` and a `message`.

| Method and path | Access | Request and response |
| --- | --- | --- |
| `GET /health` | Public | 200 with `message` and `database`. |
| `POST /auth/signup` | Public | Send `name`, `email`, and `password`. 201 with `token` and `user`. |
| `POST /auth/login` | Public | Send `email` and `password`. 200 with `token` and `user`. |
| `GET /auth/me` | Signed in | 200 with `user`. |
| `GET /categories` | Public | 200 with `categories`, each with `id`, `name`, and `createdAt`. |
| `POST /categories`, `PUT /categories/:id` | Admin | Send `name`. Receive `category` with 201 or 200, respectively. Duplicate names return 409. |
| `DELETE /categories/:id` | Admin | 200 with `message`. Returns 409 if the category is still in use. |
| `GET /menu` | Public | 200 with `items` and `pagination`. Supports `search`, `category` ID, `available=true\|false`, `page`, and `limit`. |
| `GET /menu/:id` | Public | 200 with `item`. |
| `POST /menu`, `PUT /menu/:id` | Admin | Send `name`, `description`, `category` ID, positive numeric `price`, HTTP(S) `image` URL, and optional boolean `available`. Receive `item` with 201 or 200, respectively. |
| `DELETE /menu/:id` | Admin | 200 with `message`. |
| `POST /orders` | Signed in | Send only `address` and `items: [{ menuItemId, quantity }]`. 201 with `order`. |
| `GET /orders/my` | Signed in | 200 with the caller's `orders`. |
| `GET /orders` | Admin | 200 with all `orders`. |
| `PUT /orders/:id/status` | Admin | Send `status`. 200 with the updated `order`. |
| `GET /admin/stats` | Admin | 200 with `stats` containing `totalOrders`, `deliveredRevenue`, `pendingOrders`, `totalUsers`, and `totalMenuItems`. |

User responses contain `id`, `name`, `email`, and `role` (`user` or `admin`). Signup always assigns `user`. Missing or expired tokens return 401, role restrictions return 403, and signup and login can return 429.

Menu items contain `id`, `name`, `description`, `price`, `image`, `category`, `available`, `createdAt`, and `updatedAt`. Pagination contains `page`, `limit`, `total`, and `totalPages`. The default limit is 10 and the maximum is 100.

An order contains `id`, `userId`, `address`, `status`, `total`, `createdAt`, `updatedAt`, and `items`. Each item snapshot contains `menuItemId`, `name`, `quantity`, `unitPrice`, and `subtotal`. Checkout accepts 1 to 50 distinct items, quantities from 1 to 99, and a trimmed delivery address of 5 to 500 characters. The server calculates the total from current menu prices and returns 409 for unavailable items.

Status transitions are `pending` to `preparing` or `cancelled`, and `preparing` to `delivered` or `cancelled`. Delivered and cancelled orders are final. Invalid transitions return 409. Dashboard revenue counts delivered orders only.
