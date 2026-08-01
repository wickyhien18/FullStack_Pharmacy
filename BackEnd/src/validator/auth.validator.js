import { z } from "zod";

export const registerSchema = z.object({
  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must be at most 100 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Invalid Vietnamese phone number"),
  password: z
    .string()
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_@$!%*?&])[A-Za-z\d_@$!%*?&]{8,}$/,
      "Password must have at least 8 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special characer such as: _, @, $, !, %, *, ?, & ",
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .max(128, "Password must be at most 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_@$!%*?&])[A-Za-z\d_@$!%*?&]{8,}$/,
      "Password must have at least 8 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special characer such as: _, @, $, !, %, *, ?, & ",
    ),
});
