'use client'

import { useState, useEffect } from 'react'
import { X, Users } from 'lucide-react'
import type { Course, CourseType } from '@/types/admin'

interface AddCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (course: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => void
  editingCourse?: Course | null
}

const courseTypes: CourseType[] = [
  'IELTS Premium', 'IELTS Crash', 'IELTS Intense', 'IELTS Elementary', 'IELTS Mock Test',
  'Basic English', 'GRE Premium', 'TOEFL Premium', 'PTE Premium',
]

const inputCls = "w-full h-10 px-3 border border-[#00000F]/[0.10] rounded-xl focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] text-[13px] font-medium text-[#00000F] placeholder:text-[#00000F]/30 bg-white outline-none transition-all"
const labelCls = "block text-[10.5px] font-bold text-[#00000F]/45 uppercase tracking-widest mb-1.5"

export default function AddCourseModal({ isOpen, onClose, onSubmit, editingCourse }: AddCourseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    testType: '' as CourseType | '',
    instructor: '',
    capacity: 50,
    enrolledCount: 0,
    durationMonths: 3,
    schedule: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    price: 0,
    currency: 'BDT',
    syllabus: [] as string[],
    isActive: true
  })

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        name: editingCourse.name || '',
        testType: editingCourse.testType || '',
        instructor: editingCourse.instructor || '',
        capacity: editingCourse.capacity || 50,
        enrolledCount: editingCourse.enrolledCount || 0,
        durationMonths: editingCourse.durationMonths || 3,
        schedule: editingCourse.schedule || '',
        description: editingCourse.description || '',
        startDate: editingCourse.startDate ? editingCourse.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        price: editingCourse.price || 0,
        currency: editingCourse.currency || 'BDT',
        syllabus: editingCourse.syllabus || [],
        isActive: editingCourse.isActive !== undefined ? editingCourse.isActive : true
      })
    } else {
      setFormData({
        name: '',
        testType: '',
        instructor: '',
        capacity: 50,
        enrolledCount: 0,
        durationMonths: 3,
        schedule: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        price: 0,
        currency: 'BDT',
        syllabus: [],
        isActive: true
      })
    }
  }, [editingCourse, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as Omit<Course, '_id' | 'createdAt' | 'updatedAt'>)
  }

  const enrollPct = formData.capacity > 0
    ? Math.min(100, Math.round((formData.enrolledCount / formData.capacity) * 100))
    : 0

  const set = (field: string, val: any) => setFormData(prev => ({ ...prev, [field]: val }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-[0_24px_64px_rgba(0,0,15,0.18)] border border-[#00000F]/[0.07] overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#00000F]/[0.06] flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-[#00000F] tracking-tight">
              {editingCourse ? 'Edit Course' : 'Add Course'}
            </h2>
            <p className="text-[11.5px] text-[#00000F]/40 font-medium mt-0.5">
              {editingCourse ? 'Update batch details.' : 'Fill in the details to create a new batch.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#00000F]/[0.05] hover:bg-[#00000F]/10 text-[#00000F]/40 hover:text-[#00000F] transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5 max-h-[75vh] overflow-y-auto">

          {/* Batch No & Course */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Batch No</label>
              <input
                type="text"
                placeholder="e.g. 3"
                value={formData.name}
                onChange={(e) => set('name', e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Course</label>
              <select
                value={formData.testType}
                onChange={(e) => set('testType', e.target.value as CourseType)}
                className={inputCls}
                required
              >
                <option value="">Select type</option>
                {courseTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Instructor */}
          <div>
            <label className={labelCls}>Instructor</label>
            <input
              type="text"
              placeholder="Instructor name"
              value={formData.instructor}
              onChange={(e) => set('instructor', e.target.value)}
              className={inputCls}
              required
            />
          </div>

          {/* Enrolment & Capacity */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <label className={labelCls}>Total Enrolment</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={formData.enrolledCount === 0 ? '' : formData.enrolledCount}
                  onChange={(e) => set('enrolledCount', parseInt(e.target.value) || 0)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Capacity</label>
                <input
                  type="number"
                  min={1}
                  placeholder="50"
                  value={formData.capacity === 0 ? '' : formData.capacity}
                  onChange={(e) => set('capacity', parseInt(e.target.value) || 50)}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Live progress preview */}
            <div className="bg-[#FACE39]/[0.06] rounded-xl px-3.5 py-2.5 border border-[#FACE39]/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#00000F]/35" />
                  <span className="text-[11px] text-[#00000F]/50 font-semibold">Enrollment Preview</span>
                </div>
                <span className="text-[11px] font-bold text-[#00000F]">
                  {formData.enrolledCount} / {formData.capacity}
                  <span className="text-[#FACE39] ml-1">({enrollPct}%)</span>
                </span>
              </div>
              <div className="h-1.5 bg-[#00000F]/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FACE39] rounded-full transition-all duration-300"
                  style={{ width: `${enrollPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Duration (Months)</label>
              <input
                type="number"
                min={1}
                placeholder="3"
                value={formData.durationMonths === 0 ? '' : formData.durationMonths}
                onChange={(e) => set('durationMonths', parseInt(e.target.value) || 0)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Price (BDT)</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={formData.price === 0 ? '' : formData.price}
                onChange={(e) => set('price', parseInt(e.target.value) || 0)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Class Time */}
          <div>
            <label className={labelCls}>Class Time</label>
            <input
              type="text"
              placeholder="e.g., 10:00 AM - 12:00 PM"
              value={formData.schedule}
              onChange={(e) => set('schedule', e.target.value)}
              className={inputCls}
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-[#00000F]/[0.10] rounded-xl text-[13px] font-semibold text-[#00000F]/55 hover:bg-[#00000F]/[0.04] hover:text-[#00000F] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-[#FACE39] rounded-xl text-[13px] font-bold text-[#00000F] hover:bg-[#FACE39]/90 hover:shadow-[0_4px_16px_rgba(250,206,57,0.40)] active:scale-[0.98] transition-all duration-200"
            >
              {editingCourse ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
