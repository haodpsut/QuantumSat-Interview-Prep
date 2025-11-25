import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// POLYFILL: Prevent "process is not defined" crash in browser environments (Vercel)
// This ensures the app can mount even if environment variables are missing
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);