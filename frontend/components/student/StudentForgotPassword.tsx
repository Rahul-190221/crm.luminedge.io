"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import mainlogo from "@/assets/mainlogo.png";
import { studentForgotPassword } from "@/lib/api/studentAuth";

export default function StudentForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await studentForgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4 p-4 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20">
            <Image src={mainlogo} alt="Luminedge" className="w-12 h-auto" />
          </div>
          <h1 className="text-2xl font-black text-[#00000F]">Reset Password</h1>
          <p className="text-sm text-[#00000F]/50 mt-1.5">Student Portal</p>
        </div>

        <div className="relative bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)] p-10">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FACE39] to-transparent rounded-t-3xl" />

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-[#00000F]">Check your email</p>
              <p className="text-sm text-[#00000F]/55">If an account exists, we&apos;ve sent a reset link to <strong>{email}</strong>.</p>
              <Link href="/login" className="block mt-4 text-sm font-bold text-[#FACE39] hover:text-[#E8B010]">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-[#00000F]/60 mb-4">Enter your registered email and we&apos;ll send you a password reset link.</p>
              <div>
                <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-[#FACE39]/60 text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition shadow-[0_4px_24px_rgba(250,206,57,0.4)] disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <div className="text-center">
                <Link href="/login" className="text-xs font-bold text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
