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
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "10"),
  REDIS_URL: requireEnv("REDIS_URL"),
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production",
};
