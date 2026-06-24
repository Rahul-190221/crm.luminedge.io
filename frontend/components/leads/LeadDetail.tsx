'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Mail, Phone, User, FileText, Clock,
  Tag, Activity, Calendar, RefreshCw, AlertCircle,
  MapPin, TrendingUp, Users, MessageSquare, Plus,
  ChevronDown, Check, X, Save, Flag
} from 'lucide-react';
import { getLead, addFollowUp, updateLeadStage, updateLead, lookupLeadPhones } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType } from '@/types/admin';

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Stage config (prototype color-aligned) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

const STAGE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Intake:     { bg: 'bg-gray-100',       text: 'text-gray-600',    border: 'border-gray-200',     dot: 'bg-gray-400' },
  Processing: { bg: 'bg-[#ebf0ff]',      text: 'text-[#1a56db]',   border: 'border-[#1a56db]/25', dot: 'bg-[#1a56db]' },
  Hot:        { bg: 'bg-[#fffbeb]',      text: 'text-[#92400e]',   border: 'border-[#e3a008]/35', dot: 'bg-[#e3a008]' },
  Converted:  { bg: 'bg-[#f0fdf4]',      text: 'text-[#0e9f6e]',   border: 'border-[#0e9f6e]/30', dot: 'bg-[#0e9f6e]' },
  Dead:       { bg: 'bg-[#fef2f2]',      text: 'text-[#e02424]',   border: 'border-[#e02424]/20', dot: 'bg-[#e02424]' },
};

const STAGES: LeadStageType[] = ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'];
const countryCodes = ['+880', '+91', '+92', '+94', '+977', '+95', '+1', '+44', '+61', '+971', '+966', '+65', '+60', '+66', '+81', '+82', '+86', '+49', '+33'] as const;

interface PhoneLookupSuggestion { _id: string; fullName: string; phone: string; whom?: string }

const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '');
const splitPhoneEntries = (value?: string | null) => (value || '').split(',').map(part => part.trim()).filter(Boolean);

const normalizePhoneLookup = (value: string, countryCode: string) => {
  const countryDigits = countryCode.replace(/\D/g, '');
  let normalized = value.replace(/\D/g, '');
  if (countryDigits && normalized.startsWith(countryDigits)) {
    normalized = normalized.slice(countryDigits.length);
  }
  if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }
  return normalized;
};

const stripCountryCodeFromPhone = (value: string, countryCode: string) => {
  const countryDigits = countryCode.replace(/\D/g, '');
  const normalized = value.replace(/\D/g, '');
  if (countryDigits && normalized.startsWith(countryDigits)) {
    return normalized.slice(countryDigits.length);
  }
  return normalized;
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function todayISO() { return new Date().toISOString().split('T')[0]; }
function todayDateTimeLocal() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Sub-components ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

const inputCls = "w-full h-10 px-3 border border-gray-200 rounded-xl text-[13.5px] font-medium text-gray-800 placeholder:text-gray-300 bg-[#f8fafc] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a56db] transition-all focus:bg-white";

function StageDropdown({ value, onChange, saving }: { value: LeadStageType; onChange: (s: LeadStageType) => void; saving: boolean }) {
  const [open, setOpen] = useState(false);
  const style = STAGE_STYLES[value] ?? STAGE_STYLES.Intake;

  return (
    <div className="relative inline-block">
      <button
        disabled={saving}
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[12.5px] font-bold border transition-all hover:shadow-sm active:scale-95 disabled:opacity-60 ${style.bg} ${style.text} ${style.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
        {value}
        {saving
          ? <RefreshCw className="w-3 h-3 animate-spin ml-0.5" />
          : <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-60 ml-0.5 ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 py-1.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-100">
            <p className="px-3 py-1.5 text-[9px] font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Change Stage</p>
            <div className="px-1 space-y-0.5">
              {STAGES.map(stage => {
                const sc = STAGE_STYLES[stage];
                const isSelected = stage === value;
                return (
                  <button
                    key={stage}
                    onClick={() => { onChange(stage); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-bold transition-all ${
                      isSelected ? `${sc.bg} ${sc.text}` : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-sm ${sc.dot}`} />
                    {stage}
                    {isSelected && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0 opacity-80" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Main Component ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

interface LeadDetailProps { id: string; onBack: () => void; }

export default function LeadDetail({ id, onBack }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageSaving, setStageSaving] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountryCode, setEditCountryCode] = useState<(typeof countryCodes)[number]>('+880');
  const [phoneSuggestions, setPhoneSuggestions] = useState<PhoneLookupSuggestion[]>([]);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPhoneChecking, setIsPhoneChecking] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [fuNote, setFuNote] = useState('');
  const [fuDate, setFuDate] = useState(todayDateTimeLocal());
  const [fuNext, setFuNext] = useState('');
  const [fuSaving, setFuSaving] = useState(false);
  const [fuError, setFuError] = useState<string | null>(null);
  const phoneLookupTimerRef = useRef<number | null>(null);


  useEffect(() => {
    if (!id) return;
    setLoading(true); setError(null);
    getLead(id).then(setLead).catch(e => setError(e.message || 'Failed to load lead')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const query = editPhone.trim();
    const queryDigits = query.replace(/\D/g, '');

    if (phoneLookupTimerRef.current) {
      window.clearTimeout(phoneLookupTimerRef.current);
    }

    if (!editingContact || queryDigits.length < 3) {
      setPhoneSuggestions([]);
      setIsPhoneChecking(false);
      return;
    }

    setIsPhoneChecking(true);
    phoneLookupTimerRef.current = window.setTimeout(async () => {
      try {
        const lookupQuery = `${editCountryCode} ${query}`.trim();
        const result = await lookupLeadPhones(lookupQuery, 6);
        setPhoneSuggestions(result.suggestions || []);
        setPhoneError(null);
      } catch {
        setPhoneSuggestions([]);
      } finally {
        setIsPhoneChecking(false);
      }
    }, 150);

    return () => {
      if (phoneLookupTimerRef.current) {
        window.clearTimeout(phoneLookupTimerRef.current);
      }
    };
  }, [editPhone, editCountryCode, editingContact]);

  const handleStageChange = async (newStage: LeadStageType) => {
    if (!lead) return;
    setStageSaving(true); setStageError(null);
    try { setLead(await updateLeadStage(lead._id, newStage)); }
    catch (e: unknown) { setStageError(e instanceof Error ? e.message : 'Could not update stage'); }
    finally { setStageSaving(false); }
  };

  const checkPhoneDuplicate = async (phoneValue = editPhone) => {
    if (!phoneValue.trim()) return false;

    const combinedPhone = `${editCountryCode} ${phoneValue}`.trim();
    const digits = normalizePhoneLookup(combinedPhone, editCountryCode);
    if (digits.length < 7) return false;

    const currentLeadDuplicate = splitPhoneEntries(lead?.phone).some(existing => normalizePhoneDigits(existing) === digits);
    if (currentLeadDuplicate) {
      setPhoneError('This number is already added to this lead.');
      return true;
    }

    try {
      const result = await lookupLeadPhones(combinedPhone, 8);
      const exactSuggestion = result.suggestions?.some(suggestion =>
        splitPhoneEntries(suggestion.phone).some(existing => normalizePhoneDigits(existing) === digits) &&
        suggestion._id !== lead?._id
      );

      if (result.exactMatch || exactSuggestion) {
        setPhoneError('This number already exists. Already used, try with another number.');
        return true;
      }
    } catch {
      // Let the save continue if the lookup service is unavailable.
    }

    setPhoneError(null);
    return false;
  };

  const handleSaveContact = async () => {
    if (!lead || (!editEmail.trim() && !editPhone.trim())) return;
    setContactSaving(true);
    try {
      if (editPhone.trim()) {
        const duplicate = await checkPhoneDuplicate();
        if (duplicate) return;
      }

      const newEmail = editEmail.trim() ? (lead.email ? `${lead.email}, ${editEmail.trim()}` : editEmail.trim()) : lead.email;
      const nextPhone = editPhone.trim() ? `${editCountryCode} ${editPhone.trim()}`.trim() : '';
      const newPhone = editPhone.trim() ? (lead.phone ? `${lead.phone}, ${nextPhone}` : nextPhone) : lead.phone;
      setLead(await updateLead(lead._id, { email: newEmail, phone: newPhone }));
      setEditingContact(false); setEditEmail(''); setEditPhone(''); setEditCountryCode('+880');
      setPhoneSuggestions([]); setPhoneError(null);
    } catch (e: any) { alert(e.message || 'Failed to update contact info'); }
    finally { setContactSaving(false); }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !fuNote.trim()) return;
    setFuSaving(true); setFuError(null);
    try {
      setLead(await addFollowUp(lead._id, { note: fuNote.trim(), date: fuDate || undefined, nextFollowUpDate: fuNext || undefined }));
      setFuNote(''); setFuDate(todayISO()); setFuNext('');
      setShowFollowUpForm(false);
    } catch (err: any) { setFuError(err.message || 'Failed to save follow-up'); }
    finally { setFuSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#1a56db]/20 border-t-[#1a56db] mx-auto mb-3" />
        <p className="text-[13px] text-gray-500 font-medium">Loading lead detailsÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦</p>
      </div>
    </div>
  );

  if (error || !lead) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-[15px] font-bold text-gray-800 mb-1">Could not load lead</p>
        <p className="text-[13px] text-gray-500 mb-4">{error}</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-[#1a56db] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_14px_rgba(26,86,219,0.35)] hover:bg-[#1341a8] hover:shadow-[0_6px_20px_rgba(26,86,219,0.45)] transition-all">
          Go Back
        </button>
      </div>
    </div>
  );

  const assignedName = lead.assignedTo
    ? (typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo)
    : null;
  const assignedBdmLabel = assignedName && String(assignedName).trim() ? String(assignedName).trim() : 'Not assigned yet';

  return (
    <div className="w-full space-y-3 pb-8">

      {/* ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Breadcrumb ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ */}
      <div className="flex items-center gap-1.5 px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 h-7 rounded-xl text-[12px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] text-gray-400 font-medium">Lead Center</span>
        <span className="text-gray-300">/</span>
        <span className="text-[12px] text-gray-800 font-bold truncate">{lead.fullName}</span>
      </div>

      {/* ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Hero Card ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ */}
      <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-[#1a56db] shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative z-10">
        <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5">
          <div className="w-[56px] h-[56px] rounded-xl bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center text-[22px] font-extrabold text-[#1a56db] flex-shrink-0 shadow-sm">
            {lead.fullName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">{lead.fullName}</h1>
              <StageDropdown value={lead.lifecycleStage as LeadStageType} onChange={handleStageChange} saving={stageSaving} />
            </div>
            {stageError && <p className="text-[12px] text-red-500 font-medium mt-1 mb-1.5">{stageError}</p>}
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> {lead.email || 'No email'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {lead.phone}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right flex-shrink-0 mt-3 md:mt-0">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Last Updated</p>
            <p className="text-[13px] font-bold text-gray-700 mt-0.5">{fmtTime(lead.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-4.5 flex flex-col justify-between min-h-[98px]">
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center text-[#1a56db] flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Source</p>
              <p className="text-[14px] md:text-[15px] font-bold leading-snug break-words text-gray-900">{lead.source}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-4.5 flex flex-col justify-between min-h-[98px]">
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center text-[#1a56db] flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Service</p>
              <p className="text-[14px] md:text-[15px] font-bold leading-snug break-words text-gray-900">{Array.isArray(lead.serviceInterest) ? lead.serviceInterest.join(', ') : lead.serviceInterest}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-4.5 flex flex-col justify-between min-h-[98px]">
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center text-[#1a56db] flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned BDM</p>
              <p className={`text-[14px] md:text-[15px] font-bold leading-snug break-words ${assignedBdmLabel === 'Not assigned yet' ? 'text-gray-400 italic' : 'text-gray-900'}`}>{assignedBdmLabel}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-4.5 flex flex-col justify-between min-h-[98px]">
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center text-[#1a56db] flex-shrink-0">
              <Flag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Follow-ups</p>
              <p className="text-[14px] md:text-[15px] font-bold leading-snug break-words text-gray-900">{String(lead.followUps?.length ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Left Column */}
        <div className="space-y-3">
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 bg-[#1a56db] rounded-full" />
                <User className="w-4 h-4 text-[#1a56db]" />
                <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.05em]">Contact Information</h3>
              </div>
              {!editingContact && (
                <button
                  onClick={() => { setEditEmail(''); setEditPhone(''); setEditCountryCode('+880'); setPhoneSuggestions([]); setPhoneError(null); setEditingContact(true); }}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a56db] hover:text-[#1341a8] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Add New
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email</p>
                </div>
                <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-3">
                  <div className="space-y-1">
                    {lead.email?.split(',').map((e, i) => (
                      <p key={i} className="text-[13.5px] font-bold text-gray-800 break-all">{e.trim()}</p>
                    )) || <p className="text-[13px] text-gray-400 italic">No email</p>}
                  </div>
                  {editingContact && (
                    <input
                      type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                      placeholder="Add another emailÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦"
                      className={`mt-2 ${inputCls}`}
                    />
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Phone</p>
                </div>
                <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-3">
                  <div className="space-y-1">
                    {lead.phone?.split(',').map((p, i) => (
                      <p key={i} className="text-[13.5px] font-bold text-gray-800">{p.trim()}</p>
                    ))}
                  </div>                  {editingContact && (
                    <div className="relative mt-2">
                      <div className="grid grid-cols-[auto_minmax(0,1fr)] rounded-xl overflow-visible border border-gray-200 bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                        <div className="relative flex-shrink-0 border-r border-gray-200 rounded-l-xl bg-[#f8fafc]">
                          <select
                            value={editCountryCode}
                            onChange={e => setEditCountryCode(e.target.value as (typeof countryCodes)[number])}
                            className="h-10 bg-transparent border-0 pl-3 pr-8 appearance-none text-[13px] font-bold text-gray-800 min-w-[88px] cursor-pointer focus:ring-0"
                          >
                            {countryCodes.map((code, i) => (
                              <option key={`${code}-${i}`} value={code}>{code}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        <input
                          type="tel"
                          value={editPhone}
                          onFocus={() => setIsPhoneFocused(true)}
                          onBlur={() => window.setTimeout(() => setIsPhoneFocused(false), 120)}
                          onKeyDown={async e => { if (e.key === 'Enter') { e.preventDefault(); await checkPhoneDuplicate(); } }}
                          onChange={e => { setEditPhone(e.target.value); setPhoneError(null); }}
                          placeholder="Add another phoneâ€¦"
                          className="h-10 px-3 bg-white border-0 text-[13.5px] text-gray-900 placeholder:text-gray-300 font-medium focus:outline-none"
                        />
                      </div>

                      {(isPhoneFocused || isPhoneChecking) && (phoneSuggestions.length > 0 || isPhoneChecking) && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.12)] overflow-hidden">
                          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-gray-500">Phone Suggestions</p>
                            <span className="text-[11px] font-semibold text-gray-400">{isPhoneChecking ? 'Searching...' : `${phoneSuggestions.length} found`}</span>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {!isPhoneChecking && phoneSuggestions.length === 0 ? (
                              <div className="px-4 py-3 text-[13px] text-gray-500">No matching phone suggestions.</div>
                            ) : (
                              phoneSuggestions.map(suggestion => (
                                <button
                                  key={suggestion._id}
                                  type="button"
                                  onMouseDown={e => {
                                    e.preventDefault();
                                    setEditPhone(stripCountryCodeFromPhone(suggestion.phone, editCountryCode));
                                    setPhoneError(null);
                                    setIsPhoneFocused(false);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-[#f8fafc] transition-colors border-b border-gray-50 last:border-b-0"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-[13px] font-bold text-gray-900">{suggestion.fullName}</p>
                                      <p className="text-[12px] text-gray-500">{suggestion.phone}</p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-[#1a56db] bg-[#ebf0ff] px-2.5 py-1 rounded-full">
                                      {suggestion.whom || 'No whom'}
                                    </span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {phoneError && <p className="mt-2 text-[12px] font-semibold text-red-600">{phoneError}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {editingContact && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  disabled={contactSaving}
                  onClick={() => setEditingContact(false)}
                  className="h-8 px-4 text-[13px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={contactSaving || (!editEmail.trim() && !editPhone.trim()) || Boolean(phoneError)}
                  onClick={handleSaveContact}
                  className="flex items-center gap-1.5 h-8 px-4 bg-[#1a56db] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_14px_rgba(26,86,219,0.30)] hover:bg-[#1341a8] transition-all disabled:opacity-50"
                >
                  {contactSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Contact
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-[#1a56db] rounded-full" />
                <FileText className="w-4 h-4 text-[#1a56db]" />
                <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.05em]">Notes</h3>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-3">
                <p className="text-[14px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Source & Service */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[#1a56db] rounded-full" />
              <Tag className="w-4 h-4 text-[#1a56db]" />
              <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.05em]">Source & Service</h3>
            </div>
            
            <div className="space-y-3">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">Source</p>
                  <p className="text-[14px] font-bold text-gray-900">{lead.source}</p>
                </div>
              </div>

              <div className="bg-[#ebf0ff] border border-[#1a56db]/20 rounded-xl p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1a56db]/10 border border-[#1a56db]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-[#1a56db]/80 uppercase tracking-widest mb-0.5">Service Interest</p>
                  <p className="text-[14px] font-bold text-[#1a56db]">{Array.isArray(lead.serviceInterest) ? lead.serviceInterest.join(', ') : lead.serviceInterest}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Follow-up Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
        <div className="flex items-center gap-2.5 mb-5 border-b border-gray-100 pb-3">
          <span className="w-1 h-4 bg-[#1a56db] rounded-full" />
          <Activity className="w-4 h-4 text-[#1a56db]" />
          <h3 className="text-[12px] font-extrabold text-gray-500 uppercase tracking-[0.05em]">Follow-up History</h3>
          <span className="text-[11px] font-extrabold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full ml-1">
            {lead.followUps?.length ?? 0}
          </span>
          <button
            onClick={() => { setShowFollowUpForm(v => !v); setFuError(null); }}
            className="ml-auto flex items-center gap-1.5 h-8 px-4 bg-[#1a56db] text-white text-[12.5px] font-bold rounded-xl shadow-[0_2px_10px_rgba(26,86,219,0.30)] hover:bg-[#1341a8] hover:shadow-[0_4px_14px_rgba(26,86,219,0.40)] active:scale-95 transition-all duration-200"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Add Follow-Up
          </button>
        </div>

        {showFollowUpForm && (
          <form onSubmit={handleAddFollowUp} className="bg-[#f8fafc] border border-gray-100 rounded-xl p-4 md:p-5 space-y-4 mb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-[#1a56db]" />
                </div>
                <p className="text-[12.5px] font-bold text-[#1a56db] uppercase tracking-widest">New Follow-Up</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowFollowUpForm(false); setFuError(null); setFuNote(''); setFuDate(todayDateTimeLocal()); setFuNext(''); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#1a56db]/10 text-gray-500 hover:text-[#1a56db] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Follow-Up Date</label>
                <input
                  type="datetime-local"
                  value={fuDate}
                  min={todayISO() + 'T00:00'}
                  onChange={e => setFuDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Next Follow-Up Date</label>
                <input
                  type="datetime-local"
                  value={fuNext}
                  min={todayISO() + 'T00:00'}
                  onChange={e => setFuNext(e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Note <span className="text-red-500 normal-case">*</span></label>
              <textarea
                required
                rows={3}
                value={fuNote}
                onChange={e => setFuNote(e.target.value)}
                placeholder="Describe the interaction in detail..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-[13.5px] font-medium text-gray-800 placeholder:text-gray-300 resize-none outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a56db] transition-all focus:bg-white"
              />
            </div>
            {fuError && (
              <div className="flex items-center gap-1.5 text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100">
                <AlertCircle className="w-3.5 h-3.5" />
                <p className="text-[12.5px] font-bold">{fuError}</p>
              </div>
            )}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={fuSaving || !fuNote.trim()}
                className="flex items-center gap-1.5 h-9 px-5 bg-[#1a56db] text-white text-[13px] font-bold rounded-xl shadow-[0_2px_10px_rgba(26,86,219,0.30)] hover:bg-[#1341a8] disabled:opacity-50 transition-all"
              >
                {fuSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {fuSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {lead.followUps && lead.followUps.length > 0 ? (
          <div className="relative pl-5 md:pl-6 py-1">
            <div className="absolute left-[9px] md:left-[13px] top-3 bottom-3 w-[1.5px] bg-gray-200 rounded-full" />
            <div className="space-y-4">
              {lead.followUps.map((fu, i) => (
                <div key={`${fu.date || ''}-${(fu.note || '').slice(0, 48)}-${i}`} className="relative group">
                  <div className="absolute -left-[24px] md:-left-[28px] top-3.5 w-3 h-3 rounded-full bg-[#1a56db] border-2 border-white shadow-sm ring-2 ring-[#ebf0ff] group-hover:scale-125 transition-transform" />
                  <div className="bg-[#f8fafc] border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)] rounded-xl p-4 hover:border-[#1a56db]/30 hover:shadow-[0_4px_20px_rgba(26,86,219,0.06)] transition-all">
                    <p className="text-[14px] text-gray-700 leading-relaxed font-semibold">
                      {fu.note || <span className="text-gray-300 italic font-medium">No note provided</span>}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {fu.date && (
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 font-bold bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />{fmt(fu.date)}
                        </span>
                      )}
                      {fu.nextFollowUpDate && (
                        <button
                          type="button"
                          onClick={() => { setShowFollowUpForm(true); setFuError(null); }}
                          className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#1a56db] bg-[#ebf0ff] px-2.5 py-1 rounded-lg border border-[#1a56db]/25 hover:bg-[#1a56db] hover:text-white hover:shadow-sm transition-all group/next"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#1a56db] group-hover/next:text-white transition-colors" />
                          Next: {fmt(fu.nextFollowUpDate)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !showFollowUpForm && (
            <div className="text-center py-8 bg-[#f8fafc] rounded-xl border border-dashed border-gray-200">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-100">
                <MessageSquare className="w-6 h-6 text-[#1a56db]/40" />
              </div>
              <p className="text-[15px] font-extrabold text-gray-800">No follow-up history yet</p>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Click &quot;Add Follow-Up&quot; to record the first interaction.</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}





