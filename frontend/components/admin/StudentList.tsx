'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Search, User } from 'lucide-react'

interface Student {
  _id: string
  name: string
  email: string
  phone?: string
  serviceCategory?: string
  onboardingComplete: boolean
  assignedBDM?: { name: string }
  createdAt: string
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken')
    fetch('/api/student/students', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setStudents(d.students || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#00000F]">All Students</h2>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
          <Search size={14} className="text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="text-sm outline-none bg-transparent text-[#00000F] w-48"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Student', 'Service', 'BDM', 'Profile', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#00000F]/40 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-black text-blue-600">{s.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#00000F]">{s.name}</p>
                        <p className="text-xs text-[#00000F]/40">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#00000F]/60">{s.serviceCategory || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#00000F]/60">{s.assignedBDM?.name || 'Unassigned'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.onboardingComplete ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                      {s.onboardingComplete ? 'Complete' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#00000F]/40">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-[#00000F]/40">
              <User size={24} className="mx-auto mb-2" />
              <p className="text-sm font-medium">No students found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
