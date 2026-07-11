'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, RefreshCw, Users, Mail, Phone, Eye, ChevronDown, ChevronLeft, ChevronRight, Check, X, Clock, CheckCheck, XCircle, FileEdit, Trash2 } from 'lucide-react';
import { getLeads, updateLeadStage, assignLeads, getBDMsForAssignment, getLeadBdmNames, deleteLead, getLeadStageCounts } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType, BDM } from '@/types/admin';
import { getLeadEditRequests } from '@/lib/api/leadEditRequests';
import type { LeadEditRequestItem } from '@/lib/api/leadEditRequests';
import QuickAddLeadModal from './QuickAddLeadModal';
import LeadDetail from './LeadDetail';
import StageDropdown from './StageDropdown';
import { getUserIdFromToken } from '@/lib/helpers/jwt';
import { LEAD_STAGES } from '@/lib/constants/leadStages';
import { COURSE_GROUPS } from '@/lib/constants/courseGroups';
import { getBdmColor } from '@/lib/helpers/bdmColors';

// ---

const stages: LeadStageType[] = LEAD_STAGES;

// ---

// BDM column shows the full name (which are now short nicknames in DB).
// the assignment dropdown / lead detail view.
const firstName = (name: string) => name;

const BDMDropdown: React.FC<{
    lead: Lead; bdms: BDM[]; onAssign: (leadId: string, bdmId: string) => void; disabled?: boolean;
}> = ({ lead, bdms, onAssign, disabled }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const currentBDM = lead.assignedTo
        ? (typeof lead.assignedTo === 'object' ? lead.assignedTo : bdms.find(b => b._id === lead.assignedTo))
        : null;
    const displayName = currentBDM
        ? firstName(typeof currentBDM === 'object' ? currentBDM.name : String(currentBDM))
        : (lead.bdmName ? firstName(lead.bdmName) : 'Not Assigned');

    const handleOpen = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 248)) });
        }
        setOpen(v => !v);
    };

    const color = currentBDM ? getBdmColor(displayName) : null;

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={handleOpen}
                disabled={disabled}
                style={color ? { backgroundColor: color.bg, color: color.text, borderColor: color.bg } : undefined}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-200 w-[100px] ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'
                } ${!currentBDM ? 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300' : ''}`}
            >
                <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: currentBDM ? color!.text : '#d1d5db' }}
                />
                <span className="truncate">{displayName}</span>
                {!disabled && <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 min-w-[200px] max-w-[240px]"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        <p className="px-3.5 py-1.5 text-[9.5px] font-bold text-gray-400 uppercase tracking-[0.14em] border-b border-gray-100 mb-1">Assign BDM</p>
                        <button
                            onClick={() => { onAssign(lead._id, ''); setOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                                !currentBDM ? 'bg-gray-50 text-gray-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                            Unassigned
                            {!currentBDM && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0 text-gray-400" />}
                        </button>
                        {bdms.map(bdm => {
                            const isSelected = currentBDM && (typeof currentBDM === 'object' ? currentBDM._id === bdm._id : currentBDM === bdm._id);
                            const optColor = getBdmColor(bdm.name);
                            return (
                                <button
                                    key={bdm._id}
                                    onClick={() => { onAssign(lead._id, bdm._id); setOpen(false); }}
                                    className={`w-full flex items-center gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: optColor.dot }} />
                                    <span className="flex flex-col text-left min-w-0">
                                        <span className="truncate">{bdm.name}</span>
                                        <span className="text-[10px] text-gray-400 font-medium truncate">{bdm.role}</span>
                                    </span>
                                    {isSelected && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0 text-blue-600" />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

// ---

// Header-level "filter by BDM" dropdown. Three groups: "Unassigned" (no BDM info at all),
// "Registered BDMs" (real Users filtered by CURRENT assignedTo — from getLeadBdmNames'
// bdmUsers, encoded as `user:<id>`), and the 7 original CSV names (filtered by bdmName —
// historical attribution, which can differ from current assignedTo once leads are
// reassigned). Value is '' (all), 'unassigned', `user:<id>`, or a raw name (e.g. "Raka").
const BdmFilterDropdown: React.FC<{
    bdmNames: Array<{ name: string; count: number }>; unassignedCount: number;
    bdmUsers: Array<{ _id: string; name: string; count: number }>;
    value: string; onChange: (value: string) => void;
}> = ({ bdmNames, unassignedCount, bdmUsers, value, onChange }) => {
    const [open, setOpen] = useState(false);

    const selectedLabel = !value
        ? 'All BDMs'
        : value === 'unassigned'
            ? 'Unassigned'
            : value.startsWith('user:')
                ? bdmUsers.find(u => `user:${u._id}` === value)?.name ?? 'BDM'
                : value;

    const select = (next: string) => { onChange(next); setOpen(false); };

    const isBdmSelected = value.startsWith('user:');
    const triggerColor = isBdmSelected ? getBdmColor(selectedLabel) : null;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                style={triggerColor ? { backgroundColor: triggerColor.bg, color: triggerColor.text, borderColor: triggerColor.bg } : undefined}
                className={`flex items-center justify-between gap-2 h-8 px-3 min-w-[140px] border rounded-lg text-[12.5px] font-medium transition-all max-w-[160px] ${
                    triggerColor
                        ? ''
                        : value
                            ? 'border-blue-200 text-blue-700 bg-blue-50'
                            : 'border-gray-200 text-gray-600 bg-white hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
                <span className="truncate">{selectedLabel}</span>
                {value ? (
                    <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                            triggerColor ? 'hover:bg-black/10' : 'text-blue-400 hover:bg-blue-200/70 hover:text-blue-700'
                        }`}
                    >
                        <X className="w-3 h-3" />
                    </span>
                ) : (
                    <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="absolute top-full left-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 min-w-[220px] max-w-[min(260px,calc(100vw-2rem))] max-h-[360px] overflow-y-auto"
                    >
                        <button
                            onClick={() => select('')}
                            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                                !value ? 'bg-gray-50 text-gray-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span>All BDMs</span>
                            {!value && <Check className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />}
                        </button>
                        <button
                            onClick={() => select('unassigned')}
                            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                                value === 'unassigned' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                                Unassigned
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="text-[10.5px] text-gray-400 font-medium">{unassignedCount.toLocaleString()}</span>
                                {value === 'unassigned' && <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />}
                            </span>
                        </button>

                        {bdmUsers.length > 0 && (
                            <div className="my-1 border-t border-gray-100" />
                        )}
                        {bdmUsers.map(({ _id, name, count }) => {
                            const optionValue = `user:${_id}`;
                            const isSelected = value === optionValue;
                            const optColor = getBdmColor(name);
                            return (
                                <button
                                    key={_id}
                                    onClick={() => select(optionValue)}
                                    className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                                        isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: optColor.dot }} />
                                        <span className="truncate">{name}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 flex-shrink-0">
                                        <span className="text-[10.5px] text-gray-400 font-medium">{count.toLocaleString()}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Removed 'By original CSV name' section as per user request */}
                    </div>
                </>
            )}
        </div>
    );
};

// ---

// Flat, icon-less filter chip used for "All Courses" / "All Status" — a plain option list or,
// for courses, one grouped by category (Registration, IELTS Courses, etc).
interface FlatOption { value: string; label: string }
interface FlatGroup { label?: string; options: FlatOption[] }

const FlatDropdown: React.FC<{
    value: string; // '' = default/all
    defaultLabel: string;
    groups: FlatGroup[];
    onChange: (value: string) => void;
}> = ({ value, defaultLabel, groups, onChange }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const selectedLabel = value ? (groups.flatMap(g => g.options).find(o => o.value === value)?.label ?? value) : defaultLabel;

    return (
        <div className="relative" ref={rootRef}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center justify-between gap-2 h-8 px-3 min-w-[140px] rounded-lg border text-[12.5px] font-medium transition-colors ${
                    value ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
                <span className="truncate">{selectedLabel}</span>
                {value ? (
                    <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-200/70 hover:text-blue-700 transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </span>
                ) : (
                    <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''} text-gray-400`} />
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 mt-1.5 z-50 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 min-w-[200px] max-w-[min(260px,calc(100vw-2rem))] max-h-[360px] overflow-y-auto">
                        <button
                            onClick={() => { onChange(''); setOpen(false); }}
                            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                                !value ? 'bg-gray-50 text-gray-800' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span>{defaultLabel}</span>
                            {!value && <Check className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />}
                        </button>
                        {groups.map((group, gi) => (
                            <div key={gi} className={group.label ? 'mt-1 pt-1 border-t border-gray-100' : ''}>
                                {group.label && (
                                    <div className="px-3.5 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        {group.label}
                                    </div>
                                )}
                                {group.options.map(opt => {
                                    const selected = opt.value === value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => { onChange(opt.value); setOpen(false); }}
                                            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                                                selected ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="truncate">{opt.label}</span>
                                            {selected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-blue-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ---

const LeadCenter: React.FC<{ onViewLead?: (id: string) => void; refreshKey?: number }> = ({ onViewLead, refreshKey = 0 }) => {
    const tokenData = getUserIdFromToken();
    const isAdmin = tokenData?.role === 'admin';
    const [view, setView] = useState<'list' | 'form'>('list');
    const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [bdms, setBdms] = useState<BDM[]>([]);
    const [bdmNames, setBdmNames] = useState<Array<{ name: string; count: number }>>([]);
    const [bdmUsers, setBdmUsers] = useState<Array<{ _id: string; name: string; count: number }>>([]);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [bdmFilterValue, setBdmFilterValue] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
    const [updatingBDMId, setUpdatingBDMId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState<'all' | LeadStageType>('all');
    const [editRequestMap, setEditRequestMap] = useState<Record<string, LeadEditRequestItem>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [apiTotal, setApiTotal] = useState(0);
    const [stageCounts, setStageCounts] = useState<Record<LeadStageType, number> | null>(null);

    // stageCounts (from a dedicated aggregation, see loadStageCounts below) reflects the true
    // total per stage under the current search/BDM/course filters — unlike `leads`, which is
    // just the current page — so the stat cards stay in sync with the active filters instead
    // of only describing whatever happens to be on the visible page.
    const stats = useMemo(() => ({
        total:      stageCounts ? Object.values(stageCounts).reduce((a, b) => a + b, 0) : apiTotal,
        newInquiry: stageCounts?.['New Inquiry'] ?? 0,
        contacted:  stageCounts?.['Contacted'] ?? 0,
        trialClass: stageCounts?.['Trial Class'] ?? 0,
        enrolled:   stageCounts?.['Enrolled'] ?? 0,
        lost:       stageCounts?.['Lost'] ?? 0,
    }), [stageCounts, apiTotal]);

    const filterCards = [
        { key: 'all' as const,          label: 'Total Leads',  count: stats.total,
          active: 'bg-gradient-to-b from-white to-blue-50/30 border-blue-100 shadow-sm shadow-blue-900/5 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 hover:shadow-md',   activeNum: 'text-blue-600', activeLbl: 'text-blue-500',
          idle:   'bg-gradient-to-b from-white to-blue-50/30 border-blue-100 shadow-sm shadow-blue-900/5 hover:border-blue-500 hover:ring-1 hover:ring-blue-500 hover:shadow-md' },
        { key: 'New Inquiry' as const,  label: 'New Inquiry',  count: stats.newInquiry,
          active: 'bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300 shadow-md shadow-gray-400/10', activeNum: 'text-gray-800', activeLbl: 'text-gray-500',
          idle:   'bg-gradient-to-b from-white to-blue-50/30 border-blue-100 shadow-sm shadow-blue-900/5 hover:border-gray-300 hover:shadow-md hover:shadow-blue-900/10' },
        { key: 'Contacted' as const,    label: 'Contacted',    count: stats.contacted,
          active: 'bg-gradient-to-b from-blue-50 to-blue-100 border-blue-300 shadow-md shadow-blue-500/10', activeNum: 'text-blue-800', activeLbl: 'text-blue-600',
          idle:   'bg-gradient-to-b from-white to-blue-50/30 border-blue-100 shadow-sm shadow-blue-900/5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/10' },
        { key: 'Trial Class' as const,  label: 'Trial Class',  count: stats.trialClass,
          active: 'bg-gradient-to-b from-orange-50 to-orange-100 border-orange-300 shadow-md shadow-orange-500/10', activeNum: 'text-orange-800', activeLbl: 'text-orange-600',
          idle:   'bg-gradient-to-b from-white to-blue-50/30 border-blue-100 shadow-sm shadow-blue-900/5 hover:border-orange-300 hover:shadow-md hover:shadow-blue-900/10' },
        { key: 'Enrolled' as const,     label: 'Enrolled',     count: stats.enrolled,
          active: 'bg-gradient-to-b from-green-50 to-green-100 border-green-300 shadow-md shadow-green-500/10', activeNum: 'text-green-800', activeLbl: 'text-green-600',
          idle:   'bg-gradient-to-b from-white to-blue-50/30 border-blue-100 shadow-sm shadow-blue-900/5 hover:border-green-300 hover:shadow-md hover:shadow-blue-900/10' },
        { key: 'Lost' as const,         label: 'Lost Leads',   count: stats.lost,
          active: 'bg-gradient-to-b from-red-50 to-red-100 border-red-300 shadow-md shadow-red-500/10', activeNum: 'text-red-800', activeLbl: 'text-red-600',
          idle:   'bg-gradient-to-b from-white to-blue-50/30 border-blue-100 shadow-sm shadow-blue-900/5 hover:border-red-300 hover:shadow-md hover:shadow-blue-900/10' },
    ];

    // Stage filtering now happens server-side (see `stage` below) so the table, pagination,
    // and stat cards all describe the same filtered set — `leads` already only contains
    // matching-stage leads for the current page.
    const displayedLeads = leads;

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await getLeads({
                search: searchTerm,
                page: currentPage,
                ...(stageFilter !== 'all' ? { stage: stageFilter } : {}),
                ...(courseFilter ? { serviceInterest: courseFilter } : {}),
                ...(bdmFilterValue === 'unassigned' ? { unassigned: true } : {}),
                ...(bdmFilterValue.startsWith('user:') ? { assignedTo: bdmFilterValue.slice('user:'.length) } : {}),
                ...(bdmFilterValue && bdmFilterValue !== 'unassigned' && !bdmFilterValue.startsWith('user:') ? { bdmName: bdmFilterValue } : {}),
            });
            setLeads(data.leads);
            setTotalPages(data.totalPages);
            setApiTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // True per-stage totals under the current search/BDM/course filters (excluding stage
    // itself), so the stat cards and the "All Status" dropdown stay accurate even though
    // `leads` above is paginated.
    const loadStageCounts = async () => {
        try {
            const counts = await getLeadStageCounts({
                search: searchTerm,
                ...(courseFilter ? { serviceInterest: courseFilter } : {}),
                ...(bdmFilterValue === 'unassigned' ? { unassigned: true } : {}),
                ...(bdmFilterValue.startsWith('user:') ? { assignedTo: bdmFilterValue.slice('user:'.length) } : {}),
                ...(bdmFilterValue && bdmFilterValue !== 'unassigned' && !bdmFilterValue.startsWith('user:') ? { bdmName: bdmFilterValue } : {}),
            });
            setStageCounts(counts);
        } catch {
            setStageCounts(null);
        }
    };

    const fetchEditRequests = async () => {
        try {
            const all = await getLeadEditRequests('all');
            const map: Record<string, LeadEditRequestItem> = {};
            all.forEach(req => {
                const leadId = typeof req.leadId === 'object' ? req.leadId._id : req.leadId;
                const existing = map[leadId];
                if (!existing || new Date(req.createdAt) > new Date(existing.createdAt)) {
                    map[leadId] = req;
                }
            });
            setEditRequestMap(map);
        } catch { /* silent */ }
    };

    useEffect(() => { fetchLeads(); fetchEditRequests(); }, [searchTerm, refreshKey, currentPage, bdmFilterValue, courseFilter, stageFilter]);
    useEffect(() => { loadStageCounts(); }, [searchTerm, refreshKey, bdmFilterValue, courseFilter]);
    useEffect(() => { if (!isAdmin) return; getBDMsForAssignment().then(data => setBdms(data)).catch(() => {}); }, [isAdmin]);
    useEffect(() => {
        getLeadBdmNames()
            .then(data => { setBdmNames(data.names); setUnassignedCount(data.unassignedCount); setBdmUsers(data.bdmUsers); })
            .catch((err) => console.error('Failed to fetch BDM filter options:', err));
    }, [refreshKey]);

    const handleAssignBDM = async (leadId: string, bdmId: string) => {
        setUpdatingBDMId(leadId);
        try {
            await assignLeads([leadId], bdmId);
            setLeads(prev => prev.map(l => {
                if (l._id !== leadId) return l;
                if (!bdmId) return { ...l, assignedTo: undefined };
                const bdm = bdms.find(b => b._id === bdmId);
                return { ...l, assignedTo: bdm ? { _id: bdm._id, name: bdm.name, email: bdm.email } : bdmId };
            }));
        } catch { alert('Failed to assign BDM'); }
        finally { setUpdatingBDMId(null); }
    };



    const openLeadDrawer = (id: string) => {
        setDrawerLeadId(id);
        requestAnimationFrame(() => setDrawerVisible(true));
    };
    const closeLeadDrawer = () => {
        setDrawerVisible(false);
        window.setTimeout(() => setDrawerLeadId(null), 250);
        fetchLeads();
    };

    const handleStageChange = async (id: string, newStage: LeadStageType) => {
        setUpdatingStageId(id);
        try {
            await updateLeadStage(id, newStage);
            setLeads(prev => prev.map(l => l._id === id ? { ...l, lifecycleStage: newStage } : l));
        } catch { alert('Failed to update lead stage'); }
        finally { setUpdatingStageId(null); }
    };

    const handleDeleteLead = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
        try {
            await deleteLead(id);
            setLeads(prev => prev.filter(l => l._id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete lead');
        }
    };

    return (
        <div className="space-y-4 pb-6">

            {/* Sticky Header */}
            <div className="-mx-6 -mt-6 mb-4 px-4 py-3 md:px-6 md:py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                {/* Left: icon + title + count + Add Lead */}
                <div className="flex flex-wrap items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4c6ef5] to-[#3b5bdb] flex items-center justify-center shadow-md shadow-blue-500/25 flex-shrink-0">
                        <Users className="w-[18px] h-[18px] text-white" strokeWidth={2.25} />
                    </div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-[18px] font-extrabold text-[#1a1d24] tracking-tight">Lead Center</h1>
                        <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100/80 rounded-full pl-2 pr-2.5 py-[3px] whitespace-nowrap">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                            </span>
                            {stats.total.toLocaleString()} <span className="font-medium text-blue-400">leads</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setView('form')}
                        className="flex items-center gap-1.5 h-8 px-4 bg-gradient-to-b from-[#4c6ef5] to-[#3b5bdb] hover:from-[#3b5bdb] hover:to-[#364fc7] text-white font-semibold text-[13px] rounded-lg transition-all duration-150 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-px active:translate-y-0 active:scale-[0.97] ml-1 whitespace-nowrap flex-shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
                        Add Lead
                    </button>
                </div>

                {/* Right: filter toolbar */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-wrap items-center gap-5 p-4 rounded-2xl bg-slate-100/70 ring-1 ring-slate-200/80 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="relative w-60">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search name, phone or email..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full h-8 pl-8 pr-3 bg-white border border-gray-200/70 rounded-lg text-[12.5px] font-medium text-gray-900 placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            />
                        </div>
                        <BdmFilterDropdown
                            bdmNames={bdmNames}
                            bdmUsers={bdmUsers}
                            unassignedCount={unassignedCount}
                            value={bdmFilterValue}
                            onChange={(next) => { setBdmFilterValue(next); setCurrentPage(1); }}
                        />
                        <FlatDropdown
                            value={courseFilter}
                            defaultLabel="All Courses"
                            groups={COURSE_GROUPS.map(g => ({ label: g.label, options: g.options.map(o => ({ value: o, label: o })) }))}
                            onChange={(next) => { setCourseFilter(next); setCurrentPage(1); }}
                        />
                        <FlatDropdown
                            value={stageFilter === 'all' ? '' : stageFilter}
                            defaultLabel="All Status"
                            groups={[{ options: stages.map(s => ({ value: s, label: s })) }]}
                            onChange={(next) => { setStageFilter((next || 'all') as 'all' | LeadStageType); setCurrentPage(1); }}
                        />
                    </div>

                    {(searchTerm || bdmFilterValue || courseFilter || stageFilter !== 'all') ? (
                        <button
                            onClick={() => { setSearchTerm(''); setBdmFilterValue(''); setCourseFilter(''); setStageFilter('all'); setCurrentPage(1); }}
                            className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12.5px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Reset
                        </button>
                    ) : (
                        <button
                            onClick={fetchLeads}
                            title="Refresh"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 bg-white"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>
            </div>



            {/* --- */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-4">
                {filterCards.map(card => {
                    const isActive = stageFilter === card.key;
                    return (
                        <button
                            key={card.key}
                            onClick={() => { setStageFilter(card.key); setCurrentPage(1); }}
                            className={`flex flex-col justify-between text-left rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 transition-all duration-300 hover:-translate-y-1 ${
                                isActive ? card.active + ' scale-[1.02]' : card.idle
                            }`}
                        >
                            <p className={`text-[12px] uppercase tracking-[0.15em] font-bold mb-3 ${isActive ? card.activeLbl : 'text-gray-500'}`}>{card.label}</p>
                            <p className={`text-[20px] md:text-[28px] lg:text-[32px] font-semibold leading-none tabular-nums tracking-tight ${isActive ? card.activeNum : 'text-gray-800'}`}>{card.count}</p>
                        </button>
                    );
                })}
            </div>

            {/* --- */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[420px] sm:min-w-[860px] md:min-w-[1060px] table-fixed">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b-2 border-slate-200/70">
                                <th className="w-[18%] px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">Lead Info</th>
                                <th className="w-[17%] px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">Contact</th>
                                <th className="w-[14%] px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] hidden sm:table-cell">Service Interested</th>
                                <th className="w-[14%] px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em]">Stage</th>
                                <th className="w-[13%] px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] hidden md:table-cell">BDM</th>
                                <th className="w-[14%] px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] hidden sm:table-cell">Edit Request</th>
                                <th className="w-[10%] px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.18em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-14 text-center">
                                        <div className="animate-spin rounded-full h-9 w-9 border-[2.5px] border-blue-600 border-t-transparent mx-auto mb-3" />
                                        <p className="text-[13px] text-slate-500 font-medium">Loading leads...</p>
                                    </td>
                                </tr>
                            ) : displayedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-[14px] font-bold text-slate-600 mb-1">No leads found</p>
                                        <p className="text-[12px] text-slate-400">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedLeads.map((lead, idx) => (
                                    <tr
                                        key={lead._id}
                                        onClick={() => openLeadDrawer(lead._id)}
                                        className={`group relative transition-all duration-150 border-b border-slate-100 last:border-0 hover:bg-blue-50/25 hover:shadow-[inset_3px_0_0_#3b82f6] cursor-pointer ${idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                                    >
                                        <td className="px-5 py-3.5 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0 shadow-sm shadow-blue-600/30">
                                                    {(lead.fullName || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <button
                                                        onClick={() => openLeadDrawer(lead._id)}
                                                        className="text-[13px] font-semibold text-slate-800 truncate hover:text-blue-600 transition-colors block leading-snug text-left w-full"
                                                    >
                                                        {lead.fullName || 'Unnamed lead'}
                                                    </button>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-wide">
                                                        {new Date(lead.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 align-middle">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Phone className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                                <span className="text-[11.5px] font-semibold text-slate-700 truncate min-w-0 leading-none">{lead.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 hidden sm:table-cell align-middle">
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(lead.serviceInterest) ? lead.serviceInterest : [lead.serviceInterest]).filter(Boolean).map((s, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide whitespace-nowrap">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 align-middle" onClick={e => e.stopPropagation()}>
                                            <StageDropdown
                                                value={lead.lifecycleStage}
                                                onChange={(stage) => handleStageChange(lead._id, stage)}
                                                disabled={updatingStageId === lead._id}
                                            />
                                        </td>
                                        <td className="px-5 py-3.5 hidden md:table-cell align-middle" onClick={e => e.stopPropagation()}>
                                            {isAdmin ? (
                                                <BDMDropdown
                                                    lead={lead}
                                                    bdms={bdms}
                                                    onAssign={handleAssignBDM}
                                                    disabled={updatingBDMId === lead._id}
                                                />
                                            ) : lead.assignedTo ? (() => {
                                                const name = firstName(typeof lead.assignedTo === 'object' ? lead.assignedTo.name : String(lead.assignedTo));
                                                const rowColor = getBdmColor(name);
                                                return (
                                                    <div
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border w-[100px]"
                                                        style={{ backgroundColor: rowColor.bg, color: rowColor.text, borderColor: rowColor.bg }}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: rowColor.text }} />
                                                        <span className="truncate">{name}</span>
                                                    </div>
                                                );
                                            })() : lead.bdmName ? (() => {
                                                const name = firstName(lead.bdmName);
                                                const rowColor = getBdmColor(name);
                                                return (
                                                    <div
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border w-[100px]"
                                                        style={{ backgroundColor: rowColor.bg, color: rowColor.text, borderColor: rowColor.bg }}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: rowColor.text }} />
                                                        <span className="truncate">{name}</span>
                                                    </div>
                                                );
                                            })() : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border bg-gray-50 text-gray-400 border-gray-200 w-[100px]">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                                    <span className="truncate">Not Assigned</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 align-middle hidden sm:table-cell">
                                            {(() => {
                                                const req = editRequestMap[lead._id];
                                                if (!req) return (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-300">
                                                        <FileEdit className="w-3 h-3" /> No request
                                                    </span>
                                                );
                                                const ts = new Date(req.createdAt);
                                                const timeAgo = (() => {
                                                    const diff = Math.floor((Date.now() - ts.getTime()) / 1000);
                                                    if (diff < 60) return 'just now';
                                                    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
                                                    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
                                                    return `${Math.floor(diff/86400)}d ago`;
                                                })();
                                                const sectionLabel = req.section === 'contact' ? 'Contact' : req.section === 'stage' ? 'Stage' : req.section === 'follow-up' ? 'Follow-up' : req.section === 'source-service' ? 'Source/Service' : req.section === 'notes' ? 'Notes' : req.section;
                                                if (req.status === 'pending') return (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-[10px] font-bold w-fit shadow-[0_1px_3px_rgba(245,158,11,0.15)]">
                                                            <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                                            Pending
                                                        </span>
                                                        <span className="text-[9.5px] text-slate-400 font-medium pl-0.5 tracking-wide">{sectionLabel} &middot; {timeAgo}</span>
                                                    </div>
                                                );
                                                if (req.status === 'approved') return (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold w-fit shadow-[0_1px_3px_rgba(16,185,129,0.15)]">
                                                            <CheckCheck className="w-2.5 h-2.5 flex-shrink-0" />
                                                            Approved
                                                        </span>
                                                        <span className="text-[9.5px] text-slate-400 font-medium pl-0.5 tracking-wide">{sectionLabel} &middot; {timeAgo}</span>
                                                    </div>
                                                );
                                                if (req.status === 'rejected') return (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-600 text-[10px] font-bold w-fit shadow-[0_1px_3px_rgba(239,68,68,0.12)]">
                                                            <XCircle className="w-2.5 h-2.5 flex-shrink-0" />
                                                            Rejected
                                                        </span>
                                                        <span className="text-[9.5px] text-slate-400 font-medium pl-0.5 tracking-wide">{sectionLabel} &middot; {timeAgo}</span>
                                                    </div>
                                                );
                                                return null;
                                            })()}
                                        </td>
                                        <td className="px-5 py-3.5 text-right align-middle" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => onViewLead?.(lead._id)}
                                                    className="inline-flex items-center justify-center gap-1.5 h-8 px-2 sm:px-3 min-w-[36px] sm:min-w-[84px] bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white rounded-lg text-[11px] font-semibold transition-all shadow-sm shadow-blue-900/20 hover:shadow-[0_4px_12px_rgba(59,130,246,0.4)] hover:-translate-y-px active:scale-95 whitespace-nowrap ml-auto"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span className="hidden sm:inline">View</span>
                                                </button>
                                                {isAdmin && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead._id); }}
                                                        title="Delete Lead"
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-100 flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && displayedLeads.length > 0 && (
                    <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                        <p className="text-[12px] text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-700">{displayedLeads.length}</span> of <span className="font-bold text-slate-700">{apiTotal}</span> leads
                        </p>
                        <div className="flex items-center gap-3">
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-[12px] font-semibold text-slate-700 px-2 tabular-nums">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] text-slate-400 font-medium">Live</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- */}
            <button
                type="button"
                onClick={() => setView('form')}
                title="Add new lead"
                className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full items-center justify-center z-30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(37,99,235,0.4)]"
            >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
            </button>

            {view === 'form' && (
                <QuickAddLeadModal
                    title="Add New Lead"
                    subtitle="Add a prospective student to the pipeline"
                    onClose={() => setView('list')}
                    onSuccess={() => { setView('list'); fetchLeads(); }}
                />
            )}

            {drawerLeadId && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${drawerVisible ? 'opacity-100' : 'opacity-0'}`}
                        onClick={closeLeadDrawer}
                    />
                    <div className={`relative w-full max-w-4xl h-full bg-[#f8fafc] shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${drawerVisible ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-4 md:p-6">
                            <LeadDetail id={drawerLeadId} onBack={closeLeadDrawer} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadCenter;