'use client'

import { useState, useEffect, useMemo } from 'react'
import { Pencil, X, Plus, Trash2, SlidersHorizontal } from 'lucide-react'
import MockTestScheduleTable from './MockTestScheduleTable'
import { getAvailableSchedulesFromLuminedge, getMockTestPackages, updateMockTestPackage, seedMockTestPackages } from '@/lib/api/mockTests'
import type { LuminedgeSchedule, MockTestSchedule, FilterState, ExamType } from '@/types/admin'

interface MockTestPackage {
  testType: string
  borderColor: string
  bgColor: string
  textColor: string
  features: string[]
  pricing: { testCount: number; fee: number }[]
}

const initialMockTestPackages: MockTestPackage[] = [
  {
    testType: 'IELTS',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    features: ['Flexible mock test schedule', 'Real exam experience', 'Official test standard question', 'Result published in quick time', 'Detailed mock feedback', 'Wireless headphones'],
    pricing: [{ testCount: 1, fee: 1550 }, { testCount: 3, fee: 3000 }, { testCount: 5, fee: 4500 }]
  },
  {
    testType: 'GRE',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    features: ['Flexible mock test schedule', 'Real exam experience', 'Official test standard question', 'Result published in quick time', 'Detailed mock feedback', 'Wireless headphones'],
    pricing: [{ testCount: 1, fee: 2000 }, { testCount: 3, fee: 4000 }, { testCount: 5, fee: 6000 }]
  },
  {
    testType: 'PTE',
    borderColor: 'border-l-blue-800',
    bgColor: 'bg-blue-800',
    textColor: 'text-blue-200',
    features: ['Flexible mock test schedule', 'Real exam experience', 'Official test standard question', 'Result published in quick time', 'Detailed mock feedback', 'Wireless headphones'],
    pricing: [{ testCount: 1, fee: 1750 }, { testCount: 3, fee: 3500 }, { testCount: 5, fee: 5000 }]
  },
  {
    testType: 'TOEFL',
    borderColor: 'border-l-blue-800',
    bgColor: 'bg-blue-800',
    textColor: 'text-blue-200',
    features: ['Flexible mock test schedule', 'Real exam experience', 'Official test standard question', 'Result published in quick time', 'Detailed mock feedback', 'Wireless headphones'],
    pricing: [{ testCount: 1, fee: 1800 }, { testCount: 3, fee: 3600 }, { testCount: 5, fee: 5400 }]
  },
]

const courses = [
  { _id: '67337c880794d577cd982b75', name: 'IELTS' },
  { _id: '67337c880794d577cd982b76', name: 'Pearson PTE' },
  { _id: '67337c880794d577cd982b77', name: 'GRE' },
  { _id: '67337c880794d577cd982b78', name: 'TOEFL' },
]

const testTypes: ExamType[] = ['Computer-Based', 'Paper-Based']

function formatTimeTo12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`
}

function transformSchedules(data: LuminedgeSchedule[]): MockTestSchedule[] {
  return data.map((item, index) => {
    const slot = item.timeSlots?.[0]
    const totalSeats = slot ? parseInt(slot.totalSlot, 10) || 0 : 0
    const availableSeats = slot ? Math.max(0, Math.min(slot.slot, totalSeats)) : 0
    const examTime = slot ? `${formatTimeTo12h(slot.startTime)} - ${formatTimeTo12h(slot.endTime)}` : ''
    return {
      _id: item._id,
      listNumber: index + 1,
      name: item.name,
      testType: item.name as MockTestSchedule['testType'],
      examType: (item.testType || 'Computer-Based') as MockTestSchedule['examType'],
      examDate: item.startDate,
      examTime,
      totalSeats,
      availableSeats,
      status: (item.status?.toLowerCase() === 'scheduled' ? 'upcoming' : item.status?.toLowerCase() || 'upcoming') as MockTestSchedule['status'],
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    }
  })
}

const filterSelectCls = "h-9 px-3 border border-[#00000F]/[0.10] rounded-xl text-[12.5px] font-medium text-[#00000F]/70 bg-white focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 outline-none transition-all cursor-pointer"
const editInputCls = "flex-1 h-9 px-3 border border-[#00000F]/10 rounded-xl text-[13px] font-medium text-[#00000F] bg-white focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 outline-none transition-all"

export default function MockTest({ user }: { user?: any }) {
  const isAdmin = user?.role === 'admin'
  const [schedules, setSchedules] = useState<MockTestSchedule[]>([])
  const [packages, setPackages] = useState<MockTestPackage[]>(initialMockTestPackages)
  const [isLoading, setIsLoading] = useState(true)
  const [editingPackage, setEditingPackage] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<MockTestPackage | null>(null)
  const today = new Date().toISOString().split('T')[0]
  const [filters, setFilters] = useState<FilterState>({ testType: 'all', examType: 'all', status: 'upcoming', sortBy: 'date-asc' })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { fetchSchedules(); fetchPackages() }, [])

  const fetchPackages = async () => {
    try {
      const data = await getMockTestPackages()
      if (data && data.length > 0) {
        const styleMap: Record<string, { borderColor: string; bgColor: string; textColor: string }> = {
          'IELTS': { borderColor: 'border-l-blue-500', bgColor: 'bg-blue-600', textColor: 'text-white' },
          'GRE':   { borderColor: 'border-l-blue-500', bgColor: 'bg-blue-600', textColor: 'text-white' },
          'PTE':   { borderColor: 'border-l-blue-800', bgColor: 'bg-blue-800', textColor: 'text-blue-200' },
          'TOEFL': { borderColor: 'border-l-blue-800', bgColor: 'bg-blue-800', textColor: 'text-blue-200' },
        }
        setPackages(data.map((pkg: any) => ({
          ...pkg,
          ...(styleMap[pkg.testType] || { borderColor: 'border-l-blue-500', bgColor: 'bg-blue-600', textColor: 'text-white' })
        })))
      } else {
        await seedMockTestPackages()
        fetchPackages()
      }
    } catch { /* fallback to initial data */ }
  }

  const handleEditPackage   = (pkg: MockTestPackage) => { setEditingPackage(pkg.testType); setEditFormData({ ...pkg, features: [...pkg.features], pricing: pkg.pricing.map(p => ({ ...p })) }) }
  const handleCancelEdit    = () => { setEditingPackage(null); setEditFormData(null) }
  const handleFeatureChange = (i: number, v: string) => { if (!editFormData) return; const f = [...editFormData.features]; f[i] = v; setEditFormData({ ...editFormData, features: f }) }
  const handleAddFeature    = () => { if (!editFormData) return; setEditFormData({ ...editFormData, features: [...editFormData.features, ''] }) }
  const handleRemoveFeature = (i: number) => { if (!editFormData) return; setEditFormData({ ...editFormData, features: editFormData.features.filter((_, idx) => idx !== i) }) }
  const handlePricingChange = (i: number, field: 'testCount' | 'fee', v: number) => { if (!editFormData) return; const p = [...editFormData.pricing]; p[i] = { ...p[i], [field]: v }; setEditFormData({ ...editFormData, pricing: p }) }
  const handleAddPricing    = () => { if (!editFormData) return; setEditFormData({ ...editFormData, pricing: [...editFormData.pricing, { testCount: 1, fee: 0 }] }) }
  const handleRemovePricing = (i: number) => { if (!editFormData) return; setEditFormData({ ...editFormData, pricing: editFormData.pricing.filter((_, idx) => idx !== i) }) }

  const handleSavePackage = async () => {
    if (!editFormData || !editingPackage) return
    setIsSaving(true)
    try {
      await updateMockTestPackage(editingPackage, { features: editFormData.features, pricing: editFormData.pricing })
      setPackages(prev => prev.map(p => p.testType === editingPackage ? editFormData : p))
      setEditingPackage(null); setEditFormData(null)
    } catch { alert('Failed to save package. Please try again.') }
    finally { setIsSaving(false) }
  }

  const fetchSchedules = async () => {
    try {
      const data = await getAvailableSchedulesFromLuminedge()
      setSchedules(transformSchedules(data))
    } catch { setSchedules([]) }
    finally { setIsLoading(false) }
  }

  const filteredSchedules = useMemo(() => {
    let result = [...schedules]
    if (filters.testType && filters.testType !== 'all') result = result.filter(s => s.name.toLowerCase().includes(filters.testType!.toLowerCase()))
    if (filters.examType && filters.examType !== 'all') result = result.filter(s => s.examType === filters.examType)
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'today')    result = result.filter(s => s.examDate === today)
      if (filters.status === 'previous') result = result.filter(s => s.examDate && s.examDate < today)
      if (filters.status === 'upcoming') result = result.filter(s => s.examDate && s.examDate >= today)
    }
    if (filters.dateRange?.start) result = result.filter(s => s.examDate && s.examDate >= filters.dateRange!.start)
    if (filters.sortBy === 'date-asc')  result.sort((a, b) => (a.examDate || '').localeCompare(b.examDate || ''))
    if (filters.sortBy === 'date-desc') result.sort((a, b) => (b.examDate || '').localeCompare(a.examDate || ''))
    if (filters.sortBy === 'name')      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return result.map((s, i) => ({ ...s, listNumber: i + 1 }))
  }, [schedules, filters])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-blue-900" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="-mx-6 -mt-6 mb-4 p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Mock Test</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Browse mock test details and available schedules</p>
        </div>
      </div>

      {/* ── Packages Section ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#00000F]/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-[3px] h-4 bg-blue-500 rounded-full" />
            <div>
              <h2 className="text-[13px] font-bold text-[#00000F] tracking-tight">Mock Test Packages</h2>
              <p className="text-[11px] text-[#00000F]/40 font-medium mt-0.5">Available mock test packages with pricing details</p>
            </div>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.testType}
              className={`rounded-xl border border-[#00000F]/[0.07] border-l-4 ${pkg.borderColor} overflow-hidden shadow-[0_1px_6px_rgba(0,0,15,0.04)] relative`}
            >
              {/* Admin edit button */}
              {isAdmin && editingPackage !== pkg.testType && (
                <button
                  onClick={() => handleEditPackage(pkg)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg bg-[#00000F]/[0.04] hover:bg-blue-100 text-[#00000F]/35 hover:text-blue-700 transition-all"
                  title="Edit Package"
                >
                  <Pencil size={13} />
                </button>
              )}

              {editingPackage === pkg.testType && editFormData ? (
                /* ── Edit Mode ── */
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-bold text-[#00000F]">{pkg.testType} Mock Test Packages</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePackage}
                        disabled={isSaving}
                        className="h-8 px-3 bg-blue-600 text-white text-[12px] font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                      >
                        {isSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="h-8 px-3 border border-[#00000F]/10 text-[#00000F]/60 text-[12px] font-semibold rounded-xl hover:bg-[#00000F]/[0.04] transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10.5px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-2">Features</p>
                    {editFormData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1.5">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(idx, e.target.value)}
                          className={editInputCls}
                        />
                        <button onClick={() => handleRemoveFeature(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#00000F]/30 hover:text-red-500 hover:bg-red-50 transition-all">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    <button onClick={handleAddFeature} className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-800 mt-1.5 transition-colors">
                      <Plus size={13} /> Add Feature
                    </button>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-2">Pricing</p>
                    {editFormData.pricing.map((price, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1.5">
                        <input
                          type="number"
                          value={price.testCount}
                          onChange={(e) => handlePricingChange(idx, 'testCount', parseInt(e.target.value) || 0)}
                          className="w-16 h-9 px-2 border border-[#00000F]/10 rounded-xl text-[13px] font-medium text-[#00000F] bg-white focus:ring-2 focus:ring-blue-400/40 outline-none text-center"
                        />
                        <span className="text-[12px] text-[#00000F]/40 font-medium">tests</span>
                        <input
                          type="number"
                          value={price.fee}
                          onChange={(e) => handlePricingChange(idx, 'fee', parseInt(e.target.value) || 0)}
                          className="w-24 h-9 px-2 border border-[#00000F]/10 rounded-xl text-[13px] font-medium text-[#00000F] bg-white focus:ring-2 focus:ring-blue-400/40 outline-none"
                        />
                        <span className="text-[12px] text-[#00000F]/40 font-medium">BDT</span>
                        <button onClick={() => handleRemovePricing(idx)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#00000F]/30 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <button onClick={handleAddPricing} className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-800 mt-1.5 transition-colors">
                      <Plus size={13} /> Add Pricing Tier
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View Mode ── */
                <>
                  <div className="p-4">
                    <h3 className="text-[14px] font-bold text-[#00000F] mb-1 tracking-tight">{pkg.testType} Mock Test Packages</h3>
                    <p className="text-[11.5px] text-[#00000F]/40 font-medium mb-3">We have paper-based and computer-delivered mock tests.</p>
                    <ul className="space-y-1.5 mb-1">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-[12.5px] text-[#00000F]/65 font-medium">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing table */}
                  <table className="w-full">
                    <thead>
                      <tr className={pkg.bgColor}>
                        <th className={`px-4 py-2.5 text-left text-[11.5px] font-bold tracking-wide ${pkg.textColor}`}>No. of Mock Test</th>
                        <th className={`px-4 py-2.5 text-left text-[11.5px] font-bold tracking-wide ${pkg.textColor}`}>Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00000F]/[0.05]">
                      {pkg.pricing.map((price, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-[#00000F]/[0.02]' : ''}>
                          <td className="px-4 py-2.5 text-[12.5px] text-[#00000F]/65 font-medium">{price.testCount} Mock Test Fee</td>
                          <td className="px-4 py-2.5 text-[12.5px] text-[#00000F] font-bold">BDT {price.fee.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Schedule Filters ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-2 px-0.5">Filter schedules</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={filters.testType || 'all'}
              onChange={(e) => setFilters({ ...filters, testType: e.target.value as any })}
              className={filterSelectCls}
            >
              <option value="all">All Courses</option>
              {courses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <select
            value={filters.examType || 'all'}
            onChange={(e) => setFilters({ ...filters, examType: e.target.value as any })}
            className={filterSelectCls}
          >
            <option value="all">All Types</option>
            {testTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={filters.sortBy || 'date-asc'}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className={filterSelectCls}
          >
            <option value="date-asc">Date ↑</option>
            <option value="date-desc">Date ↓</option>
            <option value="name">Name</option>
          </select>

          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={filterSelectCls}
          >
            <option value="upcoming">Upcoming</option>
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="previous">Previous</option>
          </select>

          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={filters.dateRange?.start || ''}
            onChange={(e) => setFilters({ ...filters, dateRange: { start: e.target.value, end: filters.dateRange?.end || '' } })}
            className={`${filterSelectCls} w-auto`}
          />
        </div>
      </div>

      {/* ── Schedules Table ─────────────────────────────────────────────────── */}
      <MockTestScheduleTable
        schedules={filteredSchedules}
        totalCount={schedules.length}
      />

    </div>
  )
}
