'use client'

import { X, Clock, Users, User, CalendarDays, CreditCard, Pencil, Trash2, BookOpen } from 'lucide-react'
import type { Course } from '@/types/admin'

interface ViewCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (course: Course) => void
  onDelete: (course: Course) => void
  course: Course | null
  isAdmin?: boolean
}

export default function ViewCourseModal({ isOpen, onClose, onEdit, onDelete, course, isAdmin = false }: ViewCourseModalProps) {
  if (!isOpen || !course) return null

  const enrollPct = course.capacity
    ? Math.min(100, Math.round((course.enrolledCount / course.capacity) * 100))
    : 0

  const fillColor =
    enrollPct >= 90 ? 'bg-red-400' :
    enrollPct >= 60 ? 'bg-amber-400' :
    'bg-[#FACE39]'

  const stats = [
    { icon: Clock,        label: 'Duration',   value: `${course.durationMonths} months` },
    { icon: CreditCard,   label: 'Price',      value: course.price > 0 ? `${course.price.toLocaleString()} ${course.currency}` : 'Free' },
    { icon: User,         label: 'Instructor', value: course.instructor || 'TBA' },
    { icon: CalendarDays, label: 'Schedule',   value: course.schedule || '—' },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#FACE39] text-[#00000F]">
              {course.testType}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
              course.isActive
                ? 'bg-green-50 text-green-600 border border-green-100'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {course.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#00000F] leading-tight">Batch {course.name}</h2>
          {course.instructor && (
            <p className="text-sm text-gray-400 mt-0.5">{course.instructor}</p>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Enrollment card */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FACE39]/20 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-[#00000F]" />
                </div>
                <span className="text-sm font-semibold text-[#00000F]">Enrollment</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-[#00000F]">{course.enrolledCount}</span>
                <span className="text-sm text-gray-400"> / {course.capacity ?? 50}</span>
              </div>
            </div>

            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${fillColor}`}
                style={{ width: `${enrollPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{course.capacity ? course.capacity - course.enrolledCount : 50} seats available</span>
              <span className="font-semibold text-[#00000F]">{enrollPct}% filled</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                <div className="w-7 h-7 rounded-lg bg-[#FACE39]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-[#00000F]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-[#00000F] truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(course)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FACE39] text-sm font-bold text-[#00000F] hover:bg-[#FACE39]/85 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => onDelete(course)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
