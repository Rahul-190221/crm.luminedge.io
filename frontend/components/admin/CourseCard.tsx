'use client'

import { Clock, Users, CreditCard, BookOpen, ChevronRight } from 'lucide-react'
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

  return (
    <div className="group bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_8px_rgba(0,0,15,0.05)] hover:shadow-[0_8px_28px_rgba(250,206,57,0.13)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">

      {/* Brand accent bar */}
      <div className="h-[3px] w-full bg-[#FACE39]" />

      <div className="p-4 flex flex-col flex-1">

        {/* Header row: badge + toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-[#FACE39]/15 text-[#00000F] border border-[#FACE39]/25 tracking-wide">
            {course.testType}
          </span>

          <div className="flex items-center gap-2">
            {onToggleActive && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleActive(course) }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  course.isActive ? 'bg-[#22C55E]' : 'bg-[#00000F]/20'
                }`}
                title={course.isActive ? 'Click to deactivate' : 'Click to activate'}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                    course.isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
            <span className={`text-[11px] font-bold ${course.isActive ? 'text-[#16A34A]' : 'text-[#00000F]/30'}`}>
              {course.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Price */}
        {course.price > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-[#00000F]/30" />
            <span className="text-[13px] font-bold text-[#00000F]">
              {course.price.toLocaleString()}
              <span className="text-[11px] font-semibold text-[#00000F]/35 ml-1">{course.currency}</span>
            </span>
          </div>
        )}

        {/* Batch name */}
        <h3 className="text-[18px] font-extrabold text-[#00000F] mb-1 leading-tight tracking-tight">
          Batch {course.name}
        </h3>

        {/* Instructor + schedule */}
        {course.instructor && (
          <p className="text-[12px] text-[#00000F]/45 mb-3 leading-snug">
            <span className="font-semibold text-[#00000F]/65">{course.instructor}</span>
            {course.schedule && <span className="ml-1 text-[#00000F]/40">· {course.schedule}</span>}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#00000F]/45 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#00000F]/30" />
            <span>{course.durationMonths} mo</span>
          </div>
          <span className="w-px h-3 bg-[#00000F]/10" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#00000F]/45 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#00000F]/30" />
            <span>{course.enrolledCount} enrolled</span>
          </div>
          <span className="w-px h-3 bg-[#00000F]/10" />
          <div className="flex items-center gap-1.5 text-[11px] text-[#00000F]/45 font-medium">
            <Users className="w-3.5 h-3.5 text-[#00000F]/30" />
            <span>Cap {course.capacity ?? 50}</span>
          </div>
        </div>

        {/* Enrollment progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] text-[#00000F]/35 font-medium">Enrollment</span>
            <span className="text-[12px] font-bold text-[#00000F]">{enrollPct}%</span>
          </div>
          <div className="h-1.5 bg-[#00000F]/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FACE39] transition-all duration-500"
              style={{ width: `${enrollPct}%` }}
            />
          </div>
        </div>

        {/* View Details button */}
        <button
          onClick={() => onViewDetails(course)}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00000F] text-[#FACE39] text-[13px] font-bold hover:bg-[#00000F]/85 hover:shadow-[0_4px_16px_rgba(0,0,15,0.2)] active:scale-[0.98] transition-all duration-200"
        >
          View Details
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
