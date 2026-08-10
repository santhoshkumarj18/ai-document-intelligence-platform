// src/components/common/Toast.jsx
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)

  const showToast = useCallback((message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast({ message, id: Date.now() })
    timeoutRef.current = setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-6 right-6 z-50 pointer-events-none">
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 bg-ink text-white font-ui text-body rounded-sm shadow-lg px-4 py-3"
          >
            <CheckCircle2 size={18} className="text-accent shrink-0" />
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}