// ================================================================
// passport.config.js — Cấu hình Passport Google OAuth
// Đặt tại: src/config/passport.config.js
// ================================================================
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.js";
import { env } from "./env.js";

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const fullName = profile.displayName;
          const googleId = profile.id;

          if (!email) return done(new Error("Không lấy được email từ Google"));

          // Tìm user theo googleId trước
          let user = await prisma.user.findFirst({
            where: { googleId },
            include: { role: true },
          });

          if (!user) {
            // Tìm theo email (user đã đăng ký thường)
            user = await prisma.user.findFirst({
              where: { email },
              include: { role: true },
            });

            if (user) {
              // Liên kết Google vào tài khoản hiện có
              user = await prisma.user.update({
                where: { userId: user.userId },
                data: { googleId },
                include: { role: true },
              });
            }

            return done(null, { pending: true, email, fullName, googleId });
          }

          if (!user.isActive) {
            return done(null, false, { message: "Tài khoản đang bị khóa" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
};
