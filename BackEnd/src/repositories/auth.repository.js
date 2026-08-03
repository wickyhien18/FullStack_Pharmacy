import { prisma } from "../config/prisma.config.js";

//── FIND QUERIES ────────────────────────────────────────────────
//== FIND USER BY EMAIL ===========================================
export const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
};

//== FIND USER BY USERNAME ========================================
export const findUserByUserName = (userName) => {
  return prisma.user.findUnique({
    where: { userName },
    include: { role: true },
  });
};

//== FIND USER BY PHONE ===========================================
export const findUserByPhone = (phone) => {
  return prisma.user.findUnique({
    where: { phone },
  });
};

//== FIND USER BY ID ==============================================
export const findUserById = (userId) => {
  return prisma.user.findUnique({
    where: { userId },
    include: { role: true },
  });
};

//== FIND ROLE BY NAME ============================================
export const findRoleByName = (name) => {
  return prisma.role.findUnique({
    where: { roleName: name },
  });
};

//== FIND TOKEN BY DEVICE =========================================
export const findTokenByDevice = (userId, deviceInfo) => {
  return prisma.refreshToken.findFirst({
    where: { userId, deviceInfo: deviceInfo },
  });
};

//== FIND REFRESH TOKEN ===========================================
export const findRefreshToken = async (token) => {
  const rows = await prisma.$queryRaw`
    SELECT rt.id,
    rt.token,
    rt.expire_at as "expireAt",
    rt.is_revoked as "isRevoked",
    rt.device_info as "deviceInfo",
    u.user_id as "userId",
    u.user_name as "userName",
    u.full_name as "fullName",
    u.email as "userEmail",
    u.phone as "userPhone", 
    u.is_active as "isActive",
    r.role_name as "roleName"
    FROM refresh_tokens rt
    join users u on rt.user_id = u.user_id
    join roles r on u.role_id = r.role_id
    where rt.token = ${token}
  `;
  return rows[0] ?? null;
};

//== FIND USER PASSWORD BY ID =====================================
export const findUserPasswordById = (userId) => {
  return prisma.user.findUnique({
    where: { userId: userId },
    select: { userId: true, password: true },
  });
};

//== FIND ALL TOKENS BY USER ======================================
export const findAllTokensByUser = (userId) => {
  return prisma.refreshToken.findMany({
    where: { userId },
    select: { id: true, deviceInfo: true, createdAt: true, expireAt: true },
    orderBy: { createdAt: "desc" },
  });
};

//== FIND EMAIL OTP ===============================================
export const findEmailOTP = (userId) => {
  return prisma.otpVerification.findUnique({
    where: { userId },
  });
};

//── CREATE QUERIES ──────────────────────────────────────────────
//== CREATE USER ==================================================
export const createUser = (userData) => {
  return prisma.user.create({
    data: userData,
    include: { role: true },
  });
};

//== SAVE REFRESH TOKEN ===========================================
export const saveRefreshToken = (userId, token, expireAt, deviceInfo) => {
  return prisma.refreshToken.create({
    data: { userId, token, expireAt, deviceInfo },
  });
};

//── EXISTENCE QUERIES ───────────────────────────────────────────
//== EXIST USER ===================================================
export const existUser = (email, userName, phone) => {
  return prisma.user.findFirst({
    where: {
      OR: [{ email }, { userName }, { phone }],
    },
  });
};

//== EXIST USER PHONE =============================================
export const existUserPhone = (phone, excludeUserId) => {
  return prisma.user.findFirst({
    where: { phone, userId: { not: excludeUserId } },
  });
};

//== EXIST USER EMAIL =============================================
export const existUserEmail = (email, excludeUserId) => {
  return prisma.user.findFirst({
    where: {
      email,
      userId: { not: excludeUserId },
    },
  });
};

//── UPDATE QUERIES ──────────────────────────────────────────────
//== UPDATE REFRESH TOKEN BY ID ===================================
export const updateRefreshTokenById = (id, newToken, newExpireAt) => {
  return prisma.refreshToken.update({
    where: { id },
    data: { token: newToken, expireAt: newExpireAt, isRevoked: false },
  });
};

//== UPDATE USER PROFILE ==========================================
export const updateUserProfile = (userId, data) => {
  return prisma.user.update({
    where: { userId },
    data: { ...data, updatedAt: new Date() },
    include: { role: true },
  });
};

//== UPDATE LAST ACTIVITY =========================================
export const updateLastActivity = (userId) => {
  return prisma.user.update({
    where: { userId },
    data: { lastActivity: new Date() },
  });
};

//== UPDATE USER PASSWORD =========================================
export const updateUserPassword = (userId, hashedPasword) => {
  return prisma.user.update({
    where: { userId },
    data: { password: hashedPasword, updatedAt: new Date() },
  });
};

//── DELETE / REVOKE QUERIES ─────────────────────────────────────
//== REVOKE REFRESH TOKEN =========================================
export const revokeRefreshToken = (refreshToken) => {
  return prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { isRevoked: true, token: "" },
  });
};

//== REVOKE ALL REFRESH TOKENS BY USER ============================
export const revokeAllRefreshTokensByUser = (userId) => {
  return prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true, token: "" },
  });
};

//== DELETE EMAIL OTP =============================================
export const deleteEmailOTP = (userId) => {
  return prisma.otpVerification.delete({
    where: { userId },
  });
};

//── UPSERT QUERIES ──────────────────────────────────────────────
//== SAVE EMAIL OTP ===============================================
export const saveEmailOTP = (userId, newEmail, otp, expiresAt) => {
  return prisma.otpVerification.upsert({
    where: { userId },
    update: { newEmail, otp, expiresAt, createdAt: new Date() },
    create: { userId, newEmail, otp, expiresAt },
  });
};
