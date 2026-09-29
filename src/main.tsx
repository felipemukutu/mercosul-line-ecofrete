import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { QuotationProvider } from './state/QuotationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <QuotationProvider>
        <App />
      </QuotationProvider>
    </BrowserRouter>
  </StrictMode>,
);
