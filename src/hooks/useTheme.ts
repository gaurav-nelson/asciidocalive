import { useState, useEffect } from 'react';
import { indexedDBService } from '../utils/indexedDBService';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // Default to system preference initially
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from IndexedDB on mount
  useEffect(() => {
    const loadTheme = async () => {
      const stored = await indexedDBService.getSetting<string>('theme');
      if (stored) {
        setIsDark(stored === 'dark');
      }
      setIsLoaded(true);
    };
    loadTheme();
  }, []);

  // Apply theme and save to IndexedDB when it changes
  useEffect(() => {
    // Don't update until we've loaded the initial value
    if (!isLoaded) return;

    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    indexedDBService.setSetting('theme', isDark ? 'dark' : 'light');
  }, [isDark, isLoaded]);

  return { isDark, setIsDark };
}