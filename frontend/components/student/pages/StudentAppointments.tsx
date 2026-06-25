"use client";

import { useEffect, useState } from "react";
import { getMyAppointments, requestAppointment } from "@/lib/api/appointments";
import type { StudentProfile, Appointment } from "@/types/student";
import { Calendar, Plus, X } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const APPT_TYPES = ["Counseling", "Visa Consultation", "Interview Prep", "Language Course Meeting"];

const staffTypeLabel: Record<string, string> = {
  bdm: "BDM",
  counselor: "Counselor",
  "visa-officer": "Visa Officer",
};

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    Scheduled: "text-blue-600 bg-blue-50",
    Completed: "text-green-600 bg-green-50",
    Cancelled: "text-red-500 bg-red-50",
    Rescheduled: "text-yellow-600 bg-yellow-50",
  };
  return colors[status] || "text-gray-500 bg-gray-100";
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-[#FACE39] focus:ring-2 focus:ring-[#FACE39]/20 transition";
const labelCls = "block text-xs font-bold text-[#00000F]/50 mb-1 uppercase tracking-wide";

export default function StudentAppointments({ token }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewAppt, setViewAppt] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ type: APPT_TYPES[0], scheduledAt: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const data = await getMyAppointments(token);
      setAppointments(data.appointments || []);
    } catch {}
  }

  useEffect(() => { load(); }, [token]);

  async function handleSubmit() {
    if (!form.scheduledAt) return;
    setSubmitting(true);
    try {
      await requestAppointment(token, form);
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  const upcoming = appointments.filter(a => a.status === "Scheduled" && new Date(a.scheduledAt) >= new Date());
  const past = appointments.filter(a => a.status !== "Scheduled" || new Date(a.scheduledAt) < new Date());

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      {/* Appointment detail modal */}
      {viewAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewAppt(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-[#00000F]">{viewAppt.type}</h4>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(viewAppt.status)}`}>
                  {viewAppt.status}
                </span>
                <button onClick={() => setViewAppt(null)} className="text-[#00000F]/30 hover:text-[#00000F] transition">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
              <div>
                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">Date & Time</p>
                <p className="text-sm font-semibold text-[#00000F]">{new Date(viewAppt.scheduledAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">Duration</p>
                <p className="text-sm font-semibold text-[#00000F]">{viewAppt.durationMinutes} minutes</p>
              </div>
              {viewAppt.staffId && (
                <div>
                  <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">Staff</p>
                  <p className="text-sm font-semibold text-[#00000F]">
                    {viewAppt.staffId.name}
                    {viewAppt.staffType && (
                      <span className="ml-1.5 text-[10px] font-bold text-[#b08800] bg-[#FACE39]/20 px-1.5 py-0.5 rounded">
                        {staffTypeLabel[viewAppt.staffType] || viewAppt.staffType}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {viewAppt.notes && (
              <div>
                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase mb-1">Notes</p>
                <p className="text-xs text-[#00000F]/60 bg-gray-50 rounded-xl p-2.5">{viewAppt.notes}</p>
              </div>
            )}

            <p className="text-[10px] text-[#00000F]/30">Booked on {new Date(viewAppt.createdAt).toLocaleDateString()}</p>

            {viewAppt.meetingLink && (
              <a
                href={viewAppt.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition">
                Join Meeting →
              </a>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#b08800]" />
          <h3 className="text-sm font-black text-[#00000F]">Appointments</h3>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-xs font-black text-[#00000F] bg-[#FACE39] px-3 py-2 rounded-xl hover:bg-[#f0c020] transition">
          <Plus size={12} /> Book
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-[#FACE39]/30 bg-white p-5 space-y-4">
          <h4 className="text-sm font-black text-[#00000F]">Request Appointment</h4>
          <div>
            <label className={labelCls}>Type</label>
            <select className={inputCls} value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {APPT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Preferred Date & Time</label>
            <input type="date" min={new Date().toISOString().slice(0, 10)} className={inputCls} value={form.scheduledAt}
              onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Notes (optional)</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any specific topics..." />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={submitting || !form.scheduledAt}
              className="px-4 py-2 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition disabled:opacity-60">
              {submitting ? "Sending..." : "Request Appointment"}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#00000F]/50 border border-gray-200 hover:border-gray-300 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide">Upcoming</p>
          {upcoming.map(a => (
            <div key={a._id}
              onClick={() => setViewAppt(a)}
              className="rounded-2xl border border-[#FACE39]/30 bg-[#FACE39]/5 p-4 cursor-pointer hover:border-[#FACE39]/60 transition">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#00000F]">{a.type}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>{a.status}</span>
              </div>
              <p className="text-xs text-[#00000F]/50 mt-1">
                {new Date(a.scheduledAt).toLocaleString()}
              </p>
              {a.staffId && <p className="text-xs text-[#b08800] mt-1">With: {(a.staffId as any).name}</p>}
              {a.meetingLink && (
                <a href={a.meetingLink} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-xs font-bold text-blue-600 mt-1 block">Join Meeting →</a>
              )}
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide">Past</p>
          {past.map(a => (
            <div key={a._id}
              onClick={() => setViewAppt(a)}
              className="rounded-2xl border border-gray-100 bg-white p-4 cursor-pointer hover:border-[#FACE39]/30 transition">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#00000F]/60">{a.type}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(a.status)}`}>{a.status}</span>
              </div>
              <p className="text-xs text-[#00000F]/40 mt-1">{new Date(a.scheduledAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {appointments.length === 0 && !showForm && (
        <div className="text-center py-12 text-[#00000F]/40">
          <Calendar size={24} className="mx-auto mb-2 text-gray-200" />
          <p className="text-sm font-bold">No appointments yet</p>
        </div>
      )}
    </div>
  );
}
