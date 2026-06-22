'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, User, FileText, Clock,
  Tag, Activity, Calendar, RefreshCw, AlertCircle,
  MapPin, TrendingUp, Users, MessageSquare, Plus,
  ChevronDown, Check, X, Save
} from 'lucide-react';
import { getLead, addFollowUp, updateLeadStage } from '@/lib/api/leads';
import { getUserIdFromToken } from '@/lib/helpers/jwt';
import type { Lead, LeadStage as LeadStageType } from '@/types/admin';

const STAGE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Converted: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  Dead:       { bg: 'bg-red-50',   text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  Hot:        { bg: 'bg-orange-50',text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Processing: { bg: 'bg-yellow-50',text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Intake:     { bg: 'bg-blue-50',  text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
};

const STAGES: LeadStageType[] = ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'];

const AVATAR_COLORS = [
  ['bg-yellow-100','text-yellow-700'],
  ['bg-purple-100','text-purple-700'],
  ['bg-pink-100','text-pink-700'],
  ['bg-indigo-100','text-indigo-700'],
  ['bg-teal-100','text-teal-700'],
  ['bg-cyan-100','text-cyan-700'],
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

interface StageDropdownProps {
  value: LeadStageType;
  onChange: (s: LeadStageType) => void;
  saving: boolean;
}

function StageDropdown({ value, onChange, saving }: StageDropdownProps) {
  const [open, setOpen] = useState(false);
  const style = STAGE_STYLES[value] ?? STAGE_STYLES.Intake;

  return (
    <div className="relative inline-block">
      <button
        disabled={saving}
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:shadow-md disabled:opacity-60 ${style.bg} ${style.text} ${style.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
        {value}
        {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[160px]">
            <p className="px-3.5 pt-1 pb-2 text-[12px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50">
              Change Stage
            </p>
            {STAGES.map(stage => {
              const sc = STAGE_STYLES[stage];
              const isSelected = stage === value;
              return (
                <button
                  key={stage}
                  onClick={() => { onChange(stage); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors ${
                    isSelected ? `${sc.bg} ${sc.text}` : 'text-gray-600 hover:bg-white'
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

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stage update state
  const [stageSaving, setStageSaving] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  // Follow-up form state
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [fuNote, setFuNote] = useState('');
  const [fuDate, setFuDate] = useState(todayISO());
  const [fuNext, setFuNext] = useState('');
  const [fuSaving, setFuSaving] = useState(false);
  const [fuError, setFuError] = useState<string | null>(null);

  useEffect(() => {
    const decoded = getUserIdFromToken();
    if (!decoded) { router.replace('/'); return; }
  }, [router]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getLead(id)
      .then(setLead)
      .catch((e) => setError(e.message || 'Failed to load lead'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStageChange = async (newStage: LeadStageType) => {
    if (!lead) return;
    setStageSaving(true);
    setStageError(null);
    try {
      const updated = await updateLeadStage(lead._id, newStage);
      setLead(updated);
    } catch (e: unknown) {
      setStageError(e instanceof Error ? e.message : 'Could not update stage');
    } finally {
      setStageSaving(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !fuNote.trim()) return;
    setFuSaving(true);
    setFuError(null);
    try {
      const updated = await addFollowUp(lead._id, {
        note: fuNote.trim(),
        date: fuDate || undefined,
        nextFollowUpDate: fuNext || undefined,
      });
      setLead(updated);
      setFuNote('');
      setFuDate(todayISO());
      setFuNext('');
      setShowFollowUpForm(false);
    } catch (err: any) {
      setFuError(err.message || 'Failed to save follow-up');
    } finally {
      setFuSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-[#FACE39] mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading lead profile…</p>
      </div>
    </div>
  );

  if (error || !lead) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-800 font-semibold mb-1">Could not load lead</p>
        <p className="text-gray-400 text-sm mb-5">{error}</p>
        <button onClick={() => router.back()} className="px-5 py-2.5 bg-[#FACE39] text-gray-900 text-sm font-bold rounded-xl hover:bg-[#FACE39]/80 transition">
          Go Back
        </button>
      </div>
    </div>
  );

  const [avatarBg, avatarText] = avatarColor(lead.fullName);
  const assignedName = lead.assignedTo
    ? (typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo)
    : null;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top navigation bar ─────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-200">/</span>
          <Link href="/bdm/dashboard" className="text-xs text-gray-400 font-medium hover:text-[#00000F] transition-colors">
            BDM Home
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-xs text-gray-400 font-medium">Lead Center</span>
          <span className="text-gray-200">/</span>
          <span className="text-xs text-gray-700 font-semibold truncate max-w-[180px]">{lead.fullName}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Hero card ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#FACE39] via-yellow-300 to-yellow-100" />
          <div className="px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-sm flex-shrink-0 ${avatarBg} ${avatarText}`}>
              {lead.fullName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-gray-900">{lead.fullName}</h1>
                {/* Stage badge — clickable to change */}
                <StageDropdown
                  value={lead.lifecycleStage as LeadStageType}
                  onChange={handleStageChange}
                  saving={stageSaving}
                />
              </div>
              {stageError && (
                <p className="text-xs text-red-600 font-medium mt-1.5">{stageError}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{lead.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Added {fmt(lead.createdAt)}</span>
              </div>
            </div>

            <div className="text-right flex-shrink-0 hidden sm:block">
              <p className="text-[11px] text-gray-400">Last updated</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">{fmtTime(lead.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: <Tag className="w-4 h-4" />, label: 'Source', value: lead.source },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'Service', value: lead.serviceInterest },
            { icon: <Users className="w-4 h-4" />, label: 'Assigned BDM', value: assignedName || '—' },
            { icon: <MessageSquare className="w-4 h-4" />, label: 'Follow-ups', value: String(lead.followUps?.length ?? 0) },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
              <div className="flex items-center gap-2 text-[#FACE39] mb-2">{s.icon}</div>
              <p className="text-[12px] text-gray-400 uppercase tracking-wider font-semibold">{s.label}</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Detail grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-yellow-50 rounded-lg text-[#FACE39]"><User className="w-4 h-4" /></span>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-gray-800">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-gray-800">{lead.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Source & Service */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-yellow-50 rounded-lg text-[#FACE39]"><Tag className="w-4 h-4" /></span>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Source & Service</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400 uppercase tracking-wide">Source</p>
                  <p className="text-sm font-bold text-gray-800">{lead.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <TrendingUp className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-yellow-600 uppercase tracking-wide">Service Interest</p>
                  <p className="text-sm font-bold text-yellow-800">{lead.serviceInterest}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-yellow-50 rounded-lg text-[#FACE39]"><FileText className="w-4 h-4" /></span>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-white rounded-xl px-4 py-3 border border-gray-100">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Assigned BDM */}
          {assignedName && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1.5 bg-yellow-50 rounded-lg text-[#FACE39]"><Users className="w-4 h-4" /></span>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned BDM</h3>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="w-9 h-9 rounded-xl bg-[#FACE39] flex items-center justify-center text-sm font-black text-gray-900">
                  {assignedName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{assignedName}</p>
                  <p className="text-xs text-gray-400">Business Development Manager</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Follow-up Section ─────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="p-1.5 bg-yellow-50 rounded-lg text-[#FACE39]"><Activity className="w-4 h-4" /></span>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Follow-up History
            </h3>
            <span className="ml-1 text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {lead.followUps?.length ?? 0}
            </span>
            <button
              onClick={() => { setShowFollowUpForm(v => !v); setFuError(null); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#FACE39] hover:bg-[#FACE39]/80 text-gray-900 text-xs font-bold rounded-lg transition-all"
            >
              {showFollowUpForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showFollowUpForm ? 'Cancel' : 'Add Follow-Up'}
            </button>
          </div>

          {/* Follow-Up Form */}
          {showFollowUpForm && (
            <form onSubmit={handleAddFollowUp} className="mb-6 bg-yellow-50 border border-yellow-100 rounded-2xl p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Follow-Up Date
                  </label>
                  <input
                    type="date" min={new Date().toISOString().split('T')[0]}
                    value={fuDate}
                    onChange={e => setFuDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Next Follow-Up Date
                  </label>
                  <input
                    type="date" min={new Date().toISOString().split('T')[0]}
                    value={fuNext}
                    onChange={e => setFuNext(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-yellow-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Note <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={fuNote}
                  onChange={e => setFuNote(e.target.value)}
                  placeholder="Describe the follow-up interaction…"
                  className="w-full px-3 py-2 bg-white border border-yellow-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40"
                />
              </div>
              {fuError && (
                <p className="text-xs text-red-600 font-medium">{fuError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowFollowUpForm(false); setFuError(null); }}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fuSaving || !fuNote.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                  {fuSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Follow-Up
                </button>
              </div>
            </form>
          )}

          {/* Timeline */}
          {lead.followUps && lead.followUps.length > 0 ? (
            <div className="relative pl-5">
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100 rounded-full" />
              <div className="space-y-4">
                {[...lead.followUps].reverse().map((fu, i) => (
                  <div
                    key={`${fu.date || ''}-${(fu.note || '').slice(0, 48)}-${i}`}
                    className="relative"
                  >
                    <div className="absolute -left-5 top-3 w-3 h-3 rounded-full bg-[#FACE39] border-2 border-white shadow-sm" />
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 ml-2">
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                        {fu.note || <span className="text-gray-400 italic">No note</span>}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        {fu.date && (
                          <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            {fmt(fu.date)}
                          </span>
                        )}
                        {fu.nextFollowUpDate && (
                          <span className="flex items-center gap-1.5 text-[11px] text-[#FACE39] font-semibold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                            <Calendar className="w-3 h-3" />
                            Next: {fmt(fu.nextFollowUpDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            !showFollowUpForm && (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No follow-ups yet</p>
                <p className="text-xs text-gray-300 mt-1">Click "Add Follow-Up" to record the first interaction</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
