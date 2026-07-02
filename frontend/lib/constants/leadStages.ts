import type { LeadStage } from '@/types/admin';

export const LEAD_STAGES: LeadStage[] = ['New Inquiry', 'Contacted', 'Trial Class', 'Enrolled', 'Lost'];

export interface LeadStageMeta {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  headerText: string;
  countText: string;
}

export const LEAD_STAGE_META: Record<LeadStage, LeadStageMeta> = {
  'New Inquiry': { label: 'New Inquiry', bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400',   headerText: 'text-[#868e96]', countText: 'text-[#868e96]' },
  'Contacted':   { label: 'Contacted',   bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-600',   headerText: 'text-[#4c6ef5]', countText: 'text-[#4c6ef5]' },
  'Trial Class': { label: 'Trial Class', bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', headerText: 'text-[#f59f00]', countText: 'text-[#f59f00]' },
  'Enrolled':    { label: 'Enrolled',    bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-600',   headerText: 'text-[#40c057]', countText: 'text-[#40c057]' },
  'Lost':        { label: 'Lost',        bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-600',    headerText: 'text-[#fa5252]', countText: 'text-[#fa5252]' },
};
