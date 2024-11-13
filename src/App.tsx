import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Editor from './components/Editor';

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
    <>
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
    </>
  );
};

export default App;