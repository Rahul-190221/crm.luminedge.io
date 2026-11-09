import { Eye } from 'lucide-react'

interface ViewOnlyBadgeProps {
  show?: boolean
  className?: string
}

// Small read-only indicator for BDM screens. Reuses the existing rounded-full
// blue pill treatment already used by the Lead Center lead-count badge.
export default function ViewOnlyBadge({ show = true, className = '' }: ViewOnlyBadgeProps) {
  if (!show) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100/80 rounded-full pl-2 pr-2.5 py-[3px] whitespace-nowrap ${className}`}
    >
      <Eye className="w-3 h-3" strokeWidth={2.25} />
      View only
    </span>
  )
}
