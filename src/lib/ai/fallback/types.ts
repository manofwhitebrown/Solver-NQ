export type SlotProvider = 'gemini' | 'openai' | 'anthropic';

/** One key. For Gemini, quota is per Google project, so keys with the same label share one quota. */
export interface KeyEntry {
  id: string;
  provider: SlotProvider;
  label: string; // the project, e.g. "Project A"
  key: string; // stays on this device. Never log it.
  baseUrl?: string; // OpenAI-compatible servers only
}

/** One step of the chain. keyId empty = rotate across every key of that provider. */
export interface ModelSlot { id: string; provider: SlotProvider; model: string; keyId: string; enabled: boolean }

export type CooldownKind = 'cooldown' | 'unavailable';
export interface Cooldown { until: number; kind: CooldownKind }

export interface FallbackState {
  version: 1;
  keys: KeyEntry[];
  chain: ModelSlot[];
  cooldowns: Record<string, Cooldown>; // key: `${project}|${model}`
  invalidKeys: string[]; // key ids that were rejected (400/401/403)
  saveQuota: boolean;
  perMinute: number; // client-side throttle
  fetchedFor: string[]; // key ids whose model list was already fetched
}

export type FailKind = 'quota' | 'transient' | 'unavailable' | 'badkey' | 'safety' | 'badrequest';
export interface Failure { kind: FailKind; retryAfterMs?: number; daily?: boolean }

export type SlotStatus = 'ready' | 'cooling' | 'unavailable' | 'key-invalid';
