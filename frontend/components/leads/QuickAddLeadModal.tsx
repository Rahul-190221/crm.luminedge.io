'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Check, AlertCircle, User, Phone, Mail, BookOpen, Target, Globe, CalendarClock, FileText, Zap, ChevronDown } from 'lucide-react'
import { createLead, getLeads as fetchLeads } from '@/lib/api/leads'
import type { LeadSource, ServiceInterest } from '@/types/admin'

const whomOptions = ['Personal', 'Parents', 'Cousin', 'Uncle', 'Sibling', 'Spouse'] as const
type WhomOption = (typeof whomOptions)[number]

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
  'w-full h-[42px] px-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all hover:border-gray-300'
const labelClass = 'flex items-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2'
const countryCodes = ['+880', '+91', '+92', '+94', '+977', '+95', '+1', '+44', '+61', '+971', '+966', '+65', '+60', '+66', '+81', '+82', '+86', '+49', '+33'] as const

const normalizePhoneLookup = (value: string, countryCode: string) => {
  const countryDigits = countryCode.replace(/\D/g, '')
  let normalized = value.replace(/\D/g, '')
  if (countryDigits && normalized.startsWith(countryDigits)) {
    normalized = normalized.slice(countryDigits.length)
  }
  if (normalized.startsWith('0')) {
    normalized = normalized.slice(1)
  }
  return normalized
}

export default function QuickAddLeadModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    whom: '' as WhomOption | '',
    serviceInterest: '' as ServiceInterest | '',
    targetScore: '',
    source: 'Facebook' as LeadSource,
    followUpDate: '',
    note: '',
  })
  const [countryCode, setCountryCode] = useState<(typeof countryCodes)[number]>(countryCodes[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneSuggestions, setPhoneSuggestions] = useState<Array<{ _id: string; fullName: string; phone: string; whom?: string }>>([])
  const [existingLeads, setExistingLeads] = useState<Array<{ _id: string; fullName: string; phone: string; whom?: string }>>([])
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isPhoneFocused, setIsPhoneFocused] = useState(false)
  const [isPhoneChecking, setIsPhoneChecking] = useState(false)
  const phoneTimerRef = useRef<number | null>(null)

  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const leads = await fetchLeads()
        setExistingLeads(leads.map((lead: any) => ({
          _id: lead._id,
          fullName: lead.fullName,
          phone: lead.phone,
          whom: lead.whom,
        })))
      } catch {
        setExistingLeads([])
      }
    }
    loadLeads()
  }, [])

  useEffect(() => {
    const query = form.phone.trim()
    const queryDigits = query.replace(/\D/g, '')

    if (phoneTimerRef.current) {
      window.clearTimeout(phoneTimerRef.current)
    }

    if (queryDigits.length < 3) {
      setPhoneSuggestions([])
      setIsPhoneChecking(false)
      return
    }

    setIsPhoneChecking(true)
    phoneTimerRef.current = window.setTimeout(() => {
      const lookupQuery = normalizePhoneLookup(query, countryCode)
      const matches = existingLeads
        .filter(lead => normalizePhoneLookup(lead.phone, countryCode).includes(lookupQuery))
        .slice(0, 6)
      setPhoneSuggestions(matches)
      setIsPhoneChecking(false)
    }, 120)

    return () => {
      if (phoneTimerRef.current) window.clearTimeout(phoneTimerRef.current)
    }
  }, [form.phone, countryCode, existingLeads])

  const handleSuggestionSelect = (suggestion: { _id: string; fullName: string; phone: string; whom?: string }) => {
    setForm(prev => ({
      ...prev,
      phone: normalizePhoneLookup(suggestion.phone, countryCode),
      whom: (suggestion.whom as WhomOption) || prev.whom
    }))
    setPhoneError(null)
    setError(null)
  }

  const checkDuplicate = async (phoneValue = form.phone) => {
    const combined = `${countryCode} ${phoneValue}`.trim()
    const digits = normalizePhoneLookup(combined, countryCode)
    if (digits.length < 7) return false
    const exact = existingLeads.some(lead => normalizePhoneLookup(lead.phone, countryCode) === digits)
    if (exact) {
      setPhoneError('This number already exists. Already used, try with another number.')
      return true
    }
    setPhoneError(null)
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName.trim() || !form.phone.trim() || !form.serviceInterest) return
    setIsSubmitting(true)
    setError(null)

    try {
      const duplicate = await checkDuplicate()
      if (duplicate) return

      const notesParts = [
        form.targetScore ? `Target Score/Band: ${form.targetScore}` : '',
        form.note.trim(),
      ].filter(Boolean)

      const payload: Record<string, any> = {
        fullName: form.fullName.trim(),
        phone: `${countryCode} ${form.phone}`.trim(),
        whom: form.whom || undefined,
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
      const message = String(err?.message || '')
      if (message.toLowerCase().includes('already exists') || message.toLowerCase().includes('already used')) {
        setPhoneError('This number already exists. Already used, try with another number.')
      } else {
        setError(err.message || 'Failed to create lead. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-white tracking-tight">Quick Add Lead</h2>
              <p className="text-white/70 text-[12px] font-medium mt-0.5">Rapidly input a new prospect</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

          {/* Row 1: Full Name */}
          <div className="space-y-5">
            <div>
              <label className={labelClass}>
                <User className="w-3.5 h-3.5 text-gray-400" /> Full Name <span className="text-red-500 normal-case">*</span>
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
            <div className="relative">
              <label className={labelClass}>
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone <span className="text-red-500 normal-case">*</span>
              </label>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_120px] rounded-xl overflow-visible border border-gray-200 bg-gray-50/50 shadow-sm focus-within:ring-4 focus-within:ring-blue-500/10">
                <div className="relative border-r border-gray-200 bg-white">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value as (typeof countryCodes)[number])}
                    className="h-[42px] bg-transparent border-0 pr-8 pl-3 appearance-none text-[12px] font-bold text-gray-800 min-w-[84px] cursor-pointer focus:ring-0"
                  >
                    {countryCodes.map((code, i) => <option key={`${code}-${i}`} value={code}>{code}</option>)}
                  </select>
                  <Globe className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none opacity-0" />
                </div>
                <input
                  type="tel"
                  placeholder="017..."
                  value={form.phone}
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => window.setTimeout(() => setIsPhoneFocused(false), 120)}
                  onKeyDown={async e => { if (e.key === 'Enter') { e.preventDefault(); await checkDuplicate(); } }}
                  onChange={e => { set('phone', e.target.value); setPhoneError(null); setError(null); }}
                  className="h-[42px] px-3 bg-transparent border-0 text-[13px] text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:bg-white"
                />
                <div className="relative border-l border-gray-200 bg-white">
                  <select
                    value={form.whom || ''}
                    onChange={e => setForm(prev => ({ ...prev, whom: e.target.value as WhomOption | '' }))}
                    className="h-[42px] w-full bg-transparent border-0 px-3 pr-8 appearance-none text-[13px] font-semibold text-gray-800 cursor-pointer focus:ring-0"
                  >
                    <option value="" disabled>Whom</option>
                    {whomOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <Globe className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none opacity-0" />
                </div>
              </div>
              {(isPhoneFocused || isPhoneChecking) && (phoneSuggestions.length > 0 || isPhoneChecking) && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)] overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-gray-500">Phone Suggestions</p>
                    <span className="text-[11px] font-semibold text-gray-400">{isPhoneChecking ? 'Searching...' : `${phoneSuggestions.length} found`}</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {!isPhoneChecking && phoneSuggestions.length === 0 ? (
                      <div className="px-4 py-3 text-[13px] text-gray-500">No matching phone suggestions.</div>
                    ) : phoneSuggestions.map(suggestion => (
                      <button
                        key={suggestion._id}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); handleSuggestionSelect(suggestion) }}
                        className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-bold text-gray-900">{suggestion.fullName}</p>
                            <p className="text-[12px] text-gray-500">{suggestion.phone}</p>
                          </div>
                          <span className="text-[11px] font-semibold text-[#1a56db] bg-[#ebf0ff] px-2.5 py-1 rounded-full">
                            {suggestion.whom || 'No whom'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {phoneError && <p className="mt-2 text-[12px] font-semibold text-red-600">{phoneError}</p>}
            </div>
          </div>

          {/* Row 2: Email */}
          <div>
            <label className={labelClass}>
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. tahmina@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Row 3: Course Interest | Target Score */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Exam / Course <span className="text-red-500 normal-case">*</span>
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
              <label className={labelClass}>
                <Target className="w-3.5 h-3.5 text-gray-400" /> Target Score
              </label>
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
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                <Globe className="w-3.5 h-3.5 text-gray-400" /> Lead Source
              </label>
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
              <label className={labelClass}>
                <CalendarClock className="w-3.5 h-3.5 text-gray-400" /> Follow-up Date
              </label>
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
            <label className={labelClass}>
              <FileText className="w-3.5 h-3.5 text-gray-400" /> Quick Note
            </label>
            <textarea
              placeholder="e.g. Very interested, needs schedule info. Call in evening."
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={3}
              className={inputClass + ' h-auto py-3 resize-none'}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 text-[13px] bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-[13.5px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[13.5px] font-bold shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save & Setup
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
