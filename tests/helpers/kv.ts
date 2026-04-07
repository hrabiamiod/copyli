/**
 * In-memory mock KVNamespace dla testów lokalnych.
 * Obsługuje get/put/delete z expirationTtl.
 */
export function createMockKV() {
  const store = new Map<string, { value: string; expiresAt?: number }>();

  return {
    async get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
      store.set(key, {
        value,
        expiresAt: options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : undefined,
      });
    },
    async delete(key: string): Promise<void> {
      store.delete(key);
    },
    _store: store,
  } as unknown as KVNamespace & { _store: Map<string, { value: string; expiresAt?: number }> };
}
