import { createAnthropic } from '@ai-sdk/anthropic';

import { env } from '../env.js';

let provider: ReturnType<typeof createAnthropic> | null = null;

export const chatModelId = env.chatModel;

export function aiErrorStatus(err: unknown): number {
  return (err as { status?: number })?.status === 503 ? 503 : 502;
}

export function getChatModel() {
  if (!env.anthropicApiKey) {
    const error = new Error(
      'AI is not configured. Add ANTHROPIC_API_KEY to server/.env and restart the server.'
    ) as Error & { status?: number };
    error.status = 503;
    throw error;
  }

  provider ??= createAnthropic({ apiKey: env.anthropicApiKey });
  return provider.chat(chatModelId);
}
