# Pharmacy Management System

> A full-stack pharmacy management and e-commerce system for managing medicines, inventory, customer orders, authentication, and role-based administration.

[TBD: Add 1-2 sentences describing the real-world problem this project solves, such as digitizing pharmacy operations, reducing manual tracking, or supporting online medicine ordering.]

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Screenshots](#screenshots)
- [Development Process](#development-process)
- [Future Roadmap](#future-roadmap)
- [Author](#author)

---

## Overview

[TBD: Add a 3-4 sentence overview explaining who uses the system, such as administrators, pharmacists, and customers; what workflow it supports; and what makes it different from a simple CRUD application.]

**Role:** Full Stack Developer  
**Timeline:** [TBD: Add project timeline]  
**Status:** [TBD: Add current status, such as MVP, in development, or production-ready]

---

## Key Features

### User Management and Authorization

- User registration and login with JWT authentication.
- Refresh token stored in an HttpOnly cookie.
- Role-Based Access Control with **[TBD: number of roles]** roles: Admin, Pharmacist, and Customer.
- Protected admin routes for dashboard, product, user, and order management.

### Medicine and Category Management

- Admin CRUD workflow for medicines.
- Medicine category filtering and category count display.
- Product image upload with support for multiple images.
- Medicine search, filtering, and pagination.
- Custom medicine unit input for flexible product packaging formats.

### Inventory Management

- Inventory quantity tracking for medicines.
- Stock updates from the admin medicine form.
- [TBD: Add low-stock alert details if implemented.]
- [TBD: Add inventory history details if implemented.]

### Order Management

- Customer cart and checkout flow.
- Order creation with shipping address details.
- Admin order listing and order status updates.
- Order processing notification with estimated confirmation and delivery time.
- [TBD: Add final order status flow.]

### Performance and Security

- Redis caching for medicine list queries.
- JWT access token authentication with refresh-token rotation.
- Role-based route protection.
- Request validation before processing.
- Centralized response formatting and error handling.
- File upload validation for supported image formats and size limits.
- [TBD: Add performance metric if measured.]

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Axios, TanStack Query, Zustand, React Router |
| **Backend** | Node.js, Express.js, JavaScript ES Modules |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Caching** | Redis |
| **Authentication** | JWT, HttpOnly Cookie Refresh Token, RBAC |
| **File Storage** | Supabase Storage |
| **API Docs** | Swagger UI |
| **Testing** | Jest, Supertest |
| **DevOps** | [TBD: Add deployment or container setup if available] |
| **Tools** | Git, npm, Prisma Studio, [TBD: Add other tools if used] |

---

## System Architecture

The backend follows a layered architecture that separates HTTP handling, business logic, and database access. This keeps controllers thin, makes service logic easier to maintain, and prevents Prisma queries from being spread across route handlers.

```text
Request
  -> Routes
  -> Middlewares
  -> Controllers
  -> Services
  -> Repositories
  -> Prisma
  -> PostgreSQL
```

```text
BackEnd/src/
├── config/          # Environment config, Prisma client, Swagger config
├── controllers/     # HTTP request and response handlers
├── docs/            # Swagger documentation modules
├── middlewares/     # Authentication, authorization, upload handling
├── repositories/    # Prisma data access layer
├── routes/          # Express route definitions
├── services/        # Business logic layer
├── tests/           # Jest and Supertest test suites
├── utils/           # JWT, pagination, response helpers
└── validator/       # Request validation logic
```

```text
FrontEnd/src/
├── app/
│   ├── components/  # Shared UI components and layouts
│   ├── data/        # Local static data
│   ├── pages/       # Customer and admin pages
│   └── routes.js    # Client route definitions
├── hooks/           # API and utility hooks
├── lib/             # Axios configuration
├── stores/          # Zustand stores
└── styles/          # Global styles and Tailwind entry files
```

[TBD: Add a short explanation of architecture decisions, trade-offs, or improvements made during development.]

---

## Database Schema

**[TBD: number of main tables]** main tables with core relationships:

| Table | Description | Main Relationship |
|---|---|---|
| `users` | User accounts and authentication data | Many-to-one with `roles`; one-to-many with `orders` |
| `roles` | User roles for RBAC | One-to-many with `users` |
| `medicines` | Medicine and product information | Many-to-one with `categories` and `manufacturers` |
| `categories` | Medicine category groups | One-to-many with `medicines` |
| `manufacturers` | Medicine manufacturer information | One-to-many with `medicines` |
| `medicine_images` | Additional medicine images | Many-to-one with `medicines` |
| `inventory` | Medicine stock quantity | One-to-one with `medicines` |
| `inventory_logs` | Inventory movement history | Many-to-one with `medicines` |
| `orders` | Customer order records | One-to-many with `order_items` |
| `order_items` | Order line items | Many-to-one with `orders` and `medicines` |
| `carts` | Customer shopping cart | One-to-many with `cart_items` |
| `cart_items` | Cart line items | Many-to-one with `carts` and `medicines` |

[TBD: Add ERD diagram link or screenshot.]

---

## API Documentation

> Base URL: `http://localhost:3000/api`

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

**Total endpoints:** [TBD: number of endpoints]  
**Main resources:** [TBD: number of resources]

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new account | Public |
| POST | `/auth/login` | Log in and receive an access token | Public |
| POST | `/auth/refresh-token` | Refresh the access token | Authenticated |
| POST | `/auth/logout` | Clear refresh token session | Authenticated |
| GET | `/auth/profile` | Get current user profile | Authenticated |

### Medicines

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/medicines` | Get medicine list with search, filtering, sorting, and pagination | Public |
| GET | `/medicines/:slug` | Get medicine detail by slug | Public |

### Categories

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/categories` | Get medicine categories | Public |
| GET | `/categories/count` | Get categories with medicine counts | Public |

### Orders

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/orders` | Create a new order | Customer |
| GET | `/orders/my` | Get current user's order history | Customer |
| GET | `/orders/:orderId` | Get order detail | Customer |

### Admin

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/admin/stats` | Get dashboard metrics | Admin |
| GET | `/admin/orders` | Get all orders | Admin |
| PATCH | `/admin/orders/:orderId/status` | Update order status | Admin |
| PATCH | `/admin/orders/:orderId/cancel-request` | Handle order cancellation request | Admin |
| GET | `/admin/users` | Get all users | Admin |
| PATCH | `/admin/users/:userId/status` | Activate or deactivate a user | Admin |
| PATCH | `/admin/users/:userId/role` | Update user role | Admin |
| GET | `/admin/medicines` | Get all medicines for admin | Admin |
| GET | `/admin/medicines/:medicineId` | Get medicine detail for editing | Admin |
| POST | `/admin/medicines` | Create a medicine | Admin |
| PUT | `/admin/medicines/:medicineId` | Update medicine information | Admin |
| DELETE | `/admin/medicines/:medicineId` | Soft-delete a medicine | Admin |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/wickyhien18/FullStack_Pharmacy.git
cd FullStack_Pharmacy
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Configure Backend Environment

```bash
cd BackEnd
cp .env.example .env
```

Fill in the required environment variables:

```text
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=
REDIS_URL=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_STORAGE_BUCKET=
```

### 4. Generate Prisma Client

```bash
npm run db:generate
```

### 5. Run Database Migration

```bash
npm run db:migrate
```

### 6. Start Development Servers

From the project root:

```bash
npm run dev
```

Default local URLs:

```text
Backend:  http://localhost:3000
Frontend: http://localhost:5173
Swagger:  http://localhost:3000/api-docs
```

---

## Screenshots

> [TBD: Add screenshots for the login page, customer storefront, admin dashboard, product management, order management, and checkout flow.]

| Login Page | Admin Dashboard |
|---|---|
| ![Login](path-to-image) | ![Admin Dashboard](path-to-image) |

| Product Management | Order Management |
|---|---|
| ![Product Management](path-to-image) | ![Order Management](path-to-image) |

---

## Development Process

The project is developed iteratively with continuous improvements to frontend UX, backend architecture, API behavior, and admin workflows.

**Commits:** [TBD: number of commits]  
**Tests:** [TBD: test coverage or test status]  
**CI/CD:** [TBD: CI/CD setup if available]

[TBD: Add notable technical challenges solved, such as Prisma query optimization, upload handling, authentication refresh flow, RBAC route protection, or admin medicine image management.]

---

## Future Roadmap

- [ ] [TBD: Add unit tests for service-layer business logic.]
- [ ] [TBD: Add low-stock and expiration-date notifications.]
- [ ] [TBD: Add production deployment plan.]
- [ ] [TBD: Add automated CI checks.]
- [ ] [TBD: Add advanced inventory reports.]
- [ ] [TBD: Add pharmacist workflow features.]

---

## Author

**Giap Minh Hien**  
GitHub: [wickyhien18](https://github.com/wickyhien18)  
Email: giaphien1008@gmail.com
