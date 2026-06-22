"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Home, User, GraduationCap, Settings, FileText, Users, FolderOpen,
  BarChart3, Stamp, MessageSquare, Calendar, Building2, Briefcase,
  Newspaper, Bell, LogOut, X, ChevronLeft, ChevronDown,
} from "lucide-react";

type Page =
  | "home" | "profile" | "academic" | "settings"
  | "applications" | "counselor" | "documents" | "progress" | "visa"
  | "messages" | "appointments" | "accommodation" | "jobs" | "news" | "notifications";

interface NavItem { id: Page; label: string; icon: React.ReactNode; }
interface NavGroup { title: string; items: NavItem[]; defaultOpen?: boolean; }

const groups: NavGroup[] = [
  {
    title: "Overview",
    defaultOpen: true,
    items: [{ id: "home", label: "Dashboard", icon: <Home size={16} /> }],
  },
  {
    title: "My Account",
    defaultOpen: true,
    items: [
      { id: "profile", label: "My Profile", icon: <User size={16} /> },
      { id: "academic", label: "Academic Info", icon: <GraduationCap size={16} /> },
      { id: "settings", label: "Settings", icon: <Settings size={16} /> },
    ],
  },
  {
    title: "My Journey",
    defaultOpen: true,
    items: [
      { id: "applications", label: "Applications", icon: <FileText size={16} /> },
      { id: "counselor", label: "My Counselor", icon: <Users size={16} /> },
      { id: "documents", label: "Documents", icon: <FolderOpen size={16} /> },
      { id: "progress", label: "Progress", icon: <BarChart3 size={16} /> },
      { id: "visa", label: "Visa Process", icon: <Stamp size={16} /> },
    ],
  },
  {
    title: "Communication",
    defaultOpen: true,
    items: [
      { id: "messages", label: "Messages", icon: <MessageSquare size={16} /> },
      { id: "appointments", label: "Appointments", icon: <Calendar size={16} /> },
    ],
  },
  {
    title: "Support",
    defaultOpen: false,
    items: [
      { id: "accommodation", label: "Accommodation", icon: <Building2 size={16} /> },
      { id: "jobs", label: "Jobs & Career", icon: <Briefcase size={16} /> },
    ],
  },
  {
    title: "Info",
    defaultOpen: false,
    items: [
      { id: "news", label: "News & Updates", icon: <Newspaper size={16} /> },
      { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    ],
  },
];

/* Tooltip for icon-only mode */
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip w-full flex justify-center">
      {children}
      <div
        className="pointer-events-none absolute left-full ml-3 z-50 px-2.5 py-1.5 rounded-lg
                   text-[#00000F] text-xs font-semibold whitespace-nowrap shadow-lg
                   opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,15,0.1)",
          top: "50%",
          transform: "translateY(-50%)",
          boxShadow: "0 4px 16px rgba(0,0,15,0.10)",
        }}
      >
        {label}
        <span
          className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-2.5 h-2.5 rotate-45"
          style={{
            background: "#ffffff",
            borderLeft: "1px solid rgba(0,0,15,0.1)",
            borderBottom: "1px solid rgba(0,0,15,0.1)",
          }}
        />
      </div>
    </div>
  );
}

/* Props */
interface Props {
  activePage: Page;
  onNavigate: (page: Page) => void;
  studentName: string;
  studentEmail?: string;
  avatarUrl?: string;
  profileCompletion?: number;
  unreadMessages?: number;
  unreadNotifications?: number;
  onLogout: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

export default function StudentSidebar({
  activePage, onNavigate, studentName, studentEmail, avatarUrl,
  profileCompletion = 72,
  unreadMessages = 0, unreadNotifications = 0,
  onLogout, mobile, onClose,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    Object.fromEntries(groups.map(g => [g.title, g.defaultOpen ?? true]))
  );

  const isIconOnly = collapsed && !mobile;
  const clampedProfileCompletion = Math.min(100, Math.max(0, profileCompletion));

  function nav(page: Page) {
    onNavigate(page);
    if (mobile && onClose) onClose();
  }

  function toggleGroup(title: string) {
    if (isIconOnly) return;
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  }

  /* SVG progress ring */
  const R = 19;
  const CIRC = 2 * Math.PI * R;
  const progressOffset = CIRC - (clampedProfileCompletion / 100) * CIRC;

  return (
    <motion.aside
      animate={{ width: mobile ? 288 : collapsed ? 72 : 252 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full flex-shrink-0 overflow-hidden bg-white"
      style={{
        minWidth: mobile ? 288 : collapsed ? 72 : 252,
        borderRight: "1px solid #f0f0f0",
        boxShadow: "2px 0 24px rgba(0,0,15,0.05)",
      }}
    >
      {/* top yellow accent stripe */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#FACE39]" />

      {/* Logo */}
      <div
        className="relative flex items-center justify-between h-16 px-4 flex-shrink-0 mt-[3px]"
        style={{ borderBottom: "1px solid #f0f0f0" }}
      >
        <AnimatePresence mode="wait">
          {!isIconOnly ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <Image
                src="/assets/logo.png"
                alt="Luminedge"
                width={124}
                height={48}
                className="h-12 w-auto object-contain flex-shrink-0"
                priority
              />
              <div className="overflow-hidden">
                
                <p className="text-[9px] text-[#00000F]/30 font-bold tracking-[0.22em] mt-0.5 whitespace-nowrap">STUDENT PORTAL</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center mx-auto"
            >
              <Image
                src="/assets/logo.png"
                alt="Luminedge"
                width={34}
                height={34}
                className="h-9 w-9 object-contain"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        {mobile ? (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#00000F]/30 hover:text-[#00000F]/60 hover:bg-gray-100 transition"
          >
            <X size={15} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center text-[#00000F]/40 hover:text-[#00000F]/70 bg-white transition"
            style={{
              border: "1px solid #e8e8e8",
              boxShadow: "0 2px 8px rgba(0,0,15,0.10)",
            }}
          >
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronLeft size={12} />
            </motion.span>
          </button>
        )}
      </div>

      {/* Profile Card */}
      <div className="flex-shrink-0 px-3 py-3" style={{ borderBottom: "1px solid #f5f5f5" }}>
        <motion.button
          onClick={() => nav("profile")}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center rounded-2xl transition-all text-left ${
            isIconOnly ? "justify-center p-2" : "gap-3 px-3 py-2.5"
          }`}
          style={{
            background: "rgba(250,206,57,0.07)",
            border: "1px solid rgba(250,206,57,0.25)",
          }}
        >
          {/* Avatar + completion ring */}
          <div className="relative flex-shrink-0">
            <svg
              width={44} height={44}
              className="absolute -top-[2px] -left-[2px]"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle cx={22} cy={22} r={R} fill="none" stroke="rgba(250,206,57,0.2)" strokeWidth={2.5} />
              <circle
                cx={22} cy={22} r={R}
                fill="none"
                stroke="#FACE39"
                strokeWidth={2.5}
                strokeDasharray={CIRC}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-[#FACE39]/30">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={studentName} width={36} height={36} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FACE39]">
                  <span className="text-sm font-black text-[#00000F]">
                    {studentName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Online indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400"
              style={{ boxShadow: "0 0 0 2px #fff" }}
            />
          </div>

          {!isIconOnly && (
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-black text-[#00000F] truncate leading-none">{studentName}</p>
              {studentEmail && (
                <p className="text-[11px] text-[#00000F]/40 truncate mt-0.5">{studentEmail}</p>
              )}
              {/* Completion bar */}
              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 h-[3px] rounded-full bg-[#FACE39]/15 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#FACE39]"
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedProfileCompletion}%` }}
                    transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] font-black text-[#00000F]/50">{clampedProfileCompletion}%</span>
              </div>
            </div>
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{ padding: isIconOnly ? "8px 8px" : "8px 12px" }}
      >
        {groups.map(group => {
          const groupOpen = openGroups[group.title];
          return (
            <div key={group.title} className="mb-1">
              {/* Group label */}
              {!isIconOnly ? (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-4 py-1 mb-0.5 group/gh"
                >
                  <span className="text-[11px] font-black tracking-[0.22em] uppercase text-[#00000F]/25 group-hover/gh:text-[#00000F]/45 transition">
                    {group.title}
                  </span>
                  <motion.span
                    animate={{ rotate: groupOpen ? 0 : -90 }}
                    transition={{ duration: 0.18 }}
                    className="text-[#00000F]/20 group-hover/gh:text-[#00000F]/40 transition"
                  >
                    <ChevronDown size={10} />
                  </motion.span>
                </button>
              ) : (
                <div className="h-2" />
              )}

              <AnimatePresence initial={false}>
                {(groupOpen || isIconOnly) && (
                  <motion.div
                    initial={isIconOnly ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {group.items.map(item => {
                      const isActive = activePage === item.id;
                      const badge =
                        item.id === "messages" ? unreadMessages :
                        item.id === "notifications" ? unreadNotifications : 0;

                      const btn = (
                        <motion.button
                          key={item.id}
                          onClick={() => nav(item.id)}
                          whileHover={!isActive ? { x: isIconOnly ? 0 : 2 } : {}}
                          whileTap={{ scale: 0.96 }}
                          className={`group relative w-full flex items-center justify-start rounded-xl transition-colors overflow-hidden
                            ${isIconOnly ? "justify-center p-2.5" : "gap-3 px-4 py-3"}
                          ${isActive ? "" : "text-[#00000F] hover:text-[#00000F]"}`}
                        >
                          {/* Animated active background */}
                          {isActive && (
                            <motion.div
                              layoutId="activeBg"
                              className="absolute inset-0 rounded-xl bg-[#FACE39]"
                              style={{
                                boxShadow: "0 4px 16px rgba(250,206,57,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
                              }}
                              transition={{ type: "spring", stiffness: 420, damping: 36 }}
                            />
                          )}

                          {!isActive && (
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                              style={{
                                background:
                                  "radial-gradient(circle at 12% 50%, rgba(250,206,57,0.38) 0%, rgba(250,206,57,0.18) 34%, rgba(250,206,57,0.08) 58%, rgba(250,206,57,0) 82%)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
                                filter: "blur(0.1px)",
                              }}
                            />
                          )}

                          <span
                            className={`relative z-10 flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg border ${
                              isActive
                                ? "border-[#00000F]/5 bg-[#00000F]/10 text-[#00000F]"
                                : "border-transparent bg-[#00000F]/[0.03] text-[#00000F]"
                            }`}
                          >
                            {item.icon}
                          </span>

                          {!isIconOnly && (
                            <span
                              className={`relative z-10 min-w-0 flex-1 text-left text-[14px] font-semibold truncate ${
                                isActive ? "text-[#00000F] font-bold" : ""
                              }`}
                            >
                              {item.label}
                            </span>
                          )}

                          {/* Badge - expanded mode */}
                          {badge > 0 && !isIconOnly && (
                            <span
                              className={`relative z-10 text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                                isActive
                                  ? "bg-[#00000F] text-[#FACE39]"
                                  : "bg-[#FACE39] text-[#00000F]"
                              }`}
                            >
                              {badge > 99 ? "99+" : badge}
                            </span>
                          )}

                          {/* Badge dot - icon mode */}
                          {badge > 0 && isIconOnly && (
                            <span
                              className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FACE39]"
                              style={{ boxShadow: "0 0 6px rgba(250,206,57,0.6)" }}
                            />
                          )}
                        </motion.button>
                      );

                      return isIconOnly ? (
                        <Tooltip key={item.id} label={item.label}>{btn}</Tooltip>
                      ) : (
                        <div key={item.id}>{btn}</div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-2 pb-4 pt-3"
        style={{ borderTop: "1px solid #f0f0f0" }}
      >
        {/* Help callout - expanded only */}
        {!isIconOnly && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-2 mx-1 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(250,206,57,0.07)",
              border: "1px solid rgba(250,206,57,0.22)",
            }}
          >
            <p className="text-[10px] font-black text-[#00000F]/70">Need help?</p>
            <p className="text-[9px] text-[#00000F]/35 mt-0.5 leading-relaxed">
              Contact your counselor for support with your application.
            </p>
          </motion.div>
        )}

        {/* Sign out */}
        {isIconOnly ? (
          <Tooltip label="Sign Out">
            <motion.button
              onClick={onLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex justify-center p-2.5 rounded-xl text-red-400/60 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
            </motion.button>
          </Tooltip>
        ) : (
          <motion.button
            onClick={onLogout}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-2 px-2.5 py-2.5 rounded-xl text-[12.5px] font-semibold text-red-400/70 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </motion.button>
        )}
      </div>
    </motion.aside>
  );
}
