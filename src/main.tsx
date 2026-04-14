import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Favicon and manifest links are handled by VitePWA plugin in production
// For development, we add them manually
if (import.meta.env.DEV) {
  const links = [
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/public/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: new URL('/src/assets/favicon-32x32.png', import.meta.url).href },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: new URL('/src/assets/favicon-16x16.png', import.meta.url).href }
  ];

  links.forEach(linkInfo => {
    const link = document.createElement('link');
    Object.entries(linkInfo).forEach(([key, value]) => {
      link.setAttribute(key, value);
    });
    document.head.appendChild(link);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// When a new service worker takes control, reload the page to serve fresh assets.
// Works in tandem with registerType: 'autoUpdate', skipWaiting: true, and clientsClaim: true.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
