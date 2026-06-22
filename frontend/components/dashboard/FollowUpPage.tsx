'use client'

import React, { useState } from 'react'
import { Phone, MessageSquare, Check, Plus, MessageCircle, Banknote, Clock, Calendar as CalendarIcon, X } from 'lucide-react'

const initialFollowUps = [
  { id: '1', name: 'Tahmina Rahman',  phone: '01712-111222', type: 'Call',           courseInterest: 'IELTS Premium', due: 'Overdue (3 days)',  dueStatus: 'overdue',  note: 'Very Interested, needs fee info' },
  { id: '2', name: 'Rafiq Islam',     phone: '01812-222333', type: 'WhatsApp',        courseInterest: 'PTE',           due: 'Overdue (2 days)',  dueStatus: 'overdue',  note: 'Send batch schedule' },
  { id: '3', name: 'Nusrat Jahan',    phone: '01612-333444', type: 'Trial Reminder',  courseInterest: 'IELTS Crash',   due: 'Today 4:00 PM',     dueStatus: 'today',    note: 'Trial class reminder' },
  { id: '4', name: 'Ariful Hoque',    phone: '01512-444555', type: 'Payment',         courseInterest: 'TOEFL',         due: 'Today',             dueStatus: 'today',    note: 'BDT 8,000 due — collect or confirm' },
  { id: '5', name: 'Sumaiya Begum',   phone: '01912-555666', type: 'Call',            courseInterest: 'IELTS Intense', due: 'Today 6:00 PM',     dueStatus: 'upcoming', note: '5th day no response — final attempt' },
]

const typeMeta: Record<string, { icon: React.ReactNode; cls: string }> = {
  'Call':           { icon: <Phone className="w-3 h-3" />,        cls: 'bg-pink-50 text-pink-600 border border-pink-100' },
  'WhatsApp':       { icon: <MessageCircle className="w-3 h-3" />, cls: 'bg-[#FACE39]/15 text-[#00000F] border border-[#FACE39]/30' },
  'Trial Reminder': { icon: <Clock className="w-3 h-3" />,        cls: 'bg-blue-50 text-blue-700 border border-blue-100' },
  'Payment':        { icon: <Banknote className="w-3 h-3" />,     cls: 'bg-red-50 text-red-600 border border-red-100' },
}

const dueStyle: Record<string, string> = {
  overdue:  'text-red-600 font-bold',
  today:    'text-amber-600 font-bold',
  upcoming: 'text-[#16A34A] font-bold',
}

const inputCls = 'w-full h-10 px-3 bg-white border border-[#00000F]/[0.10] rounded-xl text-[13px] font-medium text-[#00000F] placeholder:text-[#00000F]/30 outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] transition-all'
const labelCls = 'block text-[10.5px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-1.5'

export default function FollowUpPage() {
  const [filter, setFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [followUps, setFollowUps] = useState(initialFollowUps)
  const [formData, setFormData] = useState({ followUpDate: '', nextFollowUpDate: '', note: '' })

  const handleSave = () => {
    if (!formData.note) return
    setFollowUps(prev => [{
      id: Date.now().toString(), name: 'New Lead', phone: '01000-000000',
      type: 'Call', courseInterest: 'Pending', due: 'Today', dueStatus: 'today', note: formData.note
    }, ...prev])
  }

  const handleSaveAndClose = () => { handleSave(); setFormData({ followUpDate: '', nextFollowUpDate: '', note: '' }); setIsModalOpen(false) }
  const handleSaveAndAddAnother = () => { handleSave(); setFormData({ followUpDate: '', nextFollowUpDate: '', note: '' }) }

  const displayed = followUps.filter(item => {
    if (filter === 'All') return true
    if (filter === 'Overdue') return item.dueStatus === 'overdue'
    if (filter === 'Today') return item.dueStatus === 'today'
    return true
  })

  return (
    <div className="space-y-4 relative min-h-[calc(100vh-100px)]">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-bold text-[#00000F] tracking-tight">Follow-up Reminders</h1>
          <p className="text-[12px] text-[#00000F]/40 font-medium mt-0.5">Track and manage all your scheduled follow-ups</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="h-9 pl-3 pr-8 border border-[#00000F]/[0.10] rounded-xl text-[12.5px] font-medium text-[#00000F]/70 bg-white outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] transition-all appearance-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Overdue">Overdue</option>
              <option value="Today">Today</option>
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#00000F]/30 text-[10px]">▾</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 bg-[#FACE39] text-[#00000F] font-bold text-[13px] rounded-xl shadow-[0_2px_12px_rgba(250,206,57,0.30)] hover:shadow-[0_6px_20px_rgba(250,206,57,0.45)] active:scale-[0.97] transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Add Follow up
          </button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#FACE39]">
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[#00000F]">Student / Lead</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[#00000F]">Type</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[#00000F]">Course Interest</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[#00000F]">Due</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[#00000F]">Note</th>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-[#00000F]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00000F]/[0.05]">
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[12.5px] text-[#00000F]/35 font-medium">
                    No follow-ups for this filter.
                  </td>
                </tr>
              ) : displayed.map(item => {
                const badge = typeMeta[item.type] ?? { icon: null, cls: 'bg-[#00000F]/[0.05] text-[#00000F]/55 border border-[#00000F]/10' }
                return (
                  <tr key={item.id} className="hover:bg-[#FACE39]/[0.03] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-bold text-[#00000F]">{item.name}</p>
                      <p className="text-[11px] text-[#00000F]/40 font-medium mt-0.5">{item.phone}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-bold ${badge.cls}`}>
                        {badge.icon} {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11.5px] font-bold bg-[#FACE39]/15 text-[#00000F] border border-[#FACE39]/25">
                        {item.courseInterest}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[12.5px] ${dueStyle[item.dueStatus] ?? 'text-[#00000F]/50 font-medium'}`}>
                        {item.due}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <span className="text-[12px] text-[#00000F]/55 leading-snug line-clamp-2">{item.note}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button className="w-7 h-7 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100 transition-colors" title="Call">
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        {item.type !== 'WhatsApp' && (
                          <button className="w-7 h-7 rounded-xl bg-[#00000F]/[0.04] text-[#00000F]/35 flex items-center justify-center hover:bg-[#00000F]/[0.08] transition-colors" title="Message">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {item.type === 'Payment' && (
                          <button className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors" title="Payment">
                            <Banknote className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="w-7 h-7 rounded-xl bg-[#22C55E]/10 text-[#16A34A] flex items-center justify-center hover:bg-[#22C55E]/20 transition-colors" title="Mark Done">
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
        {displayed.length > 0 && (
          <div className="px-5 py-3 border-t border-[#00000F]/[0.05]">
            <p className="text-[11.5px] text-[#00000F]/35 font-medium">
              Showing <span className="font-bold text-[#00000F]/55">{displayed.length}</span> follow-up{displayed.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#FACE39] text-[#00000F] shadow-[0_4px_20px_rgba(250,206,57,0.45)] flex items-center justify-center hover:shadow-[0_8px_28px_rgba(250,206,57,0.55)] hover:scale-105 active:scale-95 transition-all z-10"
      >
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,15,0.18)] border border-[#00000F]/[0.07]">
            <div className="h-[3px] bg-[#FACE39]" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#00000F]/[0.06]">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#00000F]/50">New Follow-up Entry</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#00000F]/[0.05] hover:bg-[#00000F]/10 text-[#00000F]/35 hover:text-[#00000F] transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Follow-up Date</label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={formData.followUpDate}
                    onChange={e => setFormData(p => ({ ...p, followUpDate: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Next Follow-up Date</label>
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
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
                  className="w-full px-3 py-2.5 bg-white border border-[#00000F]/[0.10] rounded-xl text-[13px] font-medium text-[#00000F] placeholder:text-[#00000F]/30 outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#00000F]/[0.06]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-9 px-4 rounded-xl text-[13px] font-bold text-[#00000F]/45 hover:text-[#00000F] hover:bg-[#00000F]/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndClose}
                className="h-9 px-5 bg-[#FACE39] text-[#00000F] rounded-xl text-[13px] font-bold shadow-[0_2px_12px_rgba(250,206,57,0.30)] hover:shadow-[0_6px_20px_rgba(250,206,57,0.45)] active:scale-[0.97] transition-all duration-200"
              >
                Save
              </button>
              <button
                onClick={handleSaveAndAddAnother}
                className="h-9 px-5 bg-[#00000F] text-white rounded-xl text-[13px] font-bold hover:bg-[#00000F]/85 active:scale-[0.97] transition-all duration-200"
              >
                Save & Add Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
