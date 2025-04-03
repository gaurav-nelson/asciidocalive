import React, { useState, useCallback, Suspense, lazy } from 'react';

const Navbar = lazy(() => import('./components/Navbar'));
const Editor = lazy(() => import('./components/Editor'));

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [fileContent, setFileContent] = useState<string | undefined>(undefined);
  const [getEditorContent, setGetEditorContent] = useState<(() => string) | null>(null);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
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
      />
      <Editor
        isDark={isDark}
        fileContent={fileContent}
        onEditorReady={handleEditorReady}
      />
    </Suspense>
  );
};

export default App;