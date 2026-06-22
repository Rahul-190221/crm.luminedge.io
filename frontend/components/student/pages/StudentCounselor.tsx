"use client";

import type { StudentProfile } from "@/types/student";
import { User, Mail, Phone } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

function StaffCard({ staff, role }: { staff: any; role: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#FACE39]/15 border border-[#FACE39]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-base font-black text-[#b08800]">{staff.name.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-[#00000F]">{staff.name}</p>
          <span className="inline-block mt-0.5 text-[10px] font-bold text-[#b08800] bg-[#FACE39]/10 px-2 py-0.5 rounded-full">{role}</span>
          {staff.email && (
            <div className="flex items-center gap-1 mt-2 text-xs text-[#00000F]/50">
              <Mail size={11} />
              {staff.email}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCounselor({ profile }: Props) {
  const hasStaff = !!profile.assignedBDM;

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div className="rounded-2xl bg-[#00000F] px-5 py-4">
        <h3 className="text-sm font-black text-white">Your Support Team</h3>
        <p className="text-xs text-white/40 mt-0.5">Your assigned staff members who will guide you through the process.</p>
      </div>

      {hasStaff ? (
        <div className="space-y-3">
          {profile.assignedBDM && <StaffCard staff={profile.assignedBDM} role="Business Development Manager" />}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <User size={20} className="text-gray-400" />
          </div>
          <p className="text-sm font-bold text-[#00000F]/60">No BDM assigned yet</p>
          <p className="text-xs text-[#00000F]/40 mt-1">
            Submit an application and our team will assign a BDM to your case.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h4 className="text-xs font-bold text-[#00000F]/40 uppercase tracking-wide mb-3">Contact Luminedge</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#00000F]/70">
            <Phone size={14} className="text-[#b08800]" />
            +880 1234 567890
          </div>
          <div className="flex items-center gap-2 text-sm text-[#00000F]/70">
            <Mail size={14} className="text-[#b08800]" />
            info@luminedge.com
          </div>
        </div>
      </div>
    </div>
  );
}
