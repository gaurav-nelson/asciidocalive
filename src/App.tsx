import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { indexedDBService } from './utils/indexedDBService';
import { isNewerVersion } from './utils/versionUtils';
import { useDocuments } from './hooks/useDocuments';
import WhatsNewModal from './components/WhatsNewModal';
import Sidebar from './components/Sidebar';
import type { OutlineHeading } from './components/sidebar/DocumentOutline';
import packageJson from '../package.json';

const Navbar = lazy(() => import('./components/Navbar'));
const Editor = lazy(() => import('./components/Editor'));

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [fileContent, setFileContent] = useState<string | undefined>(undefined);
  const [fileContentVersion, setFileContentVersion] = useState(0);
  const [getEditorContent, setGetEditorContent] = useState<(() => string) | null>(null);
  const [syncScrollEnabled, setSyncScrollEnabled] = useState(false);
  const [refreshDiagrams, setRefreshDiagrams] = useState<(() => void) | null>(null);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [headings, setHeadings] = useState<OutlineHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const {
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
  } = useDocuments();

  // Initialize IndexedDB and load settings
  useEffect(() => {
    const initializeSettings = async () => {
      await indexedDBService.initDB();

      const savedSyncScroll = await indexedDBService.getSetting<boolean>('syncScrollEnabled');
      if (savedSyncScroll !== null) {
        setSyncScrollEnabled(savedSyncScroll);
      }

      const currentVersion = packageJson.version;
      const lastSeenVersion = await indexedDBService.getSetting<string>('lastSeenVersion');

      if (!lastSeenVersion || isNewerVersion(currentVersion, lastSeenVersion)) {
        setShowWhatsNew(true);
      }

    };

    initializeSettings();
  }, []);

  // When active document changes, update editor content
  useEffect(() => {
    if (activeDocument && isLoaded) {
      setFileContent(activeDocument.content);
      setFileContentVersion(v => v + 1);
    }
  }, [activeDocumentId, isLoaded]);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleToggleSyncScroll = () => {
    setSyncScrollEnabled((prev: boolean) => {
      const newValue = !prev;
      indexedDBService.setSetting('syncScrollEnabled', newValue);
      return newValue;
    });
  };

  const handleFileLoad = useCallback((content: string) => {
    setFileContent(content);
    saveContent(content);
  }, [saveContent]);

  const handleEditorReady = useCallback((getValue: () => string) => {
    setGetEditorContent(() => getValue);
  }, []);

  const handleRefreshDiagramsReady = useCallback((refresh: () => void) => {
    setRefreshDiagrams(() => refresh);
  }, []);

  const handleCloseWhatsNew = async () => {
    setShowWhatsNew(false);
    await indexedDBService.setSetting('lastSeenVersion', packageJson.version);
  };

  const handleShowWhatsNew = () => {
    setShowWhatsNew(true);
  };

  // Sidebar: switch documents
  const handleSelectDocument = useCallback(async (id: string) => {
    // Save current content first
    if (getEditorContent) {
      await saveContent(getEditorContent());
    }
    await setActiveDocument(id);
  }, [getEditorContent, saveContent, setActiveDocument]);

  // Sidebar: create new document
  const handleCreateDocument = useCallback(async () => {
    if (getEditorContent) {
      await saveContent(getEditorContent());
    }
    await createDocument();
  }, [getEditorContent, saveContent, createDocument]);

  // Handle headings change from editor
  const handleHeadingsChange = useCallback((newHeadings: OutlineHeading[]) => {
    setHeadings(newHeadings);
  }, []);

  // Handle outline heading click
  const handleHeadingClick = useCallback((heading: OutlineHeading) => {
    const previewElement = document.getElementById('editor-content');
    if (previewElement && heading.id) {
      const target = previewElement.querySelector(`#${CSS.escape(heading.id)}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveHeadingId(heading.id);
      }
    }
  }, []);

  // Gist save callback
  const handleGistSaved = useCallback((gistId: string) => {
    if (activeDocumentId) {
      updateDocumentGistId(activeDocumentId, gistId);
    }
  }, [activeDocumentId, updateDocumentGistId]);

  // Gist load callback
  const handleGistLoaded = useCallback(async (content: string, name: string, gistId: string) => {
    const doc = await createDocument(name, content);
    await updateDocumentGistId(doc.id, gistId);
  }, [createDocument, updateDocumentGistId]);

  // Auto-save on content change
  const handleContentChange = useCallback(() => {
    if (getEditorContent) {
      saveContent(getEditorContent());
    }
  }, [getEditorContent, saveContent]);

  // Set up periodic auto-save
  useEffect(() => {
    if (!getEditorContent || !isLoaded) return;

    const interval = setInterval(handleContentChange, 2000);
    return () => clearInterval(interval);
  }, [getEditorContent, isLoaded, handleContentChange]);

  // IntersectionObserver for active heading tracking
  useEffect(() => {
    const previewElement = document.getElementById('editor-content');
    if (!previewElement || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
            break;
          }
        }
      },
      { root: previewElement.parentElement, rootMargin: '0px 0px -80% 0px', threshold: 0 }
    );

    headings.forEach(h => {
      if (h.id) {
        const el = previewElement.querySelector(`#${CSS.escape(h.id)}`);
        if (el) observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <>
      {showWhatsNew && (
        <WhatsNewModal
          version={packageJson.version}
          onClose={handleCloseWhatsNew}
          isDark={isDark}
        />
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <Navbar
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
          onFileLoad={handleFileLoad}
          getEditorContent={getEditorContent}
          syncScrollEnabled={syncScrollEnabled}
          onToggleSyncScroll={handleToggleSyncScroll}
          onRefreshDiagrams={refreshDiagrams}
          onShowWhatsNew={handleShowWhatsNew}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          activeDocName={activeDocument?.name}
          activeDocGistId={activeDocument?.gistId}
          onGistSaved={handleGistSaved}
          onGistLoaded={handleGistLoaded}
        />
        <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            documents={documents}
            activeDocumentId={activeDocumentId}
            headings={headings}
            activeHeadingId={activeHeadingId}
            onSelectDocument={handleSelectDocument}
            onCreateDocument={handleCreateDocument}
            onRenameDocument={renameDocument}
            onDeleteDocument={deleteDocument}
            onHeadingClick={handleHeadingClick}
          />
          <Editor
            isDark={isDark}
            fileContent={fileContent}
            fileContentVersion={fileContentVersion}
            onEditorReady={handleEditorReady}
            syncScrollEnabled={syncScrollEnabled}
            onRefreshDiagramsReady={handleRefreshDiagramsReady}
            onHeadingsChange={handleHeadingsChange}
          />
        </div>
      </Suspense>
    </>
  );
};

export default App;
