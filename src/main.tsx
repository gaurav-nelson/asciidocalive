import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const links = [
  { rel: 'apple-touch-icon', sizes: '180x180', href: new URL('/src/assets/apple-touch-icon.png', import.meta.url).href },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: new URL('/src/assets/favicon-32x32.png', import.meta.url).href },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: new URL('/src/assets/favicon-16x16.png', import.meta.url).href },
  { rel: 'manifest', href: new URL('/src/assets/site.webmanifest', import.meta.url).href }
];

links.forEach(linkInfo => {
  const link = document.createElement('link');
  Object.entries(linkInfo).forEach(([key, value]) => {
    link.setAttribute(key, value);
  });
  document.head.appendChild(link);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration);
      },
      (registrationError) => {
        console.log('SW registration failed: ', registrationError);
      }
    );
  });
}
