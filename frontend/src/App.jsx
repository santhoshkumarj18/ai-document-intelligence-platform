// src/App.jsx
import Button from './components/common/Button'
import StatusPill from './components/common/StatusPill'
import ConfidenceIndicator from './components/common/ConfidenceIndicator'

function App() {
  return (
    <div className="min-h-screen bg-canvas p-8 space-y-8">
      <div className="flex gap-3">
        <Button variant="primary">Save changes</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="destructive">Reject</Button>
      </div>

      <div className="flex gap-3">
        <StatusPill status="complete" />
        <StatusPill status="review" />
        <StatusPill status="error" />
      </div>

      <div className="flex items-center gap-6">
        <ConfidenceIndicator confidence={96} />
        <ConfidenceIndicator confidence={82} />
        <ConfidenceIndicator confidence={54} />
        <ConfidenceIndicator confidence={99} validationFailed size="md" />
        <ConfidenceIndicator confidence={92} size="lg" />
      </div>
    </div>
  )
}

export default App