# 📡 Backend API Integration Contract — Food Ordering System
**BIIT Food Hub (Rawalpindi Campus)**

This document defines the exact REST API specification required by the React frontend.
The frontend is pre-configured with Axios interceptors that automatically attach JWT tokens to every request (`Authorization: Bearer <token>`) and points to `http://localhost:5000/api` (configurable via `VITE_API_URL` in `.env`).

---

## 1. System Overview & Base URL

- **Default Base URL:** `http://localhost:5000/api`
- **Content-Type:** `application/json`
- **Authorization Header:** `Authorization: Bearer <jwt_token>`
- **CORS Allowed Origins:** Include `http://localhost:5173` and local network IPs.

---

## 2. Health & Telemetry

### `GET /api/health`
Checks backend server and database availability.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "database": "NeDB",
  "message": "Backend operational"
}
```

---

## 3. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticates a customer or admin.

**Request Body:**
```json
{
  "email": "customer@foodie.com",
  "password": "pass123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-customer-1",
    "name": "Hamza Abbasi (BIIT Student)",
    "email": "customer@foodie.com",
    "role": "customer",
    "phone": "+92 301 5551234",
    "address": "Hostel #4, BIIT Campus, Shamsabad, Murree Road, Rawalpindi"
  }
}
```

**Errors:**
- `400 / 401`: `{ "success": false, "message": "Invalid email or password" }`

---

### `POST /api/auth/register` (or `/api/auth/signup`)
Registers a new customer or admin user.

**Request Body:**
```json
{
  "name": "Hamza Abbasi",
  "email": "hamza@biit.edu.pk",
  "password": "secretpassword",
  "phone": "+92 301 5551234",
  "address": "Hostel #4, BIIT Campus, Shamsabad, Rawalpindi",
  "role": "customer"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "usr-12345",
    "name": "Hamza Abbasi",
    "email": "hamza@biit.edu.pk",
    "role": "customer",
    "phone": "+92 301 5551234",
    "address": "Hostel #4, BIIT Campus, Shamsabad, Rawalpindi"
  }
}
```

---

### `GET /api/auth/profile` (or `/api/auth/me`)
*Protected: Requires `Authorization: Bearer <token>`*

**Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": "usr-customer-1",
    "name": "Hamza Abbasi",
    "email": "customer@foodie.com",
    "role": "customer"
  }
}
```

---

## 4. Food Menu Endpoints (`/api/menu`)

### `GET /api/menu`
Retrieves all food items for the menu.

**Response `200 OK`:** *(Can return array directly or `{ items: [...] }` or `{ data: [...] }`)*
```json
[
  {
    "id": "dish-1",
    "name": "Truffle Glazed Beef Smash Burger",
    "category": "Burgers",
    "price": 890,
    "description": "Double beef patties, aged cheddar cheese, black truffle aioli, caramelized onions on toasted brioche bun.",
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "prepTime": "15-20 min",
    "rating": 4.9,
    "reviewsCount": 142,
    "isVeg": false,
    "calories": "780 kcal",
    "tag": "Bestseller",
    "isAvailable": true
  },
  {
    "id": "dish-4",
    "name": "Truffle & Porcini Fettuccine",
    "category": "Pasta",
    "price": 1290,
    "description": "Handmade Italian egg fettuccine, sautéed wild porcini mushrooms, rich parmesan cream sauce.",
    "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "prepTime": "18-22 min",
    "isVeg": true,
    "isAvailable": true
  }
]
```

---

### `POST /api/menu`
*Admin only: Requires `Authorization: Bearer <token>`*
Creates a new food item.

**Request Body:**
```json
{
  "name": "Chicken Tikka Pizza",
  "category": "Pizza",
  "price": 1590,
  "description": "Desi char-grilled chicken tikka, pickled jalapeños, mozzarella blend.",
  "image": "https://images.unsplash.com/photo-...",
  "prepTime": "20-25 min",
  "calories": "720 kcal",
  "tag": "Spicy 🔥",
  "isVeg": false,
  "isAvailable": true
}
```

**Response `201 Created`:**
Returns the newly created dish object with generated `id` (or `_id`).

---

### `PUT /api/menu/:id`
*Admin only*
Updates an existing dish.

**Request Body:**
Fields to update (e.g. `price`, `isAvailable`, `description`, etc.)

**Response `200 OK`:**
Returns updated dish object.

---

### `DELETE /api/menu/:id`
*Admin only*
Deletes a dish item.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Dish removed successfully"
}
```

---

## 5. Orders Endpoints (`/api/orders`)

### `GET /api/orders`
*Admin only*
Returns all customer orders.

**Response `200 OK`:**
```json
[
  {
    "id": "ORD-8921",
    "userId": "usr-customer-1",
    "userName": "Hamza Abbasi",
    "userEmail": "customer@foodie.com",
    "userPhone": "+92 301 5551234",
    "deliveryAddress": "Hostel #4, BIIT Campus, Shamsabad, Murree Road, Rawalpindi",
    "status": "Preparing",
    "statusStep": 1,
    "createdAt": "2026-11-18T12:00:00.000Z",
    "estimatedDeliveryTime": "20-25 mins",
    "items": [
      {
        "id": "dish-5",
        "name": "Crispy Deluxe Zinger Crunch Burger",
        "price": 650,
        "quantity": 2,
        "image": "https://..."
      }
    ],
    "subtotal": 1300,
    "discount": 0,
    "deliveryFee": 100,
    "total": 1400,
    "paymentMethod": "Cash on Delivery",
    "notes": "Call upon reaching BIIT Gate #2 please."
  }
]
```

---

### `GET /api/orders/my`
*Customer protected: Requires `Authorization: Bearer <token>`*
Returns orders placed by the currently logged-in user.

---

### `POST /api/orders`
Places a new food order.

**Request Body:**
```json
{
  "userId": "usr-customer-1",
  "userName": "Hamza Abbasi",
  "userEmail": "customer@foodie.com",
  "userPhone": "+92 301 5551234",
  "deliveryAddress": "Hostel #4, BIIT Campus, Shamsabad, Murree Road, Rawalpindi",
  "paymentMethod": "Cash on Delivery",
  "notes": "Please send extra ketchup",
  "items": [
    {
      "id": "dish-1",
      "name": "Truffle Glazed Beef Smash Burger",
      "price": 890,
      "quantity": 2,
      "image": "https://..."
    }
  ],
  "subtotal": 1780,
  "discount": 200,
  "deliveryFee": 0,
  "tax": 0,
  "total": 1580
}
```

**Response `201 Created`:**
Returns created order object with unique `id`.

---

### `PATCH /api/orders/:id/status` (or `PUT /api/orders/:id/status`)
*Admin only*
Updates order lifecycle step.

**Request Body:**
```json
{
  "status": "Out for Delivery"
}
```
*(Valid statuses: `"Pending"`, `"Preparing"`, `"Out for Delivery"`, `"Delivered"`, `"Cancelled"`)*

**Response `200 OK`:**
Returns updated order.
