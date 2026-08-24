import { ValidationError } from "@/shared/errors";
import { posterService } from "./service";
import { posterSchema } from "./schema";

export const posterController = {
  async generate(body: unknown) {
    const result = posterSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(
        result.error.issues.map((i) => i.message).join("; "),
      );
    }
    return posterService.generate(result.data);
  },
};
