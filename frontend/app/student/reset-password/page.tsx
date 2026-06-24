'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import mainlogo from '@/assets/mainlogo.png'
import { studentResetPassword } from '@/lib/api/studentAuth'

function StudentResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) toast.error('Invalid reset link')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!token) {
      toast.error('Invalid reset token')
      return
    }
    setLoading(true)
    try {
      await studentResetPassword(token, password)
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)] p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="font-bold text-[#00000F] text-lg mb-2">Invalid Reset Link</p>
          <p className="text-sm text-[#00000F]/55 mb-6">This link is invalid or has already been used.</p>
          <Link
            href="/student/forgot-password"
            className="inline-block px-6 py-3 rounded-2xl bg-[#FACE39] font-bold text-sm text-[#00000F] hover:bg-[#f0c020] transition"
          >
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)] p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-bold text-[#00000F] text-lg mb-2">Password Reset!</p>
          <p className="text-sm text-[#00000F]/55 mb-6">Redirecting you to login…</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 rounded-2xl bg-[#FACE39] font-bold text-sm text-[#00000F] hover:bg-[#f0c020] transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-black text-[#00000F]">Set New Password</h1>
          <p className="text-sm text-[#00000F]/50 mt-1.5">Student Portal</p>
        </div>

        <div className="relative bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)] p-10">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FACE39] to-transparent rounded-t-3xl" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-[#00000F]/60 mb-2">Enter and confirm your new password below.</p>

            <div>
              <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-gray-200 focus:border-[#FACE39]/60 text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-gray-200 focus:border-[#FACE39]/60 text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition"
                >
                  {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition shadow-[0_4px_24px_rgba(250,206,57,0.4)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting…
                </>
              ) : 'Reset Password'}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-xs font-bold text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default function StudentResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FACE39]" />
      </div>
    }>
      <StudentResetPasswordContent />
    </Suspense>
  )
}
