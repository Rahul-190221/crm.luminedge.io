'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Upload, Download, RefreshCw } from 'lucide-react';
import { getLeads, updateLeadStage, importLeadsFromCSV } from '@/lib/api/leads';
import type { Lead, LeadStage as LeadStageType } from '@/types/admin';
import StageDropdown from './StageDropdown';

interface LeadStats {
    total: number;
    newInquiry: number;
    contacted: number;
    trialClass: number;
    enrolled: number;
    lost: number;
}

const LeadStage: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | LeadStageType>('all');
    const [stats, setStats] = useState<LeadStats>({
        total: 0, newInquiry: 0, contacted: 0, trialClass: 0, enrolled: 0, lost: 0
    });

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await getLeads();
            const leadsList = Array.isArray(data.leads) ? data.leads : [];
            setLeads(leadsList);
            calculateStats(leadsList);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (leadsData: Lead[]) => {
        const newStats: LeadStats = {
            total: leadsData.length,
            newInquiry: leadsData.filter(l => l.lifecycleStage === 'New Inquiry').length,
            contacted: leadsData.filter(l => l.lifecycleStage === 'Contacted').length,
            trialClass: leadsData.filter(l => l.lifecycleStage === 'Trial Class').length,
            enrolled: leadsData.filter(l => l.lifecycleStage === 'Enrolled').length,
            lost: leadsData.filter(l => l.lifecycleStage === 'Lost').length,
        };
        setStats(newStats);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleStageChange = async (leadId: string, newStage: LeadStageType) => {
        try {
            await updateLeadStage(leadId, newStage);
            setLeads(leads.map(lead =>
                lead._id === leadId ? { ...lead, lifecycleStage: newStage } : lead
            ));
            // Recalculate stats
            const updatedLeads = leads.map(lead =>
                lead._id === leadId ? { ...lead, lifecycleStage: newStage } : lead
            );
            calculateStats(updatedLeads);
        } catch (error) {
            console.error('Failed to update lead stage:', error);
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                try {
                    await importLeadsFromCSV(file);
                    fetchLeads();
                } catch (error) {
                    console.error('Failed to import leads:', error);
                }
            }
        };
        input.click();
    };

    const handleExport = () => {
        const csvContent = [
            ['Full Name', 'Phone', 'Lead Source', 'Service Interest', 'Assigned BDM', 'Stage', 'Notes', 'Created Date', 'Next Follow-Up'].join(','),
            ...filteredLeads.map(lead => [
                lead.fullName,
                lead.phone,
                lead.source,
                lead.serviceInterest || '',
                typeof lead.assignedTo === 'object' ? (lead.assignedTo as any)?.name || '' : '',
                lead.lifecycleStage,
                `"${(lead.notes || '').replace(/"/g, '""')}"`,
                new Date(lead.createdAt).toLocaleDateString(),
                lead.followUps?.[0]?.nextFollowUpDate ? new Date(lead.followUps[0].nextFollowUpDate).toLocaleDateString() : '-'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredLeads = useMemo(() => {
        let result = leads;

        // Filter by stage
        if (activeFilter !== 'all') {
            result = result.filter(lead => lead.lifecycleStage === activeFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(lead =>
                (lead.fullName || '').toLowerCase().includes(term) ||
                (lead.email || '').toLowerCase().includes(term) ||
                lead.phone.includes(term)
            );
        }

        return result;
    }, [leads, activeFilter, searchTerm]);

    const filterCards = [
        { key: 'all' as const,          label: 'Total Leads', count: stats.total,      accent: 'border-gray-900  bg-gray-900',  activeText: 'text-white',       activeSub: 'text-white/70',  idle: 'border-gray-200 hover:border-gray-400' },
        { key: 'New Inquiry' as const,  label: 'New Inquiry', count: stats.newInquiry, accent: 'border-blue-500  bg-blue-50',   activeText: 'text-blue-700',    activeSub: 'text-blue-500',  idle: 'border-gray-200 hover:border-blue-300' },
        { key: 'Contacted' as const,    label: 'Contacted',   count: stats.contacted,  accent: 'border-yellow-500 bg-yellow-50', activeText: 'text-yellow-700', activeSub: 'text-yellow-600', idle: 'border-gray-200 hover:border-yellow-300' },
        { key: 'Trial Class' as const,  label: 'Trial Class', count: stats.trialClass, accent: 'border-orange-500 bg-orange-50', activeText: 'text-orange-700', activeSub: 'text-orange-500', idle: 'border-gray-200 hover:border-orange-300' },
        { key: 'Enrolled' as const,     label: 'Enrolled',    count: stats.enrolled,   accent: 'border-green-500  bg-green-50', activeText: 'text-green-700',  activeSub: 'text-green-500',  idle: 'border-gray-200 hover:border-green-300' },
        { key: 'Lost' as const,         label: 'Lost Leads',  count: stats.lost,       accent: 'border-red-500    bg-red-50',   activeText: 'text-red-700',    activeSub: 'text-red-500',    idle: 'border-gray-200 hover:border-red-300' },
    ];

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead Stage</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage leads through different stages</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={handleImport}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                    >
                        <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Import</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                    >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards — click to filter */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                {filterCards.map(card => {
                    const isActive = activeFilter === card.key;
                    return (
                        <button
                            key={card.key}
                            onClick={() => setActiveFilter(card.key)}
                            className={`text-left rounded-xl border-2 p-4 transition-all cursor-pointer ${
                                isActive ? card.accent + ' shadow-sm' : 'bg-white ' + card.idle
                            }`}
                        >
                            <p className={`text-[12px] uppercase tracking-wider mb-1 transition-all ${
                                isActive ? 'font-extrabold ' + card.activeSub : 'font-semibold text-gray-400'
                            }`}>{card.label}</p>
                            <p className={`text-2xl transition-all ${
                                isActive ? 'font-extrabold ' + card.activeText : 'font-bold text-gray-800'
                            }`}>{card.count}</p>
                        </button>
                    );
                })}
            </div>

            {/* Search Bar */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, email or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACE39]/40 focus:border-transparent"
                />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-[#FEF9C3]">
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider sticky left-0 bg-[#FEF9C3] z-10 min-w-[140px]">Full Name</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Source</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Service</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">BDM</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Stage</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                                <th className="px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider">Follow-Up</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 animate-spin text-yellow-400 mx-auto" />
                                        <p className="text-gray-500 mt-2 text-sm">Loading leads...</p>
                                    </td>
                                </tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center">
                                        <p className="text-gray-500">No leads found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 max-w-[160px] truncate">{lead.fullName}</td>
                                        <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">{lead.phone}</td>
                                        <td className="px-3 py-3 text-sm text-gray-600">{lead.source}</td>
                                        <td className="px-3 py-3 text-sm text-gray-600">{lead.serviceInterest || '-'}</td>
                                        <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                                            {typeof lead.assignedTo === 'object' ? (lead.assignedTo as any)?.name || '-' : '-'}
                                        </td>
                                        <td className="px-3 py-3">
                                            <StageDropdown
                                                value={lead.lifecycleStage}
                                                onChange={(stage) => handleStageChange(lead._id, stage)}
                                            />
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={lead.notes || ''}>
                                            {lead.notes || '-'}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                                            {new Date(lead.createdAt).toLocaleDateString('en-CA')}
                                        </td>
                                        <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                                            {lead.followUps?.[0]?.nextFollowUpDate
                                                ? new Date(lead.followUps[0].nextFollowUpDate).toLocaleDateString('en-CA')
                                                : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                    <span>Showing {filteredLeads.length} of {stats.total} leads</span>
                    <span className="text-right">
                        <span className="text-green-600 font-medium">{stats.enrolled} enrolled</span>
                        <span className="mx-2">·</span>
                        <span className="text-red-600 font-medium">{stats.lost} lost leads</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LeadStage;

