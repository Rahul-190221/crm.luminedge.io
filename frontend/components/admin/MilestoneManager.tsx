'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { getStudentMilestones, updateMilestone } from '@/lib/api/milestones'
import type { Milestone, MilestoneStatus } from '@/types/student'
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'

const STATUS_OPTIONS: MilestoneStatus[] = ['Pending', 'In Progress', 'Completed', 'Blocked']

const statusColors: Record<MilestoneStatus, string> = {
  Completed: 'text-green-600 bg-green-50',
  'In Progress': 'text-blue-600 bg-blue-50',
  Blocked: 'text-red-500 bg-red-50',
  Pending: 'text-gray-400 bg-gray-50',
}

function MIcon({ s }: { s: MilestoneStatus }) {
  if (s === 'Completed') return <CheckCircle size={14} className="text-green-500" />
  if (s === 'In Progress') return <Clock size={14} className="text-blue-500" />
  if (s === 'Blocked') return <AlertCircle size={14} className="text-red-400" />
  return <Circle size={14} className="text-gray-300" />
}

export default function MilestoneManager() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)

  const token = Cookies.get('accessToken') || localStorage.getItem('accessToken') || ''

  useEffect(() => {
    fetch('/api/student/students', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStudents(d.students || []))
      .catch(() => {})
  }, [])

  async function loadMilestones(sid: string) {
    setLoading(true)
    setSelectedStudent(sid)
    try {
      const data = await getStudentMilestones(token, sid)
      setMilestones(data.milestones || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(milestoneId: string, status: MilestoneStatus) {
    await updateMilestone(token, milestoneId, { status })
    if (selectedStudent) loadMilestones(selectedStudent)
  }

  async function handleNoteChange(milestoneId: string, notes: string) {
    await updateMilestone(token, milestoneId, { status: milestones.find(m => m._id === milestoneId)?.status || 'Pending', notes })
    if (selectedStudent) loadMilestones(selectedStudent)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#00000F]">Milestone Manager</h2>
        <select
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-blue-400 transition w-56"
          value={selectedStudent}
          onChange={e => loadMilestones(e.target.value)}
        >
          <option value="">Select a student</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && milestones.length > 0 && (
        <div className="space-y-3">
          {milestones.map(m => (
            <div key={m._id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0"><MIcon s={m.status} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#00000F]">{m.title}</p>
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-[#00000F]/60 focus:outline-none focus:border-blue-400 transition flex-shrink-0"
                      value={m.status}
                      onChange={e => handleStatusChange(m._id, e.target.value as MilestoneStatus)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="mt-2">
                    <input
                      defaultValue={m.notes || ''}
                      onBlur={e => {
                        if (e.target.value !== (m.notes || '')) {
                          handleNoteChange(m._id, e.target.value)
                        }
                      }}
                      placeholder="Add a note..."
                      className="w-full text-xs px-2 py-1.5 border border-gray-100 rounded-lg text-[#00000F]/60 focus:outline-none focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selectedStudent && milestones.length === 0 && (
        <div className="text-center py-10 text-[#00000F]/40">
          <p className="text-sm font-medium">No milestones for this student yet</p>
        </div>
      )}

      {!selectedStudent && (
        <div className="text-center py-12 text-[#00000F]/40">
          <p className="text-sm font-medium">Select a student to view milestones</p>
        </div>
      )}
    </div>
  )
}
