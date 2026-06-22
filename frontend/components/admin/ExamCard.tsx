'use client'

import { Edit2, Calendar, Clock, MapPin, Timer, CreditCard } from 'lucide-react'
import type { Exam, ExamType } from '@/types/admin'
import { examTypeBadgeColors } from '@/types/admin'

interface ExamCardProps {
  exam: Exam
  onEdit: (exam: Exam) => void
}

export default function ExamCard({ exam, onEdit, user }: ExamCardProps & { user?: any }) {
  const isAdmin = user?.role === 'admin';
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    })
  }

  const getSlotsColor = (available: number, total: number) => {
    const ratio = available / total
    if (ratio <= 0.2) return 'text-red-600'
    if (ratio <= 0.5) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
        {isAdmin && (
          <button
            onClick={() => onEdit(exam)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Exam Type Badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-md ${examTypeBadgeColors[exam.examType as ExamType] || 'bg-gray-100 text-gray-700'
          }`}>
          {exam.examType}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Exam Date</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(exam.examDate)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Exam Time</p>
            <p className="text-sm font-medium text-gray-900">{exam.examTime}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Venue</p>
            <p className="text-sm font-medium text-gray-900">{exam.venue}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Timer className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Registration Deadline</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(exam.registrationDeadline)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-xs text-gray-500">Registration Fee</p>
            <p className="text-sm font-medium text-gray-900">{exam.currency} {exam.fee.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Available Slots */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">Available Slots</span>
        <span className={`text-sm font-semibold ${getSlotsColor(exam.availableSlots, exam.totalSlots)}`}>
          {exam.availableSlots} / {exam.totalSlots}
        </span>
      </div>
    </div>
  )
}
