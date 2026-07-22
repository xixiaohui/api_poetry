import { hash, compare } from "bcryptjs";
import { userRepository } from "./repository";
import { auth } from "@/shared/auth";
import { ValidationError, NotFoundError } from "@/shared/errors";
import type { UserDTO, LoginResponseDTO } from "./types";

function toUserDTO(user: { id: string; email: string; name: string | null; avatar: string | null; createdAt: Date }): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
  };
}

export const userService = {
  async register(email: string, password: string, name?: string): Promise<LoginResponseDTO> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError("该邮箱已注册");
    }

    const passwordHash = await hash(password, 12);
    const user = await userRepository.create({ email, passwordHash, name });

    const token = await auth.signToken({ sub: user.id, email: user.email });
    return { token, user: toUserDTO(user) };
  },

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ValidationError("邮箱或密码错误");
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      throw new ValidationError("邮箱或密码错误");
    }

    const token = await auth.signToken({ sub: user.id, email: user.email });
    return { token, user: toUserDTO(user) };
  },

  async getProfile(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("用户不存在");
    return toUserDTO(user);
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string }): Promise<UserDTO> {
    const user = await userRepository.update(userId, data);
    return toUserDTO(user);
  },
};
