'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plus, Upload, Trash2, AlertCircle, CheckCircle2, Calendar, ChevronDown, ArrowLeft,
  User, Briefcase, CalendarClock, Mail, Phone, Globe, BookOpen, GraduationCap, FileText
} from 'lucide-react'
import { createLead, getBDMsForAssignment as getBDMs, getLeads as fetchLeads, importLeadsFromCSV } from '@/lib/api/leads'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import { getProfile } from '@/lib/api/auth'
import type { LeadSource, ServiceInterest, BDM } from '@/types/admin'
import { SERVICE_INTEREST_OPTIONS } from '@/types/admin'
import {
  PHONE_COUNTRIES,
  buildInternationalPhone,
  countryRules,
  extractPhoneDigits,
  formatPhoneCountryCode,
  normalizePhone,
  sanitizePhoneTypingInput,
  validatePhone,
} from '@/lib/phone/phone.utils'

interface FollowUpEntry { id: number; date: string; note: string; nextFollowUpDate: string }
interface PhoneLookupSuggestion { _id: string; fullName: string; phone: string; whom?: string }

const countryCodes = PHONE_COUNTRIES

const leadSources: LeadSource[] = [
  'Education Team', 'Phone Call', 'Previous', 'Facebook', 'WhatsApp',
  'Google', 'Walk-in', 'Event', 'Reference', 'Others', 'Website'
]
const whomOptions = ['Personal', 'Parents', 'Cousin', 'Uncle', 'Sibling', 'Spouse'] as const
type WhomOption = (typeof whomOptions)[number]
const serviceInterests: ServiceInterest[] = SERVICE_INTEREST_OPTIONS

interface InputLeadProps { onSuccess?: () => void; onCancel?: () => void }

const fieldCls = 'w-full h-11 px-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-[13.5px] text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
const labelCls = 'flex items-center gap-1.5 text-[11px] font-extrabold text-gray-500 uppercase tracking-[0.08em] mb-1.5'

const getTodayStartLocal = () => new Date().toISOString().split('T')[0]

const phoneDigitRules = countryRules

function normalizePhoneInput(phone: string, countryCode: string): string {
  return extractPhoneDigits(sanitizePhoneTypingInput(phone))
}

function canonicalizePhoneDigits(phone: string, countryCode: string): string {
  return normalizePhone(phone, countryCode)
}

function validatePhoneDigits(phone: string, code: string): string | null {
  return validatePhone(phone, code)
}

export default function InputLead({ onSuccess, onCancel }: InputLeadProps) {
  const [formData, setFormData] = useState(() => {
    const currentUserObj = getUserIdFromToken()
    const initialAssignedTo = currentUserObj ? ((currentUserObj as any)._id || currentUserObj.id || currentUserObj.userId || '') : ''
    return { fullName: '', email: '', phone: '', whom: '' as WhomOption | '', source: '' as LeadSource | '', serviceInterest: [] as string[], assignedTo: initialAssignedTo, notes: '' }
  })
  const [countryCode, setCountryCode] = useState('+880')
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>([
    { id: 1, date: getTodayStartLocal(), note: '', nextFollowUpDate: getTodayStartLocal() }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phoneSuggestions, setPhoneSuggestions] = useState<PhoneLookupSuggestion[]>([])
  const [existingLeads, setExistingLeads] = useState<PhoneLookupSuggestion[]>([])
  const [isPhoneFocused, setIsPhoneFocused] = useState(false)
  const [isPhoneChecking, setIsPhoneChecking] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [bdms, setBdms] = useState<BDM[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const serviceDropdownRef = useRef<HTMLDivElement>(null)
  const phoneLookupTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('accessToken') || ''
        if (token) {
          const profile = await getProfile(token)
          const name = profile.name || (profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.email)
          if (name) setCurrentUserName(name)
        }
      } catch {}
    }
    fetchUserName()
  }, [])

  useEffect(() => {
    const fetchExistingLeads = async () => {
      try {
        const data = await fetchLeads({ limit: 500 })
        setExistingLeads((Array.isArray(data.leads) ? data.leads : []).map((lead: any) => ({
          _id: lead._id,
          fullName: lead.fullName,
          phone: lead.phone,
          whom: lead.whom,
        })))
      } catch {
        setExistingLeads([])
      }
    }
    fetchExistingLeads()
  }, [])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchBDMs = async () => {
      try {
        const data = await getBDMs()
        setBdms(data)
        const currentUser = getUserIdFromToken()
        if (currentUser) {
          const matchedBdm = data.find((b: BDM) =>
            (b.email && b.email === currentUser.email) ||
            b._id === currentUser.id ||
            b._id === (currentUser as any)._id ||
            b._id === currentUser.userId
          )
          if (matchedBdm) {
            setFormData(prev => ({ ...prev, assignedTo: matchedBdm._id }))
          } else {
            const fallbackId = (currentUser as any)._id || currentUser.id || currentUser.userId
            if (fallbackId) setFormData(prev => ({ ...prev, assignedTo: fallbackId }))
          }
        }
      } catch {}
    }
    fetchBDMs()
  }, [])

  useEffect(() => {
    const query = formData.phone.trim()
    const queryDigits = canonicalizePhoneDigits(query, countryCode)

    if (phoneLookupTimerRef.current) {
      window.clearTimeout(phoneLookupTimerRef.current)
    }

    if (queryDigits.length < 3) {
      setPhoneSuggestions([])
      setIsPhoneChecking(false)
      return
    }

    setIsPhoneChecking(true)
    phoneLookupTimerRef.current = window.setTimeout(() => {
      const lookupQuery = normalizePhoneLookup(query)
      const matches = existingLeads
        .filter(lead => normalizePhoneLookup(lead.phone).includes(lookupQuery))
        .slice(0, 6)
      setPhoneSuggestions(matches)
      setIsPhoneChecking(false)
    }, 120)

    return () => {
      if (phoneLookupTimerRef.current) {
        window.clearTimeout(phoneLookupTimerRef.current)
      }
    }
  }, [formData.phone, countryCode, existingLeads])
  const normalizePhoneLookup = (value: string) => buildInternationalPhone(value, countryCode)

  const stripCountryCodeFromPhone = (value: string) => normalizePhone(value, countryCode)

  const handlePhoneSuggestionSelect = (suggestion: PhoneLookupSuggestion) => {
    setFormData(prev => ({
      ...prev,
      phone: stripCountryCodeFromPhone(suggestion.phone),
      whom: (suggestion.whom as WhomOption) || prev.whom
    }))
    setPhoneError(null)
    setError(null)
    setIsPhoneFocused(false)
  }

  const checkPhoneDuplicate = async (phoneValue = formData.phone) => {
    const digitError = validatePhoneDigits(phoneValue, countryCode)
    if (digitError) { setPhoneError(digitError); return true }

    const normalizedPhone = buildInternationalPhone(phoneValue, countryCode)
    if (!normalizedPhone) return false

    const exactMatch = existingLeads.some(lead => buildInternationalPhone(lead.phone, countryCode) === normalizedPhone)
    if (exactMatch) {
      setPhoneError('This number already exists. Already used, try with another number.')
      return true
    }

    setPhoneError(null)
    return false
  }
  const handleAddFollowUp = () => {
    setFollowUps([...followUps, { id: Date.now(), date: getTodayStartLocal(), note: '', nextFollowUpDate: getTodayStartLocal() }])
  }
  const handleRemoveFollowUp = (id: number) => {
    if (followUps.length > 1) setFollowUps(followUps.filter(f => f.id !== id))
  }
  const handleFollowUpChange = (id: number, field: keyof FollowUpEntry, value: string) => {
    setFollowUps(followUps.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true); setError(null); setSuccess(null)
    try {
      const duplicate = await checkPhoneDuplicate()
      if (duplicate) {
        setIsSubmitting(false)
        return
      }

      await createLead({
        ...formData,
        phone: buildInternationalPhone(formData.phone, countryCode),
        countryCode,
        whom: formData.whom || undefined,
        source: formData.source as LeadSource,
        serviceInterest: formData.serviceInterest as ServiceInterest[],
        followUps: followUps.filter(f => f.date || f.note || f.nextFollowUpDate).map(f => ({ date: f.date, note: f.note, nextFollowUpDate: f.nextFollowUpDate })),
        lifecycleStage: 'New Inquiry' as const
      })
      setSuccess('Lead created successfully!')
      setTimeout(() => { onSuccess?.() }, 1000)
    } catch (err: any) {
      const message = String(err?.message || '')
      if (message.toLowerCase().includes('already exists') || message.toLowerCase().includes('already used')) {
        setPhoneError('This number already exists. Already used, try with another number.')
      } else {
        setError(message || 'Failed to create lead')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImportCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsImporting(true); setError(null); setSuccess(null)
        try {
          const result = await importLeadsFromCSV(file)
          setSuccess(`Successfully imported ${result.imported} leads${result.failed > 0 ? `. ${result.failed} failed.` : '.'}`)
          if (result.imported > 0) setTimeout(() => { onSuccess?.() }, 2000)
        } catch (err: any) {
          setError(err.message || 'Failed to import CSV')
        } finally {
          setIsImporting(false)
        }
      }
    }
    input.click()
  }

  // --- Shared section-header strip -----------------------------------------

  const SectionStrip = ({ title, subtitle, icon: Icon, colorClass }: { title: string; subtitle: string; icon: any; colorClass: string }) => (
    <div className="px-6 md:px-8 py-4 border-b border-gray-100 bg-white flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${colorClass}`}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-[15px] font-extrabold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-[12.5px] text-gray-500 font-medium">{subtitle}</p>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-4 pb-12">

      {/* -- Header ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            type="button" onClick={onCancel}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all bg-white shadow-sm hover:shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Input Lead
              <span className="px-2.5 py-0.5 bg-[#ebf0ff] text-[#1a56db] text-[10px] uppercase tracking-widest font-extrabold rounded-md border border-[#1a56db]/20 shadow-sm">
                New Inquiry Stage
              </span>
            </h1>
            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Add a prospective student manually or via CSV import.</p>
          </div>
        </div>
        <button
          onClick={handleImportCSV} disabled={isImporting}
          className="flex items-center justify-center gap-2 h-10 px-5 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all bg-white disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
        >
          <Upload className="w-4 h-4 text-[#1a56db]" />
          {isImporting ? 'Importing...' : 'Import CSV'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* -- Contact Information --------------------------------------------- */}
          <div className="bg-white rounded-[20px] border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col h-full">
            <SectionStrip 
              title="Contact Information" 
              subtitle="Basic details and contact information for the lead" 
              icon={User} 
              colorClass="bg-[#ebf0ff] text-[#1a56db] border border-[#1a56db]/10"
            />
            <div className="p-4 md:p-5 flex flex-col gap-4 flex-1">
              <div>
                <label className={labelCls}>
                  <User className="w-3.5 h-3.5 text-gray-400" /> Full Name <span className="text-red-500 normal-case ml-0.5">*</span>
                </label>
                <input
                  type="text" placeholder="e.g. John Doe" required
                  value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className={fieldCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
                </label>
                <input
                  type="email" placeholder="e.g. john@example.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={fieldCls}
                />
              </div>
              <div className="relative">
                <label className={labelCls}>
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone Number <span className="text-red-500 normal-case ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_170px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] rounded-xl overflow-visible group focus-within:ring-4 focus-within:ring-blue-500/10 transition-all bg-[#f8fafc]">
                  <div className="relative flex-shrink-0 border-y border-l border-gray-200 rounded-l-xl bg-transparent group-focus-within:border-[#1a56db] transition-colors">
                    <select
                      value={countryCode} onChange={e => {
                        const c = e.target.value
                        setCountryCode(c)
                        if (formData.phone.trim()) setPhoneError(validatePhoneDigits(formData.phone, c))
                      }}
                      className="h-11 bg-transparent border-0 pr-8 pl-3 appearance-none text-[13.5px] font-bold text-gray-800 min-w-[74px] cursor-pointer focus:ring-0"
                    >
                      {countryCodes.map((c, i) => (
                        <option key={`${c.code}-${i}`} value={c.code}>{formatPhoneCountryCode(c)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  <input
                    type="tel" placeholder="Enter phone number" required
                    value={formData.phone}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => window.setTimeout(() => {
                      setIsPhoneFocused(false)
                      if (formData.phone.trim()) setPhoneError(validatePhoneDigits(formData.phone, countryCode))
                    }, 120)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        await checkPhoneDuplicate()
                        return
                      }
                      if (e.key.length === 1 && /\D/.test(e.key)) {
                        e.preventDefault()
                      }
                    }}
                    onChange={e => {
                      const nextValue = normalizePhoneInput(e.target.value, countryCode)
                      setFormData({ ...formData, phone: nextValue })
                      setError(null)
                      setPhoneError(nextValue ? validatePhoneDigits(nextValue, countryCode) : null)
                    }}
                    className="h-11 px-3 bg-transparent border-y border-gray-200 text-[13.5px] text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none focus:bg-white focus:border-[#1a56db] transition-all group-hover:border-gray-300 group-focus-within:border-[#1a56db] group-focus-within:bg-white"
                  />
                  <div className="relative flex-shrink-0 border-y border-r border-gray-200 rounded-r-xl bg-transparent group-focus-within:border-[#1a56db] transition-colors">
                    <select
                      value={formData.whom || ''}
                      onChange={e => setFormData({ ...formData, whom: e.target.value as WhomOption | '' })}
                      className="h-11 w-full bg-transparent border-0 px-3 pr-8 appearance-none text-[13.5px] font-semibold text-gray-800 cursor-pointer focus:ring-0"
                    >
                      <option value="" disabled>Whom</option>
                      {whomOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                {(isPhoneFocused || isPhoneChecking) && (phoneSuggestions.length > 0 || isPhoneChecking) && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)] overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-gray-500">Phone Suggestions</p>
                      <span className="text-[11px] font-semibold text-gray-400">{isPhoneChecking ? 'Searching...' : `${phoneSuggestions.length} found`}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {!isPhoneChecking && phoneSuggestions.length === 0 ? (
                        <div className="px-4 py-3 text-[13px] text-gray-500">No matching phone suggestions.</div>
                      ) : (
                        phoneSuggestions.map(suggestion => (
                          <button
                            key={suggestion._id}
                            type="button"
                            onMouseDown={e => { e.preventDefault(); handlePhoneSuggestionSelect(suggestion) }}
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
                        ))
                      )}
                    </div>
                  </div>
                )}
                {phoneError && <p className="mt-2 text-[12px] font-semibold text-red-600">{phoneError}</p>}
              </div>
              <div>
                <label className={labelCls}>
                  <Globe className="w-3.5 h-3.5 text-gray-400" /> Lead Source <span className="text-red-500 normal-case ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.source} required
                    onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                    className={`${fieldCls} appearance-none pr-10 cursor-pointer`}
                  >
                    <option value="" disabled>Select source</option>
                    {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* -- Service & Assignment -------------------------------------------- */}
          <div className="bg-white rounded-[20px] border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col h-full">
            <SectionStrip 
              title="Service & Assignment" 
              subtitle="What is the lead interested in and who is handling them?" 
              icon={Briefcase} 
              colorClass="bg-[#ebf0ff] text-[#1a56db] border border-[#1a56db]/10"
            />
            <div className="p-4 md:p-5 flex flex-col gap-4 flex-1">
              <div ref={serviceDropdownRef}>
                <label className={labelCls}>
                  <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Service Interest <span className="text-red-500 normal-case ml-0.5">*</span>
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                    className={`${fieldCls} pr-10 cursor-pointer flex items-center min-h-[44px] h-auto py-1.5 ${formData.serviceInterest.length === 0 ? 'text-gray-400' : 'text-gray-900'} ${isServiceDropdownOpen ? 'border-[#1a56db] ring-4 ring-[#1a56db]/10 bg-white' : ''}`}
                  >
                    {formData.serviceInterest.length > 0
                      ? <div className="flex flex-wrap gap-1.5">
                          {formData.serviceInterest.map(svc => (
                            <span key={svc} className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#ebf0ff] text-[#1a56db] border border-[#1a56db]/20 shadow-[0_1px_2px_rgba(26,86,219,0.05)]">
                              {svc}
                            </span>
                          ))}
                        </div>
                      : 'Select requested services'}
                  </div>
                  <ChevronDown className={`absolute right-3.5 top-[14px] w-4 h-4 text-gray-400 pointer-events-none transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180 text-[#1a56db]' : ''}`} />

                  {isServiceDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] max-h-64 overflow-y-auto py-2 animate-in fade-in zoom-in-95 duration-100">
                      {serviceInterests.map(s => (
                        <label key={s} className="flex items-center px-4 py-2.5 hover:bg-[#f8fafc] cursor-pointer transition-colors group">
                          <div className="relative flex items-center justify-center w-4 h-4 mr-3 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={formData.serviceInterest.includes(s)}
                              onChange={e => {
                                const newServices = e.target.checked
                                  ? [...formData.serviceInterest, s]
                                  : formData.serviceInterest.filter(item => item !== s)
                                setFormData({ ...formData, serviceInterest: newServices })
                              }}
                              className="peer appearance-none w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-[#1a56db]/20 focus:outline-none checked:border-[#1a56db] checked:bg-[#1a56db] transition-all cursor-pointer"
                            />
                            <CheckCircle2 className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                          </div>
                          <span className="text-[13px] font-bold text-gray-700 group-hover:text-gray-900">{s}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> Assign to BDM <span className="text-red-500 normal-case ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.assignedTo} required
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    className={`${fieldCls} appearance-none cursor-pointer pr-10`}
                  >
                    <option value="" disabled>Select BDM</option>
                    {(() => {
                      const currentUserObj = getUserIdFromToken()
                      const fallbackId = currentUserObj ? ((currentUserObj as any)._id || currentUserObj.id || currentUserObj.userId) : null
                      const hasCurrentUserInBdms = bdms.some(b => b._id === fallbackId || (b.email && currentUserObj?.email && b.email === currentUserObj.email))
                      const displayBdms = [...bdms]
                      if (!hasCurrentUserInBdms && fallbackId) {
                        displayBdms.unshift({
                          _id: fallbackId,
                          name: currentUserName ? `${currentUserName} (Me)` : (currentUserObj?.email || 'Me'),
                          email: currentUserObj?.email || '', firstName: '', lastName: ''
                        } as any)
                      }
                      return displayBdms.map(bdm => (
                        <option key={bdm._id} value={bdm._id}>
                          {bdm.name || (bdm.firstName && bdm.lastName ? `${bdm.firstName} ${bdm.lastName}` : (bdm.email || 'Unknown'))}
                        </option>
                      ))
                    })()}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <label className={labelCls}>
                  <FileText className="w-3.5 h-3.5 text-gray-400" /> Notes & Requirements <span className="text-red-500 normal-case ml-0.5">*</span>
                </label>
                <textarea
                  placeholder="Add background information or specific requirements..."
                  value={formData.notes} rows={4} required
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full flex-1 min-h-[100px] px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-[13.5px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a56db] focus:bg-white transition-all resize-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* -- Follow-Up Details ----------------------------------------------- */}
        <div className="bg-white rounded-[20px] border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <SectionStrip 
            title="Follow-Up Schedule" 
            subtitle="Plan initial communication and future touchpoints" 
            icon={CalendarClock} 
            colorClass="bg-[#ebf0ff] text-[#1a56db] border border-[#1a56db]/10"
          />
          <div className="p-4 md:p-5 space-y-5">
            {followUps.map((followUp, index) => (
              <div key={followUp.id} className={`relative ${index > 0 ? 'pt-6 mt-6 border-t border-gray-100' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ebf0ff] text-[#1a56db] text-[11px] font-extrabold shadow-sm border border-[#1a56db]/20">
                      {index + 1}
                    </span>
                    <span className="text-[13.5px] font-extrabold text-gray-800 tracking-tight">
                      Follow-up Task
                    </span>
                  </div>
                  {followUps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFollowUp(followUp.id)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11.5px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 bg-[#f8fafc] p-4 rounded-[16px] border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div>
                    <label className={labelCls}>Action Date <span className="text-red-500 normal-case ml-0.5">*</span></label>
                    <div className="relative">
                      <input
                        type="date" required
                        value={followUp.date} min={getTodayStartLocal()}
                        onChange={e => handleFollowUpChange(followUp.id, 'date', e.target.value)}
                        className={`${fieldCls} pr-10 bg-white`}
                      />
                      <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Action Note <span className="text-red-500 normal-case ml-0.5">*</span></label>
                    <input
                      type="text" placeholder="e.g. Initial consultation call" required
                      value={followUp.note}
                      onChange={e => handleFollowUpChange(followUp.id, 'note', e.target.value)}
                      className={`${fieldCls} bg-white`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Next Follow-Up <span className="text-red-500 normal-case ml-0.5">*</span></label>
                    <div className="relative">
                      <input
                        type="date" required
                        value={followUp.nextFollowUpDate} min={getTodayStartLocal()}
                        onChange={e => handleFollowUpChange(followUp.id, 'nextFollowUpDate', e.target.value)}
                        className={`${fieldCls} pr-10 bg-white`}
                      />
                      <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button" onClick={handleAddFollowUp}
              className="w-full flex items-center justify-center gap-2.5 h-11 px-5 border border-dashed border-gray-300 rounded-[14px] text-[13px] font-bold text-gray-500 hover:border-[#1a56db]/50 hover:text-[#1a56db] hover:bg-[#ebf0ff] transition-all group shadow-sm"
            >
              <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center group-hover:bg-[#1a56db]/10 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              Add Another Follow-Up
            </button>
          </div>
        </div>

        {/* -- Action Buttons -------------------------------------------------- */}
        <div className="flex items-center justify-end gap-4 pt-4 pb-6">
          <button
            type="button" onClick={onCancel}
            className="h-11 px-8 bg-white border border-gray-200 rounded-xl text-[13.5px] font-bold text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 h-11 px-10 bg-[#1a56db] text-white text-[13.5px] font-bold rounded-xl shadow-[0_4px_14px_rgba(26,86,219,0.30)] hover:shadow-[0_6px_20px_rgba(26,86,219,0.40)] hover:bg-[#1341a8] active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin" />
                Saving Lead...
              </>
            ) : (
              'Save & Create Lead'
            )}
          </button>
        </div>
      </form>

      {/* -- Toast -------------------------------------------------------------- */}
      {(error || success) && (
        <div className="fixed bottom-8 right-8 max-w-sm z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
          {error && (
            <div className="bg-white border border-red-100 p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div>
                <h4 className="text-[13.5px] font-extrabold text-gray-900">Error</h4>
                <p className="text-[12.5px] font-medium text-gray-600 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <h4 className="text-[13.5px] font-extrabold text-gray-900">Success</h4>
                <p className="text-[12.5px] font-medium text-gray-600 mt-0.5 leading-relaxed">{success}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}








