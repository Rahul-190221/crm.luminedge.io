"use client";

import type { StudentProfile } from "@/types/student";
import { Bell } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

export default function StudentNotifications({ profile }: Props) {
  const notifications = [
    { id: 1, title: "Welcome to Luminedge Student Portal!", desc: "Your account has been created successfully.", time: "Just now", read: false },
    { id: 2, title: "Complete your profile", desc: "Add your academic information to help your counselor.", time: "1 hour ago", read: false },
  ];

  return (
    <div className="w-full p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-[#b08800]" />
        <h3 className="text-sm font-black text-[#00000F]">Notifications</h3>
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="text-[10px] font-black text-[#00000F] bg-[#FACE39] px-1.5 py-0.5 rounded-full">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} className={`rounded-2xl border p-4 flex gap-3 ${n.read ? "border-gray-100 bg-white" : "border-[#FACE39]/30 bg-[#FACE39]/5"}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-200" : "bg-[#FACE39]"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#00000F]">{n.title}</p>
              <p className="text-xs text-[#00000F]/50 mt-0.5">{n.desc}</p>
              <p className="text-[10px] text-[#00000F]/30 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
