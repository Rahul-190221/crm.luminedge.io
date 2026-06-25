"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";

import { FaBars, FaTimes } from "react-icons/fa";
import { GrAnalytics } from "react-icons/gr";
import {
  IoBagRemoveOutline,
  IoWalletOutline,
  IoCloudDownloadOutline,
  IoLogOutOutline,
  IoMailOutline,
  IoHomeOutline,
  IoNotificationsOutline,
} from "react-icons/io5";
import { RiHomeOfficeFill } from "react-icons/ri";
import { MdOutlineCastForEducation } from "react-icons/md";



const SidebarAdmin = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const pathname = usePathname();
  const router = useRouter();

  const API_BASE = useMemo(() => {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  }, []);

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((v) => !v);

  // Fetch pending edit requests count
  useEffect(() => {
    let mounted = true;

    const fetchPending = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/v1/users/with-profile-request`,
          { timeout: 10000 }
          // { withCredentials: true } // enable if your API uses cookie auth
        );

        if (!mounted) return;

        setPendingCount(
          data?.success && Array.isArray(data?.users) ? data.users.length : 0
        );
      } catch {
        if (!mounted) return;
        setPendingCount(0);
      }
    };

    fetchPending();

    // Refresh every 1 hour
    const id = window.setInterval(fetchPending, 60 * 60 * 1000);

    // Also refresh when tab becomes visible
    const onVis = () => {
      if (document.visibilityState === "visible") fetchPending();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mounted = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [API_BASE]);

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <IoHomeOutline className="h-5 w-5" /> },
    { href: "/admin/create-schedule", label: "Create Schedule", icon: <IoBagRemoveOutline className="h-5 w-5" /> },
    { href: "/admin/available-schedules", label: "Available Schedules", icon: <IoCloudDownloadOutline className="h-5 w-5" /> },
    { href: "/admin/homebased", label: "Home Based Booking", icon: <RiHomeOfficeFill className="h-5 w-5" /> },
    { href: "/admin/TRF", label: "TRF", icon: <IoMailOutline className="h-5 w-5" /> },
    { href: "/admin/homebasedtrf", label: "TRF Home Based", icon: <MdOutlineCastForEducation className="h-5 w-5" /> },
    { href: "/admin/all-users", label: "Booking Details", icon: <IoWalletOutline className="h-5 w-5" /> },
    { href: "/admin/analysis", label: "Analysis", icon: <GrAnalytics className="h-5 w-5" /> },
    { href: "/admin/edit-request", label: "Edit Requests", icon: <IoNotificationsOutline className="h-5 w-5" /> },
  ] as const;

  return (
    <div className="flex">
      {/* Toggle button for mobile */}
      <button
        onClick={toggleSidebar}
        className="p-2 md:hidden z-50 flex items-center border-r border-gray-200"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
      </button>

      {/* Sidebar container */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white p-0 sm:p-1 text-[#00000f] shadow-xl rounded-2xl md:bg-transparent transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 md:relative md:flex md:flex-col md:items-start`}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center" onClick={closeSidebar}>
            {/* SVG kept exactly as you had it (shortened here for readability) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 609.58 304.79"
              width="110"
              height="70"
              className="mr-2"
            >
              <defs>
                <style>{`.cls-1 { fill: #00000f; stroke-width: 0px; }`}</style>
              </defs>
              {/* keep your full SVG body here exactly as-is */}
              <g />
            </svg>
          </Link>

          <button onClick={toggleSidebar} className="p-2 md:hidden" aria-label="Close sidebar">
            <FaTimes className="h-8 w-8" />
          </button>
        </div>

        <ul className="menu flex flex-col min-h-screen px-2 py-0 text-[#00000f] gap-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {links.map(({ href, label, icon }) => (
            <li
              key={href}
              className={`group relative rounded-full overflow-hidden transition-colors duration-300 ease-in-out
                ${pathname === href ? "bg-[#FACE39] text-[#00000f] font-bold" : "hover:text-[#00000f]"}`}
            >
              {/* Liquid hover effect layer */}
              <div className="absolute inset-0 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[#FACE39] before:rounded-full before:transition-all before:duration-500 group-hover:before:left-0 before:blur-sm z-0" />

              <Link
                href={href}
                onClick={closeSidebar}
                className="relative z-10 flex items-center gap-x-3 px-4 py-3 w-full text-sm md:text-base"
              >
                <span className="transform transition-transform duration-200 group-hover:translate-x-1 relative">
                  {icon}

                  {href === "/admin/edit-request" && pendingCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-600"
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span className="truncate w-full min-w-0 transition-all duration-200 group-hover:pl-1">
                  {label}
                </span>

                {href === "/admin/edit-request" && pendingCount > 0 && (
                  <span
                    className="ml-auto inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold px-2 py-0.5"
                    aria-label={`${pendingCount} pending edit request${pendingCount > 1 ? "s" : ""}`}
                  >
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </Link>
            </li>
          ))}

          {/* Logout */}
          <li className="group relative rounded-full overflow-hidden hover:text-[#00000f] transition-colors duration-300 ease-in-out">
            <div className="absolute inset-0 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[#FACE39] before:rounded-full before:transition-all before:duration-500 group-hover:before:left-0 before:blur-sm z-0" />

            <button
              onClick={() => {
                Cookies.remove("accessToken");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                router.push("/");
                closeSidebar();
              }}
              className="relative z-10 flex items-center gap-x-3 px-4 py-3 w-full text-left text-sm md:text-base"
            >
              <IoLogOutOutline className="h-6 w-6 transform transition-transform duration-200 group-hover:translate-x-1" />
              <span className="truncate w-full min-w-0 transition-all duration-200 group-hover:pl-1">
                Logout
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarAdmin;


