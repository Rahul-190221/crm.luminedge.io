import type { Lead, BDM, LeadStage } from '@/types/admin';

export interface PhoneLookupSuggestion {
  _id: string;
  fullName: string;
  phone: string;
  whom?: string;
}

export interface PhoneLookupResult {
  suggestions: PhoneLookupSuggestion[];
  exactMatch: boolean;
}

import { API_ORIGIN } from './base'
import { getToken } from '../helpers/jwt';
const API_BASE_URL = `${API_ORIGIN}/api`;

const getAuthHeader = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Assign leads to a BDM
export const assignLeads = async (leadIds: string[], bdmId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/leads/assign`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ leadIds, bdmId })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to assign leads');
  }
  return response.json();
};

export interface LeadsPage {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get all leads with optional filters and pagination
export const getLeads = async (filters?: {
  stage?: string;
  source?: string;
  serviceInterest?: string;
  assignedTo?: string;
  bdmName?: string;
  search?: string;
  unassigned?: boolean;
  page?: number;
  limit?: number;
}): Promise<LeadsPage> => {
  const params = new URLSearchParams();
  if (filters?.stage) params.append('stage', filters.stage);
  if (filters?.source) params.append('source', filters.source);
  if (filters?.serviceInterest) params.append('serviceInterest', filters.serviceInterest);
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
  if (filters?.bdmName) params.append('bdmName', filters.bdmName);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.unassigned) params.append('unassigned', 'true');
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const queryString = params.toString();
  const url = `${API_BASE_URL}/leads${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch leads');
  return response.json();
};

// Get single lead
export const getLead = async (id: string): Promise<Lead> => {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch lead');
  return response.json();
};

// Create lead
export const createLead = async (data: Omit<Lead, '_id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create lead');
  }
  return response.json();
};

// Update lead
export const updateLead = async (id: string, data: Partial<Lead>): Promise<Lead> => {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update lead');
  }
  return response.json();
};

// Update lead stage
export const updateLeadStage = async (id: string, lifecycleStage: string): Promise<Lead> => {
  const response = await fetch(`${API_BASE_URL}/leads/${id}/stage`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify({ lifecycleStage })
  });
  if (!response.ok) throw new Error('Failed to update lead stage');
  return response.json();
};

// Add follow-up to lead
export const addFollowUp = async (id: string, followUp: {
  date?: string;
  note?: string;
  nextFollowUpDate?: string;
}): Promise<Lead> => {
  const response = await fetch(`${API_BASE_URL}/leads/${id}/follow-up`, {
    method: 'PATCH',
    headers: getAuthHeader(),
    body: JSON.stringify(followUp)
  });
  if (!response.ok) throw new Error('Failed to add follow-up');
  return response.json();
};

// Delete lead
export const deleteLead = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete lead');
};

// Phone lookup for suggestions / duplicate checks
export const lookupLeadPhones = async (query: string, limit = 8, excludeId?: string): Promise<PhoneLookupResult> => {
  const params = new URLSearchParams();
  params.append('query', query);
  params.append('limit', String(limit));
  if (excludeId) params.append('excludeId', excludeId);

  const response = await fetch(`${API_BASE_URL}/leads/phone-lookup?${params.toString()}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to lookup phone suggestions');
  return response.json();
};

// Get all BDMs for assignment
export const getBDMsForAssignment = async (): Promise<BDM[]> => {
  const response = await fetch(`${API_BASE_URL}/auth/users?role=bdm`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch BDMs');
  return response.json();
};

export interface LeadBdmNameCounts {
  names: Array<{ name: string; count: number }>;
  unassignedCount: number;
  bdmUsers: Array<{ _id: string; name: string; count: number }>;
}

// Distinct original BDM names from bulk-imported leads (e.g. "Aroni", "Bristi"), each with its
// lead count, plus a count of genuinely unassigned leads — powers the "filter by BDM" dropdown.
export const getLeadBdmNames = async (): Promise<LeadBdmNameCounts> => {
  const response = await fetch(`${API_BASE_URL}/leads/bdm-names`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch lead BDM names');
  return response.json();
};

// True per-stage lead counts (optionally scoped to one BDM), in one request instead of one
// per stage — powers BDMPipeline's column headers.
export const getLeadStageCounts = async (filters?: {
  assignedTo?: string;
  bdmName?: string;
  unassigned?: boolean;
  serviceInterest?: string;
  search?: string;
}): Promise<Record<LeadStage, number>> => {
  const params = new URLSearchParams();
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
  if (filters?.bdmName) params.append('bdmName', filters.bdmName);
  if (filters?.unassigned) params.append('unassigned', 'true');
  if (filters?.serviceInterest) params.append('serviceInterest', filters.serviceInterest);
  if (filters?.search) params.append('search', filters.search);
  const response = await fetch(`${API_BASE_URL}/leads/stage-counts?${params.toString()}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch lead stage counts');
  return response.json();
};

export interface FollowUpLead {
  _id: string;
  fullName?: string;
  phone: string;
  serviceInterest?: string[];
  assignedTo?: string;
  lastFollowUp?: { date?: string; note?: string; nextFollowUpDate?: string; createdAt?: string };
  dueStatus: 'overdue' | 'today' | 'upcoming';
}

// Leads with a pending next-follow-up date, tagged with dueStatus computed server-side
// (Asia/Dhaka). Single shared source for the Follow-up Reminders page, the dashboard's
// "Today's Follow-ups" widget, and the sidebar badge count.
export const getFollowUpLeads = async (filters?: { assignedTo?: string }): Promise<{ leads: FollowUpLead[] }> => {
  const params = new URLSearchParams();
  if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
  const queryString = params.toString();
  const response = await fetch(`${API_BASE_URL}/leads/follow-ups${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch follow-up leads');
  return response.json();
};

// Get lead statistics
export const getLeadStats = async (): Promise<{
  total: number;
  newToday: number;
  byStage: Record<string, number>;
}> => {
  const response = await fetch(`${API_BASE_URL}/leads/stats`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch lead stats');
  return response.json();
};

// Map a row of values using a headers array to a lead object
const mapRowToLead = (headers: string[], values: string[]): any => {
  const leadData: any = { followUps: [], lifecycleStage: 'New Inquiry' };
  let lastFollowUp = '';
  let nextFollowUp = '';
  headers.forEach((header, index) => {
    const value = (values[index] || '').toString().trim();
    switch (header.toLowerCase().trim()) {
      case 'fullname': case 'full name': case 'name':
        leadData.fullName = value; break;
      case 'email':
        leadData.email = value; break;
      case 'phone': case 'phone number':
        leadData.phone = value; break;
      case 'source': case 'lead source':
        leadData.source = value || 'Others'; break;
      case 'service': case 'service interest': case 'serviceinterest':
        leadData.serviceInterest = value; break;
      case 'notes': case 'note':
        leadData.notes = value; break;
      case 'stage': case 'lifecycle stage': case 'lifecyclestage':
        leadData.lifecycleStage = value || 'New Inquiry'; break;
      case 'last follow up': case 'lastfollowup': case 'last follow-up':
        lastFollowUp = value; break;
      case 'next follow up': case 'nextfollowup': case 'next follow-up': case 'next follow up date': case 'nextfollowupdate':
        nextFollowUp = value; break;
    }
  });
  if (lastFollowUp || nextFollowUp) {
    leadData.followUps = [{ date: lastFollowUp || undefined, nextFollowUpDate: nextFollowUp || undefined, note: '' }];
  }
  return leadData;
};

// Import leads from Excel (.xlsx/.xls) or CSV file
export const importLeadsFromFile = async (file: File): Promise<{ imported: number; failed: number; errors?: string[] }> => {
  const XLSX = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
        if (rows.length < 2) { reject(new Error('No data rows found in file')); return; }
        const headers = rows[0].map((h: any) => String(h));
        const leads = rows.slice(1)
          .filter(row => row.some(cell => cell !== undefined && cell !== ''))
          .map(row => mapRowToLead(headers, row.map((c: any) => {
            if (c instanceof Date) {
              return c.toISOString().slice(0, 10); // → "2026-05-14"
            }
            return String(c ?? '');
          })))
          .filter((l: any) => l.fullName && l.email && l.phone);
        if (leads.length === 0) { reject(new Error('No valid leads found. Ensure Full Name, Email and Phone are filled.')); return; }
        const response = await fetch(`${API_BASE_URL}/leads/import`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ leads })
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to import leads');
        }
        resolve(await response.json());
      } catch (error) { reject(error); }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

// Parse CSV file and return leads array
export const parseCSV = (csvContent: string): Omit<Lead, '_id' | 'createdAt' | 'updatedAt'>[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const leads: Omit<Lead, '_id' | 'createdAt' | 'updatedAt'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const leadData: any = {
      followUps: [],
      lifecycleStage: 'New Inquiry'
    };

    headers.forEach((header, index) => {
      const value = values[index] || '';
      switch (header) {
        case 'fullname':
        case 'full name':
        case 'name':
          leadData.fullName = value;
          break;
        case 'email':
          leadData.email = value;
          break;
        case 'phone':
        case 'phone number':
          leadData.phone = value;
          break;
        case 'source':
        case 'lead source':
          leadData.source = value || 'Others';
          break;
        case 'service':
        case 'service interest':
        case 'serviceinterest':
          leadData.serviceInterest = value;
          break;
        case 'notes':
        case 'note':
          leadData.notes = value;
          break;
        case 'stage':
        case 'lifecycle stage':
        case 'lifecyclestage':
          leadData.lifecycleStage = value || 'New Inquiry';
          break;
      }
    });

    if (leadData.fullName && leadData.email && leadData.phone) {
      leads.push(leadData);
    }
  }

  return leads;
};

// Import leads from parsed CSV data
export const importLeadsFromCSV = async (file: File): Promise<{ imported: number; failed: number; errors?: string[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        const leads = parseCSV(csvContent);

        if (leads.length === 0) {
          reject(new Error('No valid leads found in CSV file'));
          return;
        }

        const response = await fetch(`${API_BASE_URL}/leads/import`, {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({ leads })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to import leads');
        }

        const result = await response.json();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read CSV file'));
    };

    reader.readAsText(file);
  });
};
