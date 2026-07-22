import OpenAI from "openai";
import { config } from "@/shared/config";
import { logger } from "@/shared/logger";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: config.deepseekApiKey,
      baseURL: config.deepseekBaseUrl,
    });
  }
  return client;
}

export interface ChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export const deepSeekClient = {
  async chat(
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    logger.info({ messageCount: messages.length }, "DeepSeek API request");
    const response = await getClient().chat.completions.create({
      model: "deepseek-chat",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("DeepSeek returned empty response");
    }
    return content;
  },
};
