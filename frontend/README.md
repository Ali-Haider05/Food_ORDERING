# 🥗 GourmetBite — Premium Food Ordering Web Application

A modern, visually stunning, and full-featured frontend web application engineered for the University Full-Stack Web Development Competition.

---

## 🌟 Key Highlights & University Evaluation Criteria

- **Tailwind Color Architecture**:
  - **Green (Emerald)**: Primary brand actions, order confirmations, active state accents.
  - **Beige (Warm Cream)**: Clean luxurious backgrounds (`#FDFBF7`, `#F8F5EE`), subtle cards, and borders.
  - **Orange (Vibrant Amber)**: High-priority badges, pricing, notifications, and secondary highlights.
- **Visual Design & Micro-Interactions**:
  - 60fps card hover lift and scale effects.
  - Custom SVG weekly revenue velocity charts and order status progress indicators.
  - Interactive live order status tracking with real-time step transitions (`Pending` ➡️ `Preparing` ➡️ `Out for Delivery` ➡️ `Delivered`).
  - Shimmering skeleton loaders for cards, tables, and statistics.
  - Smooth slide-in cart drawer and celebratory confetti explosion on checkout.
- **Authentication & Role-Based Authorization**:
  - JWT token storage in `localStorage`.
  - Automatic `Bearer` token attachment via Axios request interceptors.
  - Protected customer routes and restricted Admin routes.
  - Quick-Fill evaluation buttons for judges (1-click Customer & Admin login).
- **Backend Integration & Resilience**:
  - Automated health check integration with backend (`/api/health`).
  - Seamless fallback data persistence engine in `localStorage` when testing without an active backend server.

---

## 👥 Demo Accounts (For Judges & Evaluators)

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** | `customer@foodie.com` | `pass123` | Home, Menu, Cart, My Orders, Live Tracker, Reordering |
| **Restaurant Admin** | `admin@foodie.com` | `admin123` | Executive Dashboard, Menu Item Manager, Orders Pipeline |

*Tip: On the `/login` page, click either "Customer Demo" or "Admin Demo" for instant 1-click credential filling!*

---

## 🎟️ Available Voucher Coupons

- `FOODIE20` — 20% Off entire order
- `FREEDEL` — Free express thermal delivery
- `WELCOME10` — $10 Off orders over $30

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The app will run locally at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```
Creates an optimized, production-ready bundle in `dist/`.

---

## 📂 Project Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/       # Button, Input, Modal, Badge, Skeleton, EmptyState, BackendStatusPill
│   │   ├── dashboard/    # StatCard, RevenueChart, StatusDonutChart
│   │   ├── food/         # FoodCard, FoodQuickViewModal, CategoryPills
│   │   ├── layout/       # Navbar, Footer, CartDrawer
│   │   └── orders/       # OrderTracker, OrderCard
│   ├── context/          # AuthContext, CartContext, ToastContext
│   ├── pages/            # Home, Login, Signup, Cart, Orders, AdminDashboard, AdminMenu, AdminOrders, NotFound
│   ├── routes/           # AppRoutes, ProtectedRoute, AdminRoute, ScrollToTop
│   ├── services/         # api.js, authService.js, menuService.js, orderService.js, statsService.js, healthService.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tailwind.config.js
└── vite.config.js
```
