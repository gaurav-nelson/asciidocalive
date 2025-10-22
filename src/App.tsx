import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { indexedDBService } from './utils/indexedDBService';

const Navbar = lazy(() => import('./components/Navbar'));
const Editor = lazy(() => import('./components/Editor'));

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [fileContent, setFileContent] = useState<string | undefined>(undefined);
  const [getEditorContent, setGetEditorContent] = useState<(() => string) | null>(null);
  const [syncScrollEnabled, setSyncScrollEnabled] = useState(false);
  const [refreshDiagrams, setRefreshDiagrams] = useState<(() => void) | null>(null);

  // Initialize IndexedDB and load settings
  useEffect(() => {
    const initializeSettings = async () => {
      await indexedDBService.initDB();
      
      // Load syncScrollEnabled setting
      const savedSyncScroll = await indexedDBService.getSetting<boolean>('syncScrollEnabled');
      if (savedSyncScroll !== null) {
        setSyncScrollEnabled(savedSyncScroll);
      }
    };
    
    initializeSettings();
  }, []);

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

  const handleFileLoad = (content: string) => {
    setFileContent(content);
  };

  const handleEditorReady = useCallback((getValue: () => string) => {
    setGetEditorContent(() => getValue);
  }, []);

  const handleRefreshDiagramsReady = useCallback((refresh: () => void) => {
    setRefreshDiagrams(() => refresh);
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Navbar
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onFileLoad={handleFileLoad}
        getEditorContent={getEditorContent}
        syncScrollEnabled={syncScrollEnabled}
        onToggleSyncScroll={handleToggleSyncScroll}
        onRefreshDiagrams={refreshDiagrams}
      />
      <Editor
        isDark={isDark}
        fileContent={fileContent}
        onEditorReady={handleEditorReady}
        syncScrollEnabled={syncScrollEnabled}
        onRefreshDiagramsReady={handleRefreshDiagramsReady}
      />
    </Suspense>
  );
};

export default App;