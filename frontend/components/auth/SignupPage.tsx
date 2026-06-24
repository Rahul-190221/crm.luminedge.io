'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import Image from 'next/image'
import mainlogo from '@/assets/mainlogo.png'
import { motion, AnimatePresence } from 'framer-motion'
import Cookies from 'js-cookie'
import { studentRegister } from '@/lib/api/studentAuth'

type Errors = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function storeStudentToken(token: string) {
  const opts = { expires: 7, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production' }
  Cookies.set('studentToken', token, opts)
  localStorage.setItem('studentToken', token)
}

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Errors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Enter a valid email address'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const strengthScore = useMemo(() => {
    let score = 0
    const p = formData.password
    if (p.length >= 6) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }, [formData.password])

  const strengthLabel = useMemo(() => {
    switch (strengthScore) {
      case 0:
      case 1: return { label: 'Weak',   color: 'bg-red-400',   pct: '25%' }
      case 2: return { label: 'Fair',   color: 'bg-[#FACE39]', pct: '50%' }
      case 3: return { label: 'Good',   color: 'bg-blue-400',  pct: '75%' }
      case 4: return { label: 'Strong', color: 'bg-green-400', pct: '100%' }
      default: return { label: '',      color: 'bg-gray-300',  pct: '0%' }
    }
  }, [strengthScore])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const data = await studentRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      if (data?.accessToken) {
        storeStudentToken(data.accessToken)
        toast.success('Account created! Welcome to Luminedge.')
        router.replace('/student/dashboard')
      } else {
        toast.error('Registration succeeded but login failed. Please sign in.')
        router.replace('/login')
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-2xl border text-sm text-[#00000F] placeholder-gray-400 bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 transition ${
      hasError ? 'border-red-400' : 'border-gray-200 focus:border-[#FACE39]/60'
    }`

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-4">
          <div className="mb-3 p-3 rounded-2xl bg-[#FACE39]/10 border border-[#FACE39]/20">
            <Image src={mainlogo} alt="Luminedge" className="w-10 h-auto" />
          </div>
          <h1 className="text-3xl font-black text-[#00000F] tracking-tight">Luminedge</h1>
          <p className="text-sm font-semibold text-[#00000F]/50 mt-1">Premium exam venue &amp; training center</p>
        </div>

        <div className="rounded-3xl overflow-hidden">
          <div className="relative bg-white border border-[#FACE39]/15 rounded-3xl shadow-[0_8px_80px_rgba(250,206,57,0.18),0_2px_24px_rgba(0,0,0,0.08)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FACE39] to-transparent rounded-t-3xl" />

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="flex-1 py-5 text-sm font-semibold text-[#00000F]/45 hover:text-[#00000F]/80 transition"
              >
                Sign In
              </button>
              <div className="flex-1 relative py-5 text-center text-base font-extrabold text-[#FACE39]">
                Sign Up
                <motion.div layoutId="activeTab" className="absolute inset-x-4 bottom-0 h-0.5 bg-[#FACE39] rounded-full" />
              </div>
            </div>

            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Full name</label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleChange} placeholder="John Doe"
                    className={inputClass(!!errors.name)}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400 mt-1">
                        {errors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Email address</label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} placeholder="you@example.com"
                    className={inputClass(!!errors.email)}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400 mt-1">
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} name="password"
                      value={formData.password} onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className={`${inputClass(!!errors.password)} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-[#00000F]/30 mb-1">
                        <span>Password strength</span>
                        <span>{strengthLabel.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <motion.div
                          className={`h-1.5 rounded-full ${strengthLabel.color}`}
                          style={{ width: strengthLabel.pct }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  )}
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400 mt-1">
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Confirm password */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                  <label className="block text-xs font-extrabold mb-2 text-[#00000F]/80 uppercase tracking-widest">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                      value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`${inputClass(!!errors.confirmPassword)} pr-11`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00000F]/50 hover:text-[#00000F]/80 transition">
                      {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400 mt-1">
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="auth-submit-btn relative w-full py-3.5 rounded-2xl font-bold text-sm text-[#00000F] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Creating account…
                      </>
                    ) : 'Create account'}
                  </span>
                </motion.button>
              </form>
            </motion.div>

            <div className="px-8 pb-6 text-center">
              <p className="text-xs font-bold text-[#00000F]/55">
                Already have an account?{' '}
                <Link href="/login" className="text-[#FACE39] hover:text-[#E8B010] font-extrabold underline underline-offset-2 transition">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
