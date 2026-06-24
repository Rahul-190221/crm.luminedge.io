'use client'

import { ChevronRight } from 'lucide-react'
import type { Course } from '@/types/admin'

interface CourseCardProps {
  course: Course
  onEdit: (course: Course) => void
  onViewDetails: (course: Course) => void
  onToggleActive?: (course: Course) => void
  user?: any
}

export default function CourseCard({ course, onViewDetails, onToggleActive }: CourseCardProps) {
  const enrollPct = course.capacity
    ? Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100))
    : 0

  const isFull = enrollPct >= 100
  const barColor = isFull ? 'bg-red-500' : 'bg-blue-600'
  const badgeCls = course.isActive ? 'bg-green-50 text-green-700 border border-green-200/60' : 'bg-gray-50 text-gray-500 border border-gray-200/60'

  return (
    <div
      onClick={() => onViewDetails(course)}
      className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer p-5"
    >
      {/* Top row: Title & Active Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-[15px] font-extrabold text-gray-900 leading-tight">
          {course.testType}
        </h3>
        {onToggleActive ? (
          <button
             onClick={(e) => { e.stopPropagation(); onToggleActive(course) }}
             className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors hover:shadow-sm ${badgeCls}`}
             title={course.isActive ? 'Click to deactivate' : 'Click to activate'}
          >
             {course.isActive ? 'Active' : 'Inactive'}
          </button>
        ) : (
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${badgeCls}`}>
             {course.isActive ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>

      {/* Batch name & Schedule */}
      <p className="text-[12px] text-gray-500 mb-1.5 leading-tight">
        <span className="font-semibold text-gray-700">Batch {course.name}</span>
        {course.schedule && <span> · {course.schedule}</span>}
      </p>

      {/* Instructor */}
      {course.instructor && (
        <p className="text-[12px] text-gray-500 mb-5 leading-tight">
          Instructor: {course.instructor}
        </p>
      )}

      {/* Enrollment progress bar */}
      <div className="mt-auto">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${enrollPct}%` }}
          />
        </div>

        {/* Seats and Dates */}
        <div className="flex justify-between items-center text-[11px] font-medium text-gray-500 mb-4">
          <span className={isFull ? 'text-red-600 font-bold' : ''}>
            {course.enrolledCount}/{course.capacity ?? 50} seats {isFull && 'Full'}
          </span>
          <span>Starts: {new Date(course.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} {course.durationMonths && `Ends: ${new Date(new Date(course.startDate).setMonth(new Date(course.startDate).getMonth() + course.durationMonths)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}</span>
        </div>

        {/* View Details button (Standard Width) */}
        <div className="flex justify-end border-t border-gray-100 pt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(course) }}
            className="flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-lg bg-gradient-to-b from-blue-600 to-blue-700 text-white text-[11px] font-bold hover:from-blue-500 hover:to-blue-600 hover:shadow-md hover:shadow-blue-900/30 hover:-translate-y-0.5 border border-blue-700/50 active:scale-[0.98] transition-all duration-200"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
