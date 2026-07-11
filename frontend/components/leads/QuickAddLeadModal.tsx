'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Check, AlertCircle, User, Phone, Mail, BookOpen, Target, Globe, CalendarClock, FileText, Zap, ChevronDown } from 'lucide-react'
import { createLead, getBDMsForAssignment as getBDMs, getLeads as fetchLeads } from '@/lib/api/leads'
import { getProfile } from '@/lib/api/auth'
import type { BDM, LeadSource, ServiceInterest } from '@/types/admin'
import { SERVICE_INTEREST_OPTIONS } from '@/types/admin'
import {
  PHONE_COUNTRIES,
  buildInternationalPhone,
  extractPhoneDigits,
  formatPhoneCountryCode,
  normalizePhone,
  sanitizePhoneTypingInput,
  validatePhone,
} from '@/lib/phone/phone.utils'

const whomOptions = ['Personal', 'Parents', 'Cousin', 'Uncle', 'Sibling', 'Spouse'] as const
type WhomOption = (typeof whomOptions)[number]

const leadSources: LeadSource[] = [
  'Education Team', 'Phone Call', 'Previous', 'Facebook', 'WhatsApp',
  'Google', 'Walk-in', 'Event', 'Reference', 'Others', 'Website'
]

const serviceInterests: ServiceInterest[] = SERVICE_INTEREST_OPTIONS

interface Props {
  onClose: () => void
  onSuccess: () => void
  title?: string
  subtitle?: string
}

const inputClass =
  'w-full h-[42px] px-3.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-3 focus:ring-blue-500/12 focus:border-blue-500 focus:bg-white transition-all hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
const labelClass = 'flex items-center gap-1.5 text-[10.5px] font-extrabold text-gray-500 uppercase tracking-[0.07em] mb-1.5'
const countryCodes = PHONE_COUNTRIES

const normalizePhoneLookup = (value: string, countryCode: string) => buildInternationalPhone(value, countryCode)

const validatePhoneDigits = (phone: string, countryCode: string): string | null => validatePhone(phone, countryCode)

const normalizePhoneInput = (value: string): string => extractPhoneDigits(sanitizePhoneTypingInput(value))

export default function QuickAddLeadModal({ onClose, onSuccess, title = 'Quick Add Lead', subtitle = 'Rapidly input a new prospect' }: Props) {
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
    assignedTo: '',
  })
  const [countryCode, setCountryCode] = useState<string>(countryCodes[0].code)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneSuggestions, setPhoneSuggestions] = useState<Array<{ _id: string; fullName: string; phone: string; whom?: string }>>([])
  const [existingLeads, setExistingLeads] = useState<Array<{ _id: string; fullName: string; phone: string; whom?: string }>>([])
  const [bdms, setBdms] = useState<BDM[]>([])
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; name?: string } | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isPhoneFocused, setIsPhoneFocused] = useState(false)
  const [isPhoneChecking, setIsPhoneChecking] = useState(false)
  const phoneTimerRef = useRef<number | null>(null)

  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const token = localStorage.getItem('accessToken') || ''
        const [profile, bdmData, leadData] = await Promise.all([
          token ? getProfile(token).catch(() => null) : Promise.resolve(null),
          getBDMs().catch(() => []),
          fetchLeads({ limit: 500 }).catch(() => ({ leads: [] })),
        ])

        if (profile) {
          const id = profile._id || profile.id || profile.userId
          const name = profile.name || (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.email)
          setCurrentUser({ id, email: profile.email, name })
        }

        const normalizedBdms = Array.isArray(bdmData) ? bdmData : []
        setBdms(normalizedBdms)

        const profileId = profile?._id || profile?.id || profile?.userId
        const profileEmail = profile?.email
        const profileName = profile?.name || (profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : profile?.email)
        const matchedBdm = normalizedBdms.find((b: BDM) =>
          (profileId && b._id === profileId) ||
          (profileEmail && b.email === profileEmail) ||
          (profileName && b.name === profileName)
        )

        if (matchedBdm) {
          setForm(prev => ({ ...prev, assignedTo: matchedBdm._id }))
        } else if (profileId) {
          setForm(prev => ({ ...prev, assignedTo: profileId }))
        }

        setExistingLeads((Array.isArray(leadData.leads) ? leadData.leads : []).map((lead: any) => ({
          _id: lead._id,
          fullName: lead.fullName,
          phone: lead.phone,
          whom: lead.whom,
        })))
      } catch {
        setBdms([])
        setExistingLeads([])
      }
    }

    loadInitialData()
  }, [])

  const bdmOptions = useMemo(() => {
    const profileId = currentUser?.id
    const profileEmail = currentUser?.email
    const displayName = currentUser?.name || currentUser?.email || 'Me'

    const hasCurrentUserInBdms = bdms.some(b =>
      (profileId && b._id === profileId) ||
      (profileEmail && b.email === profileEmail)
    )

    if (hasCurrentUserInBdms || !profileId) {
      return bdms
    }

    return [
      {
        _id: profileId,
        name: displayName,
        email: profileEmail || '',
        firstName: '',
        lastName: '',
        role: 'bdm',
        status: 'active',
      } as BDM,
      ...bdms.filter(b => b._id !== profileId),
    ]
  }, [bdms, currentUser])

  useEffect(() => {
    const query = form.phone.trim()
    const queryDigits = normalizePhone(form.phone, countryCode)

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
      phone: normalizePhone(suggestion.phone, countryCode),
      whom: (suggestion.whom as WhomOption) || prev.whom
    }))
    setPhoneError(null)
    setError(null)
  }

  const checkDuplicate = async (phoneValue = form.phone) => {
    const digitError = validatePhoneDigits(phoneValue, countryCode)
    if (digitError) {
      setPhoneError(digitError)
      return true
    }

    const normalizedPhone = buildInternationalPhone(phoneValue, countryCode)
    if (!normalizedPhone) return false

    const exact = existingLeads.some(lead => buildInternationalPhone(lead.phone, countryCode) === normalizedPhone)
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
        phone: buildInternationalPhone(form.phone, countryCode),
        countryCode,
        whom: form.whom || undefined,
        source: form.source,
        serviceInterest: form.serviceInterest,
        lifecycleStage: 'New Inquiry',
        assignedTo: form.assignedTo || undefined,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.28),0_0_0_1px_rgba(0,0,0,0.04)] w-full max-w-[520px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[94vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
              <Zap className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-white tracking-tight leading-tight">{title}</h2>
              <p className="text-white/60 text-[11.5px] font-medium mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto flex-1">
          <div className="px-6 pt-5 pb-4 space-y-4">

            {/* Full Name */}
            <div>
              <label className={labelClass}>
                <User className="w-3.5 h-3.5" /> Full Name <span className="text-red-500 normal-case font-normal ml-0.5">*</span>
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

            {/* Phone */}
            <div className="relative">
              <label className={labelClass}>
                <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-red-500 normal-case font-normal ml-0.5">*</span>
              </label>
              <div className="flex rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/12 transition-all">
                {/* Country selector — fixed width so phone input gets priority space */}
                <div className="relative w-[92px] flex-shrink-0 border-r border-gray-200 bg-gray-50/80 overflow-hidden">
                  <select
                    value={countryCode}
                    onChange={e => { const nextCode = e.target.value; setCountryCode(nextCode); if (form.phone.trim()) setPhoneError(validatePhoneDigits(form.phone, nextCode)); }}
                    className="h-11 w-full bg-transparent border-0 pl-3 pr-6 appearance-none text-[12px] font-semibold text-gray-700 cursor-pointer focus:ring-0 focus:outline-none"
                  >
                    {countryCodes.map((code, i) => (
                      <option key={`${code.code}-${i}`} value={code.code}>{formatPhoneCountryCode(code)}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                {/* Number input — takes all remaining space */}
                <input
                  type="tel"
                  placeholder="Enter number"
                  value={form.phone}
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => window.setTimeout(() => { setIsPhoneFocused(false); if (form.phone.trim()) setPhoneError(validatePhoneDigits(form.phone, countryCode)); }, 120)}
                  onKeyDown={async e => { if (e.key === 'Enter') { e.preventDefault(); await checkDuplicate(); return } if (e.key.length === 1 && /\D/.test(e.key)) { e.preventDefault() } }}
                  onChange={e => { set('phone', normalizePhoneInput(e.target.value)); setPhoneError(null); setError(null); }}
                  className="h-11 flex-1 px-3.5 bg-transparent border-0 text-[13.5px] text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none min-w-0"
                />
                {/* Whom selector — fixed compact width */}
                <div className="relative w-[86px] flex-shrink-0 border-l border-gray-200 bg-gray-50/80">
                  <select
                    value={form.whom || ''}
                    onChange={e => setForm(prev => ({ ...prev, whom: e.target.value as WhomOption | '' }))}
                    className="h-11 w-full bg-transparent border-0 pl-2.5 pr-6 appearance-none text-[12px] font-semibold text-gray-700 cursor-pointer focus:ring-0 focus:outline-none"
                  >
                    <option value="" disabled>Whom</option>
                    {whomOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Suggestions dropdown */}
              {(isPhoneFocused || isPhoneChecking) && (phoneSuggestions.length > 0 || isPhoneChecking) && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
                    <p className="text-[10.5px] font-extrabold uppercase tracking-widest text-gray-500">Suggestions</p>
                    <span className="text-[11px] font-semibold text-gray-400">{isPhoneChecking ? 'Searching…' : `${phoneSuggestions.length} found`}</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {!isPhoneChecking && phoneSuggestions.map(suggestion => (
                      <button
                        key={suggestion._id}
                        type="button"
                        onMouseDown={e => { e.preventDefault(); handleSuggestionSelect(suggestion) }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50/60 transition-colors border-b border-gray-50 last:border-b-0 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight">{suggestion.fullName}</p>
                          <p className="text-[11.5px] text-gray-500 mt-0.5 font-mono">{suggestion.phone}</p>
                        </div>
                        {suggestion.whom && (
                          <span className="text-[10.5px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {suggestion.whom}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {phoneError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{phoneError}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. tahmina@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 my-1" />

            {/* Exam / Course + Target Score */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  <BookOpen className="w-3.5 h-3.5" /> Exam / Course <span className="text-red-500 normal-case font-normal ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.serviceInterest}
                    onChange={e => set('serviceInterest', e.target.value)}
                    className={inputClass + ' appearance-none cursor-pointer pr-8'}
                    required
                  >
                    <option value="">Select...</option>
                    {serviceInterests.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  <Target className="w-3.5 h-3.5" /> Target Score
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

            {/* Assign to BDM */}
            <div>
              <label className={labelClass}>
                <User className="w-3.5 h-3.5" /> Assign to BDM <span className="text-red-500 normal-case font-normal ml-0.5">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.assignedTo}
                  onChange={e => set('assignedTo', e.target.value)}
                  className={inputClass + ' appearance-none cursor-pointer pr-8'}
                  required
                >
                  <option value="" disabled>Select BDM</option>
                  {bdmOptions.map(bdm => (
                    <option key={bdm._id} value={bdm._id}>
                      {bdm.name || (bdm.firstName && bdm.lastName ? `${bdm.firstName} ${bdm.lastName}` : (bdm.email || 'Unknown'))}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Lead Source + Follow-up Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  <Globe className="w-3.5 h-3.5" /> Lead Source
                </label>
                <div className="relative">
                  <select
                    value={form.source}
                    onChange={e => set('source', e.target.value)}
                    className={inputClass + ' appearance-none cursor-pointer pr-8'}
                  >
                    {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  <CalendarClock className="w-3.5 h-3.5" /> Follow-up Date
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

            {/* Quick Note */}
            <div>
              <label className={labelClass}>
                <FileText className="w-3.5 h-3.5" /> Quick Note
              </label>
              <textarea
                placeholder="e.g. Very interested, needs schedule info. Call in evening."
                value={form.note}
                onChange={e => set('note', e.target.value)}
                rows={2}
                className={inputClass + ' h-auto py-3 resize-none leading-relaxed'}
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 text-red-700 text-[12.5px] bg-red-50 border border-red-200/70 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span className="font-semibold">{error}</span>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <p className="text-[11.5px] text-gray-400 font-medium hidden sm:block">Fields marked <span className="text-red-500">*</span> are required</p>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 flex items-center gap-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-[0_2px_8px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_14px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Save & Setup
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

