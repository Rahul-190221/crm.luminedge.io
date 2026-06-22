'use client';

import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, User, FileText, Clock, Tag, Activity } from 'lucide-react';
import type { Lead } from '@/types/admin';

const stageColors: Record<string, string> = {
    Converted: 'bg-green-100 text-green-700 border-green-200',
    Dead: 'bg-red-100 text-red-700 border-red-200',
    Hot: 'bg-orange-100 text-orange-700 border-orange-200',
    Processing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Intake: 'bg-blue-100 text-blue-700 border-blue-200',
};

const avatarColors = [
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
];

function getAvatarColor(name: string) {
    const index = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[index];
}

interface Props {
    lead: Lead;
    onClose: () => void;
}

const LeadProfileModal: React.FC<Props> = ({ lead, onClose }) => {
    const stageClass = stageColors[lead.lifecycleStage] ?? 'bg-gray-100 text-gray-700 border-gray-200';
    const avatarClass = getAvatarColor(lead.fullName);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-3 sm:mx-0 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-[#FACE39]/20 to-yellow-50 rounded-t-2xl px-6 pt-6 pb-5 border-b border-yellow-100">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/70 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm ${avatarClass}`}>
                            {lead.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{lead.fullName}</h2>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Added on {new Date(lead.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')}
                            </p>
                            <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-bold border ${stageClass}`}>
                                {lead.lifecycleStage}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">

                    {/* Contact Info */}
                    <Section icon={<User className="w-4 h-4" />} title="Contact Information">
                        <InfoRow icon={<Mail className="w-3.5 h-3.5 text-gray-400" />} label="Email" value={lead.email} />
                        <InfoRow icon={<Phone className="w-3.5 h-3.5 text-gray-400" />} label="Phone" value={lead.phone} />
                    </Section>

                    {/* Source & Service */}
                    <Section icon={<Tag className="w-4 h-4" />} title="Source & Service">
                        <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 uppercase tracking-wide">
                                {lead.source}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 uppercase tracking-wide border border-yellow-100">
                                {lead.serviceInterest}
                            </span>
                        </div>
                    </Section>

                    {/* Notes */}
                    {lead.notes && (
                        <Section icon={<FileText className="w-4 h-4" />} title="Notes">
                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                                {lead.notes}
                            </p>
                        </Section>
                    )}

                    {/* Assigned To */}
                    {lead.assignedTo && (
                        <Section icon={<User className="w-4 h-4" />} title="Assigned To">
                            <p className="text-sm text-gray-700 font-medium">
                                {typeof lead.assignedTo === 'object'
                                    ? (lead.assignedTo as any).name || (lead.assignedTo as any).email || 'Assigned'
                                    : lead.assignedTo}
                            </p>
                        </Section>
                    )}

                    {/* Follow-ups */}
                    {lead.followUps && lead.followUps.length > 0 && (
                        <Section icon={<Activity className="w-4 h-4" />} title={`Follow-ups (${lead.followUps.length})`}>
                            <div className="space-y-2.5 mt-1">
                                {lead.followUps.map((fu, i) => (
                                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
                                        <p className="text-sm text-gray-700">{fu.note}</p>
                                        <div className="flex items-center gap-3 mt-1.5 text-[12px] text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(fu.date).toLocaleDateString()}
                                            </span>
                                            {fu.nextFollowUpDate && (
                                                <span className="flex items-center gap-1 text-yellow-600">
                                                    <Calendar className="w-3 h-3" />
                                                    Next: {new Date(fu.nextFollowUpDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Last updated */}
                    <p className="text-[12px] text-gray-400 text-center pt-1">
                        Last updated: {new Date(lead.updatedAt).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div>
        <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[#FACE39]">{icon}</span>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        </div>
        {children}
    </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-2.5 py-1.5">
        {icon}
        <span className="text-xs text-gray-400 w-10">{label}</span>
        <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
);

export default LeadProfileModal;
