"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Menu, Bell, ChevronRight } from "lucide-react";
import { getStudentProfile } from "@/lib/api/studentAuth";
import { API_URL } from "@/lib/api/base";
import StudentSidebar from "./StudentSidebar";
import StudentOnboarding from "./StudentOnboarding";
import StudentHome from "./pages/StudentHome";
import StudentProfile from "./pages/StudentProfile";
import StudentAcademic from "./pages/StudentAcademic";
import StudentSettings from "./pages/StudentSettings";
import StudentApplications from "./pages/StudentApplications";
import StudentCounselor from "./pages/StudentCounselor";
import StudentDocuments from "./pages/StudentDocuments";
import StudentProgress from "./pages/StudentProgress";
import StudentVisa from "./pages/StudentVisa";
import StudentMessages from "./pages/StudentMessages";
import StudentAppointments from "./pages/StudentAppointments";
import StudentAccommodation from "./pages/StudentAccommodation";
import StudentJobs from "./pages/StudentJobs";
import StudentNews from "./pages/StudentNews";
import StudentNotifications from "./pages/StudentNotifications";
import type { StudentProfile as IStudentProfile } from "@/types/student";
import Image from "next/image";
import { socketService } from "@/lib/socket";

type Page =
  | "home" | "profile" | "academic" | "settings"
  | "applications" | "counselor" | "documents" | "progress" | "visa"
  | "messages" | "appointments" | "accommodation" | "jobs" | "news" | "notifications";

const PAGE_LABELS: Record<Page, string> = {
  home: "Dashboard",
  profile: "My Profile",
  academic: "Academic Info",
  settings: "Settings",
  applications: "Applications",
  counselor: "Assigned Counselor",
  documents: "Documents",
  progress: "Progress Tracker",
  visa: "Visa Process",
  messages: "Messages",
  appointments: "Appointments",
  accommodation: "Accommodation",
  jobs: "Jobs & Career",
  news: "News & Updates",
  notifications: "Notifications",
};

const PAGE_BREADCRUMB: Partial<Record<Page, string>> = {
  profile: "My Account",
  academic: "My Account",
  settings: "My Account",
  applications: "My Journey",
  counselor: "My Journey",
  documents: "My Journey",
  progress: "My Journey",
  visa: "My Journey",
  messages: "Communication",
  appointments: "Communication",
  accommodation: "Support",
  jobs: "Support",
  news: "Information",
  notifications: "Information",
};

export default function StudentDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<IStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadProfile = useCallback(async (tok: string) => {
    try {
      const data = await getStudentProfile(tok);
      setProfile(data.student);
      if (data.student && !data.student.onboardingComplete) {
        setShowOnboarding(true);
      }
    } catch {
      Cookies.remove("studentToken");
      localStorage.removeItem("studentToken");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Cookie is the source of truth — middleware already gated this page on it.
  // Falling back to a stale localStorage token here would let the UI believe
  // it's authenticated after the cookie has been cleared elsewhere (e.g. logout).
  useEffect(() => {
    const tok = Cookies.get("studentToken");
    if (!tok) { router.replace("/login"); return; }
    setToken(tok);
    loadProfile(tok);
  }, [router, loadProfile]);

  function handleLogout() {
    socketService.disconnect();
    const tok = Cookies.get("studentToken") || localStorage.getItem("studentToken");
    if (tok) {
      fetch(`${API_URL}/student/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok}` },
        credentials: 'include',
      }).catch(() => {});
    }
    Cookies.remove("studentToken");
    localStorage.removeItem("studentToken");
    router.replace("/login");
  }

  function navigate(page: Page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  function renderContent() {
    if (!token || !profile) return null;
    const props = { token, profile, onRefresh: () => loadProfile(token!) };
    switch (activePage) {
      case "home":          return <StudentHome {...props} onNavigate={navigate} />;
      case "profile":       return <StudentProfile {...props} />;
      case "academic":      return <StudentAcademic {...props} />;
      case "settings":      return <StudentSettings {...props} />;
      case "applications":  return <StudentApplications {...props} />;
      case "counselor":     return <StudentCounselor {...props} />;
      case "documents":     return <StudentDocuments {...props} />;
      case "progress":      return <StudentProgress {...props} />;
      case "visa":          return <StudentVisa {...props} />;
      case "messages":      return <StudentMessages {...props} />;
      case "appointments":  return <StudentAppointments {...props} />;
      case "accommodation": return <StudentAccommodation {...props} />;
      case "jobs":          return <StudentJobs {...props} />;
      case "news":          return <StudentNews {...props} />;
      case "notifications": return <StudentNotifications {...props} />;
      default:              return <StudentHome {...props} onNavigate={navigate} />;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#FACE39] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#00000F]/40">Loading your portal…</p>
        </div>
      </div>
    );
  }

  if (showOnboarding && token) {
    return (
      <StudentOnboarding
        token={token}
        onComplete={() => { setShowOnboarding(false); loadProfile(token); }}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  const breadcrumb = PAGE_BREADCRUMB[activePage];
  const avatarUrl = profile?.avatarUrl;

  const profileCompletion = profile ? (() => {
    const fields = [profile.name, profile.email, profile.phone, profile.gender, profile.nationality, profile.nativeLanguage, profile.currentAddress];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })() : 0;

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col flex-shrink-0" style={{ position: "relative", zIndex: 10 }}>
        <StudentSidebar
          activePage={activePage}
          onNavigate={navigate}
          studentName={profile?.name || "Student"}
          studentEmail={profile?.email}
          avatarUrl={avatarUrl}
          profileCompletion={profileCompletion}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex flex-col">
            <StudentSidebar
              activePage={activePage}
              onNavigate={navigate}
              studentName={profile?.name || "Student"}
              studentEmail={profile?.email}
              avatarUrl={avatarUrl}
              onLogout={handleLogout}
              mobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 h-16 bg-white border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-[#00000F]/40 transition"
            >
              <Menu size={18} />
            </button>
            <div>
              {breadcrumb && (
                <div className="hidden md:flex items-center gap-1 text-[10px] font-semibold text-[#00000F]/30 mb-0.5">
                  <span>{breadcrumb}</span>
                  <ChevronRight size={9} />
                  <span className="text-[#FACE39]">{PAGE_LABELS[activePage]}</span>
                </div>
              )}
              <h2 className="text-sm font-black text-[#00000F]">{PAGE_LABELS[activePage]}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications bell */}
            <button
              onClick={() => navigate("notifications")}
              className="relative p-2 rounded-xl hover:bg-gray-100 text-[#00000F]/40 hover:text-[#00000F]/70 transition"
            >
              <Bell size={18} />
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate("profile")}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#FACE39]/40">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={profile?.name || ""} width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#FACE39] flex items-center justify-center">
                    <span className="text-xs font-black text-[#00000F]">
                      {profile?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span className="hidden md:block text-xs font-bold text-[#00000F]/70 max-w-[100px] truncate">
                {profile?.name?.split(" ")[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
