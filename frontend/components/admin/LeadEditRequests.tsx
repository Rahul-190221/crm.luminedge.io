'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Filter, RefreshCw, ShieldCheck, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { approveLeadEditRequest, getLeadEditRequests, rejectLeadEditRequest, type LeadEditRequestItem } from '@/lib/api/leadEditRequests';
import { getUserIdFromToken } from '@/lib/helpers/jwt';

const statusStyles: Record<LeadEditRequestItem['status'], { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const sectionLabels: Record<string, string> = {
  stage: 'Stage Change',
  'follow-up': 'Follow-up',
  contact: 'Contact',
  general: 'General Update',
};

type ComparisonRow = { label: string; previous: string; requested: string };

function prettyLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, ch => ch.toUpperCase());
}

function formatDate(value?: string): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? '');
}

function getLeadTitle(request: LeadEditRequestItem): string {
  const lead = typeof request.leadId === 'object' ? request.leadId : null;
  return lead?.fullName || request.leadSnapshot?.fullName || 'Unknown lead';
}

function getLeadMeta(request: LeadEditRequestItem): string[] {
  const lead = typeof request.leadId === 'object' ? request.leadId : null;
  const meta = [
    lead?.email || request.leadSnapshot?.email,
    lead?.phone || request.leadSnapshot?.phone,
    lead?.lifecycleStage || request.leadSnapshot?.lifecycleStage,
  ].filter(Boolean) as string[];
  return meta;
}

function describePayload(request: LeadEditRequestItem): string {
  const payload = request.payload || {};
  if (request.section === 'follow-up') {
    const bits = [
      payload.note ? String(payload.note) : 'Follow-up note',
      payload.date ? `Date: ${formatDate(payload.date)}` : '',
      payload.nextFollowUpDate ? `Next: ${formatDate(payload.nextFollowUpDate)}` : '',
    ].filter(Boolean);
    return bits.join(' | ');
  }

  if (request.section === 'stage') {
    return `Stage change to ${String(payload.lifecycleStage || payload.stage || 'Unknown')}`;
  }

  const entries = Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (entries.length === 0) return 'No changes supplied';

  return entries
    .slice(0, 4)
    .map(([key, value]) => `${prettyLabel(key)}: ${formatValue(value)}`)
    .join(' | ');
}

function buildComparisonRows(request: LeadEditRequestItem): ComparisonRow[] {
  const payload = request.payload || {};
  const snapshot = request.leadSnapshot || {};

  if (request.section === 'follow-up') {
    return [
      { label: 'Note', previous: 'No note', requested: String(payload.note || 'No note') },
      { label: 'Follow-up date', previous: 'N/A', requested: formatDate(payload.date) },
      { label: 'Next follow-up', previous: 'N/A', requested: formatDate(payload.nextFollowUpDate) },
    ];
  }

  if (request.section === 'stage') {
    return [
      { label: 'Stage', previous: String(snapshot.lifecycleStage || 'N/A'), requested: String(payload.lifecycleStage || payload.stage || 'N/A') },
    ];
  }

  if (request.section === 'contact') {
    return [
      { label: 'Email', previous: String(snapshot.email || 'No email'), requested: String(payload.email || 'No email') },
      { label: 'Phone', previous: String(snapshot.phone || 'No phone'), requested: String(payload.phone || 'No phone') },
    ];
  }

  const keys = new Set([...Object.keys(snapshot), ...Object.keys(payload)]);
  const rows: ComparisonRow[] = [];
  keys.forEach((key) => {
    if (['fullName', 'email', 'phone', 'lifecycleStage', 'source', 'serviceInterest', 'assignedTo'].indexOf(key) === -1 && !(key in payload)) {
      return;
    }

    const label = prettyLabel(key);
    const previous = (snapshot as Record<string, any>)[key];
    const requested = payload[key];
    if (previous === undefined && requested === undefined) return;
    rows.push({
      label,
      previous: formatValue(previous ?? 'N/A'),
      requested: formatValue(requested ?? 'N/A'),
    });
  });

  if (rows.length > 0) return rows;

  return Object.entries(payload).map(([key, value]) => ({
    label: prettyLabel(key),
    previous: 'N/A',
    requested: formatValue(value),
  }));
}

function getReviewerName(request: LeadEditRequestItem): string {
  if (typeof request.reviewedBy === 'object') return request.reviewedBy.name || request.reviewedBy.email || 'Admin';
  return 'Admin';
}

export default function LeadEditRequests() {
  const decoded = getUserIdFromToken();
  const isAdmin = decoded?.role === 'admin';
  const [requests, setRequests] = useState<LeadEditRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [selectedRequest, setSelectedRequest] = useState<LeadEditRequestItem | null>(null);

  useEffect(() => {
    let active = true;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getLeadEditRequests('all');
        if (!active) return;
        setRequests(Array.isArray(data) ? data : []);
      } catch (error: any) {
        if (!active) return;
        toast.error(error?.message || 'Failed to load edit requests');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRequests();
    return () => {
      active = false;
    };
  }, [refreshTick]);

  const counts = useMemo(() => {
    return requests.reduce(
      (acc, request) => {
        acc.total += 1;
        acc[request.status] += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [requests]);

  const visibleRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter(request => request.status === statusFilter);
  }, [requests, statusFilter]);

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    setBusyRequestId(requestId);
    try {
      const reviewNote = reviewNotes[requestId]?.trim();
      if (action === 'approve') {
        await approveLeadEditRequest(requestId, reviewNote || undefined);
        toast.success('Request approved');
      } else {
        await rejectLeadEditRequest(requestId, reviewNote || undefined);
        toast.success('Request rejected');
      }
      setReviewNotes(prev => ({ ...prev, [requestId]: '' }));
      setRefreshTick(t => t + 1);
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${action} request`);
    } finally {
      setBusyRequestId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Page Header */}
      <div className="-mx-6 -mt-6 mb-4 p-6 sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Requests</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
              <ShieldCheck className="w-3 h-3" />
              {isAdmin ? 'Admin Review' : 'My Requests'}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">BDM edits pending admin approval before updating lead records</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm text-center">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">Total</p>
            <p className="text-lg font-black text-gray-900">{counts.total}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 shadow-sm text-center">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">Pending</p>
            <p className="text-lg font-black text-amber-700">{counts.pending}</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 shadow-sm text-center">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">Approved</p>
            <p className="text-lg font-black text-emerald-700">{counts.approved}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_10px_35px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#1a56db] via-[#2f6bff] to-[#f6c945]" />
        <div className="p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1a56db]/15 bg-[#ebf0ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1a56db]">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdmin ? 'Admin Review Queue' : 'Your Edit Requests'}
            </div>
            <h1 className="text-xl font-black tracking-tight text-[#00000f]">
              Edit Requests
            </h1>
            <p className="max-w-2xl text-sm text-gray-500">
              BDM edits are stored as approval requests. Admins can review each change before it updates the lead record.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-gray-100 bg-white px-3 py-3 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Total</p>
              <p className="mt-1 text-xl font-black text-gray-900">{counts.total}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">Pending</p>
              <p className="mt-1 text-xl font-black text-amber-700">{counts.pending}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">Approved</p>
              <p className="mt-1 text-xl font-black text-emerald-700">{counts.approved}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">Rejected</p>
              <p className="mt-1 text-xl font-black text-rose-700">{counts.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${
            statusFilter === 'pending'
              ? 'bg-[#1a56db] text-white shadow-[0_6px_18px_rgba(26,86,219,0.24)]'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1a56db]/25 hover:text-[#1a56db]'
          }`}
        >
          <Filter className="w-4 h-4" />
          Pending
        </button>
        {(['all', 'approved', 'rejected'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition-all ${
              statusFilter === key
                ? 'bg-[#00000f] text-white shadow-[0_6px_18px_rgba(0,0,15,0.18)]'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRefreshTick(t => t + 1)}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:border-[#1a56db]/25 hover:text-[#1a56db] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-52 rounded-[24px] border border-gray-100 bg-white animate-pulse" />
          ))}
        </div>
      ) : visibleRequests.length === 0 ? (
        <div className="rounded-[26px] border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 w-10 h-10 text-gray-300" />
          <p className="text-lg font-black text-[#00000f]">No requests found</p>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? 'Once a BDM submits an edit, it will appear here for approval.'
              : 'Your submitted requests will appear here after you make a change.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleRequests.map((request) => {
            const status = statusStyles[request.status];
            const leadName = getLeadTitle(request);
            const leadMeta = getLeadMeta(request);
            const canReview = isAdmin && request.status === 'pending';

            return (
              <div
                key={request._id}
                className="rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)] overflow-hidden"
              >
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${status.cls}`}>
                        {request.status === 'pending' ? <Clock3 className="w-3.5 h-3.5" /> : request.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {status.label}
                      </span>
                      <span className="rounded-full border border-[#1a56db]/15 bg-[#ebf0ff] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#1a56db]">
                        {sectionLabels[request.section] || prettyLabel(request.section)}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        Requested {formatDate(request.createdAt)}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-[#00000f]">{leadName}</h2>
                      {leadMeta.length > 0 && (
                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {leadMeta.join(' | ')}
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-[#f8fafc] px-4 py-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Requested change</p>
                      <p className="mt-1 text-sm font-semibold text-gray-800">{describePayload(request)}</p>
                      {request.note && (
                        <p className="mt-2 text-sm text-gray-500">
                          Note: {request.note}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Requested by</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {typeof request.requestedBy === 'object' ? request.requestedBy.name || request.requestedBy.email || 'Unknown' : request.requestedByName || 'Unknown'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Last updated</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">{formatDate(request.updatedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[280px] space-y-3 md:max-w-[340px] md:min-w-[340px]">
                    {request.leadSnapshot && (
                      <div className="rounded-2xl border border-[#1a56db]/10 bg-[#ebf0ff] p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#1a56db]">Lead snapshot</p>
                        <div className="mt-2 space-y-1 text-sm text-[#00000f]">
                          {request.leadSnapshot.email && <p><span className="font-bold">Email:</span> {request.leadSnapshot.email}</p>}
                          {request.leadSnapshot.phone && <p><span className="font-bold">Phone:</span> {request.leadSnapshot.phone}</p>}
                          {request.leadSnapshot.source && <p><span className="font-bold">Source:</span> {request.leadSnapshot.source}</p>}
                          {request.leadSnapshot.lifecycleStage && <p><span className="font-bold">Stage:</span> {request.leadSnapshot.lifecycleStage}</p>}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#1a56db]/15 bg-white px-4 py-2.5 text-sm font-bold text-[#1a56db] transition-all hover:bg-[#ebf0ff]"
                      >
                        View Comparison
                      </button>
                    </div>

                    {!canReview && request.reviewedAt && (
                      <div className="rounded-2xl border border-gray-100 bg-[#fafafa] p-4">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Review details</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} on {formatDate(request.reviewedAt)}
                        </p>
                        {request.reviewNote && (
                          <p className="mt-2 text-sm text-gray-600">
                            {request.reviewNote}
                          </p>
                        )}
                      </div>
                    )}

                    {canReview && (
                      <div className="rounded-2xl border border-gray-100 bg-[#fafafa] p-4 space-y-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
                            Review note
                          </label>
                          <textarea
                            value={reviewNotes[request._id] || ''}
                            onChange={(e) => setReviewNotes(prev => ({ ...prev, [request._id]: e.target.value }))}
                            placeholder="Optional note for the BDM"
                            className="min-h-[88px] w-full resize-none rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#1a56db] focus:ring-4 focus:ring-[#1a56db]/10"
                          />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            disabled={busyRequestId === request._id}
                            onClick={() => handleReview(request._id, 'approve')}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busyRequestId === request._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={busyRequestId === request._id}
                            onClick={() => handleReview(request._id, 'reject')}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 transition-all hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busyRequestId === request._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {isAdmin && !canReview && request.status === 'pending' && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-amber-700">
                        This request is pending review but actions are unavailable.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Comparison</p>
                <h3 className="mt-1 text-2xl font-black text-[#00000f]">{getLeadTitle(selectedRequest)}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {sectionLabels[selectedRequest.section] || prettyLabel(selectedRequest.section)} &mdash; {statusStyles[selectedRequest.status].label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <div className="rounded-[24px] border border-gray-100 bg-[#fafafa] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Previous data</p>
                <div className="mt-4 space-y-3">
                  {buildComparisonRows(selectedRequest).map((row) => (
                    <div key={`prev-${row.label}`} className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">{row.label}</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 whitespace-pre-wrap">{row.previous}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#1a56db]/10 bg-[#ebf0ff] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#1a56db]">Requested data</p>
                <div className="mt-4 space-y-3">
                  {buildComparisonRows(selectedRequest).map((row) => (
                    <div key={`next-${row.label}`} className="rounded-2xl border border-[#1a56db]/15 bg-white px-4 py-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#1a56db]">{row.label}</p>
                      <p className="mt-1 text-sm font-semibold text-[#00000f] whitespace-pre-wrap">{row.requested}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
              <div>
                Requested by <span className="font-bold text-gray-900">{typeof selectedRequest.requestedBy === 'object' ? selectedRequest.requestedBy.name || selectedRequest.requestedBy.email || 'Unknown' : selectedRequest.requestedByName || 'Unknown'}</span>
                {selectedRequest.reviewedAt && (
                  <span> &mdash; Reviewed {formatDate(selectedRequest.reviewedAt)} by <span className="font-bold text-gray-900">{getReviewerName(selectedRequest)}</span></span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-2xl bg-[#00000f] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
