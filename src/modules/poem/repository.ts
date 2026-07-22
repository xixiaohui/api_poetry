import { prisma } from "@/shared/database";

export const poemRepository = {
  async getFavoriteCount(poemId: string): Promise<number> {
    return prisma.favorite.count({ where: { poemId } });
  },
};
