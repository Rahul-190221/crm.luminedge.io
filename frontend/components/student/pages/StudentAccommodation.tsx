"use client";

import { useEffect, useState } from "react";
import { getMyMilestones } from "@/lib/api/milestones";
import type { StudentProfile, Milestone } from "@/types/student";
import { Building2, CheckCircle, Circle, Clock } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const ACCOM_STAGES = ["Search Started", "Shortlisted", "Booked", "Rental Agreement Signed"];

export default function StudentAccommodation({ token, profile }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    getMyMilestones(token).then(d => {
      setMilestones((d.milestones || []).filter((m: Milestone) =>
        m.title.toLowerCase().includes("accommodation") || m.title.toLowerCase().includes("arrival") || m.title.toLowerCase().includes("flight")
      ));
    }).catch(() => {});
  }, [token]);

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div className="rounded-2xl bg-[#00000F] px-5 py-4 flex items-center gap-3">
        <Building2 size={18} className="text-[#FACE39]" />
        <div>
          <h3 className="text-sm font-black text-white">Accommodation Support</h3>
          <p className="text-xs text-white/40">Track your housing arrangements</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h4 className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-4">Accommodation Journey</h4>
        <div className="space-y-3">
          {ACCOM_STAGES.map((stage, i) => {
            const m = milestones[i];
            const status = m?.status || "Pending";
            return (
              <div key={stage} className="flex items-center gap-3">
                {status === "Completed" ? <CheckCircle size={15} className="text-green-500" /> :
                 status === "In Progress" ? <Clock size={15} className="text-blue-500" /> :
                 <Circle size={15} className="text-gray-200" />}
                <span className={`text-sm ${status === "Completed" ? "line-through text-[#00000F]/30" : "text-[#00000F]/70 font-medium"}`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h4 className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-3">Updates from Your Counselor</h4>
          <div className="space-y-2">
            {milestones.filter(m => m.notes).map(m => (
              <div key={m._id} className="border-l-2 border-[#FACE39] pl-3">
                <p className="text-xs font-bold text-[#00000F]">{m.title}</p>
                <p className="text-xs text-[#00000F]/50 mt-0.5">{m.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h4 className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-3">Resources</h4>
        <div className="space-y-2">
          {[
            { label: "University Student Housing", desc: "Check on-campus accommodation options" },
            { label: "Off-Campus Rental Guide", desc: "Tips for renting in your destination country" },
            { label: "Temporary Accommodation", desc: "Short-term options on arrival" },
          ].map(r => (
            <div key={r.label} className="py-2 border-b border-gray-50 last:border-0">
              <p className="text-sm font-bold text-[#00000F]">{r.label}</p>
              <p className="text-xs text-[#00000F]/40">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
