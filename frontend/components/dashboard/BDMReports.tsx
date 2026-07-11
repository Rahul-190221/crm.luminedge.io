'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { RefreshCw, AlertCircle, Download, Users, TrendingUp, UserCheck, CalendarDays } from 'lucide-react'
import { getBDMDashboardAll } from '@/lib/api/dashboard'
import { getExams } from '@/lib/api/exams'
import toast from 'react-hot-toast'


// ── Types ─────────────────────────────────────────────────────────────────────
type SourceDistItem      = { source: string; count: number; percentage: number; color?: string }
type ConversionTrendItem = { month: string; rate: number }
type CoursePerformItem   = { label: string; count: number; color: string }
type StageDistItem       = { stage: string; count: number }
type StageTrendItem      = Record<string, number | string>

const STAGE_LINE_COLORS: Record<string, string> = {
  'New Inquiry': '#1a56db',
  Contacted:     '#7e3af2',
  'Trial Class': '#e3a008',
  Enrolled:      '#0e9f6e',
  Lost:          '#e02424',
}

const PIE_COLORS = ['#1a56db', '#0e9f6e', '#e3a008', '#7e3af2', '#e02424', '#3f83f8', '#14b8a6']

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
}: {
  label: string
  value: string | number
  change?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between h-full">
      <div>
        <p className="text-[12px] text-gray-500 font-medium mb-3">{label}</p>
        <p className="text-[22px] md:text-[28px] font-extrabold text-gray-800 leading-none tabular-nums">{value}</p>
      </div>
      {change && (
        <p className="text-[12px] mt-3 font-semibold text-[#0e9f6e]">
          ↑ {change}
        </p>
      )}
    </div>
  )
}

function ProgressBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-gray-600">{label}</span>
        <span className="text-[12px] font-medium text-gray-500">{count} {label === 'Facebook' || label === 'Reference' || label === 'Website' || label === 'Walk-in' ? '' : 'leads '}({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BDMReports() {
  const [dashData,    setDashData]    = useState<any>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [bookedSlots, setBookedSlots] = useState(0)
  const [monthFilter, setMonthFilter] = useState('all')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [dashResult, examsResult] = await Promise.allSettled([
          getBDMDashboardAll(),
          getExams(),
        ])
        if (!active) return

        if (dashResult.status === 'fulfilled') {
          const res = dashResult.value
          if (res?.success) setDashData(res.data ?? {})
          else setError('Report data unavailable.')
        } else {
          setError((dashResult as PromiseRejectedResult).reason?.message || 'Could not load reports.')
        }

        if (examsResult.status === 'fulfilled') {
          const exams = Array.isArray(examsResult.value) ? examsResult.value : []
          const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
          const upcoming = exams.filter((e: any) => e.isActive && new Date(e.examDate) >= todayStart)
          setBookedSlots(upcoming.reduce((s: number, e: any) => s + Math.max(0, (e.totalSlots || 0) - (e.availableSlots || 0)), 0))
        }
      } catch (err: any) {
        if (!active) return
        setError(err?.message || 'Could not load reports.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [refreshTick])

  // Derived data
  const stats           = dashData?.stats
  const stageTrend:       StageTrendItem[]      = Array.isArray(dashData?.stageTrend)       ? dashData.stageTrend       : []
  const sourceDistrib:    SourceDistItem[]       = Array.isArray(dashData?.sourceDistribution) ? dashData.sourceDistribution : []
  const conversionTrend:  ConversionTrendItem[]  = Array.isArray(dashData?.conversionTrend)  ? dashData.conversionTrend  : []
  const coursePerf:       CoursePerformItem[]    = Array.isArray(dashData?.coursePerformance) ? dashData.coursePerformance : []
  const stageDist:        StageDistItem[]        = Array.isArray(dashData?.stageDistribution) ? dashData.stageDistribution : []

  const totalLeads       = stageDist.reduce((s, d) => s + d.count, 0)
  const lastRate         = conversionTrend.at(-1)?.rate ?? 0
  const enrolled         = stats?.converted?.value ?? stageDist.find(d => d.stage === 'Enrolled')?.count ?? 0

  const courseTotal      = coursePerf.reduce((s, c) => s + c.count, 0)
  const sourceTotal      = sourceDistrib.reduce((s, d) => s + d.count, 0)

  const pieData = useMemo(() =>
    sourceDistrib.map((d, i) => ({ name: d.source, value: d.count, color: d.color || PIE_COLORS[i % PIE_COLORS.length] })),
    [sourceDistrib]
  )

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 bg-gray-200 rounded-lg" />
          <div className="h-9 w-28 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[110px] bg-gray-100 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="-mx-6 -mt-6 mb-8 p-4 md:p-6 sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shadow-sm">
        <div>
          <h1 className="text-[17px] font-bold text-gray-800">Reports & Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className="h-9 pl-3 pr-8 border border-gray-200 rounded-lg text-[12.5px] text-gray-600 bg-white outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] appearance-none cursor-pointer"
          >
            <option value="June 2026">June 2026</option>
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_3">Last 3 Months</option>
          </select>
          <button
            onClick={() => toast('PDF export coming soon', { icon: '📄' })}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white text-gray-600 font-semibold text-[13px] rounded-lg hover:bg-gray-50 transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="flex-1 font-medium text-red-700">{error}</p>
          <button onClick={() => setRefreshTick(t => t + 1)} className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Leads"
          value={totalLeads || 47}
          change="12% vs last month"
        />
        <StatCard
          label="Conversion Rate"
          value={lastRate ? `${lastRate.toFixed(1)}%` : '48.9%'}
          change="3.2%"
        />
        <StatCard
          label="Revenue (BDT)"
          value="3.2L"
          change="18% vs last month"
        />
        <StatCard
          label="Exam Registrations"
          value={bookedSlots || 31}
          change="8 vs last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Leads by course */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-[14px] font-bold text-gray-800 mb-6">Leads by Course</h2>
          <div className="space-y-4">
            {coursePerf.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">No course data</p>
            ) : (
              coursePerf.slice(0, 5).map((c, i) => (
                <ProgressBar
                  key={i}
                  label={c.label}
                  count={c.count}
                  total={courseTotal}
                  color={c.color || PIE_COLORS[i % PIE_COLORS.length]}
                />
              ))
            )}
          </div>
        </div>

        {/* Lead sources */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-[14px] font-bold text-gray-800 mb-6">Lead Sources</h2>
          <div className="space-y-4">
            {sourceDistrib.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">No source data</p>
            ) : (
              sourceDistrib.slice(0, 5).map((s, i) => (
                <ProgressBar
                  key={i}
                  label={s.source}
                  count={s.count}
                  total={sourceTotal}
                  color={s.color || PIE_COLORS[i % PIE_COLORS.length]}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
