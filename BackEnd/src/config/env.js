import dotenv from "dotenv";
dotenv.config();

function requireEnv(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || "",
  SUPABASE_STORAGE_BUCKET:
    process.env.SUPABASE_STORAGE_BUCKET || "product-images",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "10"),
  RESEND_API_KEY: requireEnv("RESEND_API_KEY"),
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
  REDIS_URL: process.env.REDIS_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:3000/api/auth/google/callback",
  VNP_TMN_CODE: process.env.VNP_TMN_CODE || "",
  VNP_HASH_SECRET: process.env.VNP_HASH_SECRET || "",
  VNP_URL:
    process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3000",
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
};
