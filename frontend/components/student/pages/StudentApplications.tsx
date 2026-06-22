"use client";

import { useEffect, useState } from "react";
import { getMyApplications, submitApplication } from "@/lib/api/applications";
import type { StudentProfile, Application } from "@/types/student";
import { Plus, ChevronRight } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const STAGES = [
  "Submitted", "Under Review", "University Applied", "Offer Received",
  "Accepted", "Tuition Paid", "COE Received", "Visa Applied", "Visa Granted",
];

const COUNTRIES = ["Australia", "Canada", "UK", "USA", "New Zealand", "Germany", "Malaysia", "Other"];
const INTAKES = ["January 2025", "April 2025", "July 2025", "October 2025", "January 2026"];
const SERVICES = ["Language Prep", "Study Abroad", "Migration", "Visa", "Career"];

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    "Visa Granted": "text-green-600 bg-green-50 border-green-200",
    "Under Review": "text-blue-600 bg-blue-50 border-blue-200",
    "Submitted": "text-yellow-600 bg-yellow-50 border-yellow-200",
  };
  return colors[status] || "text-gray-600 bg-gray-50 border-gray-200";
}

export default function StudentApplications({ token }: Props) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    serviceType: "Study Abroad",
    serviceDetail: "",
    targetCountry: "",
    targetUniversity: "",
    targetCourse: "",
    preferredIntake: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getMyApplications(token);
      setApplications(data.applications || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitApplication(token, form as any);
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-[#FACE39] focus:ring-2 focus:ring-[#FACE39]/20 transition";
  const labelCls = "block text-xs font-bold text-[#00000F]/50 mb-1 uppercase tracking-wide";

  if (selected) {
    const idx = STAGES.indexOf(selected.status);
    return (
      <div className="w-full p-4 md:p-6 space-y-5">
        <button onClick={() => setSelected(null)} className="text-sm font-bold text-[#b08800] flex items-center gap-1">
          ← Back to Applications
        </button>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#00000F]">{selected.serviceType}</h3>
              {selected.targetCourse && <p className="text-xs text-[#00000F]/50">{selected.targetCourse}</p>}
              {selected.serviceDetail && <p className="text-xs text-[#00000F]/40 italic mt-0.5">{selected.serviceDetail}</p>}
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBadge(selected.status)}`}>
              {selected.status}
            </span>
          </div>

          {/* Stage timeline */}
          <div>
            <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-3">Application Journey</p>
            <div className="space-y-1">
              {STAGES.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                    i < idx ? "bg-green-400" : i === idx ? "bg-[#FACE39]" : "bg-gray-100 border border-gray-200"
                  }`} />
                  <span className={`text-xs ${i <= idx ? "font-bold text-[#00000F]" : "text-[#00000F]/30"}`}>{s}</span>
                  {i === idx && <span className="text-[10px] font-black text-[#b08800] bg-[#FACE39]/10 px-1.5 py-0.5 rounded">Current</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-100 pt-4">
            {[
              ["Target Country", selected.targetCountry],
              ["University", selected.targetUniversity],
              ["Intake", selected.preferredIntake],
              ["Submitted", new Date(selected.createdAt).toLocaleDateString()],
              ["Last Updated", new Date(selected.updatedAt).toLocaleDateString()],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l as string}>
                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">{l}</p>
                <p className="font-semibold text-[#00000F]">{v}</p>
              </div>
            ))}
          </div>

          {/* Your Team */}
          {selected.assignedBDM && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-3">Your Team</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: "BDM", staff: selected.assignedBDM },
                ].filter(({ staff }) => staff).map(({ label, staff }) => (
                  <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-7 h-7 rounded-full bg-[#FACE39]/30 flex items-center justify-center text-xs font-black text-[#b08800]">
                      {staff!.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">{label}</p>
                      <p className="text-xs font-bold text-[#00000F]">{staff!.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selected.notes && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-[#00000F]/70 bg-gray-50 rounded-xl p-3 leading-relaxed">{selected.notes}</p>
            </div>
          )}

          {/* Stage History */}
          {selected.stageHistory && selected.stageHistory.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-3">History</p>
              <div className="space-y-2.5">
                {[...selected.stageHistory].reverse().map((h, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FACE39] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#00000F]">{h.status}</p>
                      {h.note && <p className="text-xs text-[#00000F]/50 mt-0.5">{h.note}</p>}
                      <p className="text-[10px] text-[#00000F]/30 mt-0.5">{new Date(h.changedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-[#00000F]">My Applications</h3>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs font-black text-[#00000F] bg-[#FACE39] px-3 py-2 rounded-xl hover:bg-[#f0c020] transition">
          <Plus size={13} /> New Application
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#FACE39]/30 bg-white p-6 space-y-4">
          <h4 className="text-sm font-black text-[#00000F]">Submit New Application</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Service Type</label>
              <select className={inputCls} value={form.serviceType}
                onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Target Country</label>
              <select className={inputCls} value={form.targetCountry}
                onChange={e => setForm(f => ({ ...f, targetCountry: e.target.value }))}>
                <option value="">Select</option>
                {COUNTRIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Preferred Intake</label>
              <select className={inputCls} value={form.preferredIntake}
                onChange={e => setForm(f => ({ ...f, preferredIntake: e.target.value }))}>
                <option value="">Select</option>
                {INTAKES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Target University</label>
              <input className={inputCls} value={form.targetUniversity}
                onChange={e => setForm(f => ({ ...f, targetUniversity: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Target Course</label>
              <input className={inputCls} value={form.targetCourse}
                onChange={e => setForm(f => ({ ...f, targetCourse: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#00000F]/50 border border-gray-200 hover:border-gray-300 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#FACE39] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 text-[#00000F]/40">
          <p className="text-sm font-bold">No applications yet</p>
          <p className="text-xs mt-1">Click "New Application" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => (
            <button key={app._id} onClick={() => setSelected(app)}
              className="w-full text-left rounded-2xl border border-gray-100 bg-white p-4 hover:border-[#FACE39]/30 hover:shadow-[0_2px_16px_rgba(250,206,57,0.1)] transition-all flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-[#00000F]">{app.serviceType}</p>
                <p className="text-xs text-[#00000F]/50 mt-0.5">
                  {[app.targetCourse, app.targetCountry].filter(Boolean).join(" · ")}
                </p>
                <p className="text-[10px] text-[#00000F]/30 mt-1">{new Date(app.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge(app.status)}`}>
                  {app.status}
                </span>
                <ChevronRight size={14} className="text-[#00000F]/30" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
