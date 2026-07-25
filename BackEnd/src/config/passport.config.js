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
        clientID:     env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL:  env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email    = profile.emails?.[0]?.value;
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
                data:  { googleId },
                include: { role: true },
              });
            } else {
              // Tạo user mới từ Google
              const role = await prisma.role.findFirst({
                where: { roleName: "ROLE_CUSTOMER" },
              });

              user = await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                  data: {
                    googleId,
                    fullName,
                    email,
                    userName: `google_${googleId.slice(0, 8)}`,
                    password: "", // không có password khi login Google
                    roleId:   role.roleId,
                    isActive: true,
                  },
                  include: { role: true },
                });

                // Tạo cart cho user mới
                await tx.cart.create({
                  data: { userId: newUser.userId },
                });

                return newUser;
              });
            }
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
