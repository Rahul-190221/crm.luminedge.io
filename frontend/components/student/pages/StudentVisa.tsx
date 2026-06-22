"use client";

import { useEffect, useState } from "react";
import { getMyMilestones } from "@/lib/api/milestones";
import { getMyDocuments } from "@/lib/api/documents";
import type { StudentProfile, Milestone, StudentDocument } from "@/types/student";
import { Stamp, FileText, CheckCircle, Clock, Circle } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const VISA_DOC_TYPES = ["Passport", "Visa Form", "Bank Statement", "Sponsor Documents", "Police Clearance", "Medical Report"];

export default function StudentVisa({ token, profile }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [docs, setDocs] = useState<StudentDocument[]>([]);

  useEffect(() => {
    Promise.all([getMyMilestones(token), getMyDocuments(token)]).then(([ms, ds]) => {
      setMilestones((ms.milestones || []).filter((m: Milestone) =>
        m.title.toLowerCase().includes("visa") || m.serviceType === "Visa"
      ));
      setDocs((ds.documents || []).filter((d: StudentDocument) =>
        VISA_DOC_TYPES.includes(d.documentType)
      ));
    }).catch(() => {});
  }, [token]);

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div className="rounded-2xl bg-[#00000F] px-5 py-4">
        <div className="flex items-center gap-2">
          <Stamp size={16} className="text-[#FACE39]" />
          <div>
            <h3 className="text-sm font-black text-white">Visa Process</h3>
            <p className="text-xs text-white/40">Track your visa application status</p>
          </div>
        </div>
      </div>

      {/* Visa milestones */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h4 className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-4">Visa Milestones</h4>
        {milestones.length === 0 ? (
          <p className="text-sm text-[#00000F]/40 text-center py-4">No visa milestones yet</p>
        ) : (
          <div className="space-y-3">
            {milestones.map(m => (
              <div key={m._id} className="flex items-center gap-3">
                {m.status === "Completed" ? <CheckCircle size={15} className="text-green-500" /> :
                 m.status === "In Progress" ? <Clock size={15} className="text-blue-500" /> :
                 <Circle size={15} className="text-gray-300" />}
                <span className={`text-sm ${m.status === "Completed" ? "line-through text-[#00000F]/30" : "text-[#00000F]/70 font-medium"}`}>
                  {m.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visa document checklist */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h4 className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-4">Document Checklist</h4>
        <div className="space-y-2">
          {VISA_DOC_TYPES.map(type => {
            const doc = docs.find(d => d.documentType === type);
            return (
              <div key={type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-[#b08800]" />
                  <span className="text-sm text-[#00000F]/70">{type}</span>
                </div>
                {doc ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.status === "Approved" ? "text-green-600 bg-green-50" :
                    doc.status === "Uploaded" || doc.status === "Under Review" ? "text-blue-600 bg-blue-50" :
                    "text-gray-500 bg-gray-100"
                  }`}>
                    {doc.status}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium">Not uploaded</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
