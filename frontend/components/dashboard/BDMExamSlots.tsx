'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { getAvailableSchedulesFromLuminedge, getMockTestSchedules } from '@/lib/api/mockTests'
import MockTestScheduleTable from '@/components/admin/MockTestScheduleTable'
import type { FilterState, LuminedgeSchedule, MockTestSchedule } from '@/types/admin'

const initialFilters: FilterState = {
  testType: 'all',
  examType: 'all',
  status: 'upcoming',
  sortBy: 'date-asc',
  dateRange: { start: '', end: '' },
}

const selectCls = 'h-10 w-full rounded-xl border border-[#1d4ed8]/[0.12] bg-white px-3 text-[13px] font-medium text-[#0f172a]/75 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#60a5fa]/30'
const dateCls = 'h-10 w-full rounded-xl border border-[#1d4ed8]/[0.12] bg-white px-3 text-[13px] font-medium text-[#0f172a]/75 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#60a5fa]/30'

function toDateKey(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function formatTimeTo12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

function transformSchedules(data: LuminedgeSchedule[]): MockTestSchedule[] {
  return data.map((item, index) => {
    const slot = item.timeSlots?.[0]
    const totalSeats = slot ? parseInt(slot.totalSlot, 10) || 0 : 0
    const availableSeats = slot ? Math.max(0, Math.min(slot.slot, totalSeats)) : 0
    const examTime = slot ? `${formatTimeTo12h(slot.startTime)} - ${formatTimeTo12h(slot.endTime)}` : ''

    return {
      _id: item._id,
      listNumber: index + 1,
      name: item.name,
      testType: item.name as MockTestSchedule['testType'],
      examType: (item.testType || 'Computer-Based') as MockTestSchedule['examType'],
      examDate: item.startDate,
      examTime,
      totalSeats,
      availableSeats,
      status: (item.status?.toLowerCase() === 'scheduled' ? 'upcoming' : item.status?.toLowerCase() || 'upcoming') as MockTestSchedule['status'],
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    }
  })
}

export default function BDMExamSlots() {
  const [schedules, setSchedules] = useState<MockTestSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        let rows: MockTestSchedule[] = []

        try {
          const availableSchedules = await getAvailableSchedulesFromLuminedge()
          rows = transformSchedules(availableSchedules)
        } catch {
          const schedulesResponse = await getMockTestSchedules()
          rows = Array.isArray(schedulesResponse) ? schedulesResponse : []
        }

        if (!active) return
        setSchedules(rows.filter((schedule) => schedule.status !== 'cancelled'))
      } catch (err: any) {
        if (!active) return
        setError(err?.message || 'Could not load exam slots.')
        setSchedules([])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [refreshTick])

  const filteredSchedules = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    let rows = [...schedules]

    if (filters.testType && filters.testType !== 'all') {
      rows = rows.filter((schedule) => schedule.testType === filters.testType)
    }

    if (filters.examType && filters.examType !== 'all') {
      rows = rows.filter((schedule) => schedule.examType === filters.examType)
    }

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'upcoming') {
        rows = rows.filter((schedule) => {
          const dateKey = toDateKey(schedule.examDate)
          return dateKey >= todayKey && schedule.status !== 'completed' && schedule.status !== 'cancelled'
        })
      } else {
        rows = rows.filter((schedule) => schedule.status === filters.status)
      }
    }

    const selectedDate = filters.dateRange?.start?.trim()
    if (selectedDate) {
      rows = rows.filter((schedule) => toDateKey(schedule.examDate) === selectedDate)
    }

    switch (filters.sortBy) {
      case 'date-desc':
        rows.sort((a, b) => toDateKey(b.examDate).localeCompare(toDateKey(a.examDate)))
        break
      case 'name':
        rows.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'seats-desc':
        rows.sort((a, b) => b.availableSeats - a.availableSeats)
        break
      case 'date-asc':
      default:
        rows.sort((a, b) => toDateKey(a.examDate).localeCompare(toDateKey(b.examDate)))
        break
    }

    return rows.map((schedule, index) => ({
      ...schedule,
      listNumber: index + 1,
    }))
  }, [filters, schedules])

  const upcomingCount = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    return schedules.filter((schedule) => {
      const dateKey = toDateKey(schedule.examDate)
      return dateKey >= todayKey && schedule.status !== 'completed' && schedule.status !== 'cancelled'
    }).length
  }, [schedules])

  const availableSeats = useMemo(
    () => filteredSchedules.reduce((sum, schedule) => sum + schedule.availableSeats, 0),
    [filteredSchedules]
  )

  return (
    <div className="space-y-5">
      <div className="-mx-6 -mt-6 sticky top-0 z-20 border-b border-blue-100 bg-white/95 px-4 py-3 md:px-6 md:py-5 backdrop-blur-sm shadow-[0_1px_8px_rgba(37,99,235,0.04)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-[#0f172a]">Exam Slots</h1>
            <p className="mt-1 text-[12.5px] font-medium text-[#64748b]">Mock Test Sessions - upcoming & available</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshTick((tick) => tick + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1d4ed8]/[0.10] bg-white text-[#2563eb] transition hover:border-[#2563eb]/50 hover:bg-[#eff6ff] hover:text-[#1d4ed8]"
            aria-label="Refresh exam slots"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-blue-900">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshTick((tick) => tick + 1)}
            className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-[#1d4ed8]/[0.08] bg-white px-4 py-4 shadow-[0_1px_10px_rgba(37,99,235,0.05)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">Filter schedules</p>
            <p className="mt-1 text-[12px] font-medium text-[#64748b]">Use the controls below to narrow the session list.</p>
          </div>
          <div className="hidden gap-2 md:flex">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{filteredSchedules.length} sessions</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{availableSeats} open seats</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={filters.testType || 'all'}
            onChange={(event) => setFilters({ ...filters, testType: event.target.value as any })}
            className={selectCls}
          >
            <option value="all">All Courses</option>
            <option value="IELTS">IELTS</option>
            <option value="PTE">PTE</option>
            <option value="GRE">GRE</option>
            <option value="TOEFL">TOEFL</option>
          </select>

          <select
            value={filters.examType || 'all'}
            onChange={(event) => setFilters({ ...filters, examType: event.target.value as any })}
            className={selectCls}
          >
            <option value="all">All Types</option>
            <option value="Computer-Based">Computer-Based</option>
            <option value="Paper-Based">Paper-Based</option>
          </select>

          <select
            value={filters.sortBy || 'date-asc'}
            onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}
            className={selectCls}
          >
            <option value="date-asc">Date ↑</option>
            <option value="date-desc">Date ↓</option>
            <option value="name">Name</option>
            <option value="seats-desc">Seats Left</option>
          </select>

          <select
            value={filters.status || 'upcoming'}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className={selectCls}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All Status</option>
          </select>

          <input
            type="date"
            value={filters.dateRange?.start || ''}
            onChange={(event) => setFilters({ ...filters, dateRange: { start: event.target.value, end: '' } })}
            className={dateCls}
            aria-label="Filter by date"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#1d4ed8]/[0.08] bg-white shadow-[0_1px_10px_rgba(37,99,235,0.05)] overflow-hidden">
        <div className="border-b border-blue-100 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-[#1e3a8a]">
            Showing <span className="text-[#0f172a]">{filteredSchedules.length}</span> of <span className="text-[#0f172a]">{schedules.length}</span> sessions
          </p>
          <p className="text-[12px] font-medium text-[#64748b]">
            {upcomingCount} upcoming sessions available
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 px-4 py-6">
            <div className="h-10 rounded-xl bg-blue-50 animate-pulse" />
            <div className="h-16 rounded-xl bg-blue-50/70 animate-pulse" />
            <div className="h-16 rounded-xl bg-blue-50/70 animate-pulse" />
            <div className="h-16 rounded-xl bg-blue-50/70 animate-pulse" />
          </div>
        ) : (
          <MockTestScheduleTable
            schedules={filteredSchedules}
            totalCount={schedules.length}
            showFooter={false}
          />
        )}
      </div>
    </div>
  )
}
