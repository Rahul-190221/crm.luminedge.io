'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import CourseCard from './CourseCard'
import AddCourseModal from './AddCourseModal'
import ViewCourseModal from './ViewCourseModal'
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/lib/api/courses'
import type { Course, CourseType, FilterState } from '@/types/admin'

const mockCourses: Course[] = [
  {
    _id: '1',
    name: 'IELTS Preparation',
    testType: 'IELTS Premium',
    description: 'Comprehensive IELTS preparation covering all four modules: Listening, Reading, Writing, and Speaking.',
    durationMonths: 3,
    enrolledCount: 45,
    capacity: 50,
    startDate: '2025-11-15',
    price: 15000,
    currency: 'BDT',
    instructor: 'Dr. Sarah Johnson',
    schedule: 'Mon, Wed, Fri - 10:00 AM to 12:00 PM',
    syllabus: ['Listening Module', 'Reading Module', 'Writing Module', 'Speaking Module', 'Mock Tests', 'Practice Sessions'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '2',
    name: 'PTE Academic',
    testType: 'PTE Premium',
    description: 'Complete PTE Academic training with AI-powered practice tests and personalized feedback.',
    durationMonths: 2,
    enrolledCount: 32,
    capacity: 40,
    startDate: '2025-11-20',
    price: 18000,
    currency: 'BDT',
    instructor: 'Mr. James Wilson',
    schedule: 'Tue, Thu - 2:00 PM to 5:00 PM',
    syllabus: ['Speaking & Writing', 'Reading', 'Listening', 'Practice Tests', 'Score Improvement Tips'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '3',
    name: 'GRE Test Prep',
    testType: 'GRE Premium',
    description: 'Advanced GRE preparation focusing on Verbal Reasoning, Quantitative Reasoning, and Analytical Writing.',
    durationMonths: 4,
    enrolledCount: 28,
    capacity: 35,
    startDate: '2025-11-25',
    price: 22000,
    currency: 'BDT',
    instructor: 'Dr. Michael Chen',
    schedule: 'Sat, Sun - 9:00 AM to 1:00 PM',
    syllabus: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing', 'Practice Tests', 'Strategy Sessions'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
  {
    _id: '4',
    name: 'TOEFL iBT Course',
    testType: 'TOEFL Premium',
    description: 'Intensive TOEFL iBT course with mock tests and expert guidance for all test sections.',
    durationMonths: 3,
    enrolledCount: 38,
    capacity: 45,
    startDate: '2025-12-01',
    price: 20000,
    currency: 'BDT',
    instructor: 'Ms. Emily Davis',
    schedule: 'Mon, Wed, Fri - 4:00 PM to 6:00 PM',
    syllabus: ['Reading Section', 'Listening Section', 'Speaking Section', 'Writing Section', 'Integrated Tasks'],
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  },
]

const courseTypes: CourseType[] = [
  'IELTS Premium', 'IELTS Crash', 'IELTS Intense', 'IELTS Elementary', 'IELTS Mock Test',
  'Basic English', 'GRE Premium', 'TOEFL Premium', 'PTE Premium',
]

const selectCls = "h-10 px-3 border border-[#00000F]/[0.10] rounded-xl text-[13px] font-medium text-[#00000F]/70 bg-white focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] outline-none transition-all cursor-pointer appearance-none pr-8"

const CourseDetails: React.FC = () => {
  const isAdmin = true
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterState>({ testType: 'all', sortBy: 'date' })

  useEffect(() => { fetchCourses() }, [filters])

  const fetchCourses = async () => {
    try {
      const data = await getCourses(filters)
      setCourses(data)
    } catch {
      setCourses(mockCourses)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourse = async (courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>) => {
    try {
      if (selectedCourse && isAddModalOpen) {
        await updateCourse(selectedCourse._id, courseData)
      } else {
        await createCourse({ ...courseData, enrolledCount: 0 })
      }
      fetchCourses()
      setIsAddModalOpen(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error saving course:', error)
    }
  }

  const handleViewDetails = (course: Course) => { setSelectedCourse(course); setIsViewModalOpen(true) }
  const handleEdit = (course: Course) => { setSelectedCourse(course); setIsViewModalOpen(false); setIsAddModalOpen(true) }

  const handleToggleActive = async (course: Course) => {
    setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isActive: !c.isActive } : c))
    try {
      await updateCourse(course._id, { isActive: !course.isActive })
    } catch {
      setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isActive: course.isActive } : c))
    }
  }

  const handleDelete = async (course: Course) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(course._id)
        fetchCourses()
        setIsViewModalOpen(false)
        setSelectedCourse(null)
      } catch (error) {
        console.error('Error deleting course:', error)
      }
    }
  }

  const filteredCourses = courses.filter(course =>
    (course.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (course.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#1a56db] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="-mx-6 -mt-6 mb-4 p-4 md:p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Active Batches</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setSelectedCourse(null); setIsAddModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-[12px] rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            New Batch
          </button>
        )}
      </div>



      {/* ── Course Grid ───────────────────────────────────────────────────────── */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 text-[#00000F]/35">
          <p className="text-[13px] font-semibold">No courses found</p>
          <p className="text-[12px] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={handleEdit}
              onViewDetails={handleViewDetails}
              onToggleActive={isAdmin ? handleToggleActive : undefined}
            />
          ))}
        </div>
      )}

      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setSelectedCourse(null) }}
        onSubmit={handleAddCourse}
        editingCourse={selectedCourse}
      />

      <ViewCourseModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedCourse(null) }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        course={selectedCourse}
        isAdmin={isAdmin}
      />

      {/* ── Floating Action Button ────────────────────────────────────────────── */}
      {isAdmin && (
        <button
          onClick={() => { setSelectedCourse(null); setIsAddModalOpen(true) }}
          className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:bg-blue-700 items-center justify-center hover:-translate-y-1 active:scale-95 transition-all z-30"
          title="New Batch"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}

export default CourseDetails
