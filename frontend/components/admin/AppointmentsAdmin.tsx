'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { getAllAppointments, updateAppointment } from '@/lib/api/appointments'
import type { Appointment } from '@/types/student'
import { Calendar } from 'lucide-react'

function statusBadge(s: string) {
  const m: Record<string, string> = {
    Scheduled: 'text-blue-600 bg-blue-50',
    Completed: 'text-green-600 bg-green-50',
    Cancelled: 'text-red-500 bg-red-50',
    Rescheduled: 'text-blue-600 bg-blue-50',
  }
  return m[s] || 'text-gray-500 bg-gray-100'
}

export default function AppointmentsAdmin() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')

  const token = Cookies.get('accessToken') || localStorage.getItem('accessToken') || ''

  async function load() {
    setLoading(true)
    try {
      const data = await getAllAppointments(token)
      setAppointments(data.appointments || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleAction(id: string, action: 'Completed' | 'Cancelled') {
    await updateAppointment(token, id, { status: action })
    load()
  }

  async function handleReschedule(id: string) {
    if (!newDate) return
    await updateAppointment(token, id, { status: 'Rescheduled', scheduledAt: newDate })
    setRescheduleId(null)
    setNewDate('')
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Calendar size={18} className="text-blue-600" />
        <h2 className="text-lg font-black text-[#00000F]">Appointments</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(a => (
            <div key={a._id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-[#00000F]">{a.type}</p>
                  <p className="text-xs text-[#00000F]/50 mt-0.5">
                    Student: {(a.studentId as any).name || '—'} · {new Date(a.scheduledAt).toLocaleString()}
                  </p>
                  {a.notes && <p className="text-xs text-[#00000F]/40 mt-0.5">{a.notes}</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>{a.status}</span>
              </div>

              {a.status === 'Scheduled' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleAction(a._id, 'Completed')}
                    className="text-xs font-bold text-green-600 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition">
                    Mark Complete
                  </button>
                  <button onClick={() => setRescheduleId(rescheduleId === a._id ? null : a._id)}
                    className="text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                    Reschedule
                  </button>
                  <button onClick={() => handleAction(a._id, 'Cancelled')}
                    className="text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                    Cancel
                  </button>
                </div>
              )}

              {rescheduleId === a._id && (
                <div className="flex gap-2 mt-2">
                  <input type="date" min={new Date().toISOString().slice(0, 10)} value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-blue-400 transition" />
                  <button onClick={() => handleReschedule(a._id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition">
                    Confirm
                  </button>
                </div>
              )}
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="text-center py-10 text-[#00000F]/40">
              <p className="text-sm font-medium">No appointments yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
