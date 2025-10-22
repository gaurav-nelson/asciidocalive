import React, { useState, useCallback, Suspense, lazy } from 'react';

const Navbar = lazy(() => import('./components/Navbar'));
const Editor = lazy(() => import('./components/Editor'));

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [fileContent, setFileContent] = useState<string | undefined>(undefined);
  const [getEditorContent, setGetEditorContent] = useState<(() => string) | null>(null);
  const [syncScrollEnabled, setSyncScrollEnabled] = useState(() => {
    const saved = localStorage.getItem('syncScrollEnabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleToggleSyncScroll = () => {
    setSyncScrollEnabled((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('syncScrollEnabled', JSON.stringify(newValue));
      return newValue;
    });
  };

  const handleFileLoad = (content: string) => {
    setFileContent(content);
  };

  const handleEditorReady = useCallback((getValue: () => string) => {
    setGetEditorContent(() => getValue);
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
      />
      <Editor
        isDark={isDark}
        fileContent={fileContent}
        onEditorReady={handleEditorReady}
        syncScrollEnabled={syncScrollEnabled}
      />
    </Suspense>
  );
};

export default App;