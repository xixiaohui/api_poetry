import { ValidationError } from "@/shared/errors";
import { authorService } from "./service";
import { authorListParamsSchema } from "./schema";

export const authorController = {
  async list(rawParams: Record<string, string | undefined>) {
    const result = authorListParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { page, pageSize } = result.data;
    return authorService.list(page, pageSize);
  },

  async getById(id: number) {
    if (Number.isNaN(id) || id <= 0) {
      throw new ValidationError("无效的作者 ID");
    }
    return authorService.getById(id);
  },
};
