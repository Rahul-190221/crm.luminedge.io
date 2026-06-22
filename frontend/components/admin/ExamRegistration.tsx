 'use client'

import { useState, useEffect } from 'react'
import { Plus, RefreshCw, AlertCircle, CalendarX } from 'lucide-react'
import ExamCard from './ExamCard'
import AddExamModal from './AddExamModal'
import FilterBar from './FilterBar'
import { getExams, createExam, updateExam, deleteExam } from '@/lib/api/exams'
import type { Exam, FilterState } from '@/types/admin'


export default function ExamRegistration({ user }: { user?: any }) {
  const isAdmin = user?.role === 'admin';
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    testType: 'all',
    examType: 'all',
    status: 'all',
    sortBy: 'date-asc'
  })

  useEffect(() => {
    fetchExams()
  }, [filters])

  const fetchExams = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const data = await getExams(filters)
      if (!Array.isArray(data)) throw new Error('Unexpected response from server')
      setExams(data)
    } catch (error: any) {
      console.error('Error fetching exams:', error)
      setFetchError(error?.message || 'Failed to load exams. Check your connection.')
      setExams([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExam = async (examData: Omit<Exam, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingExam) {
        await updateExam(editingExam._id, examData)
      } else {
        await createExam(examData)
      }
      fetchExams()
      setIsModalOpen(false)
      setEditingExam(null)
    } catch (error) {
      console.error('Error saving exam:', error)
    }
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setIsModalOpen(true)
  }

  const handleDeleteExam = async (exam: Exam) => {
    if (confirm('Are you sure you want to delete this exam registration?')) {
      try {
        await deleteExam(exam._id)
        fetchExams()
        setIsModalOpen(false)
        setEditingExam(null)
      } catch (error) {
        console.error('Error deleting exam:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#FACE39] border-t-[#00000F] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading exams…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#00000F]/85">Exam Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Browse and manage exam registrations</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingExam(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-[#FACE39] px-4 py-2.5 rounded-lg text-sm font-bold text-[#00000F] hover:bg-[#FACE39]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        showTestType={true}
        showExamType={true}
        showStatus={true}
        showSort={true}
        showDatePicker={true}
        statusOptions={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' }
        ]}
      />

      {/* Error banner */}
      {fetchError && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">{fetchError}</p>
          </div>
          <button
            onClick={fetchExams}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Exam Cards Grid */}
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <ExamCard
              key={exam._id}
              exam={exam}
              onEdit={handleEdit}
              user={user}
            />
          ))}
        </div>
      ) : !fetchError && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#FACE39]/10 rounded-2xl flex items-center justify-center mb-4">
            <CalendarX className="w-8 h-8 text-[#FACE39]" />
          </div>
          <p className="text-base font-bold text-gray-700 mb-1">No exams found</p>
          <p className="text-sm text-gray-400 mb-5">
            {filters.status !== 'all' || filters.testType !== 'all' || filters.examType !== 'all'
              ? 'Try clearing the filters to see all exams.'
              : 'No exam registrations have been added yet.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => { setEditingExam(null); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-[#FACE39] px-4 py-2.5 rounded-xl text-sm font-bold text-[#00000F] hover:bg-[#FACE39]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Exam
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <AddExamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExam(null)
        }}
        onSubmit={handleAddExam}
        onDelete={handleDeleteExam}
        editingExam={editingExam}
      />
    </div>
  )
}
