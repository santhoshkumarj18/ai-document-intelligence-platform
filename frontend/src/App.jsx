// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppShell from './components/common/AppShell'
import LoginPage from './pages/LoginPage'
import QueuePage from './pages/QueuePage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import ReviewQueuePage from './pages/ReviewQueuePage'
import AnalyticsPage from './pages/AnalyticsPage'
import UploadPage from './pages/UploadPage'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<QueuePage />} />
        <Route path="/review" element={<ReviewQueuePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>

      <Route
        path="/documents/:id"
        element={
          <RequireAuth>
            <DocumentDetailPage />
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App