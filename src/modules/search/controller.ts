import { ValidationError } from "@/shared/errors";
import { searchService } from "./service";
import { searchParamsSchema } from "./schema";

export const searchController = {
  async search(rawParams: Record<string, string | undefined>) {
    const result = searchParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { q, type, page, pageSize } = result.data;
    return searchService.search(q, type, page, pageSize);
  },
};
