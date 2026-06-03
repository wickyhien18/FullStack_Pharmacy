import bcrypt from "bcrypt";
import * as jwt from "../utils/jwt.js";
import * as authRepository from "../repositories/auth.repository.js";

const getRefreshTokenExpiry = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // Set expiry to 7 days from now
  return expiry;
};

export const register = async ({
  userName,
  fullName,
  email,
  phone,
  password,
}) => {
  const existEmail = await authRepository.findUserByEmail(email);
  if (existEmail) throw { status: 409, message: "Email already exists" };

  const existUserName = await authRepository.findUserByUserName(userName);
  if (existUserName) throw { status: 409, message: "Username already exists" };

  const existPhone = await authRepository.findUserByPhone(phone);
  if (existPhone) throw { status: 409, message: "Phone number already exists" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await authRepository.createUser({
    userName,
    fullName,
    email,
    phone,
    password: hashedPassword,
  });
};

export const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw { status: 401, message: "Invalid email or password" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 401, message: "Invalid email or password" };

  const accessToken = jwt.generateAccessToken(user);
  const refreshToken = jwt.generateRefreshToken(user);

  return { accessToken, refreshToken };
};
