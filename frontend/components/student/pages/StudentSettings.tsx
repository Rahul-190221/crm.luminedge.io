"use client";

import { useState } from "react";
import { changeStudentPassword } from "@/lib/api/studentAuth";
import type { StudentProfile } from "@/types/student";
import { Lock } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#00000F] focus:outline-none focus:border-[#FACE39] focus:ring-2 focus:ring-[#FACE39]/20 transition";
const labelCls = "block text-xs font-bold text-[#00000F]/50 mb-1 uppercase tracking-wide";

export default function StudentSettings({ token, profile }: Props) {
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });

  async function changePassword() {
    if (pwd.newPassword !== pwd.confirm) {
      setMsg({ text: "Passwords do not match.", ok: false });
      return;
    }
    setSaving(true);
    try {
      await changeStudentPassword(token, { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setMsg({ text: "Password changed successfully.", ok: true });
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e: any) {
      setMsg({ text: e.message || "Failed.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-[#b08800]" />
          <h3 className="text-sm font-black text-[#00000F]">Change Password</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Current Password</label>
            <input type="password" className={inputCls} value={pwd.currentPassword}
              onChange={e => setPwd(p => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>New Password</label>
            <input type="password" className={inputCls} value={pwd.newPassword}
              onChange={e => setPwd(p => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input type="password" className={inputCls} value={pwd.confirm}
              onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} />
          </div>
        </div>
        {msg.text && (
          <p className={`mt-3 text-xs font-medium ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
        )}
        <button onClick={changePassword} disabled={saving}
          className="mt-4 px-5 py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition disabled:opacity-60">
          {saving ? "Saving..." : "Update Password"}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="text-sm font-black text-[#00000F] mb-2">Account Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#00000F]/50">Email</span>
            <span className="font-semibold text-[#00000F]">{profile.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#00000F]/50">Member since</span>
            <span className="font-semibold text-[#00000F]">{new Date(profile.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#00000F]/50">Profile status</span>
            <span className={`font-semibold ${profile.onboardingComplete ? "text-green-600" : "text-yellow-600"}`}>
              {profile.onboardingComplete ? "Complete" : "Incomplete"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
