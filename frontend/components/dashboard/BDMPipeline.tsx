'use client'

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import {
  Phone,
  MessageSquare,
  Plus,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  BookOpen,
  Calendar,
  Tag,
  ChevronDown,
  Check,
  RotateCcw,
  Kanban,
} from 'lucide-react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { getLeads, updateLeadStage, getLeadStageCounts } from '@/lib/api/leads'
import type { Lead, LeadStage } from '@/types/admin'
import { LEAD_STAGES, LEAD_STAGE_META } from '@/lib/constants/leadStages'
import StageDropdown from '@/components/leads/StageDropdown'
import QuickAddLeadModal from '@/components/leads/QuickAddLeadModal'
import { formatTimeAgo, extractTargetScore } from '@/lib/helpers/format'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import type { Page } from '@/types/navigation'
import toast from 'react-hot-toast'
import { COURSE_GROUPS } from '@/lib/constants/courseGroups'

const DATE_FILTERS = ['Today', 'This Week', 'This Month', 'All Time']

function startOfDateFilter(filter: string): Date | null {
  const now = new Date()
  if (filter === 'Today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }
  if (filter === 'This Week') {
    const day = now.getDay() // 0 = Sunday
    const diffToMonday = (day + 6) % 7
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)
    return monday
  }
  if (filter === 'This Month') {
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return null // 'All Time'
}

// ─── Filter Dropdown ────────────────────────────────────────────────────────────────

interface FilterOption { value: string; label: string }
interface FilterGroup { label?: string; options: FilterOption[] }

function FilterDropdown({
  icon: Icon,
  value,
  defaultValue,
  groups,
  onChange,
  onClear,
  menuWidth = 'w-48',
}: {
  icon: React.ComponentType<{ className?: string }>
  value: string
  defaultValue: string
  groups: FilterGroup[]
  onChange: (value: string) => void
  onClear?: () => void
  menuWidth?: string
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isActive = value !== defaultValue

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const selectedLabel = useMemo(
    () => groups.flatMap(g => g.options).find(o => o.value === value)?.label ?? value,
    [groups, value]
  )

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`group flex items-center gap-1.5 h-8 pl-2.5 pr-2 rounded-lg border text-[13px] font-medium transition-all duration-150 ${
          isActive
            ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm hover:bg-blue-100 hover:border-blue-300'
            : 'border-gray-200/70 bg-white text-gray-600 shadow-sm hover:border-gray-300 hover:bg-gray-50'
        } ${open ? 'ring-2 ring-blue-500/20 border-blue-300' : ''}`}
      >
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className="truncate max-w-[120px]">{selectedLabel}</span>
        {isActive && onClear ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-200/70 hover:text-blue-700 transition-colors"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''} text-gray-400`} />
        )}
      </button>

      {open && (
        <div
          className={`absolute left-0 top-[calc(100%+8px)] ${menuWidth} max-w-[calc(100vw-2rem)] max-h-80 overflow-y-auto bg-white rounded-xl border border-gray-200/80 shadow-xl shadow-gray-900/10 z-30 py-1.5`}
        >
          {groups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-1 pt-1 border-t border-gray-100' : ''}>
              {group.label && (
                <div className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {group.label}
                </div>
              )}
              {group.options.map(opt => {
                const selected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { onChange(opt.value); setOpen(false) }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[13px] text-left transition-colors ${
                      selected ? 'text-blue-600 font-semibold bg-blue-50/70' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Lead Card ──────────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onStageChange,
  onView,
  savingStageId,
}: {
  lead: Lead
  onStageChange: (id: string, nextStage: LeadStage) => void
  onView: (id: string) => void
  savingStageId: string | null
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead._id })
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  const svc        = Array.isArray(lead.serviceInterest) ? lead.serviceInterest[0] : lead.serviceInterest || ''
  const lastFU     = lead.followUps?.at(-1)
  const isOverdue  = !!(lastFU?.nextFollowUpDate && new Date(lastFU.nextFollowUpDate) < new Date())
  const nextFUDate = lastFU?.nextFollowUpDate
    ? new Date(lastFU.nextFollowUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null
  const targetScore = !isOverdue && !nextFUDate ? extractTargetScore(lead.notes) : null

  const serviceText = [svc, lead.source].filter(Boolean).join(' - ')

  const stopDrag = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onView(lead._id)}
      className={`bg-white rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-transparent hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all flex flex-col gap-1.5 group cursor-pointer touch-none ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Name */}
      <p className="text-[12.5px] font-bold text-[#343a40] truncate leading-tight pr-2">{lead.fullName}</p>

      {/* Service Info */}
      <div className="flex items-center gap-1.5 text-[10.5px] text-[#495057]">
        {lead.lifecycleStage === 'Enrolled' ? (
          <CheckCircle2 className="w-3 h-3 text-[#40c057] flex-shrink-0" />
        ) : lead.lifecycleStage === 'Lost' ? (
          <X className="w-3 h-3 text-[#fa5252] flex-shrink-0" />
        ) : (
          <BookOpen className="w-3 h-3 text-[#d6336c] flex-shrink-0" />
        )}
        <span className="truncate font-medium">{serviceText}</span>
      </div>

      {/* Follow-up / target-score highlight line */}
      {(isOverdue || nextFUDate || targetScore) && (
        <div className="flex items-center">
          {isOverdue ? (
            <div className="flex items-center gap-1 text-[10px] text-[#fa5252] font-semibold">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Follow-up overdue
            </div>
          ) : nextFUDate ? (
            <div className="flex items-center gap-1 text-[10px] text-[#f59f00] font-semibold">
              <Clock className="w-3 h-3 flex-shrink-0" />
              Follow-up: {nextFUDate}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-[#f59f00] font-semibold">
              Target: {targetScore}
            </div>
          )}
        </div>
      )}

      {/* Actions and Time */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${lead.phone}`}
            className="w-[22px] h-[22px] rounded md:rounded-md bg-[#fff0f6] flex items-center justify-center hover:bg-[#ffdeeb] text-[#d6336c] transition-colors"
            title={`Call ${lead.fullName}`}
            onClick={stopDrag}
            onPointerDown={stopDrag}
          >
            <Phone className="w-[10px] h-[10px]" fill="currentColor" strokeWidth={0.5} />
          </a>
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="w-[22px] h-[22px] rounded md:rounded-md bg-[#ebfbee] flex items-center justify-center hover:bg-[#d3f9d8] text-[#40c057] transition-colors"
            title="WhatsApp"
            onClick={stopDrag}
            onPointerDown={stopDrag}
          >
            <MessageSquare className="w-[10px] h-[10px]" fill="currentColor" strokeWidth={0.5} />
          </a>
          <div onClick={stopDrag} onPointerDown={stopDrag}>
            <StageDropdown
              value={lead.lifecycleStage}
              onChange={(stage) => onStageChange(lead._id, stage)}
              saving={savingStageId === lead._id}
              size="compact"
            />
          </div>
        </div>
        <span className="text-[10px] text-[#adb5bd] font-medium whitespace-nowrap">{formatTimeAgo(lead.createdAt)}</span>
      </div>
    </div>
  )
}

// ─── Column ─────────────────────────────────────────────────────────────────────────

function Column({
  stage,
  count,
  loading,
  children,
}: {
  stage: LeadStage
  count: number
  loading: boolean
  children: React.ReactNode
}) {
  const meta = LEAD_STAGE_META[stage]
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div className="flex flex-col min-w-0">
      <div className={`relative flex items-center justify-center py-3 px-2 flex-shrink-0 rounded-xl mb-3 ${meta.bg}`}>
        <span className={`text-[13px] font-bold tracking-[0.5px] uppercase text-center ${meta.headerText}`}>
          {meta.label}
        </span>
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center bg-white ${meta.countText}`}>
          {loading ? '…' : count}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 min-h-[90px] rounded-xl p-1 transition-colors ${isOver ? 'bg-blue-50/60 ring-2 ring-blue-200' : ''}`}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────────

interface BDMPipelineProps {
  setActivePage?: (page: Page) => void
  onViewLead?: (id: string) => void
}

export default function BDMPipeline({ setActivePage, onViewLead }: BDMPipelineProps) {
  const [leads,         setLeads]         = useState<Lead[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [refreshTick,   setRefreshTick]   = useState(0)
  const [search,        setSearch]        = useState('')
  const [typeFilter,    setTypeFilter]    = useState('All Courses')
  const [dateFilter,    setDateFilter]    = useState('Today')
  const [sourceFilter,  setSourceFilter]  = useState('All Sources')
  const [showQuickAdd,  setShowQuickAdd]  = useState(false)
  const [savingStageId, setSavingStageId] = useState<string | null>(null)
  const [stageCounts,   setStageCounts]   = useState<Record<LeadStage, number> | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const sourceOptions = useMemo(() => {
    const distinct = Array.from(new Set(leads.map(l => l.source).filter(Boolean))) as string[]
    distinct.sort((a, b) => a.localeCompare(b))
    return ['All Sources', ...distinct]
  }, [leads])

  // "/" focuses search, like Linear/GitHub — skipped while already typing in a field
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Get the logged-in BDM's userId from JWT
  const currentUserId = useMemo(() => {
    const decoded = getUserIdFromToken()
    return decoded?.id || decoded?.userId || null
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getLeads(currentUserId ? { assignedTo: currentUserId, limit: 500 } : { limit: 500 })
        if (!active) return
        setLeads(Array.isArray(data.leads) ? data.leads : [])
      } catch (err: any) {
        if (!active) return
        setError(err?.message || 'Could not load leads.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [refreshTick, currentUserId])

  // The card fetch above is capped at 500 for rendering performance, so it can't be used to
  // derive true column totals once a BDM has more leads than that (e.g. after a bulk
  // reassignment). Fetch the real per-stage totals in one aggregated request so column headers
  // stay accurate regardless of the card cap.
  useEffect(() => {
    let active = true
    const loadCounts = async () => {
      try {
        const counts = await getLeadStageCounts(currentUserId ? { assignedTo: currentUserId } : undefined)
        if (active) setStageCounts(counts)
      } catch {
        if (active) setStageCounts(null)
      }
    }
    loadCounts()
    return () => { active = false }
  }, [refreshTick, currentUserId])

  const handleStageChange = useCallback(async (id: string, nextStage: LeadStage) => {
    const prevStage = leads.find(l => l._id === id)?.lifecycleStage
    if (!prevStage || prevStage === nextStage) return

    setSavingStageId(id)
    setLeads(prev => prev.map(l => l._id === id ? { ...l, lifecycleStage: nextStage } : l))
    try {
      await updateLeadStage(id, nextStage)
      toast.success(`Lead moved to ${nextStage}`, {
        style: {
          borderRadius: '10px',
          background: '#343a40',
          color: '#fff',
          fontSize: '13px'
        },
      })
    } catch {
      setLeads(prev => prev.map(l => l._id === id ? { ...l, lifecycleStage: prevStage } : l))
      toast.error('Could not update stage')
    } finally {
      setSavingStageId(null)
    }
  }, [leads])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    handleStageChange(String(active.id), over.id as LeadStage)
  }, [handleStageChange])

  const q = search.toLowerCase().trim()

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const qDigits = q.replace(/\D/g, '')
      const matchSearch = !q || (
        (l.fullName || '').toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        (qDigits.length > 0 && l.phone.replace(/\D/g, '').includes(qDigits)) ||
        l.phone.toLowerCase().includes(q)
      )

      // Course filter — exact match against the selected service-interest option
      const services = Array.isArray(l.serviceInterest) ? l.serviceInterest : [l.serviceInterest].filter(Boolean)
      const matchType = typeFilter === 'All Courses' || services.includes(typeFilter as any)

      // Source filter
      const matchSource = sourceFilter === 'All Sources' || l.source === sourceFilter

      // Date filter
      const cutoff = startOfDateFilter(dateFilter)
      const matchDate = !cutoff || new Date(l.createdAt) >= cutoff

      return matchSearch && matchType && matchSource && matchDate
    })
  }, [leads, q, typeFilter, sourceFilter, dateFilter])

  const hasActiveFilter = q.length > 0 || typeFilter !== 'All Courses' || sourceFilter !== 'All Sources' || dateFilter !== 'All Time'

  // leads is capped at 500 for rendering performance (see fetch above), so it can't be used as
  // the "total" once a BDM has more leads than that — stageCounts holds the true per-stage
  // totals from the server, so sum those instead when available.
  const trueTotal = useMemo(
    () => stageCounts ? Object.values(stageCounts).reduce((a, b) => a + b, 0) : leads.length,
    [stageCounts, leads.length]
  )

  const grouped = useMemo(() => {
    const map = {} as Record<LeadStage, Lead[]>
    for (const stage of LEAD_STAGES) map[stage] = []
    for (const l of filtered) {
      if (map[l.lifecycleStage]) map[l.lifecycleStage].push(l)
      else map[LEAD_STAGES[0]].push(l)
    }
    return map
  }, [filtered])

  return (
    <div className="flex flex-col h-full bg-white -m-6 min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="px-4 py-3 md:px-6 md:py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
        {/* Left: icon + title + count + Add Lead */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4c6ef5] to-[#3b5bdb] flex items-center justify-center shadow-md shadow-blue-500/25 flex-shrink-0">
            <Kanban className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[18px] font-extrabold text-[#1a1d24] tracking-tight">Lead Pipeline</h1>
            <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100/80 rounded-full pl-2 pr-2.5 py-[3px] whitespace-nowrap">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
              </span>
              {(hasActiveFilter ? filtered.length : trueTotal).toLocaleString()} <span className="font-medium text-blue-400">of</span> {trueTotal.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 h-8 px-4 bg-gradient-to-b from-[#4c6ef5] to-[#3b5bdb] hover:from-[#3b5bdb] hover:to-[#364fc7] text-white font-semibold text-[13px] rounded-lg transition-all duration-150 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] ml-1 whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
            Add Lead
          </button>
        </div>

        {/* Right: filter toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-5 p-2 rounded-2xl bg-slate-100/70 ring-1 ring-slate-200/80 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search name, phone or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Escape') { setSearch(''); (e.target as HTMLInputElement).blur() } }}
                className="h-8 pl-8 pr-8 bg-white border border-gray-200/70 rounded-xl text-[13px] font-medium text-gray-700 placeholder:text-gray-400 placeholder:font-normal outline-none shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-60 transition-all duration-150"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 pointer-events-none">
                  /
                </kbd>
              )}
            </div>

            <FilterDropdown
              icon={Calendar}
              value={dateFilter}
              defaultValue="All Time"
              onChange={setDateFilter}
              onClear={() => setDateFilter('All Time')}
              groups={[{ options: DATE_FILTERS.map(f => ({ value: f, label: f })) }]}
            />

            <FilterDropdown
              icon={BookOpen}
              value={typeFilter}
              defaultValue="All Courses"
              onChange={setTypeFilter}
              onClear={() => setTypeFilter('All Courses')}
              menuWidth="w-56"
              groups={[
                { options: [{ value: 'All Courses', label: 'All Courses' }] },
                ...COURSE_GROUPS.map(g => ({ label: g.label, options: g.options.map(o => ({ value: o, label: o })) })),
              ]}
            />

            <FilterDropdown
              icon={Tag}
              value={sourceFilter}
              defaultValue="All Sources"
              onChange={setSourceFilter}
              onClear={() => setSourceFilter('All Sources')}
              groups={[{ options: sourceOptions.map(s => ({ value: s, label: s })) }]}
            />
          </div>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => { setSearch(''); setDateFilter('All Time'); setTypeFilter('All Courses'); setSourceFilter('All Sources') }}
              className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12.5px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="m-6 mb-0 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="flex-1 text-[13px] font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshTick(t => t + 1)}
            className="px-3 py-1 rounded text-[11px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Kanban Board Area */}
      <div className="flex-1 p-6 pt-8 bg-white min-h-0">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0 pb-2 lg:pb-0 [mask-image:linear-gradient(to_right,black_0%,black_92%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_92%,transparent_100%)] lg:[mask-image:none] lg:[-webkit-mask-image:none]">
            {LEAD_STAGES.map(stage => {
              const colLeads = loading ? [] : (grouped[stage] || [])
              const meta = LEAD_STAGE_META[stage]
              const trueCount = stageCounts?.[stage] ?? colLeads.length
              // stageCounts is unfiltered, so it can only be meaningfully compared against
              // colLeads.length when no client-side search/type filter is narrowing the view —
              // otherwise a filtered column reads as "truncated" even when nothing is hidden.
              const isTruncated = !loading && !hasActiveFilter && trueCount > colLeads.length
              return (
                <div key={stage} className="w-[78%] min-w-[240px] max-w-[300px] flex-shrink-0 snap-start lg:w-auto lg:min-w-0 lg:max-w-none lg:flex-shrink lg:snap-align-none">
                <Column stage={stage} count={trueCount} loading={loading}>
                  {loading ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="h-[90px] bg-gray-50 rounded-xl animate-pulse" />
                    ))
                  ) : colLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-4 opacity-50">
                      <p className={`text-[12px] font-medium ${meta.headerText}`}>No {meta.label} leads</p>
                    </div>
                  ) : (
                    colLeads.map(lead => (
                      <LeadCard
                        key={lead._id}
                        lead={lead}
                        onStageChange={handleStageChange}
                        onView={(id) => onViewLead?.(id)}
                        savingStageId={savingStageId}
                      />
                    ))
                  )}

                  {isTruncated && (
                    <p className="text-[11px] font-medium text-gray-400 text-center py-1">
                      Showing {colLeads.length.toLocaleString()} of {trueCount.toLocaleString()} — search or filter to narrow down
                    </p>
                  )}

                  {/* Add Lead inline button at bottom of first column */}
                  {stage === LEAD_STAGES[0] && !loading && (
                    <button
                      type="button"
                      onClick={() => setShowQuickAdd(true)}
                      className="mt-1 flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-[13px] font-bold rounded-xl border border-transparent hover:border-gray-200 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 text-gray-400" />
                      Add Lead
                    </button>
                  )}
                </Column>
                </div>
              )
            })}
          </div>
        </DndContext>
      </div>

      {/* FAB - bottom right */}
      <button
        type="button"
        onClick={() => setShowQuickAdd(true)}
        className="hidden lg:flex fixed bottom-8 right-8 w-12 h-12 bg-[#3b5bdb] text-white rounded-full items-center justify-center z-30 hover:bg-[#364fc7] transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(59,91,219,0.4)]"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddLeadModal
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            setShowQuickAdd(false)
            setRefreshTick(t => t + 1)
          }}
        />
      )}
    </div>
  )
}
