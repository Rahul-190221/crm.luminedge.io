"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getMyApplications } from "@/lib/api/applications";
import { getMyMilestones } from "@/lib/api/milestones";
import { getNews } from "@/lib/api/news";
import { getMyAppointments } from "@/lib/api/appointments";
import { getMyDocuments } from "@/lib/api/documents";
import type { StudentProfile, Application, Milestone, NewsItem, Appointment } from "@/types/student";
import {
  ChevronRight, AlertCircle, CheckCircle, Clock, User,
  FileText, FolderOpen, Calendar, BarChart3, ArrowRight,
  Zap, MapPin,
} from "lucide-react";

const STAGES = [
  "Submitted", "Under Review", "University Applied", "Offer Received",
  "Accepted", "Tuition Paid", "COE Received", "Visa Applied", "Visa Granted",
];

interface Props {
  token: string;
  profile: StudentProfile;
  onRefresh: () => void;
  onNavigate: (page: any) => void;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function statusColor(s: string) {
  if (["Approved", "Completed", "Visa Granted", "Accepted"].includes(s)) return "text-green-600 bg-green-50 border-green-100";
  if (["Rejected", "Blocked", "Cancelled"].includes(s)) return "text-red-500 bg-red-50 border-red-100";
  if (["In Progress", "Under Review", "Submitted"].includes(s)) return "text-blue-600 bg-blue-50 border-blue-100";
  if (["Offer Received", "COE Received"].includes(s)) return "text-purple-600 bg-purple-50 border-purple-100";
  return "text-gray-500 bg-gray-50 border-gray-100";
}

export default function StudentHome({ token, profile, onNavigate }: Props) {
  const [application, setApplication] = useState<Application | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getMyApplications(token),
      getMyMilestones(token),
      getNews(),
      getMyAppointments(token),
      getMyDocuments(token),
    ]).then(([appsRes, msRes, newsRes, apptRes, docsRes]) => {
      if (appsRes.status === "fulfilled") {
        const apps = appsRes.value.applications || [];
        setAppCount(apps.length);
        if (apps.length) setApplication(apps[0]);
      }
      if (msRes.status === "fulfilled") setMilestones(msRes.value.milestones?.slice(0, 5) || []);
      if (newsRes.status === "fulfilled") {
        setNews(newsRes.value.news?.filter((n: NewsItem) => n.isPinned).slice(0, 3) || []);
      }
      if (apptRes.status === "fulfilled") {
        const upcoming = (apptRes.value.appointments || []).filter(
          (a: Appointment) => a.status === "Scheduled" && new Date(a.scheduledAt) > new Date()
        );
        setAppointments(upcoming.slice(0, 3));
      }
      if (docsRes.status === "fulfilled") setDocCount(docsRes.value.documents?.length || 0);
      setLoading(false);
    });
  }, [token]);

  const completedMilestones = milestones.filter(m => m.status === "Completed").length;
  const progress = milestones.length ? Math.round((completedMilestones / milestones.length) * 100) : 0;
  const currentStageIdx = application ? STAGES.indexOf(application.status) : -1;
  const onboardingDone = profile.onboardingComplete;
  const avatarUrl = (profile as any)?.avatarUrl;

  const stats = [
    { label: "Applications", value: appCount, icon: <FileText size={16} />, page: "applications", color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Documents", value: docCount, icon: <FolderOpen size={16} />, page: "documents", color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Milestones", value: `${completedMilestones}/${milestones.length}`, icon: <BarChart3 size={16} />, page: "progress", color: "text-green-600", bg: "bg-green-50" },
    { label: "Appointments", value: appointments.length, icon: <Calendar size={16} />, page: "appointments", color: "text-[#b08800]", bg: "bg-[#FACE39]/15" },
  ];

  const quickActions = [
    { label: "New Application", icon: <FileText size={14} />, page: "applications" },
    { label: "Upload Document", icon: <FolderOpen size={14} />, page: "documents" },
    { label: "Book Appointment", icon: <Calendar size={14} />, page: "appointments" },
    { label: "View Progress", icon: <BarChart3 size={14} />, page: "progress" },
  ];

  return (
    <div className="w-full px-4 md:px-6 py-5 space-y-5">

      {/* Welcome Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-[#00000F]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #FACE39 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FACE39 0%, transparent 40%)"
        }} />
        <div className="relative px-6 py-5 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-bold text-[#FACE39]/60 uppercase tracking-widest mb-1">{greeting()}</p>
            <h2 className="text-xl font-black text-white">{profile.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {profile.serviceCategory && (
                <span className="flex items-center gap-1 text-[11px] text-white/50">
                  <Zap size={10} className="text-[#FACE39]" />
                  {profile.serviceCategory}
                </span>
              )}
              {profile.preferredCountry && (
                <span className="flex items-center gap-1 text-[11px] text-white/50">
                  <MapPin size={10} className="text-[#FACE39]" />
                  {profile.preferredCountry}
                </span>
              )}
            </div>
            {milestones.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 max-w-[140px] h-1.5 rounded-full bg-white/10">
                  <div className="h-1.5 rounded-full bg-[#FACE39] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-bold text-[#FACE39]">{progress}% complete</span>
              </div>
            )}
          </div>
          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#FACE39]/30 flex-shrink-0 ml-4">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={profile.name} width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#FACE39]/20 flex items-center justify-center">
                <span className="text-xl font-black text-[#FACE39]">{profile.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding banner */}
      {!onboardingDone && (
        <div className="rounded-2xl border border-[#FACE39]/40 bg-[#FACE39]/6 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-[#b08800] flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#00000F]">Complete your profile</p>
              <p className="text-xs text-[#00000F]/50">Help your counselor assist you better by filling in your details.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="text-xs font-black text-[#00000F] bg-[#FACE39] px-4 py-2 rounded-xl hover:bg-[#f0c020] transition flex-shrink-0 flex items-center gap-1"
          >
            Complete <ArrowRight size={11} />
          </button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map(s => (
          <button key={s.label} onClick={() => onNavigate(s.page)}
            className="rounded-2xl border border-[#00000F]/[0.06] bg-white p-4 text-left shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:border-[#FACE39]/30 hover:shadow-[0_6px_20px_rgba(250,206,57,0.1)] transition-all group">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3 ring-1 ring-inset ring-white/70`}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <p className="text-xl font-black text-[#00000F]">{s.value}</p>
            <p className="text-[11px] font-semibold text-[#00000F]/40 mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-[#00000F]/[0.06] bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
        <p className="text-[10px] font-black text-[#00000F]/30 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => onNavigate(a.page)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-[#00000F]/[0.06] text-xs font-bold text-[#00000F]/70 hover:bg-[#FACE39]/8 hover:border-[#FACE39]/30 hover:text-[#00000F] transition-all">
              <span className="w-7 h-7 rounded-lg bg-[#FACE39]/12 border border-[#FACE39]/20 flex items-center justify-center text-[#b08800]">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Application status */}
        <div className="rounded-2xl border border-[#00000F]/[0.06] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-[#00000F]/30 uppercase tracking-widest">Application Journey</p>
            <button onClick={() => onNavigate("applications")} className="text-[11px] font-bold text-[#b08800] flex items-center gap-0.5 hover:text-[#FACE39] transition">
              View all <ChevronRight size={11} />
            </button>
          </div>

          {application ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-black text-[#00000F]">{application.serviceType}</span>
                  {application.targetCountry && (
                    <p className="text-[11px] text-[#00000F]/40 mt-0.5 flex items-center gap-1">
                      <MapPin size={9} /> {application.targetCountry}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1 mb-2">
                {STAGES.map((s, i) => (
                  <div key={s} title={s} className={`flex-1 h-1.5 rounded-full transition-all ${
                    i < currentStageIdx ? "bg-green-400" :
                    i === currentStageIdx ? "bg-[#FACE39]" : "bg-gray-100"
                  }`} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#00000F]/30">
                <span>{STAGES[0]}</span>
                <span className="font-bold text-[#b08800]">{application.status}</span>
                <span>{STAGES[STAGES.length - 1]}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-2">
                <FileText size={18} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-[#00000F]/40">No active application</p>
              <p className="text-xs text-[#00000F]/25 mt-0.5">Start your study abroad journey</p>
              <button onClick={() => onNavigate("applications")}
                className="mt-3 text-xs font-black text-[#00000F] bg-[#FACE39] px-4 py-2 rounded-xl hover:bg-[#f0c020] transition inline-flex items-center gap-1">
                Apply Now <ArrowRight size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Progress tracker */}
        <div className="rounded-2xl border border-[#00000F]/[0.06] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-[#00000F]/30 uppercase tracking-widest">Milestones</p>
            <button onClick={() => onNavigate("progress")} className="text-[11px] font-bold text-[#b08800] flex items-center gap-0.5 hover:text-[#FACE39] transition">
              View all <ChevronRight size={11} />
            </button>
          </div>

          {milestones.length > 0 ? (
            <div className="space-y-2.5">
              {milestones.slice(0, 4).map(m => (
                <div key={m._id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    m.status === "Completed" ? "bg-green-50" :
                    m.status === "In Progress" ? "bg-blue-50" :
                    m.status === "Blocked" ? "bg-red-50" : "bg-gray-50"
                  }`}>
                    {m.status === "Completed" ? <CheckCircle size={12} className="text-green-500" /> :
                     m.status === "In Progress" ? <Clock size={12} className="text-blue-500" /> :
                     <div className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <span className={`text-xs flex-1 ${
                    m.status === "Completed" ? "line-through text-[#00000F]/25" : "text-[#00000F]/70"
                  }`}>
                    {m.title}
                  </span>
                  {m.status === "In Progress" && (
                    <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Active</span>
                  )}
                </div>
              ))}
              {milestones.length > 0 && (
                <div className="pt-1.5 border-t border-gray-50">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#00000F]/40">{completedMilestones} of {milestones.length} done</span>
                    <span className="font-black text-[#b08800]">{progress}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full bg-[#FACE39] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-2">
                <BarChart3 size={18} className="text-gray-300" />
              </div>
              <p className="text-sm font-bold text-[#00000F]/40">No milestones yet</p>
              <p className="text-xs text-[#00000F]/25 mt-0.5">Your counselor will set these up</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming appointments */}
      {appointments.length > 0 && (
        <div className="rounded-2xl border border-[#00000F]/[0.06] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-[#00000F]/30 uppercase tracking-widest">Upcoming Appointments</p>
            <button onClick={() => onNavigate("appointments")} className="text-[11px] font-bold text-[#b08800] flex items-center gap-0.5 hover:text-[#FACE39] transition">
              View all <ChevronRight size={11} />
            </button>
          </div>
          <div className="space-y-2.5">
            {appointments.map(a => (
              <div key={a._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-[#FACE39]/15 flex items-center justify-center flex-shrink-0">
                  <Calendar size={15} className="text-[#b08800]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#00000F]">{a.type}</p>
                  <p className="text-[11px] text-[#00000F]/40 mt-0.5">
                    {new Date(a.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {new Date(a.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {a.meetingLink && (
                  <a href={a.meetingLink} target="_blank" rel="noreferrer"
                    className="text-[10px] font-black text-[#00000F] bg-[#FACE39] px-2.5 py-1.5 rounded-lg hover:bg-[#f0c020] transition flex-shrink-0">
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your team */}
      {profile.assignedBDM && (
        <div className="rounded-2xl border border-[#00000F]/[0.06] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-[#00000F]/30 uppercase tracking-widest">Your Team</p>
            <button onClick={() => onNavigate("counselor")} className="text-[11px] font-bold text-[#b08800] flex items-center gap-0.5 hover:text-[#FACE39] transition">
              Contact <ChevronRight size={11} />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { staff: profile.assignedBDM, role: "BDM", color: "bg-blue-50 text-blue-600" },
            ].filter(s => s.staff).map(({ staff, role, color }) => (
              <div key={role} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 flex-1 min-w-[160px]">
                <div className="w-9 h-9 rounded-full bg-[#FACE39]/15 flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-[#b08800]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#00000F] truncate">{staff!.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-[#00000F]/30 uppercase tracking-widest">Pinned News</p>
            <button onClick={() => onNavigate("news")} className="text-[11px] font-bold text-[#b08800] flex items-center gap-0.5 hover:text-[#FACE39] transition">
              All News <ChevronRight size={11} />
            </button>
          </div>
          <div className="space-y-3">
            {news.map(n => (
              <div key={n._id} className="flex gap-3">
                <div className="w-1 rounded-full bg-[#FACE39] flex-shrink-0 my-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-[#00000F] leading-snug">{n.title}</p>
                    <span className="text-[9px] font-bold text-[#b08800] bg-[#FACE39]/10 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#00000F]/40 mt-0.5 line-clamp-1">{n.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
