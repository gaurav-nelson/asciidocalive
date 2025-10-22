import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { indexedDBService } from './utils/indexedDBService';
import { isNewerVersion } from './utils/versionUtils';
import WhatsNewModal from './components/WhatsNewModal';
import packageJson from '../package.json';

const Navbar = lazy(() => import('./components/Navbar'));
const Editor = lazy(() => import('./components/Editor'));

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [fileContent, setFileContent] = useState<string | undefined>(undefined);
  const [getEditorContent, setGetEditorContent] = useState<(() => string) | null>(null);
  const [syncScrollEnabled, setSyncScrollEnabled] = useState(false);
  const [refreshDiagrams, setRefreshDiagrams] = useState<(() => void) | null>(null);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  // Initialize IndexedDB and load settings
  useEffect(() => {
    const initializeSettings = async () => {
      await indexedDBService.initDB();
      
      // Load syncScrollEnabled setting
      const savedSyncScroll = await indexedDBService.getSetting<boolean>('syncScrollEnabled');
      if (savedSyncScroll !== null) {
        setSyncScrollEnabled(savedSyncScroll);
      }

      // Check if we should show the "What's New" modal
      const currentVersion = packageJson.version;
      const lastSeenVersion = await indexedDBService.getSetting<string>('lastSeenVersion');
      
      if (!lastSeenVersion || isNewerVersion(currentVersion, lastSeenVersion)) {
        setShowWhatsNew(true);
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

  const handleCloseWhatsNew = async () => {
    setShowWhatsNew(false);
    // Save the current version as the last seen version
    await indexedDBService.setSetting('lastSeenVersion', packageJson.version);
  };

  const handleShowWhatsNew = () => {
    setShowWhatsNew(true);
  };

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
        />
        <Editor
          isDark={isDark}
          fileContent={fileContent}
          onEditorReady={handleEditorReady}
          syncScrollEnabled={syncScrollEnabled}
          onRefreshDiagramsReady={handleRefreshDiagramsReady}
        />
      </Suspense>
    </>
  );
};

export default App;