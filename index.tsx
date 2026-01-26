import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // O arquivo App.tsx que você enviou antes

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
