'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function BDMDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('BDM Dashboard error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/90 max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100">
          <AlertTriangle className="w-8 h-8 text-amber-600" aria-hidden />
        </div>
        <h2 className="text-xl font-black text-[#00000F] mb-2 tracking-tight">Something went wrong</h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{error.message || 'The BDM dashboard could not load. You can retry or return to sign in.'}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => { window.location.href = '/' }}
            className="px-4 py-2.5 border border-gray-200 text-[#00000F]/80 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Go to Login
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 bg-[#FACE39] text-[#00000F] text-sm font-bold rounded-xl hover:bg-[#FACE39]/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
