import { ValidationError } from "@/shared/errors";
import { userService } from "./service";
import { registerSchema, loginSchema, updateProfileSchema } from "./schema";

export const userController = {
  async register(body: unknown) {
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { email, password, name } = result.data;
    return userService.register(email, password, name);
  },

  async login(body: unknown) {
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { email, password } = result.data;
    return userService.login(email, password);
  },

  async getProfile(userId: string) {
    return userService.getProfile(userId);
  },

  async updateProfile(userId: string, body: unknown) {
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    return userService.updateProfile(userId, result.data);
  },
};
