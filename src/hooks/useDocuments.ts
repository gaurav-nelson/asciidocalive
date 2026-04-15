import { useState, useEffect, useCallback, useRef } from 'react';
import { indexedDBService, Document } from '../utils/indexedDBService';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  const activeDocument = documents.find(d => d.id === activeDocumentId) || null;

  // Load documents on mount
  useEffect(() => {
    const load = async () => {
      await indexedDBService.initDB();
      const docs = await indexedDBService.getAllDocuments();
      const savedActiveId = await indexedDBService.getSetting<string>('activeDocumentId');

      if (docs.length === 0) {
        // Create initial document if none exist
        const now = Date.now();
        const doc: Document = {
          id: crypto.randomUUID(),
          name: 'Untitled',
          content: '',
          createdAt: now,
          updatedAt: now,
        };
        await indexedDBService.putDocument(doc);
        setDocuments([doc]);
        setActiveDocumentId(doc.id);
        await indexedDBService.setSetting('activeDocumentId', doc.id);
      } else {
        setDocuments(docs);
        const targetId = savedActiveId && docs.find(d => d.id === savedActiveId)
          ? savedActiveId
          : docs[0].id;
        setActiveDocumentId(targetId);
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  const refreshDocuments = useCallback(async () => {
    const docs = await indexedDBService.getAllDocuments();
    setDocuments(docs);
  }, []);

  const setActiveDocument = useCallback(async (id: string) => {
    setActiveDocumentId(id);
    await indexedDBService.setSetting('activeDocumentId', id);
  }, []);

  const getUniqueName = useCallback((baseName: string, docs: Document[]): string => {
    const existingNames = new Set(docs.map(d => d.name));
    if (!existingNames.has(baseName)) return baseName;
    let i = 1;
    while (existingNames.has(`${baseName}${i}`)) i++;
    return `${baseName}${i}`;
  }, []);

  const createDocument = useCallback(async (name = 'Untitled', content = ''): Promise<Document> => {
    const currentDocs = await indexedDBService.getAllDocuments();
    const uniqueName = getUniqueName(name, currentDocs);
    const now = Date.now();
    const doc: Document = {
      id: crypto.randomUUID(),
      name: uniqueName,
      content,
      createdAt: now,
      updatedAt: now,
    };
    await indexedDBService.putDocument(doc);
    await refreshDocuments();
    await setActiveDocument(doc.id);
    return doc;
  }, [getUniqueName, refreshDocuments, setActiveDocument]);

  const renameDocument = useCallback(async (id: string, name: string) => {
    const doc = await indexedDBService.getDocument(id);
    if (!doc) return;
    doc.name = name;
    doc.updatedAt = Date.now();
    await indexedDBService.putDocument(doc);
    await refreshDocuments();
  }, [refreshDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await indexedDBService.deleteDocument(id);
    const remaining = await indexedDBService.getAllDocuments();

    if (remaining.length === 0) {
      // Create a new empty document if last one was deleted
      const now = Date.now();
      const doc: Document = {
        id: crypto.randomUUID(),
        name: 'Untitled',
        content: '',
        createdAt: now,
        updatedAt: now,
      };
      await indexedDBService.putDocument(doc);
      setDocuments([doc]);
      await setActiveDocument(doc.id);
    } else {
      setDocuments(remaining);
      if (id === activeDocumentId) {
        await setActiveDocument(remaining[0].id);
      }
    }
  }, [activeDocumentId, setActiveDocument]);

  const saveContent = useCallback(async (content: string) => {
    if (!activeDocumentId) return;

    // Update local state immediately
    setDocuments(prev => prev.map(d =>
      d.id === activeDocumentId
        ? { ...d, content, updatedAt: Date.now() }
        : d
    ));

    // Debounced save to IndexedDB
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(async () => {
      const doc = await indexedDBService.getDocument(activeDocumentId);
      if (doc) {
        doc.content = content;
        doc.updatedAt = Date.now();
        await indexedDBService.putDocument(doc);
      }
    }, 500);
  }, [activeDocumentId]);

  const updateDocumentGistId = useCallback(async (id: string, gistId: string) => {
    const doc = await indexedDBService.getDocument(id);
    if (!doc) return;
    doc.gistId = gistId;
    doc.updatedAt = Date.now();
    await indexedDBService.putDocument(doc);
    await refreshDocuments();
  }, [refreshDocuments]);

  return {
    documents,
    activeDocument,
    activeDocumentId,
    isLoaded,
    setActiveDocument,
    createDocument,
    renameDocument,
    deleteDocument,
    saveContent,
    updateDocumentGistId,
    refreshDocuments,
  };
}
