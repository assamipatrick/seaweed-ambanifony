
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Build: 2025-02-21 09:00 - Gemini API fix deployed
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
