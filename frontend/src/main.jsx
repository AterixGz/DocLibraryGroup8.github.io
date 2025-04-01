import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // 👈 เพิ่มตัวนี้
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* 👈 ครอบ App ด้วย */}
      <App />
    </BrowserRouter>
  </StrictMode>,
);
