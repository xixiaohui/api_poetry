import { favoriteRepository } from "./repository";
import { ValidationError, NotFoundError } from "@/shared/errors";
import type { FavoriteDTO, FavoriteListDTO } from "./types";

function toFavoriteDTO(f: { id: string; poemId: string; poemTitle: string; poemAuthor: string | null; poemDynasty: string | null; createdAt: Date }): FavoriteDTO {
  return {
    id: f.id,
    poemId: f.poemId,
    poemTitle: f.poemTitle,
    poemAuthor: f.poemAuthor,
    poemDynasty: f.poemDynasty,
    createdAt: f.createdAt.toISOString(),
  };
}

export const favoriteService = {
  async list(userId: string): Promise<FavoriteListDTO> {
    const favorites = await favoriteRepository.findByUser(userId);
    return {
      favorites: favorites.map(toFavoriteDTO),
      total: favorites.length,
    };
  },

  async add(userId: string, poemId: string, poemTitle: string, poemAuthor?: string, poemDynasty?: string): Promise<FavoriteDTO> {
    const existing = await favoriteRepository.findByUserAndPoem(userId, poemId);
    if (existing) {
      throw new ValidationError("已收藏该诗词");
    }
    const favorite = await favoriteRepository.create({ userId, poemId, poemTitle, poemAuthor, poemDynasty });
    return toFavoriteDTO(favorite);
  },

  async remove(userId: string, poemId: string): Promise<void> {
    const existing = await favoriteRepository.findByUserAndPoem(userId, poemId);
    if (!existing) {
      throw new NotFoundError("收藏不存在");
    }
    await favoriteRepository.deleteByUserAndPoem(userId, poemId);
  },
};
