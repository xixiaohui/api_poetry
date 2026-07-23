import { cache } from "@/shared/cache";
import { poemClient } from "./client";
import { poemService } from "./service";
import { chinesePoetryClient, type UpstreamDynasty, type UpstreamType } from "@/clients";
import { toPoemDTO } from "./mapper";
import type { PoemDTO } from "./types";
import { toAuthorDTO } from "@/modules/author/mapper";
import type { AuthorDTO } from "@/modules/author";

export interface HomeDTO {
  readonly featuredPoem: PoemDTO;
  readonly featuredAuthor: AuthorDTO | null;
  readonly totalPoems: number;
  readonly totalAuthors: number;
}

export interface DiscoverDTO {
  readonly recentPoems: readonly PoemDTO[];
  readonly dynasties: readonly UpstreamDynasty[];
  readonly types: readonly UpstreamType[];
}

export interface CategoriesDTO {
  readonly dynasties: readonly UpstreamDynasty[];
  readonly types: readonly UpstreamType[];
}

export interface RecommendDTO {
  readonly poems: readonly PoemDTO[];
  readonly reason: string;
}

export interface QuoteDTO {
  readonly content: string;
  readonly author: string;
  readonly source: string;
  /** YYYY-MM-DD of the quote */
  readonly date: string;
}

export interface SolarTermDTO {
  /** Current solar term name, e.g. "立春" */
  readonly termName: string;
  /** Brief description of the term */
  readonly termDescription: string;
  readonly poem: PoemDTO;
  readonly reason: string;
}

export interface BannerDTO {
  readonly id: string;
  readonly imageUrl: string;
  readonly title: string;
  readonly link: string | null;
  readonly sort: number;
}

export interface ConfigDTO {
  readonly version: string;
  readonly banners: readonly BannerDTO[];
  readonly features: Record<string, boolean>;
}

// ─── 24 Solar Terms ──────────────────────────────────────────────────────────

interface SolarTermDef {
  readonly name: string;
  readonly description: string;
  /** Approximate month (1-12) */
  readonly month: number;
  /** Approximate day of month */
  readonly day: number;
}

const SOLAR_TERMS: readonly SolarTermDef[] = [
  { name: "小寒", description: "季冬时节的正式开始，进入一年中最寒冷的日子", month: 1, day: 6 },
  { name: "大寒", description: "寒气逆极，冰天雪地，一年中最冷时期", month: 1, day: 20 },
  { name: "立春", description: "春回大地，万物复苏，新的四季轮回开始", month: 2, day: 4 },
  { name: "雨水", description: "东风解冻，冰雪皆散而为水，化而为雨", month: 2, day: 19 },
  { name: "惊蛰", description: "春雷乍动，惊醒蛰伏的昆虫，万物生机盎然", month: 3, day: 6 },
  { name: "春分", description: "昼夜平分，燕子归来，春色满园关不住", month: 3, day: 21 },
  { name: "清明", description: "气清景明，万物皆显，踏青祭祖时节", month: 4, day: 5 },
  { name: "谷雨", description: "雨生百谷，春天的最后一个节气，万物生长", month: 4, day: 20 },
  { name: "立夏", description: "夏之始，草木茂盛，万物长大", month: 5, day: 6 },
  { name: "小满", description: "麦穗初齐，小得盈满，将满未满最是好", month: 5, day: 21 },
  { name: "芒种", description: "有芒之谷可播种，收获与耕耘并存的时节", month: 6, day: 6 },
  { name: "夏至", description: "日长之至，阳气最盛，此后一阴初生", month: 6, day: 21 },
  { name: "小暑", description: "暑气渐盛，炎热天气开始，蝉声阵阵", month: 7, day: 7 },
  { name: "大暑", description: "炎热至极，一年中最热时期，荷花盛开", month: 7, day: 23 },
  { name: "立秋", description: "秋之始，凉风至，白露降，寒蝉鸣", month: 8, day: 8 },
  { name: "处暑", description: "暑气至此而止，秋高气爽，天高云淡", month: 8, day: 23 },
  { name: "白露", description: "天气转凉，露凝而白，秋意渐浓", month: 9, day: 8 },
  { name: "秋分", description: "昼夜均分，秋色平分，正是人间好时节", month: 9, day: 23 },
  { name: "寒露", description: "露气寒冷，将凝结也，秋意已深", month: 10, day: 8 },
  { name: "霜降", description: "气肃而凝，露结为霜，秋天最后一个节气", month: 10, day: 24 },
  { name: "立冬", description: "冬之始，水始冰，地始冻，万物收藏", month: 11, day: 8 },
  { name: "小雪", description: "雨下而为寒气所薄，故凝而为雪", month: 11, day: 22 },
  { name: "大雪", description: "大者，盛也，至此而雪盛矣", month: 12, day: 7 },
  { name: "冬至", description: "日短之至，阳气始生，万物蛰伏待春来", month: 12, day: 22 },
];

function getCurrentSolarTerm(): SolarTermDef {
  const now = new Date();
  const md = now.getMonth() * 100 + now.getDate(); // MMDD numeric

  // Find the most recent solar term (the one whose date <= today)
  for (let i = SOLAR_TERMS.length - 1; i >= 0; i--) {
    const term = SOLAR_TERMS[i]!;
    const termMd = (term.month - 1) * 100 + term.day;
    if (termMd <= md) return term;
  }
  // If before 小寒 (Jan 6), return 冬至 (last term of previous year)
  return SOLAR_TERMS[SOLAR_TERMS.length - 1]!;
}

function getDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const aggregateService = {
  async home(): Promise<HomeDTO> {
    const cacheKey = "poetry:home";
    const cached = await cache.get<HomeDTO>(cacheKey);
    if (cached) return cached;

    const [featuredPoem, stats, authors] = await Promise.all([
      poemClient.getRandomPoem(),
      poemClient.getStats(),
      chinesePoetryClient.getAuthors({ page: 1, pageSize: 1 }),
    ]);

    const dto: HomeDTO = {
      featuredPoem: toPoemDTO(featuredPoem),
      featuredAuthor: authors.data[0] ? toAuthorDTO(authors.data[0]) : null,
      totalPoems: stats.totalPoems,
      totalAuthors: stats.totalAuthors,
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async discover(): Promise<DiscoverDTO> {
    const cacheKey = "poetry:discover";
    const cached = await cache.get<DiscoverDTO>(cacheKey);
    if (cached) return cached;

    const [poems, dynasties, types] = await Promise.all([
      poemClient.getPoems({ page: 1, pageSize: 10 }),
      chinesePoetryClient.getDynasties(),
      chinesePoetryClient.getTypes(),
    ]);

    const dto: DiscoverDTO = {
      recentPoems: poems.data.map(toPoemDTO),
      dynasties,
      types,
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async categories(): Promise<CategoriesDTO> {
    const cacheKey = "poetry:categories";
    const cached = await cache.get<CategoriesDTO>(cacheKey);
    if (cached) return cached;

    const [dynasties, types] = await Promise.all([
      chinesePoetryClient.getDynasties(),
      chinesePoetryClient.getTypes(),
    ]);

    const dto: CategoriesDTO = { dynasties, types };
    await cache.set(cacheKey, dto, 3600);
    return dto;
  },

  /** Recommendation with variety — picks a random page and provides themed reasons */
  async recommend(): Promise<RecommendDTO> {
    const reasons = [
      "为你精选",
      "热门推荐",
      "经典永流传",
      "值得一读再读",
      "诗词之美的精华",
    ];
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const poems = await poemClient.getPoems({ page: randomPage, pageSize: 5 });

    const dto: RecommendDTO = {
      poems: poems.data.map(toPoemDTO),
      reason: reasons[Math.floor(Math.random() * reasons.length)]!,
    };
    return dto;
  },

  /** Daily quote — same poem for the same calendar day */
  async quote(): Promise<QuoteDTO> {
    const dateStr = getDateString();
    const cacheKey = `poetry:quote:${dateStr}`;
    const cached = await cache.get<QuoteDTO>(cacheKey);
    if (cached) return cached;

    const poem = await poemService.random();

    const lines = poem.content.split(/[，。！？\n]/).filter(Boolean);
    const quoteContent = lines.slice(0, 2).join("，");

    const dto: QuoteDTO = {
      content: quoteContent || poem.content.slice(0, 50),
      author: poem.author ?? "未知",
      source: poem.title,
      date: dateStr,
    };
    // Cache until end of day (expire at midnight UTC+8)
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const secondsUntilTomorrow = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
    await cache.set(cacheKey, dto, secondsUntilTomorrow);
    return dto;
  },

  /** Get a poem themed to the current solar term (节气) */
  async solarTerm(): Promise<SolarTermDTO> {
    const term = getCurrentSolarTerm();
    const cacheKey = `poetry:solarterm:${term.name}`;
    const cached = await cache.get<SolarTermDTO>(cacheKey);
    if (cached) return cached;

    // Try to find a seasonal poem — use dynasty as a hint for variety
    const seasonKeywords: Record<string, string> = {
      "立春": "春", "雨水": "春", "惊蛰": "春", "春分": "春", "清明": "春", "谷雨": "春",
      "立夏": "夏", "小满": "夏", "芒种": "夏", "夏至": "夏", "小暑": "夏", "大暑": "夏",
      "立秋": "秋", "处暑": "秋", "白露": "秋", "秋分": "秋", "寒露": "秋", "霜降": "秋",
      "立冬": "冬", "小雪": "冬", "大雪": "冬", "冬至": "冬", "小寒": "冬", "大寒": "冬",
    };

    const keyword = seasonKeywords[term.name] ?? "";
    // Use the term month as a page offset for variety across terms
    const page = (term.month % 4) + 1;

    const poems = await poemClient.getPoems({ page, pageSize: 1 });
    const poem = toPoemDTO(poems.data[0] ?? await poemClient.getRandomPoem());

    const dto: SolarTermDTO = {
      termName: term.name,
      termDescription: term.description,
      poem,
      reason: keyword ? `今日${term.name}，为你精选一首${keyword}季诗词` : `今日${term.name}`,
    };
    // Cache for 6 hours (solar terms span ~15 days, this is per-term)
    await cache.set(cacheKey, dto, 21600);
    return dto;
  },

  async config(): Promise<ConfigDTO> {
    const cacheKey = "poetry:config";
    const cached = await cache.get<ConfigDTO>(cacheKey);
    if (cached) return cached;

    const dto: ConfigDTO = {
      version: "1.0.0",
      banners: [
        {
          id: "spring",
          imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1200&h=400&fit=crop",
          title: "春日诗词鉴赏",
          link: "/browse?dynasty=唐",
          sort: 1,
        },
        {
          id: "li-bai",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop",
          title: "李白诗选 —— 天生我材必有用",
          link: "/search?q=李白",
          sort: 2,
        },
        {
          id: "song-ci",
          imageUrl: "https://images.unsplash.com/photo-1495615080073-6b89c9839ce0?w=1200&h=400&fit=crop",
          title: "宋词之美 —— 千古风流人物",
          link: "/browse?type=宋词",
          sort: 3,
        },
      ],
      features: {
        aiAnalysis: true,
        aiAsk: true,
        aiTranslate: true,
        favorites: true,
        readingHistory: true,
        recommendations: true,
        solarTerm: true,
        dailyQuote: true,
      },
    };
    await cache.set(cacheKey, dto, 3600);
    return dto;
  },
};
