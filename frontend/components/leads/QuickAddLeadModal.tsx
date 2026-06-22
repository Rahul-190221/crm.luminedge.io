'use client'

import { useState } from 'react'
import { X, Check, AlertCircle } from 'lucide-react'
import { createLead } from '@/lib/api/leads'
import type { LeadSource, ServiceInterest } from '@/types/admin'

const leadSources: LeadSource[] = [
  'Facebook', 'Instagram', 'WhatsApp', 'Website', 'Referral',
  'Social Media', 'Email Campaign', 'Walk-in', 'Phone', 'Other'
]

const serviceInterests: ServiceInterest[] = [
  'IELTS Premium', 'IELTS Crash', 'IELTS Intense', 'IELTS Elementary', 'IELTS Mock Test',
  'Basic English', 'GRE Premium', 'TOEFL Premium', 'PTE Premium',
  'Study Abroad', 'Visa Processing',
]

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FACE39]/50 focus:border-[#FACE39] transition-all bg-white'
const labelClass = 'block text-xs font-semibold text-gray-600 mb-1'

export default function QuickAddLeadModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceInterest: '' as ServiceInterest | '',
    targetScore: '',
    source: 'Facebook' as LeadSource,
    followUpDate: '',
    note: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.phone.trim() || !form.serviceInterest) return
    setIsSubmitting(true)
    setError(null)

    try {
      const notesParts = [
        form.targetScore ? `Target Score/Band: ${form.targetScore}` : '',
        form.note.trim(),
      ].filter(Boolean)

      const payload: Record<string, any> = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        source: form.source,
        serviceInterest: form.serviceInterest,
        lifecycleStage: 'Intake',
      }
      if (form.email.trim()) payload.email = form.email.trim()
      if (notesParts.length) payload.notes = notesParts.join('\n')
      if (form.followUpDate) {
        payload.followUps = [{
          date: form.followUpDate,
          note: form.note.trim() || 'Initial follow-up',
          nextFollowUpDate: form.followUpDate,
        }]
      }

      await createLead(payload as any)

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to create lead. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">⚡</span>
            <h2 className="text-base font-bold text-gray-900">Quick Add Lead</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#FACE39]/15 text-gray-400 hover:text-[#00000F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Row 1: Full Name | Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Tahmina Rahman"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Phone (WhatsApp) <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                placeholder="01X-XXXX-XXXX"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. tahmina@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Row 3: Course Interest | Target Score */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Exam / Course Interest <span className="text-red-400">*</span>
              </label>
              <select
                value={form.serviceInterest}
                onChange={e => set('serviceInterest', e.target.value)}
                className={inputClass + ' appearance-none cursor-pointer'}
                required
              >
                <option value="">Select...</option>
                {serviceInterests.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Target Score / Band</label>
              <input
                type="text"
                placeholder="e.g. 7.0, 65+, 100"
                value={form.targetScore}
                onChange={e => set('targetScore', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 4: Lead Source | Follow-up Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Lead Source</label>
              <select
                value={form.source}
                onChange={e => set('source', e.target.value)}
                className={inputClass + ' appearance-none cursor-pointer'}
              >
                {leadSources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Follow-up Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.followUpDate}
                onChange={e => set('followUpDate', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 5: Quick Note */}
          <div>
            <label className={labelClass}>Quick Note</label>
            <textarea
              placeholder="e.g. Very interested, needs schedule info. Call in evening."
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FACE39] hover:bg-[#FACE39]/90 text-[#00000F] text-sm font-bold shadow-sm hover:shadow-[0_4px_16px_rgba(250,206,57,0.4)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Saving…' : 'Save & Set Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
