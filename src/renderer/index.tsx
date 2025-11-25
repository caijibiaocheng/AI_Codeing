import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('[Renderer] index.tsx loaded');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[Renderer] #root element not found');
} else {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
