// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import QueuePage from './pages/QueuePage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import ReviewQueuePage from './pages/ReviewQueuePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<QueuePage />} />
      <Route path="/documents/:id" element={<DocumentDetailPage />} />
      <Route path="/review" element={<ReviewQueuePage />} />
    </Routes>
  )
}

export default App