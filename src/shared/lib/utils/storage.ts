/**
 * Storage Service
 * Centralized localStorage access with error handling and type safety
 */

type StorageKey = 'app_auth_token' | 'app_auth_user';

interface StorageService {
  get<T>(key: StorageKey): T | null;
  set<T>(key: StorageKey, value: T): boolean;
  remove(key: StorageKey): boolean;
  clear(): boolean;
}

class LocalStorageService implements StorageService {
  private readonly storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  get<T>(key: StorageKey): T | null {
    try {
      const item = this.storage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Failed to get item from storage: ${key}`, error);
      return null;
    }
  }

  set<T>(key: StorageKey, value: T): boolean {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set item in storage: ${key}`, error);
      return false;
    }
  }

  remove(key: StorageKey): boolean {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from storage: ${key}`, error);
      return false;
    }
  }

  clear(): boolean {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear storage', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new LocalStorageService();

