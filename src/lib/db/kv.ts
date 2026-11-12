import { db } from './db';

/** Small settings-like values (e.g. the study planner). Values must be structured-cloneable / JSON. */
export async function kvGet<T>(key: string): Promise<T | undefined> {
  return (await db.kv.get(key))?.value as T | undefined;
}
export async function kvSet(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}
export async function kvDelete(key: string): Promise<void> {
  await db.kv.delete(key);
}
