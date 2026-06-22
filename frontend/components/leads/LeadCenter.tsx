'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Plus, RefreshCw, Users, Mail, Phone, Trash2, Eye, ChevronDown, Check, Upload, Download, AlertCircle, CheckCircle2, MessageSquare, Target } from 'lucide-react';
import { getLeads, deleteLead, updateLeadStage, importLeadsFromFile, assignLeads, getBDMsForAssignment } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType, BDM } from '@/types/admin';
import InputLead from './InputLead';

// ─── Stage config ─────────────────────────────────────────────────────────────

const stageColors: Record<LeadStageType, { bg: string; text: string; border: string; dot: string }> = {
    'Intake':     { bg: 'bg-[#00000F]/[0.05]',  text: 'text-[#00000F]/70', border: 'border-[#00000F]/15', dot: 'bg-[#00000F]/40' },
    'Processing': { bg: 'bg-[#FACE39]/15',       text: 'text-[#00000F]',    border: 'border-[#FACE39]/35', dot: 'bg-[#FACE39]' },
    'Hot':        { bg: 'bg-[#FACE39]/25',       text: 'text-[#00000F]',    border: 'border-[#FACE39]/50', dot: 'bg-[#FACE39]' },
    'Converted':  { bg: 'bg-[#22C55E]/10',       text: 'text-[#16A34A]',    border: 'border-[#22C55E]/25', dot: 'bg-[#22C55E]' },
    'Dead':       { bg: 'bg-[#00000F]/[0.05]',   text: 'text-[#00000F]/35', border: 'border-[#00000F]/10', dot: 'bg-[#00000F]/25' },
};

const stages: LeadStageType[] = ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'];

// ─── Stage Dropdown ───────────────────────────────────────────────────────────

const StageDropdown: React.FC<{ value: LeadStageType; onChange: (s: LeadStageType) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);
    const colors = stageColors[value];

    const handleOpen = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 6, left: r.left });
        }
        setOpen(v => !v);
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={handleOpen}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-bold border transition-all duration-200 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'
                } ${colors.bg} ${colors.text} ${colors.border}`}
            >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                <span className="whitespace-nowrap tracking-wide">{value}</span>
                {!disabled && <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,15,0.14)] border border-[#00000F]/[0.08] py-1.5 min-w-[160px]"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        <p className="px-4 py-2 text-[10px] font-bold text-[#00000F]/35 uppercase tracking-widest border-b border-[#00000F]/[0.05] mb-1">Select Stage</p>
                        {stages.map(stage => {
                            const sc = stageColors[stage];
                            const isSelected = stage === value;
                            return (
                                <button
                                    key={stage}
                                    onClick={() => { onChange(stage); setOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold transition-colors ${
                                        isSelected ? `${sc.bg} ${sc.text}` : 'text-[#00000F]/65 hover:bg-[#00000F]/[0.04]'
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
};

// ─── BDM Dropdown ─────────────────────────────────────────────────────────────

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
        ? (typeof currentBDM === 'object' ? currentBDM.name : String(currentBDM))
        : 'Not Assigned';

    const handleOpen = () => {
        if (disabled) return;
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 6, left: r.left });
        }
        setOpen(v => !v);
    };

    return (
        <div className="relative">
            <button
                ref={btnRef}
                onClick={handleOpen}
                disabled={disabled}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-200 max-w-[130px] ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm cursor-pointer'
                } ${currentBDM
                    ? 'bg-[#FACE39]/12 text-[#00000F] border-[#FACE39]/30'
                    : 'bg-[#00000F]/[0.04] text-[#00000F]/40 border-[#00000F]/10 hover:border-[#00000F]/20'
                }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${currentBDM ? 'bg-[#FACE39]' : 'bg-[#00000F]/25'}`} />
                <span className="truncate">{displayName}</span>
                {!disabled && <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 bg-white rounded-2xl shadow-[0_16px_48px_rgba(0,0,15,0.14)] border border-[#00000F]/[0.08] py-1.5 min-w-[200px] max-w-[240px]"
                        style={{ top: pos.top, left: pos.left }}
                    >
                        <p className="px-4 py-2 text-[10px] font-bold text-[#00000F]/35 uppercase tracking-widest border-b border-[#00000F]/[0.05] mb-1">Assign BDM</p>
                        <button
                            onClick={() => { onAssign(lead._id, ''); setOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold transition-colors ${
                                !currentBDM ? 'bg-[#00000F]/[0.04] text-[#00000F]/70' : 'text-[#00000F]/45 hover:bg-[#00000F]/[0.03]'
                            }`}
                        >
                            <span className="w-2 h-2 rounded-full bg-[#00000F]/20 flex-shrink-0" />
                            Unassigned
                            {!currentBDM && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0 text-[#00000F]/40" />}
                        </button>
                        {bdms.map(bdm => {
                            const isSelected = currentBDM && (typeof currentBDM === 'object' ? currentBDM._id === bdm._id : currentBDM === bdm._id);
                            return (
                                <button
                                    key={bdm._id}
                                    onClick={() => { onAssign(lead._id, bdm._id); setOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold transition-colors ${
                                        isSelected ? 'bg-[#FACE39]/12 text-[#00000F]' : 'text-[#00000F]/65 hover:bg-[#00000F]/[0.03]'
                                    }`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#FACE39] flex-shrink-0" />
                                    <span className="flex flex-col text-left min-w-0">
                                        <span className="truncate">{bdm.name}</span>
                                        <span className="text-[10px] text-[#00000F]/35 font-medium truncate">{bdm.role}</span>
                                    </span>
                                    {isSelected && <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0 text-[#00000F]/60" />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Template download ────────────────────────────────────────────────────────

const downloadTemplate = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Luminedge CRM';
    const ws = wb.addWorksheet('Leads Import');
    const dateFmt = 'yyyy-mm-dd';
    ws.columns = [
        { header: 'Full Name',        key: 'name',         width: 24 },
        { header: 'Email',            key: 'email',        width: 30 },
        { header: 'Phone Number',     key: 'phone',        width: 18 },
        { header: 'Lead Source',      key: 'source',       width: 18 },
        { header: 'Service Interest', key: 'service',      width: 20 },
        { header: 'Notes',            key: 'notes',        width: 38 },
        { header: 'Stage',            key: 'stage',        width: 14 },
        { header: 'Last Follow Up',   key: 'lastFollowUp', width: 18, style: { numFmt: dateFmt } },
        { header: 'Next Follow Up',   key: 'nextFollowUp', width: 18, style: { numFmt: dateFmt } },
    ];
    const headerRow = ws.getRow(1);
    headerRow.eachCell(cell => {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACE39' } };
        cell.font   = { bold: true, color: { argb: 'FF000000' }, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF000000' } } };
    });
    headerRow.height = 22;
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    const rows: any[][] = [
        ['John Doe',    'john@example.com',  '01700000000', 'Social Media', 'IELTS',         'Interested in IELTS preparation course', 'Intake',     new Date('2026-05-14'), new Date('2026-05-21')],
        ['Jane Smith',  'jane@example.com',  '01800000000', 'Referral',     'PTE',           'Wants PTE coaching and mock tests',      'Processing', new Date('2026-05-10'), new Date('2026-05-17')],
        ['Alice Rahman','alice@example.com', '01900000000', 'Walk-in',      'Study Abroad',  'Needs study abroad guidance',            'Intake',     null,                   null],
    ];
    rows.forEach(r => { const row = ws.addRow(r); row.eachCell(cell => { cell.alignment = { vertical: 'middle' } }); row.height = 18; });
    for (let i = 2; i <= 500; i++) {
        ws.getCell(`D${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Website,Referral,Social Media,Email Campaign,Walk-in,Phone,Other"'], showErrorMessage: true, errorTitle: 'Invalid Source', error: 'Must be one of: Website, Referral, Social Media, Email Campaign, Walk-in, Phone, Other' };
        ws.getCell(`E${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"IELTS,PTE,GRE,TOEFL,Study Abroad,Visa Processing"'], showErrorMessage: true, errorTitle: 'Invalid Service', error: 'Must be one of: IELTS, PTE, GRE, TOEFL, Study Abroad, Visa Processing' };
        ws.getCell(`G${i}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Intake,Processing,Hot,Converted,Dead"'], showErrorMessage: true, errorTitle: 'Invalid Stage', error: 'Must be: Intake, Processing, Hot, Converted, or Dead.' };
    }
    const ref = wb.addWorksheet('Valid Options');
    const refHeaders = ['Lead Source Options', 'Service Interest Options', 'Stage Options', 'Date Format'];
    const refData = [
        ['Website',        'IELTS',           'Intake',     'YYYY-MM-DD'],
        ['Referral',       'PTE',             'Processing', '(e.g. 2026-05-21)'],
        ['Social Media',   'GRE',             'Hot',        ''],
        ['Email Campaign', 'TOEFL',           'Converted',  ''],
        ['Walk-in',        'Study Abroad',    'Dead',       ''],
        ['Phone',          'Visa Processing', '',           ''],
        ['Other',          '',                '',           ''],
    ];
    ref.columns = [{ width: 22 }, { width: 22 }, { width: 14 }, { width: 22 }];
    const refHead = ref.addRow(refHeaders);
    refHead.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACE39' } }; cell.font = { bold: true, size: 11 }; cell.alignment = { horizontal: 'center' }; });
    refData.forEach(r => ref.addRow(r));
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'luminedge_leads_import_template.xlsx'; a.click();
    URL.revokeObjectURL(url);
};

// ─── Pipeline stage styling ───────────────────────────────────────────────────

const pipelineMeta: Record<LeadStageType, { header: string; count: string; bar: string; cardHover: string }> = {
    'Intake':     { header: 'text-[#00000F]/55',  count: 'bg-[#00000F]/[0.08] text-[#00000F]/60',   bar: 'bg-[#00000F]/30',  cardHover: 'hover:border-[#00000F]/20 hover:shadow-[0_8px_24px_rgba(0,0,15,0.08)]' },
    'Processing': { header: 'text-[#B8960C]',     count: 'bg-[#FACE39]/20 text-[#00000F] border border-[#FACE39]/30',      bar: 'bg-[#FACE39]',     cardHover: 'hover:border-[#FACE39]/40 hover:shadow-[0_8px_24px_rgba(250,206,57,0.18)]' },
    'Hot':        { header: 'text-orange-500',    count: 'bg-orange-50 text-orange-600 border border-orange-200',          bar: 'bg-orange-400',    cardHover: 'hover:border-orange-200 hover:shadow-[0_8px_24px_rgba(249,115,22,0.15)]' },
    'Converted':  { header: 'text-[#16A34A]',     count: 'bg-[#22C55E]/10 text-[#16A34A] border border-[#22C55E]/25',     bar: 'bg-[#22C55E]',     cardHover: 'hover:border-[#22C55E]/30 hover:shadow-[0_8px_24px_rgba(34,197,94,0.15)]' },
    'Dead':       { header: 'text-[#00000F]/30',  count: 'bg-[#00000F]/[0.05] text-[#00000F]/30',   bar: 'bg-[#00000F]/20',  cardHover: 'hover:border-[#00000F]/15 hover:shadow-[0_8px_24px_rgba(0,0,15,0.05)]' },
};

// ─── Main component ───────────────────────────────────────────────────────────

const LeadCenter: React.FC<{ onViewLead?: (id: string) => void; refreshKey?: number }> = ({ onViewLead, refreshKey = 0 }) => {
    const isAdmin = true;
    const [view, setView] = useState<'list' | 'form'>('list');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [bdms, setBdms] = useState<BDM[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStageId, setUpdatingStageId] = useState<string | null>(null);
    const [updatingBDMId, setUpdatingBDMId] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importToast, setImportToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stageFilter, setStageFilter] = useState<'all' | LeadStageType>('all');

    const stats = useMemo(() => ({
        total:      leads.length,
        intake:     leads.filter(l => l.lifecycleStage === 'Intake').length,
        processing: leads.filter(l => l.lifecycleStage === 'Processing').length,
        hot:        leads.filter(l => l.lifecycleStage === 'Hot').length,
        converted:  leads.filter(l => l.lifecycleStage === 'Converted').length,
        dead:       leads.filter(l => l.lifecycleStage === 'Dead').length,
    }), [leads]);

    const filterCards = [
        { key: 'all' as const,        label: 'Total Leads', count: stats.total,
          active: 'bg-[#00000F] border-[#00000F]',   activeNum: 'text-[#FACE39]', activeLbl: 'text-white/60',
          idle:   'bg-white border-[#00000F]/10 hover:border-[#00000F]/30' },
        { key: 'Intake' as const,     label: 'Intake',      count: stats.intake,
          active: 'bg-[#00000F]/[0.07] border-[#00000F]/25', activeNum: 'text-[#00000F]', activeLbl: 'text-[#00000F]/50',
          idle:   'bg-white border-[#00000F]/10 hover:border-[#00000F]/25' },
        { key: 'Processing' as const, label: 'Processing',  count: stats.processing,
          active: 'bg-[#FACE39]/20 border-[#FACE39]/45', activeNum: 'text-[#00000F]', activeLbl: 'text-[#00000F]/55',
          idle:   'bg-white border-[#00000F]/10 hover:border-[#FACE39]/40' },
        { key: 'Hot' as const,        label: 'Hot Leads',   count: stats.hot,
          active: 'bg-orange-50 border-orange-300',         activeNum: 'text-orange-600', activeLbl: 'text-orange-400',
          idle:   'bg-white border-[#00000F]/10 hover:border-orange-200' },
        { key: 'Converted' as const,  label: 'Converted',   count: stats.converted,
          active: 'bg-[#22C55E]/10 border-[#22C55E]/35',   activeNum: 'text-[#16A34A]', activeLbl: 'text-[#16A34A]/60',
          idle:   'bg-white border-[#00000F]/10 hover:border-[#22C55E]/30' },
        { key: 'Dead' as const,       label: 'Dead Leads',  count: stats.dead,
          active: 'bg-[#00000F]/[0.06] border-[#00000F]/20', activeNum: 'text-[#00000F]/50', activeLbl: 'text-[#00000F]/30',
          idle:   'bg-white border-[#00000F]/10 hover:border-[#00000F]/20' },
    ];

    const displayedLeads = useMemo(() =>
        stageFilter === 'all' ? leads : leads.filter(l => l.lifecycleStage === stageFilter),
        [leads, stageFilter]
    );

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await getLeads({ search: searchTerm });
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, [searchTerm, refreshKey]);
    useEffect(() => { if (!isAdmin) return; getBDMsForAssignment().then(data => setBdms(data)).catch(() => {}); }, [isAdmin]);

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

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if (!confirm('Are you sure you want to delete this lead?')) return;
        try { await deleteLead(id); setLeads(leads.filter(l => l._id !== id)); }
        catch { console.error('Failed to delete lead'); }
    };

    const handleStageChange = async (id: string, newStage: LeadStageType) => {
        setUpdatingStageId(id);
        try {
            await updateLeadStage(id, newStage);
            setLeads(prev => prev.map(l => l._id === id ? { ...l, lifecycleStage: newStage } : l));
        } catch { alert('Failed to update lead stage'); }
        finally { setUpdatingStageId(null); }
    };

    const handleImportCSV = () => {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.csv,.xlsx,.xls';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setIsImporting(true); setImportToast(null);
            try {
                const result = await importLeadsFromFile(file);
                const skippedMsg = result.failed > 0 ? ` ${result.failed} skipped (duplicates).` : '';
                setImportToast({ type: result.imported > 0 ? 'success' : 'error', message: `Imported ${result.imported} lead${result.imported !== 1 ? 's' : ''}.${skippedMsg}` });
                fetchLeads();
            } catch (err: any) {
                setImportToast({ type: 'error', message: err.message || 'Import failed. Check the file format.' });
            } finally {
                setIsImporting(false);
                setTimeout(() => setImportToast(null), 5000);
            }
        };
        input.click();
    };

    if (view === 'form') {
        return <InputLead onSuccess={() => setView('list')} onCancel={() => setView('list')} />;
    }

    return (
        <div className="space-y-4">

            {/* ── Header ───────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-[21px] font-bold text-[#00000F] tracking-tight">Lead Center</h1>
                    <p className="text-[12px] text-[#00000F]/40 font-medium mt-0.5">Manage and track all your leads in one place</p>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                    <button
                        onClick={fetchLeads}
                        title="Refresh"
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#00000F]/10 text-[#00000F]/35 hover:text-[#00000F] hover:border-[#FACE39] hover:bg-[#FACE39]/[0.08] transition-all duration-200 bg-white"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={downloadTemplate}
                        title="Download Template"
                        className="flex items-center gap-1.5 h-9 px-3 border border-[#00000F]/10 rounded-xl text-[12.5px] font-semibold text-[#00000F]/60 hover:text-[#00000F] hover:border-[#00000F]/25 hover:bg-[#00000F]/[0.03] transition-all bg-white"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Template</span>
                    </button>
                    <button
                        onClick={handleImportCSV}
                        disabled={isImporting}
                        className="flex items-center gap-1.5 h-9 px-3 border border-[#00000F]/10 rounded-xl text-[12.5px] font-semibold text-[#00000F]/60 hover:text-[#00000F] hover:border-[#00000F]/25 hover:bg-[#00000F]/[0.03] transition-all bg-white disabled:opacity-50"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        {isImporting ? 'Importing…' : 'Import'}
                    </button>
                    <button
                        onClick={() => setView('form')}
                        className="flex items-center gap-1.5 h-9 px-3.5 bg-[#FACE39] text-[#00000F] font-bold text-[13px] rounded-xl shadow-[0_2px_12px_rgba(250,206,57,0.30)] hover:shadow-[0_6px_20px_rgba(250,206,57,0.45)] hover:bg-[#FACE39]/90 active:scale-[0.97] transition-all duration-200"
                    >
                        <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Add New Lead
                    </button>
                </div>
            </div>

            {/* ── Search ───────────────────────────────────────────────────────── */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#00000F]/30" />
                <input
                    type="text"
                    placeholder="Search leads by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-white border border-[#00000F]/[0.10] rounded-xl text-[13px] font-medium text-[#00000F] placeholder:text-[#00000F]/30 focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-[#FACE39] shadow-[0_1px_6px_rgba(0,0,15,0.04)] transition-all"
                />
            </div>

            {/* ── Stat Filter Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5">
                {filterCards.map(card => {
                    const isActive = stageFilter === card.key;
                    return (
                        <button
                            key={card.key}
                            onClick={() => setStageFilter(card.key)}
                            className={`text-left rounded-2xl border p-3.5 transition-all duration-200 shadow-[0_1px_6px_rgba(0,0,15,0.04)] hover:-translate-y-0.5 ${
                                isActive ? card.active + ' shadow-md' : card.idle
                            }`}
                        >
                            <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${isActive ? card.activeLbl : 'text-[#00000F]/35'}`}>{card.label}</p>
                            <p className={`text-[28px] font-extrabold leading-none tracking-tight ${isActive ? card.activeNum : 'text-[#00000F]/70'}`}>{card.count}</p>
                        </button>
                    );
                })}
            </div>

            {/* ── Leads Table ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-[0_1px_10px_rgba(0,0,15,0.05)] border border-[#00000F]/[0.07] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-[#FACE39]">
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Lead Info</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Contact</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest hidden sm:table-cell">Source & Service</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest">Stage</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest hidden md:table-cell">BDM</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest hidden lg:table-cell">Notes</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest hidden lg:table-cell">Last Follow Up</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest hidden lg:table-cell">Next Follow Up</th>
                                <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest text-center">Profile</th>
                                {isAdmin && <th className="px-4 py-3 text-[11px] font-bold text-[#00000F] uppercase tracking-widest text-right">Del</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#00000F]/[0.05]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={isAdmin ? 10 : 9} className="px-4 py-12 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#FACE39] border-t-[#00000F] mx-auto mb-3" />
                                        <p className="text-[12.5px] text-[#00000F]/40 font-medium">Loading leads…</p>
                                    </td>
                                </tr>
                            ) : displayedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 10 : 9} className="px-4 py-14 text-center">
                                        <Users className="w-10 h-10 text-[#00000F]/10 mx-auto mb-3" />
                                        <p className="text-[13px] font-semibold text-[#00000F]/35">No leads found</p>
                                    </td>
                                </tr>
                            ) : (
                                displayedLeads.map((lead) => (
                                    <tr key={lead._id} className="group transition-all duration-200 hover:bg-[#FACE39]/[0.03] border-l-[3px] border-l-transparent hover:border-l-[#FACE39]">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-[#FACE39]/15 border border-[#FACE39]/25 flex items-center justify-center text-[#00000F] font-bold text-[13px] flex-shrink-0">
                                                    {lead.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <button
                                                        onClick={() => onViewLead?.(lead._id)}
                                                        className="text-[13.5px] font-bold text-[#00000F] truncate max-w-[120px] sm:max-w-none hover:text-[#00000F]/60 transition-colors block leading-tight text-left"
                                                    >
                                                        {lead.fullName}
                                                    </button>
                                                    <p className="text-[11px] font-medium text-[#00000F]/35 mt-0.5 uppercase tracking-wide">
                                                        {new Date(lead.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-[11.5px] text-[#00000F]/50">
                                                    <Mail className="w-3 h-3 text-[#00000F]/25 flex-shrink-0" />
                                                    <span className="truncate max-w-[130px]">{lead.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#00000F]/70">
                                                    <Phone className="w-3 h-3 text-[#00000F]/25 flex-shrink-0" />
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 hidden sm:table-cell">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00000F] text-white w-fit uppercase tracking-wider">
                                                    {lead.source}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FACE39]/15 text-[#00000F] w-fit uppercase tracking-wider border border-[#FACE39]/30">
                                                    {Array.isArray(lead.serviceInterest) ? lead.serviceInterest.join(', ') : lead.serviceInterest}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StageDropdown
                                                value={lead.lifecycleStage}
                                                onChange={(stage) => handleStageChange(lead._id, stage)}
                                                disabled={updatingStageId === lead._id}
                                            />
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell">
                                            <span className={`text-[12px] font-semibold ${lead.assignedTo ? 'text-[#00000F]/70' : 'text-[#00000F]/30 italic'}`}>
                                                {lead.assignedTo
                                                    ? (typeof lead.assignedTo === 'object' ? lead.assignedTo.name : lead.assignedTo)
                                                    : 'Not Assigned'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell">
                                            <span className="text-[11.5px] text-[#00000F]/55 italic line-clamp-2 max-w-[160px]" title={lead.notes || ''}>
                                                {lead.notes ? `"${lead.notes}"` : <span className="text-[#00000F]/25 not-italic">No comments</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell">
                                            {(() => {
                                                const last = lead.followUps?.[lead.followUps.length - 1];
                                                return last?.date
                                                    ? <span className="text-[12px] font-semibold text-[#00000F]/60">{new Date(last.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    : <span className="text-[#00000F]/25 text-[12px]">—</span>;
                                            })()}
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell">
                                            {(() => {
                                                const last = lead.followUps?.[lead.followUps.length - 1];
                                                return last?.nextFollowUpDate
                                                    ? <span className="text-[11.5px] font-bold text-[#00000F] bg-[#FACE39]/20 px-2 py-1 rounded-lg border border-[#FACE39]/35">{new Date(last.nextFollowUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    : <span className="text-[#00000F]/25 text-[12px]">—</span>;
                                            })()}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                onClick={() => onViewLead?.(lead._id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FACE39] text-[#00000F]/70 hover:text-[#00000F] rounded-xl text-[11.5px] font-bold transition-all border border-[#00000F]/10 hover:border-[#FACE39] shadow-sm hover:shadow-md"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">View</span>
                                            </button>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-4 py-3.5 text-right">
                                                <button
                                                    onClick={() => handleDelete(lead._id)}
                                                    className="w-7 h-7 flex items-center justify-center ml-auto text-[#00000F]/20 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!isLoading && displayedLeads.length > 0 && (
                    <div className="px-4 py-3 border-t border-[#00000F]/[0.05]">
                        <p className="text-[11.5px] text-[#00000F]/40 font-medium">
                            Showing <span className="font-bold text-[#00000F]/60">{displayedLeads.length}</span> of <span className="font-bold text-[#00000F]/60">{leads.length}</span> leads
                        </p>
                    </div>
                )}
            </div>

            {/* ── Lead Pipeline Board ───────────────────────────────────────────── */}
            <div className="pt-2">
                <div className="flex items-center gap-2.5 mb-3 px-0.5">
                    <span className="w-[3px] h-5 bg-[#FACE39] rounded-full" />
                    <h2 className="text-[15px] font-bold text-[#00000F] tracking-tight">Lead Pipeline</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {stages.map(stage => {
                        const meta = pipelineMeta[stage];
                        const stageLeads = displayedLeads.filter(l => l.lifecycleStage === stage);
                        return (
                            <div key={stage} className="flex-shrink-0 flex-1 min-w-[260px] max-w-[340px] rounded-2xl flex flex-col snap-start bg-[#fafafa] border border-[#00000F]/[0.06]">
                                <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#00000F]/[0.05]">
                                    <h3 className={`text-[11px] font-black uppercase tracking-widest ${meta.header}`}>{stage}</h3>
                                    <span className={`min-w-[22px] h-[22px] flex items-center justify-center px-1.5 rounded-full text-[10px] font-extrabold ${meta.count}`}>
                                        {stageLeads.length}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 max-h-[580px] scrollbar-hide">
                                    {stageLeads.length === 0 ? (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-[11px] text-[#00000F]/25 font-medium">No leads</p>
                                        </div>
                                    ) : stageLeads.map(lead => {
                                        const diffDays = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000);
                                        const timeStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
                                        return (
                                            <div
                                                key={lead._id}
                                                onClick={() => onViewLead?.(lead._id)}
                                                className={`bg-white rounded-xl p-3.5 shadow-[0_1px_6px_rgba(0,0,15,0.05)] border border-[#00000F]/[0.07] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group relative overflow-hidden ${meta.cardHover}`}
                                            >
                                                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${meta.bar}`} />
                                                <div className="flex justify-between items-start mb-2 pl-1">
                                                    <h4 className="text-[13px] font-bold text-[#00000F] leading-tight line-clamp-1 pr-2">{lead.fullName}</h4>
                                                    <span className="text-[10px] font-semibold text-[#00000F]/30 whitespace-nowrap flex-shrink-0">{timeStr}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mb-2.5 pl-1 text-[11px] font-medium text-[#00000F]/50">
                                                    <Target className="w-3 h-3 text-[#00000F]/25 flex-shrink-0" />
                                                    <span className="truncate font-semibold text-[#00000F]/60">{Array.isArray(lead.serviceInterest) ? lead.serviceInterest.join(', ') : lead.serviceInterest || 'No Service'}</span>
                                                    <span className="text-[#00000F]/20">·</span>
                                                    <span className="truncate">{lead.source}</span>
                                                </div>
                                                {lead.notes && (
                                                    <div className="mb-2.5 pl-1 px-2.5 py-2 text-[11px] text-[#00000F]/50 italic bg-[#00000F]/[0.025] rounded-xl border border-[#00000F]/[0.05] line-clamp-2">
                                                        "{lead.notes}"
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 pt-2 border-t border-[#00000F]/[0.05] pl-1">
                                                    <button className="w-7 h-7 rounded-xl bg-[#00000F]/[0.04] flex items-center justify-center text-[#00000F]/35 hover:text-[#16A34A] hover:bg-[#22C55E]/10 transition-all" title="Call">
                                                        <Phone className="w-3 h-3" />
                                                    </button>
                                                    <button className="w-7 h-7 rounded-xl bg-[#00000F]/[0.04] flex items-center justify-center text-[#00000F]/35 hover:text-[#00000F]/70 hover:bg-[#00000F]/[0.08] transition-all" title="Message">
                                                        <MessageSquare className="w-3 h-3" />
                                                    </button>
                                                    <div className="ml-auto">
                                                        {lead.assignedTo ? (
                                                            <span className="text-[10px] font-bold text-[#00000F]/55 bg-[#FACE39]/10 px-2 py-1 rounded-lg border border-[#FACE39]/25">
                                                                {typeof lead.assignedTo === 'object' ? lead.assignedTo.name.split(' ')[0] : 'Assigned'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">Unassigned</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Import toast ─────────────────────────────────────────────────── */}
            {importToast && (
                <div className="fixed bottom-8 right-8 z-50 max-w-sm">
                    <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl shadow-[0_16px_48px_rgba(0,0,15,0.14)] border ${
                        importToast.type === 'success' ? 'bg-white border-[#22C55E]/20' : 'bg-white border-red-100'
                    }`}>
                        {importToast.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#22C55E]" />
                            : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />}
                        <p className="text-[13px] font-semibold text-[#00000F]/70">{importToast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadCenter;
