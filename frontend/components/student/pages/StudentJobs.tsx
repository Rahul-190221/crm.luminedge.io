"use client";

import { useEffect, useState } from "react";
import { getMyMilestones } from "@/lib/api/milestones";
import type { StudentProfile, Milestone } from "@/types/student";
import { Briefcase, CheckCircle, Circle, Clock } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const CAREER_STAGES = ["Resume Reviewed", "LinkedIn Optimised", "Job Applications Sent", "Interview Scheduled", "Job Secured"];

export default function StudentJobs({ token, profile }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    getMyMilestones(token).then(d => {
      setMilestones((d.milestones || []).filter((m: Milestone) =>
        m.serviceType === "Career" ||
        CAREER_STAGES.some(s => m.title.toLowerCase().includes(s.split(" ")[0].toLowerCase()))
      ));
    }).catch(() => {});
  }, [token]);

  const completed = milestones.filter(m => m.status === "Completed").length;
  const progress = milestones.length ? Math.round((completed / milestones.length) * 100) : 0;

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div className="rounded-2xl bg-[#00000F] px-5 py-4 flex items-center gap-3">
        <Briefcase size={18} className="text-[#FACE39]" />
        <div>
          <h3 className="text-sm font-black text-white">Jobs & Career Support</h3>
          <p className="text-xs text-white/40">Track your career development journey</p>
        </div>
      </div>

      {milestones.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide">Career Progress</p>
            <span className="text-sm font-black text-[#FACE39]">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 mb-4">
            <div className="h-2 rounded-full bg-[#FACE39] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-3">
            {milestones.map(m => (
              <div key={m._id} className="flex items-center gap-3">
                {m.status === "Completed" ? <CheckCircle size={15} className="text-green-500" /> :
                 m.status === "In Progress" ? <Clock size={15} className="text-blue-500" /> :
                 <Circle size={15} className="text-gray-200" />}
                <span className={`text-sm ${m.status === "Completed" ? "line-through text-[#00000F]/30" : "text-[#00000F]/70 font-medium"}`}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h4 className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-3">Career Resources</h4>
        <div className="space-y-2">
          {[
            { label: "Resume Templates", desc: "ATS-optimised resume templates for your target country" },
            { label: "LinkedIn Tips", desc: "How to create a standout international profile" },
            { label: "Job Portals", desc: "Seek, Indeed, LinkedIn Jobs, and local job boards" },
            { label: "Interview Preparation", desc: "Common questions and cultural tips" },
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
