'use client'

import type { MockTestSchedule } from '@/types/admin'

interface MockTestScheduleTableProps {
  schedules: MockTestSchedule[]
  totalCount: number
  showFooter?: boolean
}

export default function MockTestScheduleTable({ schedules, totalCount, showFooter = true }: MockTestScheduleTableProps) {
  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(dateString))

  const seatsBadge = (available: number, total: number) => {
    if (available === 0) return 'bg-slate-100 text-slate-400 border border-slate-200'
    const ratio = total > 0 ? available / total : 0
    if (ratio <= 0.1) return 'bg-blue-100 text-blue-700 border border-blue-200'
    return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  }

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] sm:min-w-[680px] md:min-w-[920px]">
          <thead>
            <tr className="bg-blue-600">
              <th className="hidden sm:table-cell w-12 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-white">#</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-white">Name</th>
              <th className="hidden md:table-cell px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-white">Type</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-white">Date</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-white">Time</th>
              <th className="hidden sm:table-cell px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-white">Seats</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-white">Avail.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1d4ed8]/[0.06]">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-[13px] font-medium text-[#64748b]">
                  No schedules found for the selected filters.
                </td>
              </tr>
            ) : (
              schedules.map((schedule, index) => (
                <tr
                  key={schedule._id}
                  className={`transition-colors hover:bg-blue-50/70 ${index % 2 === 1 ? 'bg-blue-50/[0.35]' : 'bg-white'}`}
                >
                  <td className="hidden sm:table-cell px-3 py-4 text-[12px] font-medium text-[#64748b]">{schedule.listNumber}</td>
                  <td className="px-3 py-4 text-[13px] font-semibold text-[#0f172a]">{schedule.name}</td>
                  <td className="hidden md:table-cell px-3 py-4 text-[12px] font-medium whitespace-nowrap text-[#475569]">{schedule.examType}</td>
                  <td className="px-3 py-4 text-[12px] font-medium whitespace-nowrap text-[#475569]">{formatDate(schedule.examDate)}</td>
                  <td className="px-3 py-4 text-[12px] font-medium whitespace-nowrap text-[#475569]">{schedule.examTime}</td>
                  <td className="hidden sm:table-cell px-3 py-4 text-[12px] font-medium text-[#64748b]">{schedule.totalSeats}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${seatsBadge(schedule.availableSeats, schedule.totalSeats)}`}
                    >
                      {schedule.availableSeats}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div className="flex items-center justify-between border-t border-blue-100 px-4 py-3">
          <p className="text-[11.5px] font-medium text-[#64748b]">
            Showing <span className="font-bold text-[#1e3a8a]">{schedules.length}</span> of{' '}
            <span className="font-bold text-[#1e3a8a]">{totalCount}</span> schedules
          </p>
        </div>
      )}
    </div>
  )
}
