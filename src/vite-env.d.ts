/// <reference types="vite/client" />

interface Window {
  MathJax?: {
    typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
    startup: {
      promise: Promise<void>;
    };
  };
}
