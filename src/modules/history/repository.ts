import { prisma } from "@/shared/database";

export const historyRepository = {
  async findByUser(userId: string, limit = 50) {
    return prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { readAt: "desc" },
      take: limit,
    });
  },

  async create(data: { userId: string; poemId: string; poemTitle: string; poemAuthor?: string; poemDynasty?: string }) {
    return prisma.readingHistory.create({
      data: {
        userId: data.userId,
        poemId: data.poemId,
        poemTitle: data.poemTitle,
        poemAuthor: data.poemAuthor,
        poemDynasty: data.poemDynasty,
      },
    });
  },

  async countByUser(userId: string): Promise<number> {
    return prisma.readingHistory.count({ where: { userId } });
  },
};
