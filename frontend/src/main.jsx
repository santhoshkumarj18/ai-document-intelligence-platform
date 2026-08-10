// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { DocumentsProvider } from './context/DocumentsContext.jsx'
import { ToastProvider } from './components/common/Toast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DocumentsProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </DocumentsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)