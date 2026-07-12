'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeadEditRequests, type LeadEditRequestItem } from '@/lib/api/leadEditRequests';

type RequestComparisonRow = { label: string; previous: string; requested: string };

function prettyLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, ch => ch.toUpperCase());
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value && typeof value === 'object') return JSON.stringify(value);
  return String(value ?? 'N/A');
}

function getLeadId(request: LeadEditRequestItem): string {
  return typeof request.leadId === 'string' ? request.leadId : request.leadId?._id || '';
}

function formatDate(value?: string): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB');
}

function buildRows(request: LeadEditRequestItem): RequestComparisonRow[] {
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
  const rows: RequestComparisonRow[] = [];

  keys.forEach((key) => {
    const previous = (snapshot as Record<string, any>)[key];
    const requested = (payload as Record<string, any>)[key];
    if (previous === undefined && requested === undefined) return;

    rows.push({
      label: prettyLabel(key),
      previous: formatValue(previous),
      requested: formatValue(requested),
    });
  });

  if (rows.length > 0) return rows;

  return Object.entries(payload).map(([key, value]) => ({
    label: prettyLabel(key),
    previous: 'N/A',
    requested: formatValue(value),
  }));
}

export default function LeadEditRequestHistory({ leadId, leadName, enabled }: { leadId: string; leadName: string; enabled: boolean }) {
  const [requests, setRequests] = useState<LeadEditRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<LeadEditRequestItem | null>(null);

  useEffect(() => {
    if (!enabled || !leadId) {
      setRequests([]);
      return;
    }

    let active = true;
    setLoading(true);

    getLeadEditRequests('all')
      .then((items) => {
        if (!active) return;
        setRequests((items || []).filter((request) => getLeadId(request) === leadId));
      })
      .catch((error: any) => {
        if (!active) return;
        setRequests([]);
        toast.error(error?.message || 'Failed to load edit requests');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled, leadId, refreshKey]);

  const sortedRequests = useMemo(() => requests, [requests]);

  if (!enabled) return null;
  if (!loading && sortedRequests.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 bg-[#1a56db] rounded-full" />
          <FileText className="w-4 h-4 text-[#1a56db]" />
          <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.05em]">Edit Requests</h3>
          <span className="text-[11px] font-extrabold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full ml-1">
            {sortedRequests.length}
          </span>
          <button
            type="button"
            onClick={() => setRefreshKey(v => v + 1)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-bold text-gray-600 hover:border-[#1a56db]/25 hover:text-[#1a56db] transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-gray-50 animate-pulse" />
            <div className="h-16 rounded-xl bg-gray-50 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRequests.map((request) => {
              const statusClass =
                request.status === 'approved'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : request.status === 'rejected'
                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700';

              return (
                <div key={request._id} className="rounded-xl border border-gray-100 bg-[#f8fafc] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${statusClass}`}>
                          {request.status}
                        </span>
                        <span className="rounded-full border border-[#1a56db]/15 bg-[#ebf0ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1a56db]">
                          {prettyLabel(request.section)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        Requested {formatDate(request.createdAt)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {request.note || 'No note provided'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#1a56db]/15 bg-white px-3.5 py-2 text-sm font-bold text-[#1a56db] hover:bg-[#ebf0ff] transition-all"
                    >
                      View Comparison
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-gray-400">Comparison</p>
                <h3 className="mt-1 text-2xl font-black text-[#00000f]">{leadName}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {prettyLabel(selectedRequest.section)} • {selectedRequest.status}
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
                  {buildRows(selectedRequest).map((row) => (
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
                  {buildRows(selectedRequest).map((row) => (
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
                Requested on <span className="font-bold text-gray-900">{formatDate(selectedRequest.createdAt)}</span>
                {selectedRequest.reviewedAt && (
                  <span> • Reviewed on <span className="font-bold text-gray-900">{formatDate(selectedRequest.reviewedAt)}</span></span>
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
    </>
  );
}
