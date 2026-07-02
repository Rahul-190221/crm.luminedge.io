"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  MessageSquare,
  BarChart3,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import mainlogo from "@/assets/mainlogo.png";

const features = [
  {
    icon: <BadgeCheck className="w-5 h-5" />,
    title: "Application Status",
    desc: "See exactly where your application stands — New Inquiry, Contacted, Trial Class, or Enrolled.",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Counselor Notes",
    desc: "Read every update and note your assigned counselor has logged for your journey.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Stage Progress",
    desc: "A visual progress bar shows how far along you are in the enrollment process.",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Service Details",
    desc: "View the program you applied for — IELTS, PTE, GRE, TOEFL and more.",
  },
];

export default function StudentLandingPage() {
  // No client-side "already logged in" redirect here — middleware already
  // redirects /student to /student/dashboard server-side once it verifies the
  // cookie's signature. A client check using jwtDecode() (which only reads the
  // payload, never checks the signature) would redirect on a cookie the server
  // is about to reject, producing a login <-> dashboard loop.

  return (
    <div className="min-h-screen bg-white">
      {/* subtle top yellow glow */}
      <div className="fixed inset-x-0 top-0 h-[320px] bg-gradient-to-b from-[#FACE39]/8 to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#FACE39]/10 border border-[#FACE39]/20">
            <Image src={mainlogo} alt="Luminedge" className="w-7 h-auto" />
          </div>
          <div>
            <p className="text-sm font-black text-[#00000F] tracking-tight">Luminedge</p>
            <p className="text-[10px] text-[#00000F]/35 font-medium leading-tight">Student Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/student/login"
            className="px-4 py-2 rounded-xl text-sm font-bold text-[#00000F]/60 hover:text-[#00000F] transition"
          >
            Sign In
          </Link>
          <Link
            href="/student/register"
            className="px-4 py-2 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition shadow-[0_4px_16px_rgba(250,206,57,0.4)]"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 md:pt-28 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FACE39]/40 bg-[#FACE39]/10 text-[#b08800] text-xs font-bold mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FACE39] animate-pulse" />
            Your Exam Journey, Simplified
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-[#00000F] mb-6">
            Track your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#00000F]">application</span>
              <motion.span
                className="absolute inset-x-0 bottom-1 h-3 bg-[#FACE39]/30 -z-0 rounded"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              />
            </span>{" "}
            at every step
          </h1>

          <p className="text-base md:text-lg text-[#00000F]/50 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            From the moment you apply to the day you enroll — see your status, read your counselor&apos;s notes, and stay fully informed.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/student/register"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition shadow-[0_4px_24px_rgba(250,206,57,0.45)]"
            >
              Create Account
              <ChevronRight size={16} />
            </Link>
            <Link
              href="/student/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-[#00000F] border border-gray-200 hover:border-[#FACE39]/40 hover:bg-[#FACE39]/5 transition"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-2xl"
        >
          <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-[0_8px_60px_rgba(250,206,57,0.15),0_2px_24px_rgba(0,0,0,0.08)]">
            {/* fake browser bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
              <div className="flex-1 mx-4 h-5 rounded-md bg-gray-200 flex items-center justify-center">
                <span className="text-[10px] text-gray-400 font-mono">luminedge.com/student/dashboard</span>
              </div>
            </div>

            {/* preview content */}
            <div className="p-5 bg-gray-50 space-y-3">
              {/* welcome strip */}
              <div className="rounded-xl bg-[#00000F] px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#FACE39]/70 uppercase tracking-widest">Welcome back</p>
                  <p className="text-base font-black text-white mt-0.5">Sarah Ahmed</p>
                  <p className="text-xs text-white/45 mt-0.5">Applied for <span className="text-[#FACE39] font-semibold">IELTS Premium</span></p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FACE39]/20 border border-[#FACE39]/40 flex items-center justify-center">
                  <span className="text-sm font-black text-[#FACE39]">S</span>
                </div>
              </div>

              {/* stage bar */}
              <div className="rounded-xl bg-white border border-gray-100 px-5 py-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Application Status</p>
                <div className="flex items-center gap-1">
                  {["New Inquiry", "Contacted", "Trial Class", "Enrolled"].map((s, i) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex-1 text-center ${
                        i === 1
                          ? "bg-[#FACE39] text-[#00000F]"
                          : i < 1
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {s}
                      </div>
                      {i < 3 && <div className={`w-3 h-px mx-0.5 ${i < 1 ? "bg-green-400" : "bg-gray-200"}`} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* two mini cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white border border-gray-100 px-4 py-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Counselor</p>
                  <p className="text-xs font-bold text-[#00000F]">Mehdi Rahman</p>
                </div>
                <div className="rounded-xl bg-white border border-gray-100 px-4 py-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Applied</p>
                  <p className="text-xs font-bold text-[#00000F]">12 May 2025</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-[11px] font-bold text-[#00000F]/25 uppercase tracking-[0.2em] mb-8"
          >
            What you get
          </motion.p>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group flex gap-4 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[#FACE39]/40 hover:shadow-[0_4px_24px_rgba(250,206,57,0.12)] transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FACE39]/10 border border-[#FACE39]/20 flex items-center justify-center text-[#b08800] flex-shrink-0 group-hover:bg-[#FACE39]/20 transition">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-black text-[#00000F] mb-1">{f.title}</p>
                  <p className="text-xs text-[#00000F]/45 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative z-10 px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl border border-[#FACE39]/30 bg-[#FACE39]/8 px-8 py-10 text-center"
        >
          <p className="text-xl font-black text-[#00000F] mb-2">Ready to check your status?</p>
          <p className="text-sm text-[#00000F]/45 mb-7 font-medium">Use the same email you registered with Luminedge.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/student/register"
              className="px-8 py-3 rounded-2xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition shadow-[0_4px_24px_rgba(250,206,57,0.4)]"
            >
              Create Account
            </Link>
            <Link
              href="/student/login"
              className="px-8 py-3 rounded-2xl text-sm font-bold text-[#00000F] border border-gray-200 hover:border-[#FACE39]/40 hover:bg-white transition"
            >
              Already have one? Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6 text-center">
        <p className="text-xs text-[#00000F]/25 font-medium">
          © {new Date().getFullYear()} Luminedge · Premium Exam Venue &amp; Training Center
        </p>
      </footer>
    </div>
  );
}
