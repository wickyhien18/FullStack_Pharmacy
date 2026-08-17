# Pharmacy E-commerce Platform

> A full-stack pharmacy management and e-commerce system for managing products, inventory, customer orders, authentication, and role-based administration.

Modernizing and digitizing community pharmacy operations by automating prescription and OTC medicine catalog management, real-time inventory tracking, multi-channel payment processing (COD, VNPay), and multi-role workflows for staffs, administrators, and online customers.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis)
![Tests](<https://img.shields.io/badge/Tests-70%20Passed%20(100%25)-brightgreen?logo=jest>)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation & Setup](#installation--setup)
- [Running Automated Tests](#running-automated-tests)
- [Screenshots & UI Previews](#screenshots--ui-previews)
- [Development Process & CI/CD](#development-process--cicd)
- [Future Roadmap](#future-roadmap)
- [Author](#author)

---

## Overview

The Fullstack Pharmacy Management System is an end-to-end e-commerce and inventory management platform designed for pharmaceutical retail. It caters to three primary user groups: **Administrators** managing platform statistics, user roles, catalog data, and cancellation requests; **Staff** fulfilling orders, updating batch inventory, and monitoring stock levels; and **Customers** browsing pharmaceutical products, managing shopping carts, placing orders, and tracking shipments. Unlike simple CRUD applications, it features transactional checkout with atomic stock deductions, double-token authentication with refresh token rotation, Redis query caching, real-time notifications, VNPay payment gateway integration, and comprehensive automated CI/CD testing.

**Role:** Full Stack Developer  
**Timeline:** 2026  
**Status:** Production-ready (Full MVP with automated CI/CD test suites & real-time capabilities)

---

## Key Features

### User Management and Authorization

- User registration and login with JWT authentication.
- Refresh token stored in an HttpOnly, Secure cookie with automatic rotation and device fingerprinting.
- Role-Based Access Control (RBAC) with **3 roles**: `ROLE_ADMIN`,`ROLE_STAFF`, and `ROLE_CUSTOMER`.
- Protected admin routes for dashboard, product, user, and order management.
- Google OAuth2 authentication integration.
- Secure email change with OTP verification via Resend.

### Product and Category Management

- Admin CRUD workflow for pharmaceutical products and manufacturers.
- Product category filtering and dynamic product count display.
- Product image upload with multi-image gallery support via Supabase Storage.
- Full-text product search, price/category filtering, sorting, and pagination.
- Custom packaging unit inputs (e.g., Hộp, Vỉ, Viên, Chai, Tuýp) for flexible formats.

### Inventory Management

- Real-time inventory quantity tracking per product.
- Concurrency-safe atomic stock deduction upon checkout via database transactions (`$transaction`).
- Comprehensive inventory audit logs (`IMPORT`, `EXPORT`, `ADJUST`) recording quantity deltas, previous stock, and operator notes.
- Low-stock indicators and out-of-stock guards preventing overselling.

### Order & Payment Management

- Customer cart and checkout flow with optimistic state updates.
- Multi-channel payment options: **Cash on Delivery (COD)** and **VNPay** payment gateway with IPN callback verification.
- Full order lifecycle: `PENDING` → `CONFIRMED` → `SHIPPING` → `DELIVERED` → `COMPLETED`.
- Customer cancellation request workflow (`CANCEL_REQUESTED` → `CANCELLED`) with admin approval/rejection.
- In-app notification center for order status updates.

### Performance and Security

- Redis in-memory caching for high-traffic product catalog and category queries with smart invalidation.
- Rate limiting protection: 300 req/15min global, dedicated strict limits on authentication routes.
- Helmet security headers and XSS input sanitization middleware.
- Request payload validation using Zod schemas.
- Centralized error handling and unified response formatting.
- Bidirectional localization: English backend API messages with frontend Vietnamese translation dictionary.

---

## Tech Stack

| Layer                | Technology                                                                 |
| :------------------- | :------------------------------------------------------------------------- |
| **Frontend**         | React, Vite, Tailwind CSS v4, Axios, TanStack Query, Zustand, Lucide React |
| **Frontend Testing** | Vitest, @testing-library/react, @testing-library/jest-dom, jsdom           |
| **Backend**          | Node.js (>=22), Express.js, JavaScript ES Modules, Passport.js             |
| **Backend Testing**  | Jest, Supertest, Prisma Client                                             |
| **Database**         | PostgreSQL (Supabase / Neon / Local PostgreSQL)                            |
| **ORM**              | Prisma ORM                                                                 |
| **Caching**          | Redis (Upstash / Local Redis)                                              |
| **Authentication**   | JWT (Access Token) + HttpOnly Cookie (Refresh Token), RBAC                 |
| **File Storage**     | Supabase Storage                                                           |
| **Payment Gateway**  | VNPay Sandbox, Cash on Delivery (COD)                                      |
| **Email Service**    | Resend API                                                                 |
| **DevOps & CI/CD**   | GitHub Actions, Vercel (Frontend), Render (Backend), Docker-ready          |
| **Tools**            | Git, npm, Prisma Studio, Postman, ESLint, Prettier                         |

---

## System Architecture

The backend follows a layered architecture that separates HTTP handling, business logic, and database access. This keeps controllers thin, makes service logic easier to maintain, and prevents Prisma queries from being spread across route handlers.

```text
Request
  -> Routes (Endpoint routing & rate limiting)
  -> Middlewares (Auth, RBAC, Validation, Sanitization, Cache)
  -> Controllers (Request parsing & Response sending)
  -> Services (Business logic, transactions, third-party integrations)
  -> Repositories (Data access layer & Prisma queries)
  -> Prisma ORM
  -> PostgreSQL Database
```

```text
BackEnd/src/
├── config/          # Prisma client, Redis, Passport, Env configuration
├── controllers/     # Thin HTTP request and response handlers
├── middlewares/     # Auth, RBAC, Rate-limit, Cache, Error handling, Security
├── repositories/    # Prisma database query abstraction layer
├── routes/          # Express route definitions
├── services/        # Business logic layer (Auth, Product, Order, Payment, Cart)
├── tests/           # Jest & Supertest automated test suites
├── utils/           # JWT, error translation, response formatters, crypto helpers
└── validator/       # Zod request validation schemas
```

```text
FrontEnd/src/
├── app/             # Main App root component and routes (App.jsx, routes.jsx)
├── components/      # Reusable UI components, header, footer, modals, layout
├── pages/           # Customer storefront, checkout, auth, and admin pages
├── hooks/           # Custom React hooks (useCart, useNotifications, useAuth)
├── services/        # Axios API instances and service calls (axiosInstance.js)
├── stores/          # Zustand global state stores (useAuthStore, etc.)
├── styles/          # Global CSS & Tailwind CSS styling
├── tests/           # Vitest and React Testing Library test suites
└── utils/           # Helper utilities, error localization, socket client
```

### Architecture Highlights & Trade-offs

1. **Controller-Service-Repository Pattern**: Strictly separates HTTP request parsing from business calculations and database mutations.
2. **Double-Token Security**: Short-lived Access Tokens (15 mins) kept in client memory, while Refresh Tokens (7 days) are stored in `HttpOnly`, `SameSite` cookies with DB rotation to prevent XSS credential theft.
3. **Transactional Integrity**: Multi-item order placements and inventory adjustments execute within Prisma `$transaction` blocks to ensure ACID compliance.
4. **Cache Invalidation Pipeline**: Redis caches read-heavy endpoints (`/api/products`, `/api/categories`, `/api/manufacturers`) and invalidates patterns upon product creation, update, or stock change.
5. **Bidirectional Localization Strategy**: Backend errors remain English for standard logging and automated tests; Frontend translates all API responses to user-friendly Vietnamese via `errorMessages.js`.

---

## Database Schema

The database consists of **17 tables** with comprehensive relational integrity, indexes, and foreign key cascades:

```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    USERS ||--o{ REFRESH_TOKENS : "owns"
    USERS ||--o{ OTP_VERIFICATIONS : "requests"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ CARTS : "owns"
    USERS ||--o{ ORDERS : "places"

    CATEGORIES ||--o{ PRODUCTS : "classifies"
    MANUFACTURERS ||--o{ PRODUCTS : "produces"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "contains"
    PRODUCTS ||--|| INVENTORY : "tracks"
    PRODUCTS ||--o{ INVENTORY_LOGS : "records"
    PRODUCTS ||--o{ CART_ITEMS : "added_to"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered_in"

    CARTS ||--o{ CART_ITEMS : "contains"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    ORDERS ||--o{ PAYMENTS : "paid_with"
    ORDERS ||--o{ SHIPMENTS : "shipped_via"
```

| Table               | Description                                                        | Main Relationships                                                   |
| :------------------ | :----------------------------------------------------------------- | :------------------------------------------------------------------- |
| `users`             | User accounts, credentials, and profiles                           | Many-to-one with `roles`; one-to-many with `orders`, `notifications` |
| `roles`             | RBAC roles (`ROLE_ADMIN`, `ROLE_STAFF`, `ROLE_CUSTOMER`)           | One-to-many with `users`                                             |
| `refresh_tokens`    | Active refresh tokens with device info & rotation                  | Many-to-one with `users`                                             |
| `otp_verifications` | OTP verification codes for email updates                           | One-to-one with `users`                                              |
| `categories`        | Medicine categories with slug support                              | One-to-many with `products`                                          |
| `manufacturers`     | Pharmaceutical manufacturer info & country                         | One-to-many with `products`                                          |
| `products`          | Medicines with price, unit, status, expire date                    | Many-to-one with `categories`, `manufacturers`                       |
| `product_images`    | Additional gallery photos with display order                       | Many-to-one with `products`                                          |
| `inventory`         | Real-time stock quantity                                           | One-to-one with `products`                                           |
| `inventory_logs`    | Audit trail for inventory movements (`IMPORT`, `EXPORT`, `ADJUST`) | Many-to-one with `products`                                          |
| `carts`             | User shopping carts                                                | One-to-many with `cart_items`                                        |
| `cart_items`        | Cart line items and quantities                                     | Many-to-one with `carts` and `products`                              |
| `orders`            | Customer orders, totals, shipping address, statuses                | One-to-many with `order_items`, `payments`, `shipments`              |
| `order_items`       | Order snapshots (unit price, total price, quantity)                | Many-to-one with `orders` and `products`                             |
| `payments`          | Transaction records (`COD`, `VNPAY`, `MOMO`)                       | Many-to-one with `orders`                                            |
| `shipments`         | Shipping carrier, tracking code, delivery status                   | Many-to-one with `orders`                                            |
| `notifications`     | In-app user and order alerts                                       | Many-to-one with `users`                                             |

---

**Total Endpoints:** 54 endpoints across 10 resource modules

### 1. Auth (`/api/auth`)

| Method | Endpoint                           | Description                                   | Access          |
| :----- | :--------------------------------- | :-------------------------------------------- | :-------------- |
| POST   | `/api/auth/register`               | Register a new customer account               | Public          |
| POST   | `/api/auth/login`                  | Authenticate and obtain JWT access token      | Public          |
| POST   | `/api/auth/refresh-token`          | Rotate refresh token and get new access token | Public (Cookie) |
| POST   | `/api/auth/logout`                 | Revoke current device refresh token session   | Authenticated   |
| POST   | `/api/auth/logout-all`             | Revoke all active sessions across devices     | Authenticated   |
| GET    | `/api/auth/profile`                | Get current authenticated user profile        | Authenticated   |
| PUT    | `/api/auth/profile`                | Update user personal information              | Authenticated   |
| PUT    | `/api/auth/change-password`        | Change account password                       | Authenticated   |
| POST   | `/api/auth/request-email-change`   | Request email change and send OTP             | Authenticated   |
| POST   | `/api/auth/verify-email-change`    | Confirm email change with OTP                 | Authenticated   |
| POST   | `/api/auth/forgot-password`        | Request password reset token                  | Public          |
| POST   | `/api/auth/reset-password`         | Reset password using token                    | Public          |
| GET    | `/api/auth/google`                 | Google OAuth2 authentication redirect         | Public          |
| GET    | `/api/auth/google/callback`        | Google OAuth2 callback handler                | Public          |
| POST   | `/api/auth/google/complete-signup` | Complete registration for Google users        | Public          |

### 2. Products (`/api/products`)

| Method | Endpoint              | Description                                                | Access          |
| :----- | :-------------------- | :--------------------------------------------------------- | :-------------- |
| GET    | `/api/products`       | Get products with search, category, sort, and pagination   | Public (Cached) |
| GET    | `/api/products/:slug` | Get product details, gallery images, and inventory by slug | Public (Cached) |

### 3. Categories (`/api/categories`)

| Method | Endpoint                      | Description                              | Access          |
| :----- | :---------------------------- | :--------------------------------------- | :-------------- |
| GET    | `/api/categories`             | Get all product categories               | Public (Cached) |
| GET    | `/api/categories/count`       | Get categories with active product count | Public (Cached) |
| POST   | `/api/categories`             | Create a new category                    | Admin           |
| PUT    | `/api/categories/:categoryId` | Update category details                  | Admin           |
| DELETE | `/api/categories/:categoryId` | Delete category                          | Admin           |

### 4. Manufacturers (`/api/manufacturers`)

| Method | Endpoint                             | Description                 | Access          |
| :----- | :----------------------------------- | :-------------------------- | :-------------- |
| GET    | `/api/manufacturers`                 | Get all manufacturers       | Public (Cached) |
| POST   | `/api/manufacturers`                 | Create a new manufacturer   | Admin           |
| PUT    | `/api/manufacturers/:manufacturerId` | Update manufacturer details | Admin           |
| DELETE | `/api/manufacturers/:manufacturerId` | Delete manufacturer         | Admin           |

### 5. Shopping Cart (`/api/cart`)

| Method | Endpoint                      | Description                             | Access        |
| :----- | :---------------------------- | :-------------------------------------- | :------------ |
| GET    | `/api/cart`                   | Get current user's active shopping cart | Authenticated |
| POST   | `/api/cart/items`             | Add product to cart                     | Authenticated |
| PATCH  | `/api/cart/items/:cartItemId` | Update cart item quantity               | Authenticated |
| DELETE | `/api/cart/items/:cartItemId` | Remove item from cart                   | Authenticated |

### 6. Orders (`/api/orders`)

| Method | Endpoint                      | Description                                       | Access   |
| :----- | :---------------------------- | :------------------------------------------------ | :------- |
| POST   | `/api/orders`                 | Checkout and create order from current cart       | Customer |
| GET    | `/api/orders/my`              | Get paginated order history of authenticated user | Customer |
| GET    | `/api/orders/:orderId`        | Get detailed order status and items               | Customer |
| POST   | `/api/orders/:orderId/cancel` | Submit order cancellation request with reason     | Customer |

### 7. Payments (`/api/payment`)

| Method | Endpoint                      | Description                                     | Access        |
| :----- | :---------------------------- | :---------------------------------------------- | :------------ |
| POST   | `/api/payment/vnpay/create`   | Generate VNPay payment gateway URL              | Authenticated |
| GET    | `/api/payment/vnpay/callback` | Handle VNPay IPN return and update order status | Public        |
| POST   | `/api/payment/cod`            | Initialize Cash on Delivery payment record      | Authenticated |
| GET    | `/api/payment/order/:orderId` | Get payment status for specific order           | Authenticated |

### 8. Notifications (`/api/notifications`)

| Method | Endpoint                           | Description                    | Access        |
| :----- | :--------------------------------- | :----------------------------- | :------------ |
| GET    | `/api/notifications`               | Get user notifications list    | Authenticated |
| PATCH  | `/api/notifications/mark-all-read` | Mark all notifications as read | Authenticated |

### 9. Admin & Staff Management (`/api/admin`)

| Method | Endpoint                                    | Description                                                     | Access        |
| :----- | :------------------------------------------ | :-------------------------------------------------------------- | :------------ |
| GET    | `/api/admin/stats`                          | Get overview dashboard KPIs (revenue, orders, users, inventory) | Admin / Staff |
| GET    | `/api/admin/orders`                         | Get all customer orders with filters and pagination             | Admin / Staff |
| PATCH  | `/api/admin/orders/:orderId/status`         | Update order processing status                                  | Admin / Staff |
| PATCH  | `/api/admin/orders/:orderId/cancel-request` | Approve or reject order cancellation request                    | Admin / Staff |
| GET    | `/api/admin/users`                          | Get all users list with role & activity data                    | Admin         |
| PATCH  | `/api/admin/users/:userId/status`           | Enable or disable user account                                  | Admin         |
| PATCH  | `/api/admin/users/:userId/role`             | Update user RBAC role                                           | Admin         |
| GET    | `/api/admin/roles`                          | Get system roles list                                           | Admin         |
| GET    | `/api/admin/products`                       | Get all products including inactive & draft                     | Admin / Staff |
| GET    | `/api/admin/products/:productId`            | Get product detail for admin edit form                          | Admin / Staff |
| POST   | `/api/admin/products`                       | Create product with image upload and initial inventory          | Admin         |
| PUT    | `/api/admin/products/:productId`            | Update product, images, and inventory stock                     | Admin / Staff |
| DELETE | `/api/admin/products/:productId`            | Soft-delete product (`deletedAt`)                               | Admin         |

### 10. System (`/health`)

| Method | Endpoint  | Description                                   | Access |
| :----- | :-------- | :-------------------------------------------- | :----- |
| GET    | `/health` | Server health check and uptime ping timestamp | Public |

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/wickyhien18/FullStack_Pharmacy.git
cd FullStack_Pharmacy
```

### 2. Install Dependencies

```bash
# Install root, backend, and frontend dependencies in one command
npm run install:all
```

### 3. Configure Environment Variables

**Backend Environment (`BackEnd/.env`):**

```bash
cd BackEnd
cp .env.example .env
```

Edit `BackEnd/.env`:

```env
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

# Database (PostgreSQL / Supabase / Neon)
DATABASE_URL="postgresql://postgres:password@localhost:5432/pharmacy_db?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/pharmacy_db?schema=public"

# Authentication & Security
JWT_ACCESS_SECRET="your_super_secret_jwt_access_key_min_32_chars"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
BCRYPT_ROUNDS=10

# Redis Cache
REDIS_URL="redis://localhost:6379"

# Supabase Storage (Product Image Uploads)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your_supabase_service_role_key"
SUPABASE_STORAGE_BUCKET="product-images"

# Email Service (Resend)
RESEND_API_KEY="re_123456789"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# VNPay Payment Gateway (Sandbox)
VNP_TMN_CODE="YOUR_TMN_CODE"
VNP_HASH_SECRET="YOUR_HASH_SECRET"
VNP_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
```

**Frontend Environment (`FrontEnd/.env`):**

```bash
cd ../FrontEnd
cp .env.example .env
```

Edit `FrontEnd/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Database Setup & Migration

```bash
cd ../BackEnd
npx prisma generate
npx prisma db push
```

_(Optional: You can also import sample seed data directly from [database.sql](file:///home/wicky/Pharmacy_JS/database.sql))_

### 5. Start Development Servers

From the project root:

```bash
npm run dev
```

Application endpoints:

- **Backend API:** `http://localhost:3000`
- **Frontend App:** `http://localhost:5173`

---

## Running Automated Tests

Run the full end-to-end CI/CD test suites across both Backend and Frontend:

```bash
# Run all tests (Backend Jest + Frontend Vitest)
npm test

# Run Backend tests only (9 test suites)
npm run test:backend

# Run Frontend tests only (4 test suites)
npm run test:frontend
```

---

## Screenshots & UI Previews

|                             Customer Storefront                             |                        Product Detail & Gallery                        |
| :-------------------------------------------------------------------------: | :--------------------------------------------------------------------: |
| Clean modern catalog with search, category filters, and quick cart actions. | Multi-image preview, packaging unit selector, and dosage instructions. |

|                            Shopping Cart & Checkout                             |                           Admin Analytics Dashboard                           |
| :-----------------------------------------------------------------------------: | :---------------------------------------------------------------------------: |
| Slide-out cart drawer, voucher inputs, shipping address, and VNPay integration. | Revenue overview, order status distribution, inventory logs, and user tables. |

|                           Admin Product Management                           |                           Admin Order Status Pipeline                            |
| :--------------------------------------------------------------------------: | :------------------------------------------------------------------------------: |
| Product creation modal with multi-file drag-and-drop and inventory tracking. | Order processing lifecycle, status transitions, and cancellation request review. |

---

## Development Process & CI/CD

The system is developed following modern engineering standards with end-to-end automated test suites for continuous integration.

- **Total Commits:** 150+ commits
- **Automated Tests:** **13 Test Suites / 70 Automated Tests (100% Passed)**
- **Backend Testing:** Jest + Supertest + Prisma ORM in ES Modules mode
- **Frontend Testing:** Vitest + React Testing Library + jsdom

### Test Coverage Breakdown

```text
Backend Test Suites (BackEnd/src/tests/):
  ✓ auth.test.js          (Register, login, JWT & cookies, security error concealment)
  ✓ admin.test.js         (RBAC guards, dashboard KPIs, order management, user listing)
  ✓ order.test.js         (Cart-to-order checkout, inventory decrement, order history)
  ✓ product.test.js       (Pagination metadata, search filter, slug routing, categories)
  ✓ cart.test.js          (Cart retrieval, add item, update quantity, remove item)
  ✓ category.test.js      (Categories query, count aggregation, manufacturer listing)
  ✓ security.test.js      (Health check /health, Content-Type validation, XSS sanitization)
  ✓ notification.test.js  (Notification retrieval, mark-all-read endpoint)
  ✓ prisma.test.js        (PostgreSQL ping, seed roles, soft-delete filter, transactions)

Frontend Test Suites (FrontEnd/src/tests/):
  ✓ errorMessages.test.js (Translation dictionary, Zod error extraction, dynamic regex)
  ✓ authStore.test.js     (Zustand store authentication state, token storage, logout)
  ✓ useCart.test.js       (Cart calculations, quantity bounds checking, price format)
  ✓ components.test.jsx   (React ErrorBoundary fallback rendering and crash isolation)
```

### Technical Challenges Solved

1. **Transactional Concurrency & Inventory Guards**: Implemented Prisma `$transaction` blocks ensuring atomic stock validation and deduction during high-concurrency checkout without negative inventory.
2. **Secure Token Rotation**: Configured HttpOnly cookie refresh token rotation with user-agent device fingerprinting and instant session revocation (`/logout-all`).
3. **Multi-Image Storage Pipeline**: Handled multipart form uploads with Supabase Storage, thumbnail creation, and configurable gallery display ordering.
4. **Smart Cache Invalidation**: Optimized Redis caching for high-load catalog queries with instant cache flushing on product, category, or stock mutations.
5. **Unified Localization Architecture**: Maintained standard English backend response codes while providing automated client-side Vietnamese translation for user notifications.

---

## Author

**Giap Minh Hien**  
GitHub: [@wickyhien18](https://github.com/wickyhien18)  
Email: giaphien1008@gmail.com
