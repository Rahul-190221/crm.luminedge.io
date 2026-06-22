"use client";

import { useState } from "react";
import Image from "next/image";
import { updateStudentProfile } from "@/lib/api/studentAuth";
import type { StudentProfile } from "@/types/student";
import { Save, Mail, Phone, Globe, MapPin, User, Shield, Edit3, CheckCircle } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-[#00000F] bg-white focus:outline-none focus:border-[#FACE39] focus:ring-2 focus:ring-[#FACE39]/20 transition placeholder-gray-300";
const labelCls = "block text-[10px] font-black text-[#00000F]/40 mb-1.5 uppercase tracking-widest";

export default function StudentProfile({ token, profile, onRefresh }: Props) {
  const [form, setForm] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    gender: profile.gender || "",
    nationality: profile.nationality || "",
    nativeLanguage: profile.nativeLanguage || "",
    currentAddress: profile.currentAddress || "",
    emergencyContact: profile.emergencyContact || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const avatarUrl = profile?.avatarUrl;

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updateStudentProfile(token, form);
      setSaved(true);
      onRefresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const completionFields = [
    profile.phone, profile.gender, profile.nationality,
    profile.nativeLanguage, profile.currentAddress, profile.emergencyContact,
  ];
  const filled = completionFields.filter(Boolean).length;
  const completionPct = Math.round((filled / completionFields.length) * 100);

  return (
    <div className="w-full p-4 md:p-6 space-y-4">

      {/* Profile hero card */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#FACE39] via-[#f0c020] to-[#FACE39]/40" />

        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-[#FACE39]/20">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={profile.name} width={80} height={80} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FACE39] to-[#f0c020] flex items-center justify-center">
                    <span className="text-3xl font-black text-[#00000F]">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                <Edit3 size={11} className="text-[#00000F]/50" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-[#00000F]">{profile.name}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-[#00000F]/50">
                  <Mail size={11} className="text-[#b08800]" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1 text-xs text-[#00000F]/50">
                    <Phone size={11} className="text-[#b08800]" /> {profile.phone}
                  </span>
                )}
                {profile.nationality && (
                  <span className="flex items-center gap-1 text-xs text-[#00000F]/50">
                    <Globe size={11} className="text-[#b08800]" /> {profile.nationality}
                  </span>
                )}
              </div>

              {/* Completion bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#00000F]/40">Profile completeness</span>
                  <span className={`text-[10px] font-black ${completionPct === 100 ? "text-green-600" : "text-[#b08800]"}`}>
                    {completionPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className={`h-1.5 rounded-full transition-all ${completionPct === 100 ? "bg-green-400" : "bg-[#FACE39]"}`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service & intake tags */}
          {(profile.serviceCategory || profile.preferredCountry || profile.preferredIntake) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
              {profile.serviceCategory && (
                <span className="text-[11px] font-bold text-[#b08800] bg-[#FACE39]/10 border border-[#FACE39]/20 px-2.5 py-1 rounded-lg">
                  {profile.serviceCategory}
                </span>
              )}
              {profile.preferredCountry && (
                <span className="text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <MapPin size={9} /> {profile.preferredCountry}
                </span>
              )}
              {profile.preferredIntake && (
                <span className="text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                  {profile.preferredIntake}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-xl bg-[#FACE39]/10 flex items-center justify-center">
            <User size={13} className="text-[#b08800]" />
          </div>
          <h4 className="text-sm font-black text-[#00000F]">Personal Information</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelCls}>Full Name</label>
            <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Your full name" />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input className={inputCls} value={form.phone} onChange={set("phone")} placeholder="+880 1xxx-xxxxxx" />
          </div>
          <div>
            <label className={labelCls}>Gender</label>
            <select className={inputCls} value={form.gender} onChange={set("gender")}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Nationality</label>
            <input className={inputCls} value={form.nationality} onChange={set("nationality")} placeholder="e.g. Bangladeshi" />
          </div>
          <div>
            <label className={labelCls}>Native Language</label>
            <input className={inputCls} value={form.nativeLanguage} onChange={set("nativeLanguage")} placeholder="e.g. Bengali" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Current Address</label>
            <input className={inputCls} value={form.currentAddress} onChange={set("currentAddress")} placeholder="Street, City, Country" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Emergency Contact</label>
            <input className={inputCls} value={form.emergencyContact} onChange={set("emergencyContact")} placeholder="Name — Relation — Phone number" />
          </div>
        </div>

        {/* Read-only section */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={12} className="text-[#00000F]/30" />
            <p className="text-[10px] font-black text-[#00000F]/30 uppercase tracking-widest">Read-only Information</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className={labelCls}>Email Address</p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <Mail size={13} className="text-[#00000F]/30 flex-shrink-0" />
                <p className="text-sm text-[#00000F]/60 truncate">{profile.email}</p>
              </div>
            </div>
            {profile.passportNumber && (
              <div>
                <p className={labelCls}>Passport Number</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <Shield size={13} className="text-[#00000F]/30 flex-shrink-0" />
                  <p className="text-sm text-[#00000F]/60 font-mono">{profile.passportNumber}</p>
                </div>
              </div>
            )}
            <div>
              <p className={labelCls}>Member Since</p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-[#00000F]/60">
                  {new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-[#00000F]/30 border-t-[#00000F] rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Save size={14} /> Save Changes</>
            )}
          </button>

          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
              <CheckCircle size={13} /> Saved successfully
            </span>
          )}
          {error && (
            <span className="text-xs font-bold text-red-500">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}
