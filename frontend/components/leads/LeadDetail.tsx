'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Mail, Phone, User, FileText, Clock,
  Tag, Activity, Calendar, RefreshCw, AlertCircle,
  MapPin, TrendingUp, Users, MessageSquare, Plus,
  ChevronDown, Check, X, Save
} from 'lucide-react';
import { getLead, addFollowUp, updateLeadStage, updateLead } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType } from '@/types/admin';

// ─── Stage config (brand-aligned) ────────────────────────────────────────────

const STAGE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Intake:     { bg: 'bg-[#00000F]/[0.05]',  text: 'text-[#00000F]/70', border: 'border-[#00000F]/15', dot: 'bg-[#00000F]/40' },
  Processing: { bg: 'bg-[#FACE39]/15',       text: 'text-[#00000F]',    border: 'border-[#FACE39]/35', dot: 'bg-[#FACE39]' },
  Hot:        { bg: 'bg-[#FACE39]/25',       text: 'text-[#00000F]',    border: 'border-[#FACE39]/50', dot: 'bg-[#FACE39]' },
  Converted:  { bg: 'bg-[#22C55E]/10',       text: 'text-[#16A34A]',    border: 'border-[#22C55E]/25', dot: 'bg-[#22C55E]' },
  Dead:       { bg: 'bg-[#00000F]/[0.05]',   text: 'text-[#00000F]/35', border: 'border-[#00000F]/10', dot: 'bg-[#00000F]/25' },
};

const STAGES: LeadStageType[] = ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'];

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function todayISO() { return new Date().toISOString().split('T')[0]; }
function todayDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const inputCls = "w-full h-10 px-3 border border-[#00000F]/[0.10] rounded-xl text-[13px] font-medium text-[#00000F] placeholder:text-[#00000F]/30 bg-white outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] transition-all";
const labelCls = "block text-[10.5px] font-bold text-[#00000F]/40 uppercase tracking-widest mb-1.5";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="w-[3px] h-4 bg-[#FACE39] rounded-full flex-shrink-0" />
      <span className="text-[#FACE39]/80">{icon}</span>
      <h3 className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function StageDropdown({ value, onChange, saving }: { value: LeadStageType; onChange: (s: LeadStageType) => void; saving: boolean }) {
  const [open, setOpen] = useState(false);
  const style = STAGE_STYLES[value] ?? STAGE_STYLES.Intake;

  return (
    <div className="relative inline-block">
      <button
        disabled={saving}
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-bold border transition-all hover:shadow-sm disabled:opacity-60 ${style.bg} ${style.text} ${style.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
        {value}
        {saving
          ? <RefreshCw className="w-3 h-3 animate-spin" />
          : <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,15,0.14)] border border-[#00000F]/[0.08] py-1.5 min-w-[160px]">
            <p className="px-4 py-2 text-[10px] font-bold text-[#00000F]/35 uppercase tracking-widest border-b border-[#00000F]/[0.05] mb-1">Change Stage</p>
            {STAGES.map(stage => {
              const sc = STAGE_STYLES[stage];
              const isSelected = stage === value;
              return (
                <button
                  key={stage}
                  onClick={() => { onChange(stage); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold transition-colors ${
                    isSelected ? `${sc.bg} ${sc.text}` : 'text-[#00000F]/65 hover:bg-[#00000F]/[0.04]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                  {stage}
                  {isSelected && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LeadDetailProps { id: string; onBack: () => void; }

export default function LeadDetail({ id, onBack }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageSaving, setStageSaving] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [contactSaving, setContactSaving] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [fuNote, setFuNote] = useState('');
  const [fuDate, setFuDate] = useState(todayDateTimeLocal());
  const [fuNext, setFuNext] = useState('');
  const [fuSaving, setFuSaving] = useState(false);
  const [fuError, setFuError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true); setError(null);
    getLead(id).then(setLead).catch(e => setError(e.message || 'Failed to load lead')).finally(() => setLoading(false));
  }, [id]);

  const handleStageChange = async (newStage: LeadStageType) => {
    if (!lead) return;
    setStageSaving(true); setStageError(null);
    try { setLead(await updateLeadStage(lead._id, newStage)); }
    catch (e: unknown) { setStageError(e instanceof Error ? e.message : 'Could not update stage'); }
    finally { setStageSaving(false); }
  };

  const handleSaveContact = async () => {
    if (!lead || (!editEmail.trim() && !editPhone.trim())) return;
    setContactSaving(true);
    try {
      const newEmail = editEmail.trim() ? (lead.email ? `${lead.email}, ${editEmail.trim()}` : editEmail.trim()) : lead.email;
      const newPhone = editPhone.trim() ? (lead.phone ? `${lead.phone}, ${editPhone.trim()}` : editPhone.trim()) : lead.phone;
      setLead(await updateLead(lead._id, { email: newEmail, phone: newPhone }));
      setEditingContact(false); setEditEmail(''); setEditPhone('');
    } catch (e: any) { alert(e.message || 'Failed to update contact info'); }
    finally { setContactSaving(false); }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !fuNote.trim()) return;
    setFuSaving(true); setFuError(null);
    try {
      setLead(await addFollowUp(lead._id, { note: fuNote.trim(), date: fuDate || undefined, nextFollowUpDate: fuNext || undefined }));
      setFuNote(''); setFuDate(todayISO()); setFuNext('');
    } catch (err: any) { setFuError(err.message || 'Failed to save follow-up'); }
    finally { setFuSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FACE39] border-t-[#00000F] mx-auto mb-3" />
        <p className="text-[12.5px] text-[#00000F]/40 font-medium">Loading lead profile…</p>
      </div>
    </div>
  );

  if (error || !lead) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-[#00000F]/20 mx-auto mb-3" />
        <p className="text-[14px] font-bold text-[#00000F]/70 mb-1">Could not load lead</p>
        <p className="text-[12px] text-[#00000F]/35 mb-5">{error}</p>
        <button onClick={onBack} className="px-5 py-2 bg-[#FACE39] text-[#00000F] text-[13px] font-bold rounded-xl shadow-[0_2px_12px_rgba(250,206,57,0.30)] hover:shadow-[0_6px_20px_rgba(250,206,57,0.45)] transition-all">
          Go Back
        </button>
      </div>
    </div>
  );

  const assignedName = lead.assignedTo
    ? (typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo)
    : null;

  return (
    <div className="space-y-4">

      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[12.5px] font-semibold text-[#00000F]/50 hover:text-[#00000F] hover:bg-[#00000F]/[0.05] transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-[#00000F]/15">/</span>
        <span className="text-[11.5px] text-[#00000F]/35 font-medium">Lead Center</span>
        <span className="text-[#00000F]/15">/</span>
        <span className="text-[11.5px] text-[#00000F]/65 font-semibold truncate max-w-[200px]">{lead.fullName}</span>
      </div>

      {/* ── Hero Card ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] overflow-hidden">
        <div className="h-[3px] bg-[#FACE39]" />
        <div className="px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FACE39]/15 border border-[#FACE39]/25 flex items-center justify-center text-[22px] font-bold text-[#00000F] flex-shrink-0">
            {lead.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-[21px] font-bold text-[#00000F] tracking-tight">{lead.fullName}</h1>
              <StageDropdown value={lead.lifecycleStage as LeadStageType} onChange={handleStageChange} saving={stageSaving} />
            </div>
            {stageError && <p className="text-[11.5px] text-red-500 font-medium mt-1">{stageError}</p>}
            <div className="flex flex-wrap gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-[12px] text-[#00000F]/45 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#00000F]/25" />{lead.email}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-[#00000F]/45 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#00000F]/25" />{lead.phone}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-[#00000F]/45 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#00000F]/25" />Added {fmt(lead.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0 hidden sm:block">
            <p className="text-[10.5px] text-[#00000F]/30 font-medium uppercase tracking-widest">Last updated</p>
            <p className="text-[12px] font-semibold text-[#00000F]/55 mt-0.5">{fmtTime(lead.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Tag className="w-3.5 h-3.5" />,          label: 'Source',      value: lead.source },
          { icon: <TrendingUp className="w-3.5 h-3.5" />,   label: 'Service',     value: Array.isArray(lead.serviceInterest) ? lead.serviceInterest.join(', ') : lead.serviceInterest },
          { icon: <Users className="w-3.5 h-3.5" />,        label: 'Assigned BDM',value: assignedName || '—' },
          { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Follow-ups', value: String(lead.followUps?.length ?? 0) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] px-4 py-3.5">
            <div className="text-[#FACE39] mb-2">{s.icon}</div>
            <p className="text-[10px] font-bold text-[#00000F]/35 uppercase tracking-widest">{s.label}</p>
            <p className="text-[13.5px] font-bold text-[#00000F] mt-0.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Detail Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-[3px] h-4 bg-[#FACE39] rounded-full" />
              <User className="w-3.5 h-3.5 text-[#FACE39]/70" />
              <h3 className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">Contact Information</h3>
            </div>
            {!editingContact && (
              <button
                onClick={() => { setEditEmail(''); setEditPhone(''); setEditingContact(true); }}
                className="flex items-center gap-1 text-[12px] font-bold text-[#FACE39] hover:text-[#00000F] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 px-3.5 py-3 bg-[#00000F]/[0.03] rounded-xl border border-[#00000F]/[0.05]">
              <Mail className="w-3.5 h-3.5 text-[#00000F]/25 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#00000F]/35 uppercase tracking-widest mb-1">Email</p>
                <div className="space-y-1">
                  {lead.email?.split(',').map((e, i) => (
                    <p key={i} className="text-[13px] font-semibold text-[#00000F]/75 break-all">{e.trim()}</p>
                  ))}
                </div>
                {editingContact && (
                  <input
                    type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                    placeholder="Add another email…"
                    className={`mt-2 ${inputCls}`}
                  />
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 px-3.5 py-3 bg-[#00000F]/[0.03] rounded-xl border border-[#00000F]/[0.05]">
              <Phone className="w-3.5 h-3.5 text-[#00000F]/25 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#00000F]/35 uppercase tracking-widest mb-1">Phone</p>
                <div className="space-y-1">
                  {lead.phone?.split(',').map((p, i) => (
                    <p key={i} className="text-[13px] font-semibold text-[#00000F]/75">{p.trim()}</p>
                  ))}
                </div>
                {editingContact && (
                  <input
                    type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    placeholder="Add another phone…"
                    className={`mt-2 ${inputCls}`}
                  />
                )}
              </div>
            </div>
          </div>
          {editingContact && (
            <div className="mt-3.5 flex items-center justify-end gap-2">
              <button
                disabled={contactSaving}
                onClick={() => setEditingContact(false)}
                className="h-8 px-3 text-[12px] font-semibold text-[#00000F]/45 hover:text-[#00000F] hover:bg-[#00000F]/[0.04] rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                disabled={contactSaving || (!editEmail.trim() && !editPhone.trim())}
                onClick={handleSaveContact}
                className="flex items-center gap-1.5 h-8 px-4 bg-[#FACE39] text-[#00000F] text-[12px] font-bold rounded-xl shadow-[0_2px_8px_rgba(250,206,57,0.30)] hover:shadow-[0_4px_16px_rgba(250,206,57,0.40)] transition-all disabled:opacity-50"
              >
                {contactSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </button>
            </div>
          )}
        </div>

        {/* Source & Service */}
        <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-[3px] h-4 bg-[#FACE39] rounded-full" />
            <Tag className="w-3.5 h-3.5 text-[#FACE39]/70" />
            <h3 className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">Source & Service</h3>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 px-3.5 py-3 bg-[#00000F]/[0.03] rounded-xl border border-[#00000F]/[0.05]">
              <MapPin className="w-3.5 h-3.5 text-[#00000F]/25 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-[#00000F]/35 uppercase tracking-widest mb-0.5">Source</p>
                <p className="text-[13px] font-bold text-[#00000F]/75">{lead.source}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3.5 py-3 bg-[#FACE39]/[0.08] rounded-xl border border-[#FACE39]/20">
              <TrendingUp className="w-3.5 h-3.5 text-[#FACE39] flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-[#FACE39]/70 uppercase tracking-widest mb-0.5">Service Interest</p>
                <p className="text-[13px] font-bold text-[#00000F]">{Array.isArray(lead.serviceInterest) ? lead.serviceInterest.join(', ') : lead.serviceInterest}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-[3px] h-4 bg-[#FACE39] rounded-full" />
              <FileText className="w-3.5 h-3.5 text-[#FACE39]/70" />
              <h3 className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">Notes</h3>
            </div>
            <p className="text-[13px] text-[#00000F]/65 leading-relaxed bg-[#00000F]/[0.03] rounded-xl px-4 py-3 border border-[#00000F]/[0.05]">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Assigned BDM */}
        {assignedName && (
          <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-[3px] h-4 bg-[#FACE39] rounded-full" />
              <Users className="w-3.5 h-3.5 text-[#FACE39]/70" />
              <h3 className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">Assigned BDM</h3>
            </div>
            <div className="flex items-center gap-3 px-3.5 py-3 bg-[#00000F]/[0.03] rounded-xl border border-[#00000F]/[0.05]">
              <div className="w-9 h-9 rounded-xl bg-[#FACE39] flex items-center justify-center text-[14px] font-bold text-[#00000F] flex-shrink-0">
                {assignedName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#00000F]/80">{assignedName}</p>
                <p className="text-[11px] text-[#00000F]/35 font-medium">Business Development Manager</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Follow-up Section ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#00000F]/[0.07] shadow-[0_1px_10px_rgba(0,0,15,0.05)] p-5">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-[3px] h-4 bg-[#FACE39] rounded-full" />
          <Activity className="w-3.5 h-3.5 text-[#FACE39]/70" />
          <h3 className="text-[11px] font-bold text-[#00000F]/45 uppercase tracking-widest">Follow-up History</h3>
          <span className="text-[11px] font-extrabold text-[#00000F]/50 bg-[#00000F]/[0.06] px-2.5 py-0.5 rounded-full">
            {lead.followUps?.length ?? 0}
          </span>
          <button
            onClick={() => { setShowFollowUpForm(v => !v); setFuError(null); }}
            className="ml-auto flex items-center gap-1.5 h-9 px-3.5 bg-[#FACE39] text-[#00000F] text-[12.5px] font-bold rounded-xl shadow-[0_2px_12px_rgba(250,206,57,0.30)] hover:shadow-[0_6px_20px_rgba(250,206,57,0.45)] active:scale-[0.97] transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Add Follow-Up
          </button>
        </div>

        {/* Follow-Up Form */}
        {showFollowUpForm && (
          <form onSubmit={handleAddFollowUp} className="bg-[#FACE39]/[0.04] border border-[#FACE39]/20 rounded-2xl p-4 space-y-4 mb-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#00000F]/50 uppercase tracking-widest">New Follow-Up Entry</p>
              <button
                type="button"
                onClick={() => { setShowFollowUpForm(false); setFuError(null); setFuNote(''); setFuDate(todayDateTimeLocal()); setFuNext(''); }}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#00000F]/[0.05] hover:bg-[#00000F]/10 text-[#00000F]/35 hover:text-[#00000F] transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Follow-Up Date</label>
                <input
                  type="datetime-local"
                  value={fuDate}
                  min={todayISO() + "T00:00"}
                  onChange={e => setFuDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Next Follow-Up Date</label>
                <input
                  type="datetime-local"
                  value={fuNext}
                  min={todayISO() + "T00:00"}
                  onChange={e => setFuNext(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Note <span className="text-red-400 normal-case">*</span></label>
              <textarea
                required rows={3} value={fuNote}
                onChange={e => setFuNote(e.target.value)}
                placeholder="Describe the follow-up interaction…"
                className="w-full px-3 py-2.5 bg-white border border-[#00000F]/[0.10] rounded-xl text-[13px] font-medium text-[#00000F] placeholder:text-[#00000F]/30 resize-none outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] transition-all"
              />
            </div>
            {fuError && <p className="text-[12px] text-red-500 font-medium">{fuError}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={fuSaving || !fuNote.trim()}
                className="flex items-center gap-1.5 h-9 px-5 bg-[#00000F] text-white text-[12.5px] font-bold rounded-xl hover:bg-[#00000F]/85 disabled:opacity-50 transition-all"
              >
                {fuSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {fuSaving ? 'Saving…' : 'Save & Add Another'}
              </button>
            </div>
          </form>
        )}

        {/* Timeline */}
        {lead.followUps && lead.followUps.length > 0 ? (
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[#00000F]/[0.08] rounded-full" />
            <div className="space-y-3.5">
              {[...lead.followUps].reverse().map((fu, i) => (
                <div key={`${fu.date || ''}-${(fu.note || '').slice(0, 48)}-${i}`} className="relative">
                  <div className="absolute -left-5 top-3.5 w-2.5 h-2.5 rounded-full bg-[#FACE39] border-2 border-white shadow-sm" />
                  <div className="ml-2 bg-white border border-[#00000F]/[0.07] shadow-[0_1px_6px_rgba(0,0,15,0.05)] rounded-xl px-4 py-3 hover:border-[#FACE39]/30 hover:shadow-[0_4px_16px_rgba(250,206,57,0.10)] transition-all">
                    <p className="text-[13px] text-[#00000F]/75 leading-relaxed font-medium">
                      {fu.note || <span className="text-[#00000F]/30 italic">No note</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {fu.date && (
                        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[#00000F]/50 font-medium bg-[#00000F]/[0.04] px-2.5 py-1 rounded-lg border border-[#00000F]/[0.07]">
                          <Clock className="w-3 h-3" />{fmt(fu.date)}
                        </span>
                      )}
                      {fu.nextFollowUpDate && (
                        <button
                          type="button"
                          onClick={() => { setShowFollowUpForm(true); setFuError(null); }}
                          className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#00000F] bg-[#FACE39]/20 px-2.5 py-1 rounded-lg border border-[#FACE39]/35 hover:bg-[#FACE39] hover:border-[#FACE39] hover:shadow-md transition-all"
                        >
                          <Calendar className="w-3 h-3" />Next: {fmt(fu.nextFollowUpDate)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !showFollowUpForm && (
            <div className="text-center py-10">
              <MessageSquare className="w-9 h-9 text-[#00000F]/10 mx-auto mb-2.5" />
              <p className="text-[13px] font-semibold text-[#00000F]/35">No follow-ups yet</p>
              <p className="text-[11.5px] text-[#00000F]/25 mt-1">Click "Add Follow-Up" to record the first interaction</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
