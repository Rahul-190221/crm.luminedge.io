"use client";

import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import mainlogo from "@/assets/mainlogo.png";
import { loginUser, googleLogin, checkUserExists } from "@/lib/api/auth";
import { studentLogin, studentGoogleAuth } from "@/lib/api/studentAuth";
import { useGoogleLogin } from "@react-oauth/google";
import { getUserIdFromToken } from "@/lib/helpers/jwt";

export type FormValues = { email: string; password: string };

type DecodedUser = {
  id?: string;
  email?: string;
  role?: "admin" | "bdm" | "student";
  exp?: number;
};

function dashboardPathForRole(role: string): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "bdm") return "/bdm/dashboard";
  if (role === "student") return "/student/dashboard";
  return "/login";
}

function storeStaffToken(token: string, expiryDays = 7) {
  Cookies.set("accessToken", token, { expires: expiryDays, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  localStorage.setItem("accessToken", token);
}

function storeStudentToken(token: string, expiryDays = 7) {
  Cookies.set("studentToken", token, { expires: expiryDays, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  localStorage.setItem("studentToken", token);
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleOnly, setIsGoogleOnly] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [setupPasswordEmail, setSetupPasswordEmail] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } =
    useForm<FormValues>();
  const router = useRouter();

  // No client-side "already logged in" redirect here — middleware already
  // redirects authenticated users away from /login server-side, with the JWT
  // signature actually verified. A client check using jwtDecode() (which only
  // reads the payload, never checks the signature) would redirect on a cookie
  // the server is about to reject, producing a login <-> dashboard loop.

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        let token: string | null = null;

        // Try staff Google login first
        try {
          const staffRes = await googleLogin(tokenResponse.access_token);
          if (staffRes?.accessToken) token = staffRes.accessToken;
        } catch {}

        // Fall back to student Google auth
        if (!token) {
          try {
            const studentRes = await studentGoogleAuth(tokenResponse.access_token);
            if (studentRes?.accessToken) token = studentRes.accessToken;
          } catch {}
        }

        if (!token) {
          setUserNotFound(true);
          return;
        }

        // Determine which cookie name to use based on the decoded role
        const tempDecoded = (() => { try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) } catch { return null } })();
        if (tempDecoded?.role === 'student') {
          storeStudentToken(token, 10);
        } else {
          storeStaffToken(token, 10);
        }
        const decoded = getUserIdFromToken() as DecodedUser;
        toast.success("Signed in with Google");
        window.location.replace(dashboardPathForRole(decoded?.role ?? ""));
      } catch {
        toast.error("Google sign in failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Google sign in failed"),
  });

  // ── Submit email + password ────────────────────────────────────────────────
  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      // Determine account type from database — no manual role selection needed
      const userInfo = await checkUserExists(data.email);

      if (!userInfo) {
        setUserNotFound(true);
        return;
      }

      let token: string | null = null;

      if (userInfo.type === "staff") {
        const response = await loginUser({ email: data.email, password: data.password });

        if (response?.message === "PASSWORD_SETUP_REQUIRED") {
          setSetupPasswordEmail(response.email);
          toast("A setup link has also been sent to your email", { icon: "📧" });
          return;
        }

        token = response?.accessToken ?? null;
      } else {
        // Student account
        const response = await studentLogin({ email: data.email, password: data.password });
        token = response?.accessToken ?? null;
      }

      if (!token) throw new Error("Login failed. Please try again.");

      if (userInfo.type === "student") {
        storeStudentToken(token, 7);
      } else {
        storeStaffToken(token, 10);
      }
      const decoded = getUserIdFromToken() as DecodedUser;
      toast.success("Welcome back!");
      window.location.replace(dashboardPathForRole(decoded?.role ?? ""));
    } catch (error: any) {
      const msg: string = error?.message || "";
      if (msg === "GOOGLE_ONLY_ACCOUNT") {
        setIsGoogleOnly(true);
        toast.error("This account uses Google sign-in. Use the Google button below.");
      } else {
        toast.error(msg || "Incorrect email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="mb-4 p-4 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20">
            <Image src={mainlogo} alt="Luminedge" className="w-12 h-auto" />
          </div>
          <h1 className="text-3xl font-black text-[#00000F] tracking-tight">Luminedge</h1>
          <p className="text-sm font-medium text-[#00000F]/50 mt-1.5">Premium exam venue &amp; training center</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden">
          <div className="relative bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FACE39] to-transparent rounded-t-3xl" />

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <div className="flex-1 relative py-5 text-center text-base font-extrabold text-[#FACE39]">
                Sign In
                <motion.div layoutId="activeTab" className="absolute inset-x-4 bottom-0 h-0.5 bg-[#FACE39] rounded-full" />
              </div>
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="flex-1 py-5 text-sm font-semibold text-[#00000F]/45 hover:text-[#00000F]/80 transition"
              >
                Sign Up
              </button>
            </div>

            <div className="p-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-bold text-[#00000F] transition mb-8 hover:border-[#FACE39]/60 hover:shadow-[0_4px_16px_rgba(250,206,57,0.25)] disabled:opacity-60"
              >
                <FaGoogle className="text-red-400 text-base" />
                Continue with Google
              </motion.button>

              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[13px] font-bold text-[#00000F]/55 uppercase tracking-widest">or with email</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  {/* Email */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                      Email address
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                      })}
                      placeholder="you@example.com"
                      autoComplete="username"
                      autoFocus
                      onChange={() => { if (userNotFound) setUserNotFound(false); }}
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition ${errors.email ? "border-red-400" : "border-gray-200 focus:border-[#FACE39]/60"}`}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500 mt-1">
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <AnimatePresence>
                    {userNotFound && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex flex-col gap-2"
                      >
                        <p className="text-xs font-bold text-red-700">User not found. Please create an account first.</p>
                        <motion.button
                          type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => router.push("/register")}
                          className="w-full py-2.5 rounded-xl border border-[#FACE39]/60 bg-[#FACE39]/10 text-sm font-bold text-[#00000F] hover:bg-[#FACE39]/20 transition"
                        >
                          Create Account
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[13px] font-extrabold text-[#00000F]/80 uppercase tracking-widest">Password</label>
                      <Link href="/forget-password" className="text-xs text-[#FACE39] hover:text-[#E8B010] font-semibold transition">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Minimum 6 characters" },
                        })}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className={`w-full px-4 py-3 pr-11 rounded-2xl border text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition ${errors.password ? "border-red-400" : "border-gray-200 focus:border-[#FACE39]/60"}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition"
                      >
                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500 mt-1">
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* User not found — shown when email+password login finds no account */}
                  <AnimatePresence>
                    {userNotFound && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex flex-col gap-2"
                      >
                        <p className="text-xs font-bold text-red-700">User not found. Please create an account first.</p>
                        <motion.button
                          type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => router.push("/register")}
                          className="w-full py-2.5 rounded-xl border border-[#FACE39]/60 bg-[#FACE39]/10 text-sm font-bold text-[#00000F] hover:bg-[#FACE39]/20 transition"
                        >
                          Create Account
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Google-only hint */}
                  <AnimatePresence>
                    {isGoogleOnly && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="rounded-xl border border-[#FACE39]/50 bg-[#FACE39]/8 px-4 py-3 flex flex-col gap-2"
                      >
                        <p className="text-xs font-bold text-[#00000F]/70">This account was created with Google. Use the button below to sign in.</p>
                        <button
                          type="button"
                          onClick={() => handleGoogleLogin()}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#00000F] hover:border-[#FACE39]/60 transition"
                        >
                          <FaGoogle className="text-red-400" />
                          Continue with Google
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Set Password notice (Google-only staff) — link is emailed, no inline form */}
                  <AnimatePresence>
                    {setupPasswordEmail && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-[#FACE39]/50 bg-[#FACE39]/8 px-4 py-4 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-extrabold text-[#00000F]/80 uppercase tracking-widest">Check your email</p>
                            <p className="text-xs text-[#00000F]/55 mt-0.5">
                              Your account uses Google. We sent a password setup link to <span className="font-semibold">{setupPasswordEmail}</span> — open it to set a password and sign in.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSetupPasswordEmail(null)}
                            className="text-[#00000F]/40 hover:text-[#00000F]/70 text-lg leading-none ml-2"
                          >×</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="auth-submit-btn relative w-full py-3.5 rounded-2xl font-bold text-sm text-[#00000F] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in…</>
                      ) : "Sign in"}
                    </span>
                  </motion.button>
                </form>
            </div>

            {/* Footer */}
            <div className="px-10 pb-8 text-center">
              <p className="text-xs font-bold text-[#00000F]/55">
                By continuing you agree to our{" "}
                <Link href="/terms" className="text-[#FACE39] hover:text-[#E8B010] font-extrabold underline underline-offset-2">Terms</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#FACE39] hover:text-[#E8B010] font-extrabold underline underline-offset-2">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
