'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { forgetPassword } from '@/lib/api/auth'

export default function ForgetPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await forgetPassword(email)
      if (response.message) {
        setIsSubmitted(true)
        toast.success('Password reset link sent to your email!')
      }
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500 mt-2">
              {isSubmitted
                ? "Check your email for the reset link"
                : "No worries, we'll send you reset instructions"
              }
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FACE39] focus:ring-4 focus:ring-[#FACE39]/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FACE39] hover:bg-[#FACE39]/90 text-gray-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">
                We sent a password reset link to<br />
                <span className="font-bold text-gray-900">{email}</span>
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-sm text-yellow-600 hover:text-yellow-700 font-bold"
              >
                Didn't receive the email? Click to resend
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            Remember your password?{' '}
            <Link href="/" className="text-gray-900 font-bold hover:text-yellow-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
