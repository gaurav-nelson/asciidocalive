// IndexedDB service for AsciiDoc Alive
// Manages settings, content, documents, and diagram cache

const DB_NAME = 'asciidoc-alive-db';
const DB_VERSION = 2;

export interface Document {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  gistId?: string;
}

interface DBStores {
  settings: IDBObjectStore;
  content: IDBObjectStore;
  documents: IDBObjectStore;
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

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

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

        // v2: Add documents store for multi-document support
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('documents')) {
            const docStore = db.createObjectStore('documents', { keyPath: 'id' });
            docStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        }
      };

      // After upgrade, migrate single-document content to documents store
      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;

        // Run migration if needed
        this.migrateToMultiDoc().then(() => resolve(this.db!)).catch(() => resolve(this.db!));
      };
    });

    return this.initPromise;
  }

  // Migrate single-document content to multi-document store
  private async migrateToMultiDoc(): Promise<void> {
    if (!this.db) return;
    const db = this.db;

    // Check if migration already done
    const migrated = await new Promise<boolean>((resolve) => {
      const tx = db.transaction(['settings'], 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('multiDocMigrated');
      req.onsuccess = () => resolve(!!req.result?.value);
      req.onerror = () => resolve(false);
    });

    if (migrated) return;

    // Get existing single-document content
    const existingContent = await new Promise<string | null>((resolve) => {
      const tx = db.transaction(['content'], 'readonly');
      const store = tx.objectStore('content');
      const req = store.get('document');
      req.onsuccess = () => resolve(req.result?.content || null);
      req.onerror = () => resolve(null);
    });

    // Create initial document
    const now = Date.now();
    const doc: Document = {
      id: crypto.randomUUID(),
      name: 'Untitled',
      content: existingContent || '',
      createdAt: now,
      updatedAt: now,
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['documents', 'settings'], 'readwrite');
      tx.objectStore('documents').put(doc);
      tx.objectStore('settings').put({ key: 'multiDocMigrated', value: true });
      tx.objectStore('settings').put({ key: 'activeDocumentId', value: doc.id });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Document Management
  async getAllDocuments(): Promise<Document[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['documents'], 'readonly');
        const store = tx.objectStore('documents');
        const req = store.getAll();
        req.onsuccess = () => {
          const docs = req.result as Document[];
          docs.sort((a, b) => b.updatedAt - a.updatedAt);
          resolve(docs);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('Error in getAllDocuments:', error);
      return [];
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['documents'], 'readonly');
        const req = tx.objectStore('documents').get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (error) {
      console.error('Error in getDocument:', error);
      return null;
    }
  }

  async putDocument(doc: Document): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['documents'], 'readwrite');
        tx.objectStore('documents').put(doc);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Error in putDocument:', error);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['documents'], 'readwrite');
        tx.objectStore('documents').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Error in deleteDocument:', error);
    }
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

