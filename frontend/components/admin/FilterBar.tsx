'use client'

import { X } from 'lucide-react'
import type { TestType, CourseType, ExamType, FilterState } from '@/types/admin'

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  showTestType?: boolean
  showExamType?: boolean
  showStatus?: boolean
  showSort?: boolean
  showDatePicker?: boolean
  statusOptions?: { value: string; label: string }[]
  testTypeOptions?: string[]
}

const testTypes: TestType[] = ['IELTS', 'PTE', 'GRE', 'TOEFL']
const examTypes: ExamType[] = ['Computer-Based', 'Paper-Based']

export default function FilterBar({
  filters,
  onFilterChange,
  showTestType = true,
  showExamType = false,
  showStatus = true,
  showSort = true,
  showDatePicker = false,
  testTypeOptions,
  statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' }
  ]
}: FilterBarProps) {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && key !== 'sortBy' && key !== 'dateRange'
  )

  const clearFilter = (key: string) => {
    onFilterChange({ ...filters, [key]: 'all' })
  }

  const clearAllFilters = () => {
    onFilterChange({
      testType: 'all',
      examType: 'all',
      status: 'all',
      sortBy: filters.sortBy
    })
  }

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 space-y-3">
      {/* Filter Dropdowns */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
        <span className="col-span-2 sm:col-span-1 text-sm font-medium text-gray-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter by
        </span>

        {showTestType && (
          <select
            value={filters.testType || 'all'}
            onChange={(e) => onFilterChange({ ...filters, testType: e.target.value as TestType | CourseType | 'all' })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {(testTypeOptions ?? testTypes).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        )}

        {showExamType && (
          <select
            value={filters.examType || 'all'}
            onChange={(e) => onFilterChange({ ...filters, examType: e.target.value as ExamType | 'all' })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
          >
            <option value="all">All Exam Types</option>
            {examTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        )}

        {showSort && (
          <select
            value={filters.sortBy || 'date-asc'}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
          >
            <option value="date-asc">Date ↑</option>
            <option value="date-desc">Date ↓</option>
            <option value="name">Name</option>
          </select>
        )}

        {showStatus && (
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}

        {showDatePicker && (
          <input
            type="date"
            value={filters.dateRange?.start || ''}
            onChange={(e) => onFilterChange({
              ...filters,
              dateRange: { ...filters.dateRange, start: e.target.value, end: filters.dateRange?.end || '' }
            })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
          />
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
            >
              {key}: {value}
              <button onClick={() => clearFilter(key)} className="hover:text-yellow-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
