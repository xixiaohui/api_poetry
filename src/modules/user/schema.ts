import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少6位").max(100),
  name: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "密码不能为空"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
});
