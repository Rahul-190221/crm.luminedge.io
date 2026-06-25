'use client'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { getStudentDocuments, reviewDocument, requestDocument } from '@/lib/api/documents'
import { API_URL } from '@/lib/api/base'
import type { StudentDocument, DocumentStatus } from '@/types/student'
import { FileText, Download, Plus } from 'lucide-react'

const DOC_TYPES = [
  'Passport', 'National ID', 'Birth Certificate', 'Transcript', 'Certificate',
  'Recommendation Letter', 'SOP', 'LOR', 'CV', 'Bank Statement',
  'Sponsor Documents', 'Visa Form', 'Medical Report', 'Police Clearance', 'Other',
]

const STATUS_OPTIONS: DocumentStatus[] = ['Uploaded', 'Under Review', 'Approved', 'Rejected', 'Revision Requested']

function statusBadge(s: DocumentStatus) {
  const m: Record<string, string> = {
    Approved: 'text-green-600 bg-green-50',
    Rejected: 'text-red-500 bg-red-50',
    Uploaded: 'text-blue-600 bg-blue-50',
    'Under Review': 'text-purple-600 bg-purple-50',
    'Revision Requested': 'text-blue-600 bg-blue-50',
    Requested: 'text-gray-600 bg-gray-100',
  }
  return m[s] || 'text-gray-600 bg-gray-100'
}

export default function StudentDocumentsAdmin() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [docs, setDocs] = useState<StudentDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [reqType, setReqType] = useState(DOC_TYPES[0])
  const [reqNote, setReqNote] = useState('')

  const token = Cookies.get('accessToken') || localStorage.getItem('accessToken') || ''

  useEffect(() => {
    fetch('/api/student/students', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setStudents(d.students || []))
      .catch(() => {})
  }, [])

  async function loadDocs(sid: string) {
    setLoading(true)
    setSelectedStudent(sid)
    try {
      const data = await getStudentDocuments(token, sid)
      setDocs(data.documents || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(docId: string, status: DocumentStatus, reviewNote?: string) {
    await reviewDocument(token, docId, status, reviewNote)
    if (selectedStudent) loadDocs(selectedStudent)
  }

  async function handleRequest() {
    if (!selectedStudent) return
    await requestDocument(token, { studentId: selectedStudent, documentType: reqType, requestNote: reqNote })
    setShowRequest(false)
    setReqNote('')
    loadDocs(selectedStudent)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#00000F]">Documents Review</h2>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-blue-400 transition w-48"
            value={selectedStudent} onChange={e => loadDocs(e.target.value)}>
            <option value="">Select student</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          {selectedStudent && (
            <button onClick={() => setShowRequest(true)}
              className="flex items-center gap-1.5 text-xs font-black text-white bg-blue-600 px-3 py-2 rounded-xl hover:bg-blue-700 transition">
              <Plus size={12} /> Request Doc
            </button>
          )}
        </div>
      </div>

      {showRequest && (
        <div className="rounded-2xl border border-blue-200/50 bg-white p-5 space-y-3">
          <h3 className="text-sm font-black text-[#00000F]">Request Document</h3>
          <div>
            <label className="block text-xs font-bold text-[#00000F]/50 mb-1 uppercase">Document Type</label>
            <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-blue-400 transition"
              value={reqType} onChange={e => setReqType(e.target.value)}>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#00000F]/50 mb-1 uppercase">Note to Student</label>
            <input className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-blue-400 transition"
              value={reqNote} onChange={e => setReqNote(e.target.value)} placeholder="Why this document is needed..." />
          </div>
          <div className="flex gap-2">
            <button onClick={handleRequest}
              className="px-4 py-2 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition">
              Send Request
            </button>
            <button onClick={() => setShowRequest(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#00000F]/50 border border-gray-200 hover:border-gray-300 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : docs.length > 0 ? (
        <div className="space-y-3">
          {docs.map(doc => (
            <div key={doc._id} className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-600" />
                  <p className="text-sm font-bold text-[#00000F]">{doc.documentType}</p>
                  {doc.originalName && (
                    <span className="text-xs text-[#00000F]/40">{doc.originalName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(doc.status)}`}>{doc.status}</span>
                  {doc.filePath && (
                    <a
                      href={doc.filePath.startsWith('http') ? doc.filePath : `${API_URL}${doc.filePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition"
                    >
                      <Download size={12} />
                    </a>
                  )}
                </div>
              </div>
              {doc.status === 'Uploaded' || doc.status === 'Under Review' ? (
                <div className="flex gap-2 mt-3">
                  {(['Under Review', 'Approved', 'Rejected', 'Revision Requested'] as DocumentStatus[]).map(s => (
                    <button key={s} onClick={() => handleReview(doc._id, s)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${statusBadge(s)}`}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
              {doc.reviewNote && (
                <p className="text-xs text-[#00000F]/40 mt-2">{doc.reviewNote}</p>
              )}
            </div>
          ))}
        </div>
      ) : selectedStudent ? (
        <div className="text-center py-10 text-[#00000F]/40">
          <p className="text-sm font-medium">No documents for this student yet</p>
        </div>
      ) : (
        <div className="text-center py-12 text-[#00000F]/40">
          <p className="text-sm font-medium">Select a student to view documents</p>
        </div>
      )}
    </div>
  )
}
