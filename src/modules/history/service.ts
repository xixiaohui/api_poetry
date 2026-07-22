import { historyRepository } from "./repository";
import { ValidationError } from "@/shared/errors";
import type { HistoryDTO, HistoryListDTO } from "./types";

function toHistoryDTO(h: { id: string; poemId: string; poemTitle: string; poemAuthor: string | null; poemDynasty: string | null; readAt: Date }): HistoryDTO {
  return {
    id: h.id,
    poemId: h.poemId,
    poemTitle: h.poemTitle,
    poemAuthor: h.poemAuthor,
    poemDynasty: h.poemDynasty,
    readAt: h.readAt.toISOString(),
  };
}

export const historyService = {
  async list(userId: string): Promise<HistoryListDTO> {
    const records = await historyRepository.findByUser(userId);
    return {
      records: records.map(toHistoryDTO),
      total: records.length,
    };
  },

  async record(userId: string, poemId: string, poemTitle: string, poemAuthor?: string, poemDynasty?: string): Promise<HistoryDTO> {
    if (!poemId || !poemTitle) {
      throw new ValidationError("参数不完整");
    }
    const record = await historyRepository.create({ userId, poemId, poemTitle, poemAuthor, poemDynasty });
    return toHistoryDTO(record);
  },
};
