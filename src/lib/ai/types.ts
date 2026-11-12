import type { Provider as ProviderName } from '@/lib/settings';

/** What the AI engine needs from Settings. Filled in by getAiConfig() in config.ts. */
export interface AiConfig {
  provider: ProviderName;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  proxyUrl?: string;
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string }

export interface CompletionRequest {
  system: string;
  messages: ChatMessage[];
  imageDataUrl?: string; // attached to the first user message
  signal?: AbortSignal;
}

export interface Provider {
  complete(req: CompletionRequest): Promise<string>;
}

export interface ParsedAnswer {
  finalAnswer: string;
  steps: Array<{ title: string; body: string }>;
  summary?: string;
}
