// Fixed per-source color palette for Lead Source badges across Lead Center,
// Lead Detail, and Lead Assignments — matches the reference legend design.

const LEAD_SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  'Education Team': { bg: '#6b46c1', text: '#ffffff' },
  'Phone Call':      { bg: '#fef3c7', text: '#92400e' },
  'Previous':        { bg: '#dbeafe', text: '#1e40af' },
  'Facebook':        { bg: '#3b82f6', text: '#ffffff' },
  'WhatsApp':        { bg: '#dcfce7', text: '#166534' },
  'Google':          { bg: '#ef4444', text: '#ffffff' },
  'Walk-in':         { bg: '#166534', text: '#ffffff' },
  'Event':           { bg: '#4b5563', text: '#ffffff' },
  'Reference':       { bg: '#ede9fe', text: '#6d28d9' },
  'Others':          { bg: '#f3f4f6', text: '#4b5563' },
  'Website':         { bg: '#fecdd3', text: '#9f1239' },
}

const FALLBACK = { bg: '#f3f4f6', text: '#6b7280' }

export function getSourceColor(source?: string | null): { bg: string; text: string } {
  if (!source) return FALLBACK
  return LEAD_SOURCE_COLORS[source] || FALLBACK
}

export default LEAD_SOURCE_COLORS
