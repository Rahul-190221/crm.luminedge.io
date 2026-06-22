'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Upload, Trash2, AlertCircle, CheckCircle2, Calendar, ChevronDown, ArrowLeft } from 'lucide-react'
import { createLead, getBDMsForAssignment as getBDMs, importLeadsFromCSV } from '@/lib/api/leads'
import { getUserIdFromToken } from '@/lib/helpers/jwt'
import { getProfile } from '@/lib/api/auth'
import type { LeadSource, ServiceInterest, BDM } from '@/types/admin'

interface FollowUpEntry { id: number; date: string; note: string; nextFollowUpDate: string }

const countryCodes = [
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+95',  flag: '🇲🇲', name: 'Myanmar' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
]

const leadSources: LeadSource[] = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Walk-in', 'Phone', 'Other']
const serviceInterests: ServiceInterest[] = [
  'IELTS Premium', 'IELTS Crash', 'IELTS Intense', 'IELTS Elementary', 'IELTS Mock Test',
  'Basic English', 'GRE Premium', 'TOEFL Premium', 'PTE Premium',
  'Study Abroad', 'Visa Processing',
]

interface InputLeadProps { onSuccess?: () => void; onCancel?: () => void }

const fieldCls = 'w-full h-11 px-3 bg-white border border-[#00000F]/[0.10] rounded-xl text-[13px] text-[#00000F] placeholder:text-[#00000F]/25 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] transition-all'
const labelCls = 'block text-[10.5px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-1.5'

const getCurrentDateTimeLocal = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
const getTodayStartLocal = () => getCurrentDateTimeLocal().split('T')[0] + 'T00:00'

export default function InputLead({ onSuccess, onCancel }: InputLeadProps) {
  const [formData, setFormData] = useState(() => {
    const currentUserObj = getUserIdFromToken()
    const initialAssignedTo = currentUserObj ? ((currentUserObj as any)._id || currentUserObj.id || currentUserObj.userId || '') : ''
    return { fullName: '', email: '', phone: '', source: '' as LeadSource | '', serviceInterest: [] as string[], assignedTo: initialAssignedTo, notes: '' }
  })
  const [countryCode, setCountryCode] = useState('+880')
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>([
    { id: 1, date: getCurrentDateTimeLocal(), note: '', nextFollowUpDate: getCurrentDateTimeLocal() }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [bdms, setBdms] = useState<BDM[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string | null>(null)
  const serviceDropdownRef = useRef<HTMLDivElement>(null)

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

  const handleAddFollowUp = () => {
    setFollowUps([...followUps, { id: Date.now(), date: getCurrentDateTimeLocal(), note: '', nextFollowUpDate: getCurrentDateTimeLocal() }])
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
      await createLead({
        ...formData,
        phone: `${countryCode} ${formData.phone}`,
        source: formData.source as LeadSource,
        serviceInterest: formData.serviceInterest as ServiceInterest[],
        followUps: followUps.filter(f => f.date || f.note || f.nextFollowUpDate).map(f => ({ date: f.date, note: f.note, nextFollowUpDate: f.nextFollowUpDate })),
        lifecycleStage: 'Intake' as const
      })
      setSuccess('Lead created successfully!')
      setTimeout(() => { onSuccess?.() }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to create lead')
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

  // ─── Shared section-header strip ─────────────────────────────────────────

  const SectionStrip = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className="px-5 sm:px-8 py-4 border-b border-[#00000F]/[0.06] flex items-center gap-3">
      <span className="w-[3px] h-5 bg-[#FACE39] rounded-full flex-shrink-0" />
      <div>
        <h2 className="text-[14px] font-bold text-[#00000F] tracking-tight">{title}</h2>
        <p className="text-[11.5px] text-[#00000F]/40 font-medium mt-0.5">{subtitle}</p>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-4">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            type="button" onClick={onCancel}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#00000F]/10 text-[#00000F]/35 hover:text-[#00000F] hover:border-[#FACE39] hover:bg-[#FACE39]/[0.08] transition-all bg-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <h1 className="text-[21px] font-bold text-[#00000F] tracking-tight">Input Lead</h1>
            <p className="text-[12px] text-[#00000F]/40 font-medium mt-0.5">Add a new lead manually or import from CSV</p>
          </div>
        </div>
        <button
          onClick={handleImportCSV} disabled={isImporting}
          className="flex items-center gap-1.5 h-9 px-3.5 border border-[#00000F]/10 rounded-xl text-[12.5px] font-semibold text-[#00000F]/55 hover:text-[#00000F] hover:border-[#00000F]/25 hover:bg-[#00000F]/[0.03] transition-all bg-white disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          {isImporting ? 'Importing…' : 'Import from CSV'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Contact Information ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] overflow-hidden">
          <SectionStrip title="Contact Information" subtitle="Basic details about the lead" />
          <div className="px-5 sm:px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className={labelCls}>Full Name <span className="text-red-400 normal-case">*</span></label>
              <input
                type="text" placeholder="Enter lead name" required
                value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email" placeholder="Enter email address"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={fieldCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone Number <span className="text-red-400 normal-case">*</span></label>
              <div className="flex">
                <div className="relative flex-shrink-0">
                  <select
                    value={countryCode} onChange={e => setCountryCode(e.target.value)}
                    className={`${fieldCls} rounded-r-none border-r-0 pr-8 pl-3 appearance-none bg-[#00000F]/[0.02] min-w-[110px] cursor-pointer`}
                  >
                    {countryCodes.map((c, i) => (
                      <option key={`${c.code}-${i}`} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00000F]/30 pointer-events-none" />
                </div>
                <input
                  type="tel" placeholder="Enter phone number" required
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`${fieldCls} rounded-l-none`}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Lead Source <span className="text-red-400 normal-case">*</span></label>
              <div className="relative">
                <select
                  value={formData.source} required
                  onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className={`${fieldCls} appearance-none pr-10 cursor-pointer`}
                >
                  <option value="">Select source</option>
                  {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00000F]/30 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Service & Assignment ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] overflow-hidden">
          <SectionStrip title="Service & Assignment" subtitle="Service interest and BDM assignment" />
          <div className="px-5 sm:px-8 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div ref={serviceDropdownRef}>
              <label className={labelCls}>Service Interest <span className="text-red-400 normal-case">*</span></label>
              <div className="relative">
                <div
                  onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                  className={`${fieldCls} pr-10 cursor-pointer flex items-center min-h-[44px] h-auto py-2 ${formData.serviceInterest.length === 0 ? 'text-[#00000F]/25' : 'text-[#00000F]'}`}
                >
                  {formData.serviceInterest.length > 0
                    ? <div className="flex flex-wrap gap-1.5">
                        {formData.serviceInterest.map(svc => (
                          <span key={svc} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FACE39]/15 text-[#00000F] border border-[#FACE39]/30">
                            {svc}
                          </span>
                        ))}
                      </div>
                    : 'Select service'}
                </div>
                <ChevronDown className={`absolute right-3 top-3.5 w-3.5 h-3.5 text-[#00000F]/30 pointer-events-none transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />

                {isServiceDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1.5 bg-white border border-[#00000F]/[0.08] rounded-xl shadow-[0_8px_32px_rgba(0,0,15,0.12)] max-h-64 overflow-y-auto py-1">
                    {serviceInterests.map(s => (
                      <label key={s} className="flex items-center px-3 py-2.5 hover:bg-[#FACE39]/[0.05] cursor-pointer transition-colors group">
                        <div className="relative flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.serviceInterest.includes(s)}
                            onChange={e => {
                              const newServices = e.target.checked
                                ? [...formData.serviceInterest, s]
                                : formData.serviceInterest.filter(item => item !== s)
                              setFormData({ ...formData, serviceInterest: newServices })
                            }}
                            className="peer appearance-none w-5 h-5 border-2 border-[#00000F]/20 rounded focus:ring-0 focus:outline-none checked:border-[#FACE39] checked:bg-[#FACE39] transition-all cursor-pointer"
                          />
                          <CheckCircle2 className="absolute w-3.5 h-3.5 text-[#00000F] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                        <span className="text-[13px] font-medium text-[#00000F]/70 group-hover:text-[#00000F]">{s}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Assign to BDM <span className="text-red-400 normal-case">*</span></label>
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00000F]/30 pointer-events-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Notes <span className="text-red-400 normal-case">*</span></label>
              <textarea
                placeholder="Add any additional notes about this lead…"
                value={formData.notes} rows={4} required
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-[#00000F]/[0.10] rounded-xl text-[13px] font-medium text-[#00000F] placeholder:text-[#00000F]/25 focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Follow-Up Details ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] overflow-hidden">
          <SectionStrip title="Follow-Up Details" subtitle="Schedule follow-up appointments" />
          <div className="px-5 sm:px-8 py-5 space-y-5">
            {followUps.map((followUp, index) => (
              <div key={followUp.id} className={index > 0 ? 'pt-5 border-t border-[#00000F]/[0.06]' : ''}>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FACE39]/12 border border-[#FACE39]/25 rounded-lg text-[11px] font-bold text-[#00000F]/70">
                    Follow Up {index + 1}
                  </span>
                  {followUps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFollowUp(followUp.id)}
                      className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11.5px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Date <span className="text-red-400 normal-case">*</span></label>
                    <div className="relative">
                      <input
                        type="datetime-local" required
                        value={followUp.date} min={getTodayStartLocal()}
                        onChange={e => handleFollowUpChange(followUp.id, 'date', e.target.value)}
                        className={`${fieldCls} pr-10`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00000F]/25 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Note <span className="text-red-400 normal-case">*</span></label>
                    <input
                      type="text" placeholder="Add follow-up note" required
                      value={followUp.note}
                      onChange={e => handleFollowUpChange(followUp.id, 'note', e.target.value)}
                      className={fieldCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Next Follow-Up Date <span className="text-red-400 normal-case">*</span></label>
                    <div className="relative">
                      <input
                        type="datetime-local" required
                        value={followUp.nextFollowUpDate} min={getTodayStartLocal()}
                        onChange={e => handleFollowUpChange(followUp.id, 'nextFollowUpDate', e.target.value)}
                        className={`${fieldCls} pr-10`}
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00000F]/25 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button" onClick={handleAddFollowUp}
              className="flex items-center gap-2 h-9 px-4 border border-dashed border-[#00000F]/[0.15] rounded-xl text-[12px] font-bold text-[#00000F]/35 hover:border-[#FACE39]/50 hover:text-[#00000F]/60 hover:bg-[#FACE39]/[0.04] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Follow-Up
            </button>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pb-4">
          <button
            type="submit" disabled={isSubmitting}
            className="flex items-center gap-2 h-11 px-8 bg-[#FACE39] text-[#00000F] text-[13px] font-bold rounded-xl shadow-[0_2px_12px_rgba(250,206,57,0.30)] hover:shadow-[0_6px_20px_rgba(250,206,57,0.45)] active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving…' : 'Save Lead'}
          </button>
          <button
            type="button" onClick={onCancel}
            className="h-11 px-8 border border-[#00000F]/10 rounded-xl text-[13px] font-bold text-[#00000F]/55 hover:text-[#00000F] hover:border-[#00000F]/25 hover:bg-[#00000F]/[0.03] transition-all"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {(error || success) && (
        <div className="fixed bottom-8 right-8 max-w-sm z-50">
          {error && (
            <div className="bg-white border border-red-100 px-5 py-4 rounded-2xl shadow-[0_16px_48px_rgba(0,0,15,0.14)] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-[13px] font-semibold text-[#00000F]/70">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-white border border-[#22C55E]/20 px-5 py-4 rounded-2xl shadow-[0_16px_48px_rgba(0,0,15,0.14)] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#22C55E]" />
              <p className="text-[13px] font-semibold text-[#00000F]/70">{success}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
