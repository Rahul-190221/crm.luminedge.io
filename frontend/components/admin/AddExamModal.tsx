'use client'

import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Exam, TestType, ExamType } from '@/types/admin'

interface AddExamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (exam: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>) => void
  onDelete?: (exam: Exam) => void
  editingExam?: Exam | null
}

const examTypes: ExamType[] = ['Computer-Based', 'Paper-Based']

export default function AddExamModal({ isOpen, onClose, onSubmit, onDelete, editingExam }: AddExamModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    examType: '' as ExamType | '',
    testType: 'IELTS' as TestType,
    examDate: '',
    examTime: '',
    venue: '',
    registrationDeadline: '',
    fee: 0,
    currency: 'BDT',
    totalSlots: 0,
    availableSlots: 0,
    isActive: true
  })

  useEffect(() => {
    if (editingExam) {
      setFormData({
        name: editingExam.name,
        examType: editingExam.examType,
        testType: editingExam.testType,
        examDate: editingExam.examDate.split('T')[0],
        examTime: editingExam.examTime,
        venue: editingExam.venue,
        registrationDeadline: editingExam.registrationDeadline.split('T')[0],
        fee: editingExam.fee,
        currency: editingExam.currency,
        totalSlots: editingExam.totalSlots,
        availableSlots: editingExam.availableSlots,
        isActive: editingExam.isActive
      })
    } else {
      setFormData({
        name: '',
        examType: '',
        testType: 'IELTS',
        examDate: '',
        examTime: '',
        venue: '',
        registrationDeadline: '',
        fee: 0,
        currency: 'BDT',
        totalSlots: 0,
        availableSlots: 0,
        isActive: true
      })
    }
  }, [editingExam, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingExam ? 'Edit Exam Registration' : 'Add New Exam Registration'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {editingExam
                ? 'Update the exam registration details and availability.'
                : 'Create a new exam registration with details and availability.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Exam Name + Exam Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., IELTS Academic"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type <span className="text-red-500">*</span></label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value as ExamType })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm bg-white"
                required
              >
                <option value="">Select type</option>
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Date + Exam Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date <span className="text-red-500">*</span></label>
              <input
                type="date" min={new Date().toISOString().split('T')[0]}
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Time</label>
              <input
                type="text"
                placeholder="e.g., 09:00 AM"
                value={formData.examTime}
                onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., British Council, Dhaka"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
              required
            />
          </div>

          {/* Registration Deadline + Registration Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
              <input
                type="date" min={new Date().toISOString().split('T')[0]}
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee</label>
              <input
                type="text"
                placeholder="e.g., BDT 21,000"
                value={formData.fee > 0 ? `BDT ${formData.fee.toLocaleString()}` : ''}
                onChange={(e) => {
                  const num = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                  setFormData({ ...formData, fee: num })
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Total Slots + Available Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
              <input
                type="number"
                min="0"
                value={formData.totalSlots}
                onChange={(e) => {
                  const total = parseInt(e.target.value) || 0
                  setFormData({
                    ...formData,
                    totalSlots: total,
                    availableSlots: editingExam ? formData.availableSlots : total
                  })
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
              <input
                type="number"
                min="0"
                max={formData.totalSlots}
                value={formData.availableSlots}
                onChange={(e) => setFormData({ ...formData, availableSlots: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400/40 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {editingExam && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(editingExam)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gray-900 rounded-lg text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              {editingExam ? 'Save Changes' : 'Add Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
