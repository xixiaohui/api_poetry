import { favoriteRepository } from "./repository";
import { ValidationError, NotFoundError } from "@/shared/errors";
import type { FavoriteDTO, FavoriteListDTO, FavoriteSyncDTO } from "./types";

function toFavoriteDTO(f: { id: string; poemId: string; poemTitle: string; poemAuthor: string | null; poemDynasty: string | null; createdAt: Date; updatedAt: Date }): FavoriteDTO {
  return {
    id: f.id,
    poemId: f.poemId,
    poemTitle: f.poemTitle,
    poemAuthor: f.poemAuthor,
    poemDynasty: f.poemDynasty,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
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

  /** Sync: return all favorites for a user, with a sync token (latest updatedAt timestamp) */
  async sync(userId: string): Promise<FavoriteSyncDTO> {
    const favorites = await favoriteRepository.findByUser(userId);
    const dtos = favorites.map(toFavoriteDTO);
    // Sync token is the latest updatedAt, or now if empty
    const latestUpdated = dtos.length > 0
      ? dtos.reduce((max, f) => f.updatedAt > max ? f.updatedAt : max, dtos[0]!.updatedAt)
      : new Date().toISOString();
    return { favorites: dtos, syncToken: latestUpdated, total: dtos.length };
  },
};
