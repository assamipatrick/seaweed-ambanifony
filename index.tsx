
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Warn early if the Gemini API key is not configured
if (!process.env.API_KEY && !process.env.GEMINI_API_KEY) {
  console.warn(
    "Google Gemini API key is not set. AI features will be disabled. " +
    "Set VITE_GOOGLE_GEMINI_API_KEY in your .env file."
  );
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
