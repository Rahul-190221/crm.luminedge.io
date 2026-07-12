'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Mail, Phone, User, FileText, Clock,
  Tag, Activity, Calendar, RefreshCw, AlertCircle,
  MapPin, TrendingUp, Users, MessageSquare, Plus,
  ChevronDown, Check, X, Save, Flag, Copy, Pencil
} from 'lucide-react';
import { getLead, addFollowUp, updateLeadStage, updateLead, lookupLeadPhones } from '@/lib/api/leads';
import { submitLeadEditRequest } from '@/lib/api/leadEditRequests';
import LeadEditRequestHistory from '@/components/leads/LeadEditRequestHistory';
import toast from 'react-hot-toast';
import type { Lead, LeadStage as LeadStageType } from '@/types/admin';
import { SERVICE_INTEREST_OPTIONS } from '@/types/admin';
import { getSourceColor } from '@/lib/constants/leadSourceColors';
import StageDropdown from '@/components/leads/StageDropdown';
import {
  PHONE_COUNTRIES,
  DEFAULT_PHONE_COUNTRY_CODE,
  type PhoneCountryCode,
  buildInternationalPhone,
  detectPhoneCountry,
  extractPhoneDigits,
  formatPhoneCountryCode,
  hasMatchingPhoneEntry,
  phoneEntryMatches,
  sanitizePhoneTypingInput,
  splitPhoneEntries,
  validatePhone,
} from '@/lib/phone/phone.utils';

// ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Stage config (prototype color-aligned) ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

const countryCodes = PHONE_COUNTRIES;
const whomOptions = ['Personal', 'Parents', 'Cousin', 'Uncle', 'Sibling', 'Spouse'] as const;
type WhomOption = (typeof whomOptions)[number];
const leadSources = ['Education Team', 'Phone Call', 'Previous', 'Facebook', 'WhatsApp', 'Google', 'Walk-in', 'Event', 'Reference', 'Others', 'Website'] as const;
const serviceInterests = SERVICE_INTEREST_OPTIONS;

interface PhoneLookupSuggestion { _id: string; fullName: string; phone: string; whom?: string }

const normalizePhoneInput = (value: string): string => extractPhoneDigits(sanitizePhoneTypingInput(value));

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function todayISO() { return new Date().toISOString().split('T')[0]; }

// ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Sub-components ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

const inputCls = "w-full h-10 px-3 border border-gray-200 rounded-xl text-[13.5px] font-medium text-gray-800 placeholder:text-gray-300 bg-[#f8fafc] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1a56db] transition-all focus:bg-white";

//ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Main Component ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬

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
  const [editCountryCode, setEditCountryCode] = useState<PhoneCountryCode>(DEFAULT_PHONE_COUNTRY_CODE);
  const [editWhom, setEditWhom] = useState<WhomOption | ''>('');
  const [phoneSuggestions, setPhoneSuggestions] = useState<PhoneLookupSuggestion[]>([]);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPhoneChecking, setIsPhoneChecking] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [contactSaving, setContactSaving] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [fuNote, setFuNote] = useState('');
  const [fuDate, setFuDate] = useState(todayISO());
  const [fuNext, setFuNext] = useState('');
  const [fuSaving, setFuSaving] = useState(false);
  const [fuError, setFuError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editingSourceService, setEditingSourceService] = useState(false);
  const [editSource, setEditSource] = useState('');
  const [editServiceInterest, setEditServiceInterest] = useState<string[]>([]);
  const [sourceServiceSaving, setSourceServiceSaving] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [emailEditIdx, setEmailEditIdx] = useState<number | null>(null);
  const [emailEditValue, setEmailEditValue] = useState('');
  const [phoneEditIdx, setPhoneEditIdx] = useState<number | null>(null);
  const [phoneEditDigits, setPhoneEditDigits] = useState('');
  const [phoneEditCountryCode, setPhoneEditCountryCode] = useState<PhoneCountryCode>(DEFAULT_PHONE_COUNTRY_CODE);
  const [phoneEditError, setPhoneEditError] = useState<string | null>(null);
  const [contactEditRequestSaving, setContactEditRequestSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const phoneLookupTimerRef = useRef<number | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };


  useEffect(() => {
    if (!id) return;
    setLoading(true); setError(null);
    getLead(id).then(setLead).catch(e => setError(e.message || 'Failed to load lead')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const query = editPhone.trim();
    const queryDigits = extractPhoneDigits(query);

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
        const lookupQuery = buildInternationalPhone(query, editCountryCode) || query;
        const result = await lookupLeadPhones(lookupQuery, 6, lead?._id);
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
  }, [editPhone, editCountryCode, editingContact, lead?._id]);

  const handleStageChange = async (newStage: LeadStageType) => {
    if (!lead) return;
    setStageSaving(true); setStageError(null);
    try {
      setLead(await updateLeadStage(lead._id, newStage));
      toast.success(`Lead moved to ${newStage}`);
    }
    catch (e: unknown) { setStageError(e instanceof Error ? e.message : 'Could not update stage'); }
    finally { setStageSaving(false); }
  };
  const handleSaveName = async () => {
    if (!lead || !editNameValue.trim()) return;
    setNameSaving(true);
    try {
      const updated = await updateLead(lead._id, { fullName: editNameValue.trim() });
      setLead(updated);
      setEditingName(false);
      toast.success('Name updated');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not update name');
    } finally {
      setNameSaving(false);
    }
  };

  const checkPhoneDuplicate = async (phoneValue = editPhone) => {
    if (!phoneValue.trim()) return false;

    const digitError = validatePhone(phoneValue, editCountryCode);
    if (digitError) { setPhoneError(digitError); return true; }

    const normalizedPhone = buildInternationalPhone(phoneValue, editCountryCode);
    if (!normalizedPhone) return false;

    const currentLeadDuplicate = hasMatchingPhoneEntry(lead?.phone, phoneValue, editCountryCode);
    if (currentLeadDuplicate) {
      setPhoneError('This number is already added to this lead.');
      return true;
    }

    try {
      const result = await lookupLeadPhones(normalizedPhone, 8, lead?._id);
      const exactSuggestion = result.suggestions?.some(suggestion =>
        hasMatchingPhoneEntry(suggestion.phone, phoneValue, editCountryCode) && suggestion._id !== lead?._id
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

      const newEmail = editEmail.trim()
        ? (lead.email ? `${lead.email}, ${editEmail.trim()}` : editEmail.trim())
        : lead.email;
      const nextPhone = editPhone.trim() ? buildInternationalPhone(editPhone, editCountryCode) : '';
      const newPhone = editPhone.trim()
        ? (lead.phone ? `${lead.phone}, ${nextPhone}` : nextPhone)
        : lead.phone;

      // Adding a brand-new email/phone is always saved directly — no approval needed.
      setLead(await updateLead(lead._id, { email: newEmail, phone: newPhone, ...(editWhom ? { whom: editWhom } : {}) }));
      toast.success('Contact added');

      setEditingContact(false); setEditEmail(''); setEditPhone(''); setEditCountryCode(DEFAULT_PHONE_COUNTRY_CODE); setEditWhom('');
      setPhoneSuggestions([]); setPhoneError(null);
    } catch (e: any) { alert(e.message || 'Failed to update contact info'); }
    finally { setContactSaving(false); }
  };

  const startEditEmail = (idx: number, value: string) => {
    setPhoneEditIdx(null); setPhoneEditDigits(''); setPhoneEditError(null);
    setEmailEditIdx(idx); setEmailEditValue(value);
  };
  const cancelEditEmail = () => { setEmailEditIdx(null); setEmailEditValue(''); };
  const submitEditEmail = async () => {
    if (!lead || emailEditIdx === null || !emailEditValue.trim()) return;
    setContactEditRequestSaving(true);
    try {
      const emails = splitPhoneEntries(lead.email);
      emails[emailEditIdx] = emailEditValue.trim();
      // Editing an existing email always requires admin approval.
      await submitLeadEditRequest(lead._id, { section: 'contact', payload: { email: emails.join(', ') } });
      toast.success('Email edit request sent for admin approval');
      cancelEditEmail();
    } catch (e: any) { toast.error(e.message || 'Failed to submit edit request'); }
    finally { setContactEditRequestSaving(false); }
  };

  const startEditPhone = (idx: number, value: string) => {
    setEmailEditIdx(null); setEmailEditValue('');
    const { countryCode, nationalNumber } = detectPhoneCountry(value);
    setPhoneEditIdx(idx);
    setPhoneEditCountryCode(countryCode);
    setPhoneEditDigits(nationalNumber);
    setPhoneEditError(null);
  };
  const cancelEditPhone = () => {
    setPhoneEditIdx(null); setPhoneEditDigits(''); setPhoneEditCountryCode(DEFAULT_PHONE_COUNTRY_CODE); setPhoneEditError(null);
  };

  const checkEditPhoneDuplicate = async () => {
    if (!phoneEditDigits.trim() || phoneEditIdx === null) return false;

    const digitError = validatePhone(phoneEditDigits, phoneEditCountryCode);
    if (digitError) { setPhoneEditError(digitError); return true; }

    const normalizedPhone = buildInternationalPhone(phoneEditDigits, phoneEditCountryCode);
    if (!normalizedPhone) { setPhoneEditError('Enter a valid phone number.'); return true; }

    const otherEntries = splitPhoneEntries(lead?.phone).filter((_, i) => i !== phoneEditIdx);
    const currentLeadDuplicate = otherEntries.some(entry => phoneEntryMatches(entry, phoneEditDigits, phoneEditCountryCode));
    if (currentLeadDuplicate) {
      setPhoneEditError('This number is already added to this lead.');
      return true;
    }

    try {
      const result = await lookupLeadPhones(normalizedPhone, 8, lead?._id);
      const exactSuggestion = result.suggestions?.some(suggestion =>
        hasMatchingPhoneEntry(suggestion.phone, phoneEditDigits, phoneEditCountryCode) && suggestion._id !== lead?._id
      );

      if (result.exactMatch || exactSuggestion) {
        setPhoneEditError('This number already exists. Already used, try with another number.');
        return true;
      }
    } catch {
      // Let the save continue if the lookup service is unavailable.
    }

    setPhoneEditError(null);
    return false;
  };

  const submitEditPhone = async () => {
    if (!lead || phoneEditIdx === null || !phoneEditDigits.trim()) return;
    const duplicate = await checkEditPhoneDuplicate();
    if (duplicate) return;

    setContactEditRequestSaving(true);
    try {
      const phones = splitPhoneEntries(lead.phone);
      phones[phoneEditIdx] = buildInternationalPhone(phoneEditDigits, phoneEditCountryCode);
      // Editing an existing phone always requires admin approval.
      await submitLeadEditRequest(lead._id, { section: 'contact', payload: { phone: phones.join(', ') } });
      toast.success('Phone edit request sent for admin approval');
      cancelEditPhone();
    } catch (e: any) { toast.error(e.message || 'Failed to submit edit request'); }
    finally { setContactEditRequestSaving(false); }
  };

  const handleSaveSourceService = async () => {
    if (!lead) return;
    setSourceServiceSaving(true);
    try {
      // Source & Service updates are always saved directly — no approval needed.
      setLead(await updateLead(lead._id, { source: editSource as any, serviceInterest: editServiceInterest as any }));
      toast.success('Source & Service updated');
      setEditingSourceService(false);
    } catch (e: any) { toast.error(e.message || 'Failed to update'); }
    finally { setSourceServiceSaving(false); }
  };

  const handleSaveNotes = async () => {
    if (!lead) return;
    setNotesSaving(true);
    try {
      // Notes updates are always saved directly — no approval needed.
      setLead(await updateLead(lead._id, { notes: editNotes } as any));
      toast.success('Notes updated');
      setEditingNotes(false);
    } catch (e: any) { toast.error(e.message || 'Failed to update'); }
    finally { setNotesSaving(false); }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !fuNote.trim()) return;
    setFuSaving(true); setFuError(null);
    try {
      // Follow-ups are always saved directly — no approval needed.
      setLead(await addFollowUp(lead._id, { note: fuNote.trim(), date: fuDate || undefined, nextFollowUpDate: fuNext || undefined }));
      toast.success('Follow-up saved');
      setFuNote(''); setFuDate(todayISO()); setFuNext('');
      setShowFollowUpForm(false);
    } catch (err: any) { setFuError(err.message || 'Failed to save follow-up'); }
    finally { setFuSaving(false); }
  };
  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#1a56db]/20 border-t-[#1a56db] mx-auto mb-3" />
        <p className="text-[13px] text-gray-500 font-medium">Loading lead detailsÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦</p>
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

  // Latest follow-up first.
  const sortedFollowUps = [...(lead.followUps || [])].sort((a, b) => {
    const bTime = new Date(b.createdAt || b.date || 0).getTime();
    const aTime = new Date(a.createdAt || a.date || 0).getTime();
    return bTime - aTime;
  });

  return (
    <div className="w-full space-y-3 pb-8">

      {/* ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Breadcrumb ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ */}
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
        <span className="text-[12px] text-gray-800 font-bold truncate">{lead.fullName || 'Unnamed lead'}</span>
      </div>

      {/* ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Hero Card ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÆ'Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ */}
      <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-[#1a56db] shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative z-10">
        <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-5">
          <div className="w-[56px] h-[56px] rounded-xl bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center text-[22px] font-extrabold text-[#1a56db] flex-shrink-0 shadow-sm">
            {(lead.fullName || '?').charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1.5">
              {editingName ? (
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={editNameValue}
                    onChange={e => setEditNameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    className="h-9 px-3 border border-[#1a56db] rounded-xl text-[15px] font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#1a56db]/20 min-w-[200px]"
                    placeholder="Lead name"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving || !editNameValue.trim()}
                    className="h-9 px-3 rounded-xl bg-[#1a56db] text-white text-[12px] font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {nameSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="h-9 px-3 rounded-xl border border-gray-200 text-gray-500 text-[12px] font-bold hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/name">
                  <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">{lead.fullName || 'Unnamed lead'}</h1>
                  <button
                    onClick={e => { e.stopPropagation(); setEditNameValue(lead.fullName || ''); setEditingName(true); }}
                    title="Edit name"
                    className="opacity-0 group-hover/name:opacity-100 transition-opacity p-1 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-[#1a56db]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <StageDropdown value={lead.lifecycleStage as LeadStageType} onChange={handleStageChange} saving={stageSaving} />
            </div>
            {stageError && <p className="text-[12px] text-red-500 font-medium mt-1 mb-1.5">{stageError}</p>}
            <div className="flex flex-wrap items-center gap-3 text-[13px] text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> {lead.email || 'No email'}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> {lead.phone}
                {lead.whom && <span className="text-gray-400 font-bold uppercase text-[11px]">({lead.whom})</span>}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-4.5 flex flex-col justify-between min-h-[98px]">
          <div className="flex items-start gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center text-[#1a56db] flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Source</p>
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[13px] md:text-[14px] font-bold leading-snug"
                style={{ backgroundColor: getSourceColor(lead.source).bg, color: getSourceColor(lead.source).text }}
              >
                {lead.source}
              </span>
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
                  onClick={() => { setEditEmail(''); setEditPhone(''); setEditCountryCode(DEFAULT_PHONE_COUNTRY_CODE); setPhoneSuggestions([]); setPhoneError(null); setEditingContact(true); }}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-[#1a56db] hover:text-[#1341a8] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Add New
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email</p>
                </div>
                <div className="space-y-1.5">
                  {lead.email?.split(',').map((e, i) => (
                    emailEditIdx === i ? (
                      <div key={i} className="flex items-center gap-2 bg-white border border-[#1a56db]/30 rounded-xl px-3 py-2 ring-4 ring-blue-500/10">
                        <input
                          type="email" autoFocus value={emailEditValue} onChange={ev => setEmailEditValue(ev.target.value)}
                          className="flex-1 min-w-0 text-[13.5px] font-semibold text-gray-800 outline-none bg-transparent"
                        />
                        <button type="button" disabled={contactEditRequestSaving} onClick={cancelEditEmail} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" disabled={contactEditRequestSaving || !emailEditValue.trim()} onClick={submitEditEmail} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#ebf0ff] text-[#1a56db] disabled:opacity-50 transition-all">
                          {contactEditRequestSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <div key={i} className="flex items-center gap-2.5 bg-[#f8fafc] border border-gray-100 rounded-xl px-3 py-2.5 group hover:border-gray-200 transition-all">
                        <p className="text-[13.5px] font-semibold text-gray-800 break-all flex-1">{e.trim()}</p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(e.trim(), `email-${i}`)}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                        >
                          {copiedField === `email-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          title="Edit (requires admin approval)"
                          onClick={() => startEditEmail(i, e.trim())}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-[#1a56db] transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  )) || <p className="text-[13px] text-gray-400 italic px-1">No email</p>}
                </div>
                {editingContact && (
                  <input
                    type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                    placeholder="Add another email…"
                    className={`mt-2 ${inputCls}`}
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Phone</p>
                </div>
                <div className="space-y-1.5">
                  {lead.phone?.split(',').map((p, i) => (
                    phoneEditIdx === i ? (
                      <div key={i} className="bg-white border border-[#1a56db]/30 rounded-xl px-3 py-2.5 ring-4 ring-blue-500/10 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="grid grid-cols-[auto_minmax(0,1fr)] flex-1 rounded-lg overflow-hidden border border-gray-200 bg-[#f8fafc] focus-within:border-[#1a56db] transition-colors">
                            <div className="relative flex-shrink-0 border-r border-gray-200">
                              <select
                                value={phoneEditCountryCode}
                                onChange={e => {
                                  const code = e.target.value as PhoneCountryCode;
                                  setPhoneEditCountryCode(code);
                                  if (phoneEditDigits.trim()) setPhoneEditError(validatePhone(phoneEditDigits, code));
                                }}
                                className="h-9 bg-transparent border-0 pl-2.5 pr-7 appearance-none text-[12.5px] font-bold text-gray-800 min-w-[70px] cursor-pointer focus:ring-0"
                              >
                                {countryCodes.map((c, i2) => (
                                  <option key={`${c.code}-${i2}`} value={c.code}>{formatPhoneCountryCode(c)}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                            <input
                              type="tel" autoFocus value={phoneEditDigits}
                              onKeyDown={async e => {
                                if (e.key === 'Enter') { e.preventDefault(); await checkEditPhoneDuplicate(); return; }
                                if (e.key.length === 1 && /\D/.test(e.key)) e.preventDefault();
                              }}
                              onChange={ev => {
                                const next = normalizePhoneInput(ev.target.value);
                                setPhoneEditDigits(next);
                                setPhoneEditError(next ? validatePhone(next, phoneEditCountryCode) : null);
                              }}
                              onBlur={() => { if (phoneEditDigits.trim()) setPhoneEditError(validatePhone(phoneEditDigits, phoneEditCountryCode)); }}
                              className="h-9 px-2.5 bg-transparent border-0 text-[13.5px] text-gray-900 placeholder:text-gray-400 font-medium focus:outline-none min-w-0"
                            />
                          </div>
                          <button type="button" disabled={contactEditRequestSaving} onClick={cancelEditPhone} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" disabled={contactEditRequestSaving || !phoneEditDigits.trim() || Boolean(phoneEditError)} onClick={submitEditPhone} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#ebf0ff] text-[#1a56db] disabled:opacity-50 transition-all">
                            {contactEditRequestSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {phoneEditError && <p className="text-[11.5px] font-semibold text-red-600 pl-0.5">{phoneEditError}</p>}
                      </div>
                    ) : (
                      <div key={i} className="flex items-center gap-2.5 bg-[#f8fafc] border border-gray-100 rounded-xl px-3 py-2.5 group hover:border-gray-200 transition-all">
                        <p className="text-[13.5px] font-semibold text-gray-800 flex-1">
                          {p.trim()}
                          {lead.whom && (
                            <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-wide align-middle">({lead.whom})</span>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(p.trim(), `phone-${i}`)}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                        >
                          {copiedField === `phone-${i}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          title="Edit (requires admin approval)"
                          onClick={() => startEditPhone(i, p.trim())}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 text-gray-400 hover:text-[#1a56db] transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  ))}
                </div>
                {editingContact && (
                    <div className="relative mt-2">
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] rounded-xl overflow-visible border border-gray-200 bg-white focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                        <div className="relative flex-shrink-0 border-r border-gray-200 rounded-l-xl bg-[#f8fafc]">
                          <select
                            value={editCountryCode}
                            onChange={e => {
                              const code = e.target.value as PhoneCountryCode;
                              setEditCountryCode(code);
                              if (editPhone.trim()) setPhoneError(validatePhone(editPhone, code));
                            }}
                            className="h-10 bg-transparent border-0 pl-3 pr-8 appearance-none text-[13px] font-bold text-gray-800 min-w-[88px] cursor-pointer focus:ring-0"
                          >
                            {countryCodes.map((c, i) => (
                              <option key={`${c.code}-${i}`} value={c.code}>{formatPhoneCountryCode(c)}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                        <input
                          type="tel"
                          value={editPhone}
                          onFocus={() => setIsPhoneFocused(true)}
                          onBlur={() => window.setTimeout(() => {
                            setIsPhoneFocused(false);
                            if (editPhone.trim()) setPhoneError(validatePhone(editPhone, editCountryCode));
                          }, 120)}
                          onKeyDown={async e => {
                            if (e.key === 'Enter') { e.preventDefault(); await checkPhoneDuplicate(); return; }
                            if (e.key.length === 1 && /\D/.test(e.key)) e.preventDefault();
                          }}
                          onChange={e => {
                            const next = normalizePhoneInput(e.target.value);
                            setEditPhone(next);
                            setPhoneError(next ? validatePhone(next, editCountryCode) : null);
                          }}
                          placeholder="Add another phone…"
                          className="h-10 px-3 bg-white border-0 text-[13.5px] text-gray-900 placeholder:text-gray-300 font-medium focus:outline-none"
                        />
                        <div className="relative flex-shrink-0 border-l border-gray-200 rounded-r-xl bg-[#f8fafc]">
                          <select
                            value={editWhom}
                            onChange={e => setEditWhom(e.target.value as WhomOption | '')}
                            className="h-10 bg-transparent border-0 pl-3 pr-8 appearance-none text-[13px] font-semibold text-gray-700 min-w-[100px] cursor-pointer focus:ring-0"
                          >
                            <option value="">Whom</option>
                            {whomOptions.map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
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
                                    const detected = detectPhoneCountry(suggestion.phone);
                                    setEditCountryCode(detected.countryCode);
                                    setEditPhone(detected.nationalNumber);
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

            {editingContact && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  disabled={contactSaving}
                  onClick={() => { setEditingContact(false); setEditEmail(''); setEditPhone(''); setEditCountryCode(DEFAULT_PHONE_COUNTRY_CODE); setEditWhom(''); setPhoneError(null); setPhoneSuggestions([]); }}
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

          <LeadEditRequestHistory leadId={id} leadName={lead?.fullName || 'Lead'} enabled />
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          {/* Source & Service */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 bg-[#1a56db] rounded-full" />
              <Tag className="w-4 h-4 text-[#1a56db]" />
              <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.05em]">Source & Service</h3>
              {!editingSourceService && (
                <button
                  type="button"
                  onClick={() => { setEditSource(lead.source); setEditServiceInterest(Array.isArray(lead.serviceInterest) ? [...lead.serviceInterest] : []); setEditingSourceService(true); }}
                  className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#1a56db] hover:bg-[#ebf0ff] px-2 py-1 rounded-lg transition-all"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
            </div>

            {editingSourceService ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 block">Source</label>
                  <div className="relative">
                    <select value={editSource} onChange={e => setEditSource(e.target.value)} className={`${inputCls} pr-8 appearance-none`}>
                      {leadSources.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 block">Service Interest</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {serviceInterests.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer px-2.5 py-2 rounded-lg border border-gray-100 hover:border-[#1a56db]/20 hover:bg-[#f8fafc] transition-all">
                        <input
                          type="checkbox"
                          checked={editServiceInterest.includes(s)}
                          onChange={e => setEditServiceInterest(prev => e.target.checked ? [...prev, s] : prev.filter(x => x !== s))}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#1a56db] focus:ring-[#1a56db] flex-shrink-0"
                        />
                        <span className="text-[12px] font-medium text-gray-700 leading-tight">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button type="button" disabled={sourceServiceSaving} onClick={() => setEditingSourceService(false)} className="h-8 px-4 text-[13px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                  <button
                    type="button"
                    disabled={sourceServiceSaving || !editSource || editServiceInterest.length === 0}
                    onClick={handleSaveSourceService}
                    className="flex items-center gap-1.5 h-8 px-4 bg-[#1a56db] text-white text-[13px] font-bold rounded-xl shadow-[0_4px_14px_rgba(26,86,219,0.30)] hover:bg-[#1341a8] transition-all disabled:opacity-50"
                  >
                    {sourceServiceSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                <div className="flex items-center gap-3 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Source</p>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[13px] font-bold"
                      style={{ backgroundColor: getSourceColor(lead.source).bg, color: getSourceColor(lead.source).text }}
                    >
                      {lead.source}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ebf0ff] border border-[#1a56db]/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#1a56db]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest leading-none mb-1">Service Interest</p>
                    <p className="text-[14px] font-bold text-gray-900">{Array.isArray(lead.serviceInterest) ? lead.serviceInterest.join(', ') : lead.serviceInterest}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {(lead.notes || editingNotes) ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-amber-400 rounded-full" />
                <FileText className="w-4 h-4 text-amber-500" />
                <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.05em]">Notes</h3>
                {!editingNotes && (
                  <button
                    type="button"
                    onClick={() => { setEditNotes(lead.notes || ''); setEditingNotes(true); }}
                    className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded-lg transition-all"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Add notes about this lead..."
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13.5px] font-medium text-gray-800 placeholder:text-gray-300 resize-none outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                    <button type="button" disabled={notesSaving} onClick={() => setEditingNotes(false)} className="h-8 px-4 text-[13px] font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                    <button
                      type="button"
                      disabled={notesSaving}
                      onClick={handleSaveNotes}
                      className="flex items-center gap-1.5 h-8 px-4 bg-amber-500 text-white text-[13px] font-bold rounded-xl shadow-[0_4px_14px_rgba(245,158,11,0.30)] hover:bg-amber-600 transition-all disabled:opacity-50"
                    >
                      {notesSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-l-[3px] border-amber-300 bg-amber-50/60 rounded-r-xl pl-4 pr-3 py-3">
                  <p className="text-[14px] font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setEditNotes(''); setEditingNotes(true); }}
              className="w-full flex items-center gap-2 bg-white rounded-xl border border-dashed border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] px-4 py-3 text-[12px] font-bold text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Notes
            </button>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-4 bg-[#1a56db] rounded-full" />
              <Clock className="w-4 h-4 text-[#1a56db]" />
              <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.05em]">Timeline</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between py-2.5">
                <p className="text-[12px] font-semibold text-gray-500">Created</p>
                <p className="text-[12px] font-bold text-gray-800">{fmt(lead.createdAt)}</p>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <p className="text-[12px] font-semibold text-gray-500">Last Updated</p>
                <p className="text-[12px] font-bold text-gray-800">{fmt(lead.updatedAt)}</p>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <p className="text-[12px] font-semibold text-gray-500">Follow-ups</p>
                <span className="text-[12px] font-extrabold text-[#1a56db] bg-[#ebf0ff] border border-[#1a56db]/15 px-2 py-0.5 rounded-full">{lead.followUps?.length ?? 0}</span>
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
                onClick={() => { setShowFollowUpForm(false); setFuError(null); setFuNote(''); setFuDate(todayISO()); setFuNext(''); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#1a56db]/10 text-gray-500 hover:text-[#1a56db] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Follow-Up Date</label>
                <input
                  type="date"
                  value={fuDate}
                  min={todayISO()}
                  onChange={e => setFuDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={fuNext}
                  min={todayISO()}
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
                {fuSaving ? 'Saving...' : 'Save Follow-Up'}
              </button>
            </div>
          </form>
        )}

        {sortedFollowUps.length > 0 ? (
          <div className="relative pl-5 md:pl-6 py-1">
            <div className="absolute left-[9px] md:left-[13px] top-3 bottom-3 w-[1.5px] bg-gray-200 rounded-full" />
            <div className="space-y-4">
              {sortedFollowUps.map((fu, i) => (
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







