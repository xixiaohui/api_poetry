import { prisma } from "@/shared/database";

export const favoriteRepository = {
  async findByUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByUserAndPoem(userId: string, poemId: string) {
    return prisma.favorite.findUnique({
      where: { userId_poemId: { userId, poemId } },
    });
  },

  async create(data: { userId: string; poemId: string; poemTitle: string; poemAuthor?: string; poemDynasty?: string }) {
    return prisma.favorite.create({ data });
  },

  async deleteByUserAndPoem(userId: string, poemId: string): Promise<void> {
    await prisma.favorite.deleteMany({ where: { userId, poemId } });
  },

  async countByUser(userId: string): Promise<number> {
    return prisma.favorite.count({ where: { userId } });
  },
};
