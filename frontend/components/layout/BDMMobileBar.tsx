'use client'

import { Menu } from 'lucide-react'

interface BDMMobileBarProps {
  onMenuToggle: () => void
}

export default function BDMMobileBar({ onMenuToggle }: BDMMobileBarProps) {
  return (
    <div className="lg:hidden px-3 pt-3 pb-1 bg-[#f9fafb] flex-shrink-0">
      <div className="flex items-center justify-between gap-2 pl-3 pr-2 py-2 rounded-2xl bg-white/75 backdrop-blur-xl border border-white/70 shadow-[0_8px_28px_rgba(0,0,15,0.10),0_2px_8px_rgba(0,0,15,0.04)]">
        <div className="flex items-center gap-1.5">
          <img src="/assets/mainlogo.png" alt="Luminedge" className="h-[26px] w-auto object-contain" />
          <span className="text-[15px] font-extrabold text-[#00000F] tracking-tight">Luminedge</span>
        </div>
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2.5 rounded-xl bg-[#00000F]/[0.04] border border-[#00000F]/[0.06] text-[#00000F]/70 hover:text-[#00000F] hover:bg-[#00000F]/10 active:scale-90 transition-all flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
