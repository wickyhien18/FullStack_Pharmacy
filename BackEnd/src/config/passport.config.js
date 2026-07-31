//Authentication handling library
import passport from "passport";
//Strategy login by Google OAuth
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.js";
import { env } from "./env.js";

export const configurePassport = () => {
  //Register Google OAth strategy for Passport
  passport.use(
    new GoogleStrategy(
      //Information Google OAuth
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },

      //Callback run after Google authentication successfully
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const fullName = profile.displayName;
          const googleId = profile.id;

          if (!email) return done(new Error("Không lấy được email từ Google"));

          // Find user by googleId first
          let user = await prisma.user.findFirst({
            where: { googleId },
            include: { role: true },
          });

          if (!user) {
            // Find user by email
            user = await prisma.user.findFirst({
              where: { email },
              include: { role: true },
            });

            if (user) {
              // Add Google ID to this user
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
