function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function createConfig() {
  return {
    get databaseUrl() { return requireEnv("DATABASE_URL"); },
    get redisUrl() { return requireEnv("REDIS_URL"); },
    get jwtSecret() { return requireEnv("JWT_SECRET"); },
    get deepseekApiKey() { return requireEnv("DEEPSEEK_API_KEY"); },
    get deepseekBaseUrl() { return process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com"; },
    get chinesePoetryApiUrl() { return requireEnv("CHINESE_POETRY_API_URL"); },
    get nodeEnv() { return process.env.NODE_ENV ?? "development"; },
    get port() { return parseInt(process.env.PORT ?? "8080", 10); },
  } as const;
}

export const config = createConfig();
export type Config = typeof config;
