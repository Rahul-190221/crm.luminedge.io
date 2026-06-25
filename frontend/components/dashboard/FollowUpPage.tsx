'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Phone,
  MessageSquare,
  Check,
  Plus,
  MessageCircle,
  Banknote,
  Clock,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { getLeads, addFollowUp } from '@/lib/api/leads'
import { useSocket } from '@/components/providers/SocketProvider'
import type { Lead } from '@/types/admin'
import { formatTimeAgo, formatShortDate } from '@/lib/helpers/format'

// ── Types ────────────────────────────────────────────────────────────────────

type FollowUpType = 'Call' | 'WhatsApp' | 'Trial Reminder' | 'Payment' | 'Other'

type DisplayRow = {
  id:             string
  name:           string
  phone:          string
  type:           FollowUpType
  courseInterest: string
  dueDate:        string
  dueStatus:      'overdue' | 'today' | 'upcoming'
  note:           string
}

type Filter = 'All' | 'Overdue' | 'Today' | 'Upcoming'

// ── Helpers ──────────────────────────────────────────────────────────────────

function dueStatus(date: string): 'overdue' | 'today' | 'upcoming' {
  const now = new Date()
  const d   = new Date(date)
  if (Number.isNaN(d.getTime())) return 'upcoming'
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999)
  if (d < todayStart) return 'overdue'
  if (d <= todayEnd)  return 'today'
  return 'upcoming'
}

function leadsToRows(leads: Lead[]): DisplayRow[] {
  const rows: DisplayRow[] = []
  for (const lead of leads) {
    const lastFU  = lead.followUps?.at(-1)
    const nextDate = lastFU?.nextFollowUpDate
    if (!nextDate) continue
    const ds = dueStatus(nextDate)
    const svc = Array.isArray(lead.serviceInterest) ? lead.serviceInterest[0] : (lead.serviceInterest as string) || 'Unknown'
    rows.push({
      id:             lead._id,
      name:           lead.fullName,
      phone:          lead.phone,
      type:           'Call',
      courseInterest: svc,
      dueDate:        nextDate,
      dueStatus:      ds,
      note:           lastFU?.note || '',
    })
  }
  return rows.sort((a, b) => {
    const order = { overdue: 0, today: 1, upcoming: 2 } as const
    return order[a.dueStatus] - order[b.dueStatus]
  })
}

const TYPE_META: Record<string, { icon: React.ReactNode; cls: string }> = {
  'Call':           { icon: <Phone className="w-3 h-3" />,        cls: 'bg-[#fde8e8] text-[#e02424] border border-[#e02424]/15' },
  'WhatsApp':       { icon: <MessageCircle className="w-3 h-3" />, cls: 'bg-[#fdf6b2] text-[#92400e] border border-[#e3a008]/20' },
  'Trial Reminder': { icon: <Clock className="w-3 h-3" />,        cls: 'bg-[#ebf0ff] text-[#1a56db] border border-[#1a56db]/15' },
  'Payment':        { icon: <Banknote className="w-3 h-3" />,     cls: 'bg-[#fde8e8] text-[#e02424] border border-[#e02424]/15' },
  'Other':          { icon: null,                                   cls: 'bg-gray-100 text-gray-600 border border-gray-200' },
}

const DUE_STYLE: Record<string, string> = {
  overdue:  'text-[#e02424] font-bold',
  today:    'text-[#e3a008] font-bold',
  upcoming: 'text-[#0e9f6e] font-bold',
}

const COURSE_BADGE: Record<string, string> = {
  'IELTS Premium':    'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS Crash':      'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS Intense':    'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS Elementary': 'bg-[#ebf0ff] text-[#1a56db]',
  'IELTS Mock Test':  'bg-[#ebf0ff] text-[#1a56db]',
  'PTE Premium':      'bg-[#edebfe] text-[#7e3af2]',
  'TOEFL Premium':    'bg-[#def7ec] text-[#0e9f6e]',
  'GRE Premium':      'bg-[#fdf6b2] text-[#92400e]',
  'Basic English':    'bg-gray-100 text-gray-600',
  'Study Abroad':     'bg-gray-100 text-gray-600',
  'Visa Processing':  'bg-gray-100 text-gray-600',
}

const inputCls = 'w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] transition-all'
const labelCls = 'block text-[10.5px] font-bold text-gray-400 uppercase tracking-widest mb-1.5'

// ── Component ────────────────────────────────────────────────────────────────

export default function FollowUpPage() {
  const socket = useSocket()

  const [filter,      setFilter]      = useState<Filter>('All')
  const [rows,        setRows]        = useState<DisplayRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [doneIds,     setDoneIds]     = useState<Set<string>>(new Set())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData,    setFormData]    = useState({ followUpDate: '', nextFollowUpDate: '', note: '' })
  const [saving,      setSaving]      = useState(false)

  // Socket.IO: real-time refresh on any new notification/lead activity
  useEffect(() => {
    const rawSocket = socket?.socket
    if (!rawSocket) return
    const handler = () => setRefreshTick(t => t + 1)
    rawSocket.on('new-notification', handler)
    return () => { rawSocket.off('new-notification', handler) }
  }, [socket])

  // Fetch leads
  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getLeads({ limit: 500 })
        if (!active) return
        setRows(leadsToRows(Array.isArray(data.leads) ? data.leads : []))
      } catch (err: any) {
        if (!active) return
        setError(err?.message || 'Could not load follow-ups.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [refreshTick])

  const markDone = useCallback(async (row: DisplayRow) => {
    setDoneIds(prev => new Set(prev).add(row.id))
    try {
      await addFollowUp(row.id, {
        date: new Date().toISOString(),
        note: `Completed: ${row.note}`,
        nextFollowUpDate: '',
      })
    } catch {
      setDoneIds(prev => { const s = new Set(prev); s.delete(row.id); return s })
    }
  }, [])

  const handleSave = async () => {
    if (!formData.note) return
    setSaving(true)
    try {
      await addFollowUp('', formData)
    } catch { /* best effort */ }
    finally {
      setSaving(false)
      setFormData({ followUpDate: '', nextFollowUpDate: '', note: '' })
      setIsModalOpen(false)
      setRefreshTick(t => t + 1)
    }
  }

  const displayed = rows.filter(r => {
    if (doneIds.has(r.id)) return false
    if (filter === 'All')      return true
    if (filter === 'Overdue')  return r.dueStatus === 'overdue'
    if (filter === 'Today')    return r.dueStatus === 'today'
    if (filter === 'Upcoming') return r.dueStatus === 'upcoming'
    return true
  })

  return (
    <div className="space-y-4 relative min-h-[calc(100vh-100px)]">

      {/* Header */}
      <div className="-mx-6 -mt-6 mb-8 p-6 sticky top-0 z-20 bg-white border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h1 className="text-[17px] font-bold text-gray-800 tracking-tight">Follow-up Reminders</h1>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">Track and manage all your scheduled follow-ups</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-[#1a56db] text-white font-bold text-[13px] rounded-xl hover:bg-[#1341a8] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Add Follow-up
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick(t => t + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as Filter)}
              className="h-9 pl-3 pr-8 border border-gray-200 rounded-xl text-[12.5px] font-medium text-gray-600 bg-white outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] transition-all appearance-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Overdue">Overdue</option>
              <option value="Today">Today</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">▾</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="flex-1 font-medium text-red-700">{error}</p>
          <button onClick={() => setRefreshTick(t => t + 1)} className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ring-1 ring-gray-200/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-[10px] text-[11px] font-bold uppercase tracking-[.5px] text-gray-500 text-left">Student / Lead</th>
                <th className="px-4 py-[10px] text-[11px] font-bold uppercase tracking-[.5px] text-gray-500 text-left">Type</th>
                <th className="px-4 py-[10px] text-[11px] font-bold uppercase tracking-[.5px] text-gray-500 text-left">Course Interest</th>
                <th className="px-4 py-[10px] text-[11px] font-bold uppercase tracking-[.5px] text-gray-500 text-left">Due</th>
                <th className="px-4 py-[10px] text-[11px] font-bold uppercase tracking-[.5px] text-gray-500 text-left">Note</th>
                <th className="px-4 py-[10px] text-[11px] font-bold uppercase tracking-[.5px] text-gray-500 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[12.5px] text-gray-400 font-medium">
                    {filter === 'All' ? 'No follow-ups scheduled yet.' : `No ${filter.toLowerCase()} follow-ups.`}
                  </td>
                </tr>
              ) : displayed.map(item => {
                const badge   = TYPE_META[item.type] ?? TYPE_META.Other
                const courseCls = COURSE_BADGE[item.courseInterest] || 'bg-gray-100 text-gray-600'
                return (
                  <tr key={item.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-bold text-gray-800">{item.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{item.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-bold ${badge.cls}`}>
                        {badge.icon} {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-bold ${courseCls}`}>
                        {item.courseInterest}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[12.5px] ${DUE_STYLE[item.dueStatus] ?? 'text-gray-500 font-medium'}`}>
                        {formatShortDate(item.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-[12px] text-gray-500 leading-snug line-clamp-2">{item.note || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${item.phone}`}
                          className="w-7 h-7 rounded-xl bg-[#fde8e8] text-[#e02424] flex items-center justify-center hover:bg-[#e02424]/20 transition-colors"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-7 h-7 rounded-xl bg-[#def7ec] text-[#0e9f6e] flex items-center justify-center hover:bg-[#0e9f6e]/20 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => markDone(item)}
                          className="w-7 h-7 rounded-xl bg-[#def7ec] text-[#0e9f6e] flex items-center justify-center hover:bg-[#0e9f6e]/20 transition-colors"
                          title="Mark Done"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && displayed.length > 0 && (
          <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[11.5px] text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{displayed.length}</span> follow-up{displayed.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[#1a56db] text-white shadow-[0_6px_24px_rgba(26,86,219,0.45)] flex items-center justify-center hover:shadow-[0_10px_32px_rgba(26,86,219,0.55)] hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,15,0.18)] border border-gray-200">
            <div className="h-[3px] bg-[#1a56db]" />
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">New Follow-up Entry</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Follow-up Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.followUpDate}
                    onChange={e => setFormData(p => ({ ...p, followUpDate: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Next Follow-up Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.nextFollowUpDate}
                    onChange={e => setFormData(p => ({ ...p, nextFollowUpDate: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Note <span className="text-red-500 normal-case">*</span></label>
                <textarea
                  rows={4}
                  value={formData.note}
                  onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
                  placeholder="Describe the follow-up interaction…"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#1a56db]/30 focus:border-[#1a56db] transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-9 px-4 rounded-xl text-[13px] font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={saving || !formData.note}
                onClick={handleSave}
                className="h-9 px-5 bg-[#1a56db] text-white rounded-xl text-[13px] font-bold hover:bg-[#1341a8] active:scale-[0.97] disabled:opacity-50 transition-all duration-200"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
