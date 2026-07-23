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

  async getGlobalStats() {
    const totalReads = await prisma.readingHistory.count();

    // Top poems
    const topPoemsRaw = await prisma.readingHistory.groupBy({
      by: ["poemId", "poemTitle"],
      _count: { poemId: true },
      orderBy: { _count: { poemId: "desc" } },
      take: 10,
    });

    // Top authors
    const topAuthorsRaw = await prisma.readingHistory.groupBy({
      by: ["poemAuthor"],
      _count: { poemAuthor: true },
      orderBy: { _count: { poemAuthor: "desc" } },
      take: 10,
    });

    // Reads by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentRecords = await prisma.readingHistory.findMany({
      where: { readAt: { gte: sevenDaysAgo } },
      select: { readAt: true },
      orderBy: { readAt: "asc" },
    });

    // Build daily counts
    const dayMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of recentRecords) {
      const key = r.readAt.toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }

    const readsByDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

    // Count distinct poems read
    const distinctPoems = await prisma.readingHistory.groupBy({
      by: ["poemId"],
    });

    return {
      totalReads,
      totalPoems: distinctPoems.length,
      topPoems: topPoemsRaw.map((p: { poemId: string; poemTitle: string; _count: { poemId: number } }) => ({
        poemId: p.poemId,
        poemTitle: p.poemTitle,
        count: p._count.poemId,
      })),
      topAuthors: topAuthorsRaw
        .filter((a: { poemAuthor: string | null }) => a.poemAuthor != null)
        .map((a: { poemAuthor: string | null; _count: { poemAuthor: number } }) => ({
          author: a.poemAuthor!,
          count: a._count.poemAuthor,
        })),
      readsByDay,
    };
  },
};
