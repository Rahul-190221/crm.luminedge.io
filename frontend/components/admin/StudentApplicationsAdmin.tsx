'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { getAllApplications, assignStaff, updateApplicationStatus } from '@/lib/api/applications'
import type { Application } from '@/types/student'

const STAGES = [
  'Draft', 'Submitted', 'Under Review', 'University Applied', 'Offer Received',
  'Accepted', 'Tuition Paid', 'COE Received', 'Visa Applied', 'Visa Granted',
]

function statusBadge(status: string) {
  const map: Record<string, string> = {
    'Visa Granted': 'text-green-600 bg-green-50',
    'Under Review': 'text-blue-600 bg-blue-50',
    'Submitted': 'text-blue-600 bg-blue-50',
    'Rejected': 'text-red-500 bg-red-50',
  }
  return map[status] || 'text-gray-600 bg-gray-100'
}

export default function StudentApplicationsAdmin() {
  const [applications, setApplications] = useState<Application[]>([])
  const [selected, setSelected] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<any[]>([])
  const [assign, setAssign] = useState({ assignedBDM: '' })
  const [saving, setSaving] = useState(false)

  const token = Cookies.get('accessToken') || localStorage.getItem('accessToken') || ''

  useEffect(() => {
    load()
    // Load staff list for assign dropdowns
    fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStaff(d.users || d || []))
      .catch(() => {})
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getAllApplications(token)
      setApplications(data.applications || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign() {
    if (!selected) return
    setSaving(true)
    try {
      await assignStaff(token, selected._id, assign)
      load()
      setSelected(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status: string) {
    if (!selected) return
    await updateApplicationStatus(token, selected._id, status)
    load()
    setSelected(null)
  }

  const selectCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-blue-400 transition bg-white"

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-black text-[#00000F]">Student Applications</h2>

      {selected && (
        <div className="rounded-2xl border border-blue-200/50 bg-white p-6 space-y-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-black text-[#00000F]">{(selected.studentId as any).name || 'Student'}</h3>
              <p className="text-xs text-[#00000F]/50">{selected.serviceType} · {selected.status}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-[#00000F]/40 hover:text-[#00000F]">✕ Close</button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#00000F]/40 mb-1 uppercase">BDM</label>
              <select className={selectCls} value={assign.assignedBDM}
                onChange={e => setAssign({ assignedBDM: e.target.value })}>
                <option value="">Select Staff</option>
                {staff.map((s: any) => <option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAssign} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Assign Staff'}
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-bold text-[#00000F]/40 mb-2 uppercase">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STAGES.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                    selected.status === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-[#00000F]/60 hover:border-blue-400/50'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Student', 'Service', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#00000F]/40 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[#00000F]">{(app.studentId as any).name || '—'}</p>
                    <p className="text-xs text-[#00000F]/40">{(app.studentId as any).email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#00000F]/60">{app.serviceType}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(app.status)}`}>{app.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#00000F]/40">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(app); setAssign({ assignedBDM: '' }) }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                      Manage →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
