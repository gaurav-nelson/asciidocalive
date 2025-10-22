// IndexedDB service for AsciiDoc Alive
// Manages settings, content, and diagram cache

const DB_NAME = 'asciidoc-alive-db';
const DB_VERSION = 1;

interface DBStores {
  settings: IDBObjectStore;
  content: IDBObjectStore;
  diagramCache: IDBObjectStore;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  // Initialize the database
  async initDB(): Promise<IDBDatabase> {
    // Return existing promise if initialization is in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return existing connection if already initialized
    if (this.db) {
      return Promise.resolve(this.db);
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB initialization error:', request.error);
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('content')) {
          db.createObjectStore('content', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('diagramCache')) {
          db.createObjectStore('diagramCache', { keyPath: 'hash' });
        }
      };
    });

    return this.initPromise;
  }

  // Settings Management
  async getSetting<T>(key: string): Promise<T | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result ? request.result.value : null);
        };

        request.onerror = () => {
          console.error('Error getting setting:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getSetting:', error);
      return null;
    }
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ key, value });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Error setting setting:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in setSetting:', error);
    }
  }

  // Content Management
  async getContent(): Promise<string | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['content'], 'readonly');
        const store = transaction.objectStore('content');
        const request = store.get('document');

        request.onsuccess = () => {
          resolve(request.result ? request.result.content : null);
        };

        request.onerror = () => {
          console.error('Error getting content:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getContent:', error);
      return null;
    }
  }

  async setContent(content: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['content'], 'readwrite');
        const store = transaction.objectStore('content');
        const request = store.put({ id: 'document', content });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Error setting content:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in setContent:', error);
    }
  }

  // Diagram Cache Management
  async getCachedDiagram(hash: string): Promise<string | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['diagramCache'], 'readonly');
        const store = transaction.objectStore('diagramCache');
        const request = store.get(hash);

        request.onsuccess = () => {
          resolve(request.result ? request.result.svg : null);
        };

        request.onerror = () => {
          console.error('Error getting cached diagram:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getCachedDiagram:', error);
      return null;
    }
  }

  async setCachedDiagram(hash: string, svg: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['diagramCache'], 'readwrite');
        const store = transaction.objectStore('diagramCache');
        const timestamp = Date.now();
        const request = store.put({ hash, svg, timestamp });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('Error setting cached diagram:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in setCachedDiagram:', error);
    }
  }

  async clearDiagramCache(): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['diagramCache'], 'readwrite');
        const store = transaction.objectStore('diagramCache');
        const request = store.clear();

        request.onsuccess = () => {
          console.log('Diagram cache cleared');
          resolve();
        };

        request.onerror = () => {
          console.error('Error clearing diagram cache:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in clearDiagramCache:', error);
    }
  }

  // Get all cached diagram hashes (for debugging/management)
  async getAllCachedHashes(): Promise<string[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['diagramCache'], 'readonly');
        const store = transaction.objectStore('diagramCache');
        const request = store.getAllKeys();

        request.onsuccess = () => {
          resolve(request.result as string[]);
        };

        request.onerror = () => {
          console.error('Error getting cached hashes:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getAllCachedHashes:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const indexedDBService = new IndexedDBService();

