// src/components/common/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { Layers, FileStack, UploadCloud, ClipboardCheck, BarChart3 } from 'lucide-react'
import { useDocuments } from '../../context/DocumentsContext'
import { getFlaggedFields } from '../../utils/review'

const NAV_ITEMS = [
  { to: '/', label: 'Documents', icon: FileStack, end: true },
  { to: '/upload', label: 'Upload', icon: UploadCloud },
  { to: '/review', label: 'Review Queue', icon: ClipboardCheck, showBadge: true },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

function Sidebar() {
  const { documents } = useDocuments()
  const reviewCount = getFlaggedFields(documents).length

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
          <Layers size={16} className="text-white" />
        </div>
        <span className="font-ui text-[16px] font-semibold text-ink">DocIQ</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center justify-between gap-2 px-3 py-2 rounded-sm font-ui text-body transition-colors ${
                isActive
                  ? 'bg-accent-subtle text-accent font-medium'
                  : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
              }`
            }
          >
            <span className="flex items-center gap-2.5">
              <Icon size={16} />
              {label}
            </span>
            {showBadge && reviewCount > 0 && (
              <span className="bg-accent text-white text-[11px] font-medium rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {reviewCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar