import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export const generateAccessTokens = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};
