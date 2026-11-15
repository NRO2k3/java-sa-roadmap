import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ProgressProvider } from './progress';
import { TrackProvider } from './track';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* HashRouter để reload trang con không bị 404 trên GitHub Pages */}
    <HashRouter>
      <ProgressProvider>
        <TrackProvider>
          <App />
        </TrackProvider>
      </ProgressProvider>
    </HashRouter>
  </React.StrictMode>,
);
