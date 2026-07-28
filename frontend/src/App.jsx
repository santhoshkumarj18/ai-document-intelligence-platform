// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/common/AppShell'
import QueuePage from './pages/QueuePage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import ReviewQueuePage from './pages/ReviewQueuePage'
import AnalyticsPage from './pages/AnalyticsPage'
import UploadPage from './pages/UploadPage'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<QueuePage />} />
        <Route path="/review" element={<ReviewQueuePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
      <Route path="/documents/:id" element={<DocumentDetailPage />} />
    </Routes>
  )
}

export default App