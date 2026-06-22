'use client'

import type { MockTestSchedule } from '@/types/admin'

interface MockTestScheduleTableProps {
  schedules: MockTestSchedule[]
  totalCount: number
}

export default function MockTestScheduleTable({ schedules, totalCount }: MockTestScheduleTableProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })

  const seatsBadge = (available: number, total: number) => {
    if (available === 0) return 'bg-[#00000F]/[0.08] text-[#00000F]/35'
    const ratio = available / total
    if (ratio <= 0.1) return 'bg-red-50 text-red-600 border border-red-100'
    if (ratio <= 0.3) return 'bg-[#FACE39]/20 text-[#00000F] border border-[#FACE39]/40'
    return 'bg-[#22C55E]/10 text-[#16A34A] border border-[#22C55E]/20'
  }

  return (
    <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="bg-[#FACE39]">
              <th className="px-3 py-3 text-left text-[11px] font-bold text-[#00000F] uppercase tracking-widest w-10">#</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Name</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Type</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Date</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Time</th>
              <th className="hidden sm:table-cell px-3 py-3 text-left text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Seats</th>
              <th className="px-3 py-3 text-left text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Avail.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#00000F]/[0.05]">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[12.5px] text-[#00000F]/35 font-medium">
                  No schedules found for the selected filters.
                </td>
              </tr>
            ) : schedules.map((schedule, index) => (
              <tr
                key={schedule._id}
                className={`transition-colors hover:bg-[#FACE39]/[0.03] ${index % 2 === 1 ? 'bg-[#00000F]/[0.015]' : 'bg-white'}`}
              >
                <td className="px-3 py-2.5 text-[12px] text-[#00000F]/40 font-medium">{schedule.listNumber}</td>
                <td className="px-3 py-2.5 text-[13px] text-[#00000F] font-semibold">{schedule.name}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#00000F]/60 font-medium whitespace-nowrap">{schedule.examType}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#00000F]/60 font-medium whitespace-nowrap">{formatDate(schedule.examDate)}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#00000F]/60 font-medium whitespace-nowrap">{schedule.examTime}</td>
                <td className="hidden sm:table-cell px-3 py-2.5 text-[12px] text-[#00000F]/50 font-medium">{schedule.totalSeats}</td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold ${seatsBadge(schedule.availableSeats, schedule.totalSeats)}`}>
                    {schedule.availableSeats}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-[#00000F]/[0.05] flex items-center justify-between">
        <p className="text-[11.5px] text-[#00000F]/40 font-medium">
          Showing <span className="font-bold text-[#00000F]/60">{schedules.length}</span> of <span className="font-bold text-[#00000F]/60">{totalCount}</span> schedules
        </p>
      </div>
    </div>
  )
}
