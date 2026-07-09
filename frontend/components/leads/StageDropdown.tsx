'use client';

import React, { useRef, useState } from 'react';
import { ChevronDown, Check, RefreshCw, Tag } from 'lucide-react';
import type { LeadStage } from '@/types/admin';
import { LEAD_STAGES, LEAD_STAGE_META } from '@/lib/constants/leadStages';

interface StageDropdownProps {
  value: LeadStage;
  onChange: (stage: LeadStage) => void;
  disabled?: boolean;
  saving?: boolean;
  size?: 'default' | 'compact';
}

export default function StageDropdown({ value, onChange, disabled, saving, size = 'default' }: StageDropdownProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const meta = LEAD_STAGE_META[value];
  const isDisabled = disabled || saving;

  const toggle = () => {
    if (isDisabled) return;
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropH = LEAD_STAGES.length * 40 + 48;
      setPos({
        top: window.innerHeight - r.bottom > dropH ? r.bottom + 6 : r.top - dropH - 6,
        left: Math.max(8, Math.min(r.left, window.innerWidth - 190)),
      });
    }
    setOpen(v => !v);
  };

  return (
    <div className="relative inline-block">
      {size === 'compact' ? (
        <button
          type="button"
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          disabled={isDisabled}
          title={`Change stage (currently ${value})`}
          className={`w-[22px] h-[22px] rounded md:rounded-md flex items-center justify-center transition-colors disabled:opacity-50 ${meta.bg} ${meta.text} hover:opacity-80`}
        >
          {saving ? <RefreshCw className="w-[10px] h-[10px] animate-spin" /> : <Tag className="w-[10px] h-[10px]" />}
        </button>
      ) : (
        <button
          type="button"
          ref={btnRef}
          onClick={(e) => { e.stopPropagation(); toggle(); }}
          disabled={isDisabled}
          className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 py-1.5 sm:px-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[12px] font-bold border transition-all duration-200 ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'
          } ${meta.bg} ${meta.text} ${meta.border}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${meta.dot}`} />
          <span className="whitespace-nowrap tracking-wide">{value}</span>
          {saving
            ? <RefreshCw className="w-3 h-3 animate-spin flex-shrink-0" />
            : !isDisabled && <ChevronDown className={`hidden sm:block w-3 h-3 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 py-1 min-w-[170px]"
            style={{ top: pos.top, left: pos.left }}
          >
            <p className="px-3.5 py-1.5 text-[9.5px] font-bold text-gray-400 uppercase tracking-[0.14em] border-b border-gray-100 mb-1">Change Stage</p>
            {LEAD_STAGES.map(stage => {
              const sc = LEAD_STAGE_META[stage];
              const isSelected = stage === value;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(stage); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                    isSelected ? `${sc.bg} ${sc.text}` : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                  {stage}
                  {isSelected && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
