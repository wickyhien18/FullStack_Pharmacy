# Pharmacy Backend API

Node.js + Express + TypeScript + Prisma + PostgreSQL (Supabase)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file và điền thông tin
cp .env.example .env

# 3. Generate Prisma Client (bắt buộc sau khi clone)
npm run db:generate

# 4. Chạy dev server
npm run dev
```

## Lấy DATABASE_URL từ Supabase

1. Vào Supabase Dashboard → Settings → Database
2. Chọn **Transaction** mode (port 6543) → dán vào `DATABASE_URL`  
3. Chọn **Session** mode (port 5432) → dán vào `DIRECT_URL`

## Cấu trúc thư mục

```
src/
├── config/          # env, prisma client
├── controllers/     # xử lý request/response
├── middlewares/     # auth, validate, error
├── repositories/    # truy vấn DB qua Prisma
├── routes/          # định nghĩa endpoint
├── services/        # business logic
├── types/           # TypeScript types/interfaces
└── utils/           # jwt, response, pagination helpers
prisma/
└── schema.prisma    # Prisma schema map với DB Supabase
```

## API Base URL

```
http://localhost:3000/api
```
