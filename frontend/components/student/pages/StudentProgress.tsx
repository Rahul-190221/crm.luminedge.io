"use client";

import { useEffect, useState } from "react";
import { getMyMilestones } from "@/lib/api/milestones";
import type { StudentProfile, Milestone, MilestoneStatus } from "@/types/student";
import { CheckCircle, Circle, Clock, AlertCircle, ChevronDown } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

function MilestoneIcon({ status }: { status: MilestoneStatus }) {
  switch (status) {
    case "Completed":   return <CheckCircle size={18} className="text-green-500" />;
    case "In Progress": return <Clock size={18} className="text-blue-500 animate-pulse" />;
    case "Blocked":     return <AlertCircle size={18} className="text-red-400" />;
    default:            return <Circle size={18} className="text-gray-300" />;
  }
}

const statusColors: Record<MilestoneStatus, string> = {
  Completed:    "text-green-600 bg-green-50",
  "In Progress": "text-blue-600 bg-blue-50",
  Blocked:      "text-red-500 bg-red-50",
  Pending:      "text-gray-400 bg-gray-50",
};

export default function StudentProgress({ token, profile }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyMilestones(token)
      .then(data => setMilestones(data.milestones || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const completed = milestones.filter(m => m.status === "Completed").length;
  const progress = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#FACE39] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      {/* Progress header */}
      <div className="rounded-2xl bg-[#00000F] px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-bold text-[#FACE39]/60 uppercase tracking-widest">Overall Progress</p>
            <p className="text-sm text-white/60 mt-0.5">{profile.serviceCategory}</p>
          </div>
          <span className="text-3xl font-black text-[#FACE39]">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-[#FACE39] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-white/30 mt-2">{completed} of {milestones.length} milestones completed</p>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12 text-[#00000F]/40">
          <p className="text-sm font-bold">No milestones yet</p>
          <p className="text-xs mt-1">Milestones are created when your application is processed.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[17px] top-0 bottom-0 w-px bg-gray-100" />
          <div className="space-y-0">
            {milestones.map((m) => (
              <div key={m._id} className="relative flex gap-4 pb-4">
                <div className="relative z-10 flex-shrink-0 mt-0.5">
                  <MilestoneIcon status={m.status} />
                </div>
                <div
                  onClick={() => setExpandedId(expandedId === m._id ? null : m._id)}
                  className={`flex-1 rounded-2xl border p-4 cursor-pointer transition-colors ${
                    m.status === "In Progress"
                      ? "border-blue-200 bg-blue-50/50 hover:border-blue-300"
                      : "border-gray-100 bg-white hover:border-[#FACE39]/30"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${m.status === "Completed" ? "text-[#00000F]/40 line-through" : "text-[#00000F]"}`}>
                        {m.title}
                      </p>
                      {m.notes && <p className="text-xs text-[#00000F]/50 mt-0.5">{m.notes}</p>}
                      {m.completedAt && (
                        <p className="text-[10px] text-green-500 mt-1">
                          Completed {new Date(m.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[m.status]}`}>
                        {m.status}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-[#00000F]/30 transition-transform ${expandedId === m._id ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {expandedId === m._id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                      {m.description && (
                        <p className="text-xs text-[#00000F]/60 leading-relaxed">{m.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {m.serviceType && (
                          <span className="text-[10px] text-[#00000F]/40">
                            Service: <span className="font-bold text-[#00000F]/60">{m.serviceType}</span>
                          </span>
                        )}
                        {m.order != null && (
                          <span className="text-[10px] text-[#00000F]/40">
                            Step: <span className="font-bold text-[#00000F]/60">#{m.order}</span>
                          </span>
                        )}
                        {m.updatedBy && (
                          <span className="text-[10px] text-[#00000F]/40">
                            Updated by: <span className="font-bold text-[#00000F]/60">{m.updatedBy}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
