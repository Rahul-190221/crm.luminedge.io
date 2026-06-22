'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  ClipboardCheck,
  CalendarDays,
  Phone,
  MessageSquare,
  Plus,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  UserPlus,
  CheckSquare,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { getBDMDashboardAll } from '@/lib/api/dashboard'
import { getExams } from '@/lib/api/exams'
import { getMockTestSchedules } from '@/lib/api/mockTests'
import type { CourseType, LeadSource, LeadStage, Exam, MockTestSchedule } from '@/types/admin'
import QuickAddLeadModal from '@/components/leads/QuickAddLeadModal'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  service: string
  phone: string
  createdAt: string
  stage: LeadStage | string
}

type UpcomingTask = {
  id: string
  title: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  entityType: string
  leadId?: string
  leadName?: string
  serviceInterest?: string
}

type StageDistributionItem = { stage: LeadStage; count: number }
type StageTrendItem = { month: string; Converted: number; Hot: number; Intake: number; Processing: number; Dead: number }
type SourceDistributionItem = { source: LeadSource | string; count: number; percentage: number; color?: string }
type ConversionTrendItem = { month: string; rate: number }
type CoursePerformanceItem = { label: CourseType; count: number; color: string }

type BDMDashboardAllResponse = {
  success: boolean
  version?: string
  data?: {
    stats?: Partial<DashboardStats>
    recentLeads?: RecentLead[]
    upcomingTasks?: UpcomingTask[]
    stageDistribution?: StageDistributionItem[]
    stageTrend?: StageTrendItem[]
    sourceDistribution?: SourceDistributionItem[]
    conversionTrend?: ConversionTrendItem[]
    coursePerformance?: CoursePerformanceItem[]
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_STATS: DashboardStats = {
  todaysLead:      { value: 0, change: 0 },
  converted:       { value: 0, change: 0 },
  inProcess:       { value: 0, change: 0 },
  followupPending: { value: 0, change: 0 },
}

const DEFAULT_COURSE_PERF: CoursePerformanceItem[] = [
  { label: 'IELTS Premium',    count: 0, color: '#EF4444' },
  { label: 'IELTS Crash',      count: 0, color: '#F87171' },
  { label: 'IELTS Intense',    count: 0, color: '#DC2626' },
  { label: 'IELTS Elementary', count: 0, color: '#FCA5A5' },
  { label: 'IELTS Mock Test',  count: 0, color: '#FF6B6B' },
  { label: 'Basic English',    count: 0, color: '#F97316' },
  { label: 'GRE Premium',      count: 0, color: '#22C55E' },
  { label: 'TOEFL Premium',    count: 0, color: '#3B82F6' },
  { label: 'PTE Premium',      count: 0, color: '#A855F7' },
]

const SERVICE_BADGE: Record<string, string> = {
  'IELTS Premium':    'bg-[#FACE39]/15 text-[#00000F] border-[#FACE39]/30',
  'IELTS Crash':      'bg-[#FACE39]/10 text-[#00000F] border-[#FACE39]/20',
  'IELTS Intense':    'bg-[#FACE39]/10 text-[#00000F] border-[#FACE39]/20',
  'IELTS Elementary': 'bg-[#FACE39]/10 text-[#00000F] border-[#FACE39]/20',
  'IELTS Mock Test':  'bg-[#FACE39]/10 text-[#00000F] border-[#FACE39]/20',
  'Basic English':    'bg-[#00000F]/5  text-[#00000F]/70 border-[#00000F]/10',
  'GRE Premium':      'bg-[#00000F]/5  text-[#00000F]/70 border-[#00000F]/10',
  'TOEFL Premium':    'bg-[#00000F]/5  text-[#00000F]/70 border-[#00000F]/10',
  'PTE Premium':      'bg-[#00000F]/5  text-[#00000F]/70 border-[#00000F]/10',
  'Study Abroad':     'bg-[#00000F]/5  text-[#00000F]/70 border-[#00000F]/10',
  'Visa Processing':  'bg-[#00000F]/5  text-[#00000F]/70 border-[#00000F]/10',
}

const EXAM_BADGE: Record<string, string> = {
  IELTS: 'bg-[#FACE39]/15 text-[#00000F] border-[#FACE39]/30',
  PTE:   'bg-[#00000F]/5  text-[#00000F] border-[#00000F]/10',
  GRE:   'bg-[#00000F]/5  text-[#00000F] border-[#00000F]/10',
  TOEFL: 'bg-[#00000F]/5  text-[#00000F] border-[#00000F]/10',
}

const STAGE_META: Record<string, { card: string; num: string; lbl: string }> = {
  Intake:     { card: 'bg-[#00000F]/[0.04] border-[#00000F]/10',  num: 'text-[#00000F]',    lbl: 'text-[#00000F]/50'  },
  Processing: { card: 'bg-[#FACE39]/10    border-[#FACE39]/25',   num: 'text-[#00000F]',    lbl: 'text-[#00000F]/60'  },
  Hot:        { card: 'bg-[#FACE39]/20    border-[#FACE39]/35',   num: 'text-[#00000F]',    lbl: 'text-[#00000F]/60'  },
  Converted:  { card: 'bg-[#00000F]       border-[#00000F]',      num: 'text-[#FACE39]',    lbl: 'text-[#FACE39]/70'  },
  Dead:       { card: 'bg-[#00000F]/[0.06] border-[#00000F]/12',  num: 'text-[#00000F]/40', lbl: 'text-[#00000F]/30'  },
}

const ACTIVITY_DOT: Record<string, string> = {
  Converted:  'bg-[#FACE39]',
  Hot:        'bg-[#FACE39]/70',
  Intake:     'bg-[#00000F]',
  Processing: 'bg-[#00000F]/50',
  Dead:       'bg-[#00000F]/20',
}

const SOURCE_COLORS = ['#00000F','#FACE39','#00000F99','#FACE3999','#00000F66','#FACE3966','#00000F44','#FACE3944','#00000F22','#FACE3922']

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatHeaderDate(): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

function formatTimeAgo(date: Date | string): string {
  const now   = new Date()
  const then  = new Date(date)
  if (Number.isNaN(then.getTime())) return 'Unknown'
  const diffMs    = now.getTime() - then.getTime()
  const diffMins  = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays  = Math.floor(diffMs / 86400000)
  if (diffMins  <  1)  return 'Just now'
  if (diffMins  < 60)  return `${diffMins}m ago`
  if (diffHours <  24) return `${diffHours}h ago`
  if (diffDays  === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

function followUpTitle(lead: RecentLead): string {
  switch (lead.stage) {
    case 'Hot':        return `Follow-up call — ${lead.name}`
    case 'Processing': return `Follow up — ${lead.name}`
    case 'Intake':     return `Call ${lead.name}`
    case 'Converted':  return `Confirm enrollment — ${lead.name}`
    default:           return `Follow-up — ${lead.name}`
  }
}

function followUpStatus(lead: RecentLead): { label: string; cls: string } {
  const days = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000)
  if (lead.stage === 'Hot' || days > 3)
    return { label: 'Overdue', cls: 'bg-[#00000F] text-[#FACE39] border border-[#00000F]' }
  if (days === 0)
    return { label: 'Today', cls: 'bg-[#FACE39]/20 text-[#00000F] border border-[#FACE39]/40' }
  return { label: 'Today', cls: 'bg-[#FACE39]/15 text-[#00000F]/70 border border-[#FACE39]/30' }
}

function taskStatus(task: UpcomingTask): { label: string; cls: string } {
  const now      = new Date()
  const due      = new Date(task.dueDate)
  const diffDays = Math.floor((due.getTime() - now.getTime()) / 86400000)
  if (diffDays < 0)
    return { label: 'Overdue', cls: 'bg-[#00000F] text-[#FACE39] border border-[#00000F]' }
  if (diffDays === 0) {
    const timeStr = due.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
    return { label: `Today ${timeStr}`, cls: 'bg-[#FACE39]/20 text-[#00000F] border border-[#FACE39]/40' }
  }
  return { label: 'Today', cls: 'bg-[#FACE39]/15 text-[#00000F]/70 border border-[#FACE39]/30' }
}

function mockTestDayLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today    = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  if (d.toDateString() === today.toDateString())    return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
}

function activityText(lead: RecentLead): string {
  switch (lead.stage) {
    case 'Converted':  return `enrolled in ${lead.service}`
    case 'Hot':        return `marked as hot lead — ${lead.service}`
    case 'Intake':     return `added as new lead`
    case 'Processing': return `in processing — ${lead.service}`
    case 'Dead':       return `lead closed`
    default:           return `— ${lead.service}`
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ accent = true, title, sub, action }: {
  accent?: boolean
  title: string
  sub?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#00000F]/[0.06]">
      <div className="flex items-center gap-2.5">
        {accent && <span className="w-[3px] h-4 bg-[#FACE39] rounded-full flex-shrink-0" />}
        <div>
          <h2 className="text-[13px] font-bold text-[#00000F] tracking-tight">{title}</h2>
          {sub && <p className="text-[10.5px] text-[#00000F]/40 font-medium mt-0.5">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

function CardSectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className="w-[3px] h-4 bg-[#FACE39] rounded-full flex-shrink-0" />
      <div>
        <h3 className="text-[13px] font-bold text-[#00000F] tracking-tight">{title}</h3>
        {sub && <p className="text-[10.5px] text-[#00000F]/40 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ViewAllBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[11px] font-semibold text-[#00000F]/40 hover:text-[#00000F] px-2.5 py-1.5 rounded-lg border border-[#00000F]/[0.08] hover:border-[#FACE39] hover:bg-[#FACE39]/[0.07] transition-all duration-200"
    >
      View all <ChevronRight className="w-3 h-3" />
    </button>
  )
}

function EmptyState({ Icon, title, sub }: { Icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-6">
      <div className="w-11 h-11 bg-[#FACE39]/10 rounded-2xl flex items-center justify-center mb-3 border border-[#FACE39]/20">
        <Icon className="w-5 h-5 text-[#FACE39]" />
      </div>
      <p className="text-[13px] font-semibold text-[#00000F]/50">{title}</p>
      {sub && <p className="text-[11px] text-[#00000F]/30 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BDMDashboardProps {
  onViewLead?:      (id: string) => void
  onAddLead?:       () => void
  onViewAllLeads?:  () => void
  onBookExam?:      () => void
  onNewLeadsToday?: () => void
  onViewMockTests?: () => void
  userName?:        string
}

export default function BDMDashboard({
  onViewLead,
  onViewAllLeads,
  onBookExam,
  onNewLeadsToday,
  onViewMockTests,
  userName,
}: BDMDashboardProps) {

  const [stats,             setStats]             = useState<DashboardStats>(DEFAULT_STATS)
  const [recentLeads,       setRecentLeads]       = useState<RecentLead[]>([])
  const [upcomingTasks,     setUpcomingTasks]     = useState<UpcomingTask[]>([])
  const [stageDistrib,      setStageDistrib]      = useState<StageDistributionItem[]>([])
  const [stageTrend,        setStageTrend]        = useState<StageTrendItem[]>([])
  const [sourceDistrib,     setSourceDistrib]     = useState<SourceDistributionItem[]>([])
  const [conversionTrend,   setConversionTrend]   = useState<ConversionTrendItem[]>([])
  const [coursePerfData,    setCoursePerfData]    = useState<CoursePerformanceItem[]>([])
  const [upcomingExams,     setUpcomingExams]     = useState<Exam[]>([])
  const [bookedSlots,       setBookedSlots]       = useState(0)
  const [upcomingMockTests, setUpcomingMockTests] = useState<MockTestSchedule[]>([])
  const [apiVersion,        setApiVersion]        = useState('')
  const [loading,           setLoading]           = useState(true)
  const [fetchError,        setFetchError]        = useState<string | null>(null)
  const [fetchTick,         setFetchTick]         = useState(0)
  const [mounted,           setMounted]           = useState(false)
  const [showQuickAdd,      setShowQuickAdd]      = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    let isActive = true
    const fetchAll = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const [dashResult, examsResult, mockTestsResult] = await Promise.allSettled([
          getBDMDashboardAll(),
          getExams(),
          getMockTestSchedules(),
        ])

        if (!isActive) return

        if (dashResult.status === 'fulfilled') {
          const res = dashResult.value as BDMDashboardAllResponse
          if (res?.success) {
            const d = res.data ?? {}
            if (res.version) setApiVersion(res.version)
            setStats(mergeStats(d.stats))
            setRecentLeads(Array.isArray(d.recentLeads)         ? d.recentLeads         : [])
            setUpcomingTasks(Array.isArray(d.upcomingTasks)     ? d.upcomingTasks       : [])
            setStageDistrib(Array.isArray(d.stageDistribution)  ? d.stageDistribution   : [])
            setStageTrend(Array.isArray(d.stageTrend)           ? d.stageTrend          : [])
            setSourceDistrib(Array.isArray(d.sourceDistribution)? d.sourceDistribution  : [])
            setConversionTrend(Array.isArray(d.conversionTrend) ? d.conversionTrend     : [])
            setCoursePerfData(
              Array.isArray(d.coursePerformance) && d.coursePerformance.length > 0
                ? d.coursePerformance
                : DEFAULT_COURSE_PERF
            )
          } else {
            setFetchError('Dashboard data unavailable. Try refreshing.')
          }
        } else {
          setFetchError((dashResult as PromiseRejectedResult).reason?.message || 'Could not load dashboard.')
        }

        if (examsResult.status === 'fulfilled') {
          const all: Exam[] = Array.isArray(examsResult.value) ? examsResult.value : []
          const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
          const allUpcoming = all
            .filter(e => e.isActive && new Date(e.examDate) >= todayStart)
            .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
          setUpcomingExams(allUpcoming.slice(0, 3))
          setBookedSlots(
            allUpcoming.reduce((sum, e) => sum + Math.max(0, e.totalSlots - e.availableSlots), 0)
          )
        }

        if (mockTestsResult.status === 'fulfilled') {
          const all: MockTestSchedule[] = Array.isArray(mockTestsResult.value) ? mockTestsResult.value : []
          const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
          const filtered = all
            .filter(s =>
              s.status !== 'cancelled' &&
              s.status !== 'completed' &&
              new Date(s.examDate) >= todayStart
            )
            .sort((a, b) => {
              const dd = new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
              return dd !== 0 ? dd : a.examTime.localeCompare(b.examTime)
            })
            .slice(0, 12)
          setUpcomingMockTests(filtered)
        }
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

  // ── Computed ────────────────────────────────────────────────────────────────

  const firstName = (userName || '').split(' ')[0] || 'there'

  const sourcePieData = useMemo(
    () => sourceDistrib.filter(s => (s.count ?? 0) > 0 || (s.percentage ?? 0) > 0),
    [sourceDistrib],
  )

  const maxCourse = useMemo(
    () => coursePerfData.length > 0 ? Math.max(...coursePerfData.map(c => c.count)) : 1,
    [coursePerfData],
  )

  const hasTrendData      = stageTrend.length > 0
  const hasSourceData     = sourcePieData.length > 0
  const hasConversionData = conversionTrend.length > 0

  const useTasksForFollowUps = upcomingTasks.length > 0

  const mockTestsByDate = useMemo(() => {
    const map = new Map<string, MockTestSchedule[]>()
    for (const t of upcomingMockTests) {
      const key = new Date(t.examDate).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return Array.from(map.entries())
  }, [upcomingMockTests])

  const ch = (n: number) => (n >= 0 ? `↑ ${n}` : `↓ ${Math.abs(n)}`)

  const statCards = [
    {
      title:   'New Leads Today',
      value:   stats.todaysLead.value,
      sub:     stats.todaysLead.change !== 0
                 ? `${ch(stats.todaysLead.change)} vs yesterday`
                 : 'No change vs yesterday',
      subCls:  stats.todaysLead.change >= 0 ? 'text-[#00000F]/45' : 'text-[#00000F]/35',
      Icon:    UserPlus,
      onClick: onNewLeadsToday,
    },
    {
      title:   'Follow-ups Due',
      value:   stats.followupPending.value,
      sub:     stats.followupPending.change > 0
                 ? `${stats.followupPending.change} overdue`
                 : 'All on track',
      subCls:  stats.followupPending.change > 0 ? 'text-[#00000F]/55' : 'text-[#00000F]/40',
      Icon:    Bell,
    },
    {
      title:   'Enrolled This Month',
      value:   stats.converted.value,
      sub:     stats.converted.change > 0
                 ? `↑ ${stats.converted.change}% vs last month`
                 : stats.converted.change < 0
                 ? `↓ ${Math.abs(stats.converted.change)}% vs last month`
                 : 'Same as last month',
      subCls:  stats.converted.change > 0 ? 'text-[#00000F]/55' : stats.converted.change < 0 ? 'text-[#00000F]/40' : 'text-[#00000F]/35',
      Icon:    ClipboardCheck,
    },
    {
      title:   'Exam Slots Booked',
      value:   bookedSlots,
      sub:     upcomingExams.length > 0
                 ? `${upcomingExams.length} upcoming exam${upcomingExams.length !== 1 ? 's' : ''}`
                 : 'No upcoming exams',
      subCls:  upcomingExams.length > 0 ? 'text-[#00000F]/45' : 'text-[#00000F]/30',
      Icon:    CalendarDays,
    },
  ]

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-14 bg-[#00000F]/[0.04] rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[#00000F]/[0.04] rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 h-80 bg-[#00000F]/[0.04] rounded-2xl" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-36 bg-[#00000F]/[0.04] rounded-2xl" />
            <div className="h-36 bg-[#00000F]/[0.04] rounded-2xl" />
          </div>
        </div>
        <div className="h-40 bg-[#00000F]/[0.04] rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-[#00000F]/[0.04] rounded-2xl" />
          <div className="h-64 bg-[#00000F]/[0.04] rounded-2xl" />
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 pb-20">

      {/* ── Error banner ──────────────────────────────────────────────────────── */}
      {fetchError && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-[#FACE39]/40 bg-[#FACE39]/[0.07] px-5 py-4 text-sm text-[#00000F]">
          <div className="flex items-start gap-2.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-[#00000F]/50 shrink-0 mt-0.5" />
            <p className="font-semibold leading-snug text-[#00000F]/75">{fetchError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFetchTick(t => t + 1)}
            className="sm:ml-auto shrink-0 px-4 py-1.5 rounded-xl text-[12px] font-bold bg-[#00000F] text-[#FACE39] hover:bg-[#00000F]/85 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Section 1: Greeting ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-bold text-[#00000F] tracking-tight flex items-center gap-2">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-[12px] text-[#00000F]/40 mt-0.5 font-medium tracking-wide">{formatHeaderDate()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFetchTick(t => t + 1)}
            title="Refresh data"
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#00000F]/10 text-[#00000F]/30 hover:text-[#00000F] hover:border-[#FACE39] hover:bg-[#FACE39]/[0.08] transition-all duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FACE39] text-[#00000F] font-bold text-[13px] rounded-xl shadow-[0_2px_12px_rgba(250,206,57,0.3)] hover:shadow-[0_6px_20px_rgba(250,206,57,0.45)] hover:bg-[#FACE39]/90 active:scale-[0.97] transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Add Lead
          </button>
        </div>
      </div>

      {/* ── Section 2: Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(card => (
          <div
            key={card.title}
            onClick={card.onClick}
            className={`bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 shadow-[0_1px_10px_rgba(0,0,15,0.05)] hover:border-[#FACE39]/50 hover:shadow-[0_8px_28px_rgba(250,206,57,0.14)] hover:-translate-y-0.5 transition-all duration-200 ${card.onClick ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] text-[#00000F]/50 font-semibold leading-tight tracking-wide uppercase max-w-[100px]">{card.title}</p>
              <div className="p-2 rounded-xl bg-[#FACE39]/12 flex-shrink-0 border border-[#FACE39]/20">
                <card.Icon className="w-4 h-4 text-[#00000F]" />
              </div>
            </div>
            <p className="text-[34px] font-extrabold leading-none mb-1.5 tracking-tight text-[#00000F]">{card.value}</p>
            <p className={`text-[11px] font-semibold ${card.subCls}`}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Section 3: Follow-ups + Activity/Mock Tests ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">

        {/* Today's Follow-ups */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#00000F]/[0.07] overflow-hidden shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
          <SectionHeader
            title="Today's Follow-ups"
            action={<ViewAllBtn onClick={onViewAllLeads} />}
          />

          <div className="divide-y divide-[#00000F]/[0.05]">
            {(useTasksForFollowUps ? upcomingTasks : recentLeads).length === 0 ? (
              <EmptyState Icon={CheckSquare} title="No follow-ups today" sub="New tasks will appear here as leads come in." />
            ) : useTasksForFollowUps ? (
              upcomingTasks.map(task => {
                const status = taskStatus(task)
                const svcKey = task.serviceInterest || ''
                const svc    = SERVICE_BADGE[svcKey] || 'bg-[#00000F]/5 text-[#00000F]/60 border-[#00000F]/10'
                return (
                  <div key={task.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#FACE39]/[0.04] group transition-colors duration-150">
                    <div className="mt-[4px] w-3.5 h-3.5 rounded border-2 border-[#00000F]/15 flex-shrink-0 group-hover:border-[#FACE39] transition-colors duration-150" />
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => task.leadId && onViewLead?.(task.leadId)}
                        className="text-[13px] font-semibold text-[#00000F]/80 hover:text-[#00000F] transition-colors text-left mb-1.5 block"
                      >
                        {task.title}
                      </button>
                      <div className="flex items-center gap-2">
                        {svcKey && (
                          <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${svc}`}>
                            {svcKey}
                          </span>
                        )}
                        <span className="text-[11px] text-[#00000F]/30 font-medium">· {formatTimeAgo(task.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => task.leadId && onViewLead?.(task.leadId)}
                          className="w-7 h-7 rounded-xl bg-[#FACE39]/15 flex items-center justify-center text-[#00000F] hover:bg-[#FACE39]/35 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => task.leadId && onViewLead?.(task.leadId)}
                          className="w-7 h-7 rounded-xl bg-[#00000F]/[0.05] flex items-center justify-center text-[#00000F]/40 hover:bg-[#00000F]/10 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              recentLeads.map(lead => {
                const status = followUpStatus(lead)
                const svc    = SERVICE_BADGE[lead.service] || 'bg-[#00000F]/5 text-[#00000F]/60 border-[#00000F]/10'
                return (
                  <div key={lead.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#FACE39]/[0.04] group transition-colors duration-150">
                    <div className="mt-[4px] w-3.5 h-3.5 rounded border-2 border-[#00000F]/15 flex-shrink-0 group-hover:border-[#FACE39] transition-colors duration-150" />
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => onViewLead?.(lead.id)}
                        className="text-[13px] font-semibold text-[#00000F]/80 hover:text-[#00000F] transition-colors text-left mb-1.5 block"
                      >
                        {followUpTitle(lead)}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${svc}`}>
                          {lead.service}
                        </span>
                        <span className="text-[11px] text-[#00000F]/30 font-medium">· {formatTimeAgo(lead.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.cls}`}>
                        {status.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewLead?.(lead.id)}
                          className="w-7 h-7 rounded-xl bg-[#FACE39]/15 flex items-center justify-center text-[#00000F] hover:bg-[#FACE39]/35 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewLead?.(lead.id)}
                          className="w-7 h-7 rounded-xl bg-[#00000F]/[0.05] flex items-center justify-center text-[#00000F]/40 hover:bg-[#00000F]/10 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right column: Activity + Mock Tests */}
        <div className="lg:col-span-2 flex flex-col gap-3">

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
            <CardSectionHeader title="Recent Activity" />
            {recentLeads.length === 0 ? (
              <p className="text-[12px] text-[#00000F]/30 text-center py-6 font-medium">No recent activity</p>
            ) : (
              <div className="space-y-2.5">
                {recentLeads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-[6px] flex-shrink-0 ${ACTIVITY_DOT[lead.stage] ?? 'bg-[#00000F]/20'}`} />
                    <p className="flex-1 text-[12px] text-[#00000F]/60 leading-snug min-w-0">
                      <span className="font-semibold text-[#00000F]/85">{lead.name}</span>{' '}
                      {activityText(lead)}
                    </p>
                    <span className="text-[10px] text-[#00000F]/30 flex-shrink-0 mt-0.5 font-semibold">
                      {formatTimeAgo(lead.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Mock Tests */}
          <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] overflow-hidden shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
            <SectionHeader
              title="Upcoming Mock Tests"
              sub="Next sessions · seat availability"
              action={<ViewAllBtn onClick={onViewMockTests} />}
            />

            {mockTestsByDate.length === 0 ? (
              <EmptyState Icon={ClipboardCheck} title="No upcoming mock tests" sub="Sessions will appear once scheduled." />
            ) : (
              <div className="divide-y divide-[#00000F]/[0.05]">
                {mockTestsByDate.slice(0, 5).map(([dateKey, tests]) => (
                  <div key={dateKey}>
                    <div className="px-4 py-1.5 bg-[#00000F]/[0.02]">
                      <span className="text-[9px] font-bold text-[#00000F]/40 uppercase tracking-widest">
                        {mockTestDayLabel(tests[0].examDate)}
                        {' · '}
                        {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(tests[0].examDate))}
                      </span>
                    </div>
                    <div className="divide-y divide-[#00000F]/[0.04]">
                      {tests.slice(0, 4).map(test => {
                        const isFull   = test.availableSeats === 0
                        const isUrgent = !isFull && test.availableSeats <= 5
                        return (
                          <div key={test._id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#FACE39]/[0.03] transition-colors">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border text-center min-w-[44px] flex-shrink-0 tracking-wide ${EXAM_BADGE[test.testType] ?? 'bg-[#00000F]/5 text-[#00000F] border-[#00000F]/10'}`}>
                              {test.testType}
                            </span>
                            <span className="flex-1 text-[11px] text-[#00000F]/55 font-medium min-w-0 truncate">
                              {test.name}
                            </span>
                            <span className="text-[11px] text-[#00000F]/35 font-semibold flex-shrink-0">
                              {test.examTime}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                              isFull
                                ? 'bg-[#00000F]/[0.04] text-[#00000F]/25'
                                : isUrgent
                                ? 'bg-[#FACE39]/20 text-[#00000F] border border-[#FACE39]/40'
                                : 'bg-[#00000F]/[0.03] text-[#00000F]/35'
                            }`}>
                              {isFull ? 'Full' : `${test.availableSeats} left`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Section 4: Pipeline This Month ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
        <CardSectionHeader title="Pipeline This Month" sub="Lead stage distribution" />

        {stageDistrib.length === 0 ? (
          <div className="py-10 text-center rounded-xl border border-dashed border-[#00000F]/10 bg-[#00000F]/[0.02]">
            <BarChart3 className="w-6 h-6 text-[#00000F]/15 mx-auto mb-2" />
            <p className="text-[12px] font-semibold text-[#00000F]/35">No stage data this month yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {stageDistrib.map(item => {
              const m = STAGE_META[item.stage] ?? STAGE_META.Intake
              return (
                <div key={item.stage} className={`rounded-xl p-3.5 border ${m.card} text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}>
                  <p className={`text-[28px] font-extrabold leading-none mb-1.5 tracking-tight ${m.num}`}>{item.count}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${m.lbl}`}>
                    {item.stage === 'Hot' ? 'Hot Leads' : item.stage === 'Dead' ? 'Dead Leads' : item.stage}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Section 5: Charts Row 1 ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Lead Lifecycle Trend */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
          <CardSectionHeader title="Lead Lifecycle Trend" sub="Last 6 months by stage" />
          <div style={{ height: 210 }}>
            {mounted && hasTrendData ? (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={stageTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000F" strokeOpacity={0.05} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#00000F', fillOpacity: 0.35, fontWeight: 600, fontFamily: 'inherit' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#00000F', fillOpacity: 0.35, fontWeight: 600, fontFamily: 'inherit' }}
                    width={24}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,15,0.08)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={6}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '8px', fontFamily: 'inherit' }}
                  />
                  <Line type="monotone" dataKey="Converted"  stroke="#FACE39"   strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: '#FACE39'   }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Hot"        stroke="#00000F"   strokeWidth={2}   dot={{ r: 3, strokeWidth: 0, fill: '#00000F'   }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Intake"     stroke="#00000F99" strokeWidth={2}   dot={{ r: 3, strokeWidth: 0, fill: '#00000F99' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Processing" stroke="#FACE3999" strokeWidth={2}   dot={{ r: 3, strokeWidth: 0, fill: '#FACE3999' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Dead"       stroke="#00000F44" strokeWidth={2}   dot={{ r: 3, strokeWidth: 0, fill: '#00000F44' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[#00000F]/10 bg-[#00000F]/[0.02] text-center px-4">
                <BarChart3 className="w-6 h-6 text-[#00000F]/15 mb-2" />
                <p className="text-[12px] font-semibold text-[#00000F]/35">No trend data yet</p>
                <p className="text-[11px] text-[#00000F]/25 mt-1">Counts appear monthly once leads flow in.</p>
              </div>
            )}
          </div>
        </div>

        {/* Source Channels */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
          <CardSectionHeader title="Source Channels" sub="Lead origin breakdown" />
          <div style={{ height: 230 }}>
            {mounted && hasSourceData ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart margin={{ top: 0, right: 8, bottom: 4, left: 8 }}>
                  <Pie
                    data={sourcePieData}
                    cx="50%"
                    cy="44%"
                    innerRadius={54}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="percentage"
                    nameKey="source"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {sourcePieData.map((_e, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Share']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,15,0.08)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'inherit',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '6px', fontFamily: 'inherit' }}
                    formatter={(v) => (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,0,15,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {v}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[#00000F]/10 bg-[#00000F]/[0.02] text-center px-4">
                <PieChartIcon className="w-6 h-6 text-[#00000F]/15 mb-2" />
                <p className="text-[12px] font-semibold text-[#00000F]/35">No source breakdown</p>
                <p className="text-[11px] text-[#00000F]/25 mt-1">Channel mix appears when leads include a source.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 6: Charts Row 2 ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Conversion Success Rate */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
          <CardSectionHeader title="Conversion Success Rate" sub="Monthly conversion percentage" />
          <div style={{ height: 210 }}>
            {mounted && hasConversionData ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={conversionTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000F" strokeOpacity={0.05} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#00000F', fillOpacity: 0.35, fontWeight: 600, fontFamily: 'inherit' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#00000F', fillOpacity: 0.35, fontWeight: 600, fontFamily: 'inherit' }}
                    tickFormatter={v => `${v}%`}
                    width={30}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(250,206,57,0.07)', radius: 8 }}
                    formatter={v => [`${v}%`, 'Conversion Rate']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,15,0.08)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: 'inherit',
                    }}
                  />
                  <Bar dataKey="rate" fill="#FACE39" radius={[6, 6, 0, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[#00000F]/10 bg-[#00000F]/[0.02] text-center px-4">
                <TrendingUp className="w-6 h-6 text-[#00000F]/15 mb-2" />
                <p className="text-[12px] font-semibold text-[#00000F]/35">No conversion history</p>
                <p className="text-[11px] text-[#00000F]/25 mt-1">Monthly rates show after conversions are recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Course Performance */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] p-4 shadow-[0_1px_10px_rgba(0,0,15,0.04)]">
          <CardSectionHeader title="Course Performance" sub="All-time lead distribution" />
          <div className="space-y-2.5">
            {coursePerfData.map((item, idx) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-[#00000F]/55">{item.label}</span>
                  <span className="text-[13px] font-extrabold text-[#00000F] tabular-nums">{item.count}</span>
                </div>
                <div className="relative h-2 bg-[#00000F]/[0.06] rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${maxCourse > 0 ? (item.count / maxCourse) * 100 : 0}%`,
                      minWidth: item.count > 0 ? 4 : 0,
                      backgroundColor: idx % 2 === 0 ? '#FACE39' : '#00000F',
                      opacity: item.count > 0 ? 1 : 0.15,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowQuickAdd(true)}
        title="Add new lead"
        className="fixed bottom-7 right-7 w-12 h-12 bg-[#FACE39] text-[#00000F] rounded-full shadow-[0_6px_24px_rgba(250,206,57,0.50)] hover:shadow-[0_10px_32px_rgba(250,206,57,0.65)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center z-40"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* ── Quick Add Lead Modal ──────────────────────────────────────────────── */}
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
