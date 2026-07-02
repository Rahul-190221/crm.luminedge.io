'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
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
import { getLeads, updateLeadStage } from '@/lib/api/leads'
import type { Lead, LeadStage } from '@/types/admin'
import { LEAD_STAGES, LEAD_STAGE_META } from '@/lib/constants/leadStages'
import StageDropdown from '@/components/leads/StageDropdown'
import QuickAddLeadModal from '@/components/leads/QuickAddLeadModal'
import { formatTimeAgo, extractTargetScore } from '@/lib/helpers/format'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import type { Page } from '@/types/navigation'
import toast from 'react-hot-toast'

const EXAMS = ['All Exams', 'IELTS', 'PTE', 'TOEFL', 'GRE', 'SAT', 'GMAT']

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
  const [typeFilter,    setTypeFilter]    = useState('All Exams')
  const [showQuickAdd,  setShowQuickAdd]  = useState(false)
  const [savingStageId, setSavingStageId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

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
      const matchSearch = !q || (
        l.fullName.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        l.phone.includes(q)
      )

      // Exam type filter
      const svc = (Array.isArray(l.serviceInterest) ? l.serviceInterest.join(',') : l.serviceInterest || '').toLowerCase()
      const matchType = typeFilter === 'All Exams' || svc.includes(typeFilter.toLowerCase())

      return matchSearch && matchType
    })
  }, [leads, q, typeFilter])

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
      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-[17px] font-bold text-[#343a40]">Lead Pipeline</h1>
          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 h-8 px-4 bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-medium text-[13px] rounded-md transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Lead
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 pl-8 pr-8 border border-gray-200 rounded-md text-[13px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-56 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Exam Filter Dropdown */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-8 pl-3 pr-8 border border-gray-200 rounded-md text-[13px] text-gray-700 bg-white outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.2rem_center] bg-no-repeat"
          >
            {EXAMS.map(exam => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
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
          <div className="grid grid-cols-5 gap-4">
            {LEAD_STAGES.map(stage => {
              const colLeads = loading ? [] : (grouped[stage] || [])
              const meta = LEAD_STAGE_META[stage]
              return (
                <Column key={stage} stage={stage} count={colLeads.length} loading={loading}>
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
              )
            })}
          </div>
        </DndContext>
      </div>

      {/* FAB - bottom right */}
      <button
        type="button"
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#3b5bdb] text-white rounded-full flex items-center justify-center z-40 hover:bg-[#364fc7] transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(59,91,219,0.4)]"
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
