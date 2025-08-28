// lib/storage-migration.ts
// Helper to migrate legacy localStorage keys to new keys without data loss.
export function migrateLocalStorageKey(oldKey: string, newKey: string) {
  if (typeof window === "undefined") return

  try {
    // If new key already exists, nothing to do
    const newVal = localStorage.getItem(newKey)
    if (newVal !== null) return

    const oldVal = localStorage.getItem(oldKey)
    if (oldVal !== null) {
      // copy value to new key and keep a backup of the old key
      localStorage.setItem(newKey, oldVal)
      localStorage.setItem(`${oldKey}_backup`, oldVal)
      // optionally remove the old key to avoid duplication (commented out to be safe)
      // localStorage.removeItem(oldKey)
    }
  } catch (e) {
    // ignore any storage errors
    console.error("Storage migration failed for", oldKey, "->", newKey, e)
  }
}
