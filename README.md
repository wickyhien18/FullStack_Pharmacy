# Fullstack Pharmacy Management System (Nhà thuốc Long Châu style)

A complete Fullstack Pharmacy Management System comprising a client-facing E-Commerce storefront and an Administration Dashboard. The project is designed with a premium, responsive UI inspired by the popular Vietnamese pharmacy retail chain, **Nhà thuốc Long Châu**.

---

## 🌟 Key Features

### 🛒 Customer E-Commerce Storefront
- **Dynamic Catalog & Navigation**: Search, filter, and browse medicines/products by category.
- **Shopping Cart & Checkout**: Interactive cart management, shipping detail submission, and checkout flows.
- **User Portal**: Registration, login, profile management, and order history tracking.
- **Responsive Design**: Mobile-friendly navigation drawer, customized category sliders, and premium micro-interactions.

### 🛡️ Administration Dashboard (`/admin`)
- **Key Metrics Overview**: Real-time stats showing total sales, order volume, active users, and catalog count.
- **Product Management (CRUD)**: Create, read, update, and delete medicines with customizable information.
- **Order Tracking**: View customer orders, update delivery status, and handle invoices.
- **User Administration**: Monitor registered accounts and assign roles.

### 🔐 Security & Architecture
- **Authentication**: JWT access tokens coupled with secure `HttpOnly` cookie-based refresh tokens.
- **Authorization (RBAC)**: Role-based route protection supporting `ADMIN`, `PHARMACIST`, and `CUSTOMER`.
- **Database Layer**: Managed via Prisma ORM mapped to a PostgreSQL database.
- **API Resilience**: Seamless Axios interceptors handling token rotation, auto-logout on expiry, and descriptive error dialogs.

---

## 🛠️ Technology Stack

### Frontend
- **Framework & Tooling**: Vite 6 + React 18
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (for Client Auth state) & TanStack Query v5 (for Server cache/state sync)
- **Routing**: React Router 7 (`react-router`)
- **Icons & Alerts**: Lucide React & React Hot Toast

### Backend
- **Framework**: Node.js + Express (ES Modules)
- **Database & ORM**: PostgreSQL & Prisma ORM
- **Authentication**: JsonWebToken (JWT) + Cookie Parser
- **Utilities**: Nodemailer (Email notification skeleton), BcryptJS (Password hashing), Zod (Data Validation)

---

## 📂 Project Structure

```text
Pharmacy_JS/
├── BackEnd/
│   ├── prisma/             # Prisma schema definition
│   └── src/
│       ├── config/         # App & DB configurations
│       ├── controllers/    # Request handlers (Auth, Admin, Orders, Medicines)
│       ├── middlewares/    # Auth guards, role checks, and validators
│       ├── repositories/   # Direct database queries via Prisma client
│       ├── routes/         # Express endpoint definitions
│       ├── services/       # Core business logic layer
│       └── utils/          # Helpers (JWT generation, format responses)
│
├── FrontEnd/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Reusable UI pieces & layouts (Header, Footer, AdminLayout)
│   │   │   ├── data/       # Mock/Static local constants
│   │   │   ├── pages/      # Route pages (Home, Search, Cart, Account, Admin Dashboard)
│   │   │   └── routes.js   # Client router definitions
│   │   ├── hooks/          # Custom utility hooks
│   │   ├── lib/            # Axios API config & setup
│   │   ├── stores/         # Zustand global stores (Auth store)
│   │   └── styles/         # Global styles (Tailwind configuration)
│   └── index.html          # Main HTML entry point
│
├── package.json            # Root workspaces/scripts definitions
└── database.sql            # Initial PostgreSQL database schema seed
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Node.js**: `v18.x` or later
- **PostgreSQL**: A running instance (local or remote like Supabase)

### 2. Setup the Repository
Clone the project and install all dependencies for both the frontend and backend using the root helper script:

```bash
# Install dependencies for all folders
npm run install:all
```

### 3. Backend Configuration
Navigate to the `BackEnd/` directory and configure the environment variables:

```bash
cd BackEnd

# Copy environmental template
cp .env.example .env
```

Open the newly created `.env` file and fill in your connection variables:
- `DATABASE_URL`: Transaction-mode connection string.
- `DIRECT_URL`: Session-mode direct connection string.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secure cryptographic strings.

Run the Prisma code generation and apply migrations/schemas to your database:

```bash
# Generate Prisma Client
npm run db:generate

# Apply migrations
npm run db:migrate
```

### 4. Running the Project
You can run both the frontend and backend concurrently from the root directory:

```bash
# From the project root folder
npm run dev
```

- **Backend** will run on `http://localhost:3000`
- **Frontend** will run on `http://localhost:5173`

---

## 🔑 Default Credentials

To explore the administration dashboard, log in with the following default administrator credentials:

- **Username / Email**: `admin@pharmacy.vn`
- **Password**: `Admin@123`
