'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  ClipboardCheck,
  CalendarDays,
  Phone,
  MessageSquare,
  Plus,
  RefreshCw,
  AlertCircle,
  UserPlus,
  CheckSquare,
} from 'lucide-react'
import { getBDMDashboardAll } from '@/lib/api/dashboard'
import { getAvailableSchedulesFromLuminedge, getMockTestSchedules } from '@/lib/api/mockTests'
import type { LeadSource, LeadStage, LuminedgeSchedule, MockTestSchedule } from '@/types/admin'
import QuickAddLeadModal from '@/components/leads/QuickAddLeadModal'
import type { Page } from '@/types/navigation'
import { formatTimeAgo, formatHeaderDate, formatExamDate, formatShortDate } from '@/lib/helpers/format'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import { useFollowUpLeads } from '@/lib/hooks/useFollowUpLeads'

// ─── Types ─────────────────────────────────────────────────────────────────────

type DashboardMetric = { value: number; change: number }

type DashboardStats = {
  todaysLead:      DashboardMetric
  converted:       DashboardMetric
  inProcess:       DashboardMetric
  followupPending: DashboardMetric
}

type RecentLead = {
  id: string
  name: string
  service: string | string[]
  phone: string
  createdAt: string
  stage: LeadStage | string
}

type StageDistributionItem = { stage: LeadStage; count: number }
type StageTrendItem       = { month: string; Enrolled: number; 'Trial Class': number; 'New Inquiry': number; Contacted: number; Lost: number }
type SourceDistributionItem = { source: LeadSource | string; count: number; percentage: number; color?: string }
type ConversionTrendItem  = { month: string; rate: number }
type CoursePerformanceItem = { label: string; count: number; color: string }

type BDMDashboardAllResponse = {
  success: boolean
  version?: string
  data?: {
    stats?: Partial<DashboardStats>
    recentLeads?: RecentLead[]
    stageDistribution?: StageDistributionItem[]
    stageTrend?: StageTrendItem[]
    sourceDistribution?: SourceDistributionItem[]
    conversionTrend?: ConversionTrendItem[]
    coursePerformance?: CoursePerformanceItem[]
  }
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_STATS: DashboardStats = {
  todaysLead:      { value: 0, change: 0 },
  converted:       { value: 0, change: 0 },
  inProcess:       { value: 0, change: 0 },
  followupPending: { value: 0, change: 0 },
}

function mergeStats(next?: Partial<DashboardStats>): DashboardStats {
  if (!next) return DEFAULT_STATS
  return {
    todaysLead:      { ...DEFAULT_STATS.todaysLead,      ...next.todaysLead      },
    converted:       { ...DEFAULT_STATS.converted,       ...next.converted       },
    inProcess:       { ...DEFAULT_STATS.inProcess,       ...next.inProcess       },
    followupPending: { ...DEFAULT_STATS.followupPending, ...next.followupPending },
  }
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const SERVICE_BADGE: Record<string, string> = {
  'IELTS Reg':         'bg-slate-100 text-slate-600',
  'PTE Reg':           'bg-slate-100 text-slate-600',
  'TOEFL Reg':         'bg-slate-100 text-slate-600',
  'GRE Reg':           'bg-slate-100 text-slate-600',
  'Duolingo Reg':      'bg-slate-100 text-slate-600',
  'IELTS Premium':     'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS Crash':       'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS Intense':     'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS 1 Module':    'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS 1-on-1':      'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS Mock Tests':  'bg-[#ebf0ff] text-[#1a56db]',
  'PTE Premium':       'bg-[#edebfe] text-[#7e3af2]',
  'PTE Crash':         'bg-[#edebfe] text-[#7e3af2]',
  'PTE Intense':       'bg-[#edebfe] text-[#7e3af2]',
  'PTE 1 Module':      'bg-[#edebfe] text-[#7e3af2]',
  'PTE 1-on-1':        'bg-[#edebfe] text-[#7e3af2]',
  'PTE Mock Tests':    'bg-[#edebfe] text-[#7e3af2]',
  'TOEFL Premium':     'bg-[#def7ec] text-[#0e9f6e]',
  'TOEFL Crash':       'bg-[#def7ec] text-[#0e9f6e]',
  'TOEFL 1 Module':    'bg-[#def7ec] text-[#0e9f6e]',
  'TOEFL 1-on-1':      'bg-[#def7ec] text-[#0e9f6e]',
  'TOEFL Mock Tests':  'bg-[#def7ec] text-[#0e9f6e]',
  'GRE Premium':       'bg-[#fdf6b2] text-[#92400e]',
  'GRE Quant':         'bg-[#fdf6b2] text-[#92400e]',
  'GRE Verbal':        'bg-[#fdf6b2] text-[#92400e]',
  'GRE 1-on-1':        'bg-[#fdf6b2] text-[#92400e]',
  'GRE Mock Tests':    'bg-[#fdf6b2] text-[#92400e]',
  'GRE Portal':        'bg-[#fdf6b2] text-[#92400e]',
  'Basic English':     'bg-gray-100 text-gray-600',
  'Spoken':            'bg-gray-100 text-gray-600',
  'Service Charge':    'bg-gray-100 text-gray-600',
  'SSC English':       'bg-gray-100 text-gray-600',
  'Study Abroad':      'bg-gray-100 text-gray-600',
  'Others':            'bg-gray-100 text-gray-600',
}

const EXAM_BADGE: Record<string, string> = {
  IELTS: 'bg-[#ebf0ff] text-[#1a56db]',
  PTE:   'bg-[#edebfe] text-[#7e3af2]',
  GRE:   'bg-[#fdf6b2] text-[#92400e]',
  TOEFL: 'bg-[#def7ec] text-[#0e9f6e]',
}
function formatTimeTo12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

function parseDateSafe(value: string): Date | null {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toDateKey(value: string): string | null {
  const parsed = parseDateSafe(value)
  return parsed ? parsed.toISOString().slice(0, 10) : null
}

function transformSchedules(data: LuminedgeSchedule[]): MockTestSchedule[] {
  return data
    .map((item, index) => {
      const slot = item.timeSlots?.[0]
      const totalSeats = slot ? parseInt(slot.totalSlot, 10) || 0 : 0
      const availableSeats = slot ? Math.max(0, Math.min(slot.slot, totalSeats)) : 0
      const examTime = slot ? `${formatTimeTo12h(slot.startTime)} - ${formatTimeTo12h(slot.endTime)}` : ''
      const examDate = item.startDate ? new Date(item.startDate) : null

      return {
        _id: item._id,
        listNumber: index + 1,
        name: item.name,
        testType: item.name as MockTestSchedule['testType'],
        examType: (item.testType || 'Computer-Based') as MockTestSchedule['examType'],
        examDate: examDate && !Number.isNaN(examDate.getTime()) ? examDate.toISOString() : '',
        examTime,
        totalSeats,
        availableSeats,
        status: (item.status?.toLowerCase() === 'scheduled' ? 'upcoming' : item.status?.toLowerCase() || 'upcoming') as MockTestSchedule['status'],
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
      }
    })
    .filter((item) => Boolean(item.examDate))
}

const ACTIVITY_DOT: Record<string, string> = {
  Enrolled:      'bg-[#0e9f6e]',
  'Trial Class': 'bg-[#e3a008]',
  'New Inquiry': 'bg-[#1a56db]',
  Contacted:     'bg-[#1a56db]/50',
  Lost:          'bg-gray-300',
}

function followUpDueBadge(status: 'overdue' | 'today' | 'upcoming'): { label: string; cls: string } {
  if (status === 'overdue') return { label: 'Overdue', cls: 'bg-[#fde8e8] text-[#e02424] border border-[#e02424]/20' }
  if (status === 'today')   return { label: 'Today',   cls: 'bg-[#def7ec] text-[#0e9f6e] border border-[#0e9f6e]/20' }
  return { label: 'Upcoming', cls: 'bg-[#ebf0ff] text-[#1a56db] border border-[#1a56db]/20' }
}

function svcLabel(service: string | string[]): string {
  return Array.isArray(service) ? service[0] ?? '' : String(service || '').split(',')[0]?.trim() ?? ''
}

function activityText(lead: RecentLead): string {
  const svc = svcLabel(lead.service)
  switch (lead.stage) {
    case 'Enrolled':    return `enrolled in ${svc}`
    case 'Trial Class': return `marked as hot lead — ${svc}`
    case 'New Inquiry': return `added as new lead`
    case 'Contacted':   return `in processing — ${svc}`
    case 'Lost':        return `lead closed`
    default:             return svc ? `— ${svc}` : ''
  }
}

// ─── Props ──────────────────────────────────────────────────────────────────────

interface BDMDashboardProps {
  onViewLead?:      (id: string) => void
  onAddLead?:       () => void
  onViewAllLeads?:  () => void
  onBookExam?:      () => void
  onNewLeadsToday?: () => void
  onViewMockTests?: () => void
  userName?:        string
  setActivePage?:   (page: Page) => void
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BDMDashboard({
  onViewLead,
  onViewAllLeads,
  onBookExam,
  onNewLeadsToday,
  userName,
  setActivePage,
}: BDMDashboardProps) {

  const [stats,           setStats]           = useState<DashboardStats>(DEFAULT_STATS)
  const [recentLeads,     setRecentLeads]     = useState<RecentLead[]>([])
  const [upcomingSchedules, setUpcomingSchedules] = useState<MockTestSchedule[]>([])
  const [bookedSlots,       setBookedSlots]       = useState(0)
  const [loading,         setLoading]         = useState(true)
  const [fetchError,      setFetchError]      = useState<string | null>(null)
  const [fetchTick,       setFetchTick]       = useState(0)
  const [showQuickAdd,    setShowQuickAdd]    = useState(false)
  const [checkedIds,      setCheckedIds]      = useState<Set<string>>(new Set())

  // Get the logged-in BDM's userId from JWT, so only their own leads' follow-ups show —
  // same shared query/hook used by the Follow-up Reminders page and the sidebar badge.
  const currentUserId = useMemo(() => {
    const decoded = getUserIdFromToken()
    return decoded?.id || decoded?.userId || null
  }, [])
  const { rows: followUpRows } = useFollowUpLeads(currentUserId)
  const todayFollowUps = followUpRows.filter(r => r.dueStatus !== 'upcoming').slice(0, 5)

  useEffect(() => {
    let isActive = true
    const fetchAll = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const [dashResult, luminedgeResult, examsResult] = await Promise.allSettled([
          getBDMDashboardAll(),
          getAvailableSchedulesFromLuminedge(),
          getMockTestSchedules(),
        ])

        if (!isActive) return

        if (dashResult.status === 'fulfilled') {
          const res = dashResult.value as BDMDashboardAllResponse
          if (res?.success) {
            const d = res.data ?? {}
            setStats(mergeStats(d.stats))
            setRecentLeads(Array.isArray(d.recentLeads) ? d.recentLeads : [])
          } else {
            setFetchError('Dashboard data unavailable. Try refreshing.')
          }
        } else {
          setFetchError((dashResult as PromiseRejectedResult).reason?.message || 'Could not load dashboard.')
        }

        const sourceSchedules =
          luminedgeResult.status === 'fulfilled'
            ? transformSchedules(Array.isArray(luminedgeResult.value) ? luminedgeResult.value : [])
            : examsResult.status === 'fulfilled'
              ? (Array.isArray(examsResult.value) ? examsResult.value : [])
              : []

        const todayKey = new Date().toISOString().slice(0, 10)
        const upcoming = sourceSchedules
          .filter((s) => {
            const dateKey = toDateKey(s.examDate)
            return s.status === 'upcoming' && dateKey !== null && dateKey >= todayKey
          })
          .sort((a, b) => {
            const aTime = parseDateSafe(a.examDate)?.getTime() ?? 0
            const bTime = parseDateSafe(b.examDate)?.getTime() ?? 0
            return aTime - bTime
          })

        setUpcomingSchedules(upcoming.slice(0, 5))
        setBookedSlots(upcoming.reduce((sum, s) => sum + Math.max(0, s.totalSeats - s.availableSeats), 0))
      } catch (err: any) {
        if (!isActive) return
        setFetchError(err?.message || 'Could not load dashboard.')
      } finally {
        if (isActive) setLoading(false)
      }
    }
    fetchAll()
    return () => { isActive = false }
  }, [fetchTick])

  const firstName = userName || 'there'

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-64 bg-gray-200 rounded-lg mb-2" />
            <div className="h-4 w-40 bg-gray-100 rounded" />
          </div>
          <div className="h-9 w-28 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[110px] bg-gray-100 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[360px] bg-gray-100 rounded-xl" />
          <div className="space-y-4">
            <div className="h-[170px] bg-gray-100 rounded-xl" />
            <div className="h-[170px] bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 pb-6">

      {/* Error banner */}
      {fetchError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="flex-1 font-medium text-red-700">{fetchError}</p>
          <button
            type="button"
            onClick={() => setFetchTick(t => t + 1)}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────────────── */}
      <div className="-mx-6 -mt-6 mb-6 p-4 md:p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {getGreeting()}, {firstName} <span className="inline-block hover:animate-wave origin-bottom-right">👋</span>
              </h1>
              <button
                type="button"
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-1.5 h-8 px-4 bg-blue-600 text-white font-semibold text-[13px] rounded-xl transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 whitespace-nowrap flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                Add Lead
              </button>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{formatHeaderDate()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFetchTick(t => t + 1)}
            title="Refresh"
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── KPI Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">

        <div
          onClick={() => { onNewLeadsToday?.(); setActivePage?.('bdm-pipeline') }}
          className="flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/30 rounded-2xl border border-blue-100 px-6 py-5 cursor-pointer hover:-translate-y-1 shadow-sm shadow-blue-900/5 hover:shadow-md hover:shadow-blue-900/15 hover:border-blue-300 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500">New Leads Today</p>
            <div className="w-8 h-8 rounded-xl bg-blue-100/50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors shadow-sm shadow-blue-900/5">
              <UserPlus className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-[24px] md:text-[32px] font-semibold text-gray-800 leading-none tabular-nums tracking-tight">{stats.todaysLead.value}</p>
            <p className={`text-[12px] mt-2 font-semibold flex items-center gap-1 ${stats.todaysLead.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{stats.todaysLead.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(stats.todaysLead.change)} vs yesterday</span>
            </p>
          </div>
        </div>

        <div
          onClick={() => { onViewAllLeads?.(); setActivePage?.('notification') }}
          className="flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/30 rounded-2xl border border-blue-100 px-6 py-5 cursor-pointer hover:-translate-y-1 shadow-sm shadow-blue-900/5 hover:shadow-md hover:shadow-amber-900/10 hover:border-amber-300 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500">Follow-ups Due</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors shadow-sm shadow-amber-900/5">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="text-[24px] md:text-[32px] font-semibold text-gray-800 leading-none tabular-nums tracking-tight">{stats.followupPending.value}</p>
            <p className={`text-[12px] mt-2 font-semibold flex items-center gap-1 ${stats.followupPending.change > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              <span>{stats.followupPending.change > 0 ? '↑' : '✓'}</span>
              <span>{stats.followupPending.change > 0 ? `${stats.followupPending.change} overdue` : 'All on track'}</span>
            </p>
          </div>
        </div>

        <div
          onClick={() => setActivePage?.('lead-center')}
          className="flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/30 rounded-2xl border border-blue-100 px-6 py-5 cursor-pointer hover:-translate-y-1 shadow-sm shadow-blue-900/5 hover:shadow-md hover:shadow-emerald-900/10 hover:border-emerald-300 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500">Enrolled Month</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors shadow-sm shadow-emerald-900/5">
              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <p className="text-[24px] md:text-[32px] font-semibold text-gray-800 leading-none tabular-nums tracking-tight">{stats.converted.value}</p>
            <p className={`text-[12px] mt-2 font-semibold flex items-center gap-1 ${stats.converted.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{stats.converted.change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(stats.converted.change)} vs last month</span>
            </p>
          </div>
        </div>

        <div
          onClick={() => { onBookExam?.(); setActivePage?.('bdm-exam-slots') }}
          className="flex flex-col justify-between bg-gradient-to-b from-white to-blue-50/30 rounded-2xl border border-blue-100 px-6 py-5 cursor-pointer hover:-translate-y-1 shadow-sm shadow-blue-900/5 hover:shadow-md hover:shadow-purple-900/10 hover:border-purple-300 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] uppercase tracking-[0.15em] font-bold text-gray-500">Exams Booked</p>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors shadow-sm shadow-purple-900/5">
              <CalendarDays className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-[24px] md:text-[32px] font-semibold text-gray-800 leading-none tabular-nums tracking-tight">{bookedSlots}</p>
            <p className={`text-[12px] mt-2 font-semibold flex items-center gap-1 ${upcomingSchedules.length > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
              <span>{upcomingSchedules.length > 0 ? '↑' : '—'}</span>
              <span>{upcomingSchedules.length > 0 ? `${upcomingSchedules.length} upcoming` : 'No upcoming sessions'}</span>
            </p>
          </div>
        </div>

      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Today's Follow-ups (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm shadow-blue-900/5 flex flex-col relative">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <span className="text-sm">📋</span>
              </div>
              <h2 className="text-[13.5px] font-bold text-gray-900">Today&apos;s Follow-ups</h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                {todayFollowUps.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { onViewAllLeads?.(); setActivePage?.('notification') }}
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-all"
            >
              View all →
            </button>
          </div>

          <div className="divide-y divide-gray-100 flex-1">
            {todayFollowUps.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                  <CheckSquare className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-[13px] font-semibold text-gray-400">No follow-ups today</p>
                <p className="text-[11px] text-gray-300 mt-1">Tasks appear here as leads come in.</p>
              </div>
            ) : (
              todayFollowUps.map(row => {
                const status = followUpDueBadge(row.dueStatus)
                const done   = checkedIds.has(row.id)
                return (
                  <div key={row.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/70 transition-colors group">
                    <div
                      onClick={() => toggleCheck(row.id)}
                      className={`w-4.5 h-4.5 border-2 rounded-[5px] flex-shrink-0 cursor-pointer transition-all ${
                        done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-blue-500'
                      }`}
                    />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onViewLead?.(row.id)}
                    >
                      <p className={`text-[13.5px] font-semibold leading-tight truncate ${done ? 'line-through text-gray-400' : 'text-gray-800 group-hover:text-blue-600 transition-colors'}`}>
                        {row.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${SERVICE_BADGE[row.courseInterest] || 'bg-gray-100 text-gray-600'}`}>{row.courseInterest}</span>
                        <span className="text-[11px] text-gray-400 font-medium">· {row.dueDate ? formatShortDate(row.dueDate) : ''}</span>
                        {row.note && <span className="text-[11px] text-gray-400 font-medium truncate">· {row.note}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border whitespace-nowrap ${status.cls}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                        <a
                          href={row.phone ? `https://wa.me/${row.phone.replace(/\D/g, '')}` : undefined}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => { if (!row.phone) e.preventDefault() }}
                          title="WhatsApp call"
                          className={`w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center transition-colors ${row.phone ? 'hover:bg-emerald-100' : 'opacity-40 cursor-not-allowed'}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        </a>
                        <a
                          href={row.phone ? `https://wa.me/${row.phone.replace(/\D/g, '')}` : undefined}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => { if (!row.phone) e.preventDefault() }}
                          title="WhatsApp chat"
                          className={`w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center transition-colors text-gray-500 ${row.phone ? 'hover:bg-gray-100' : 'opacity-40 cursor-not-allowed'}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-900/5 flex flex-col overflow-hidden relative">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <span className="text-sm">⚡</span>
              </div>
              <h2 className="text-[13.5px] font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="px-5 py-3">
              {recentLeads.length === 0 ? (
                <div className="flex flex-col items-center py-5 text-center">
                  <p className="text-xs text-gray-400 font-medium">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentLeads.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ACTIVITY_DOT[lead.stage] ?? 'bg-gray-300'}`} />
                      <p className="flex-1 text-[12.5px] text-gray-600 leading-relaxed">
                        <span className="font-bold text-gray-900">{lead.name}</span>{' '}
                        {activityText(lead)}
                      </p>
                      <span className="text-[11px] text-gray-400 flex-shrink-0 font-medium whitespace-nowrap pt-0.5">
                        {formatTimeAgo(lead.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-900/5 flex flex-col overflow-hidden relative">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <span className="text-sm">📅</span>
              </div>
              <h2 className="text-[13.5px] font-bold text-gray-900">Upcoming Exams</h2>
            </div>
            <div className="px-5 py-2">
              {upcomingSchedules.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <p className="text-sm text-gray-400 font-medium">No upcoming mock tests</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {upcomingSchedules.map(slot => {
                    const isFull   = slot.availableSeats === 0
                    const isLow    = !isFull && slot.availableSeats <= 3
                    const badgeCls = EXAM_BADGE[slot.testType] || 'bg-gray-100 text-gray-600'
                    return (
                      <div key={slot._id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 group">
                        <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-md min-w-[48px] text-center ${badgeCls}`}>
                          {slot.testType}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] text-gray-800 font-semibold truncate group-hover:text-blue-600 transition-colors">
                            {formatExamDate(slot.examDate)}
                          </p>
                          <p className={`text-[11px] mt-0.5 font-medium ${
                            isFull ? 'text-gray-400' : isLow ? 'text-red-500' : 'text-emerald-600'
                          }`}>
                            {isFull ? 'Fully Booked' : `${slot.availableSeats} left`}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={isFull}
                          onClick={() => setActivePage?.('bdm-exam-slots')}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                            isFull
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
                          }`}
                        >
                          {isFull ? 'Full' : 'Book'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowQuickAdd(true)}
        title="Add new lead"
        className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full items-center justify-center z-30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(37,99,235,0.4)]"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Quick Add Lead Modal */}
      {showQuickAdd && (
        <QuickAddLeadModal
          onClose={() => setShowQuickAdd(false)}
          onSuccess={() => {
            setShowQuickAdd(false)
            setFetchTick(t => t + 1)
          }}
        />
      )}

    </div>
  )
}
