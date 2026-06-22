"use client";

import { useEffect, useState, useRef } from "react";
import { getMyDocuments, uploadDocument } from "@/lib/api/documents";
import { API_URL } from "@/lib/api/base";
import type { StudentProfile, StudentDocument, DocumentStatus } from "@/types/student";
import { Upload, FileText, CheckCircle, Clock, XCircle, AlertTriangle, X } from "lucide-react";

interface Props { token: string; profile: StudentProfile; onRefresh: () => void; }

const DOC_TYPES = [
  "Passport", "National ID", "Birth Certificate", "Transcript", "Certificate",
  "Recommendation Letter", "SOP", "LOR", "CV", "Bank Statement",
  "Sponsor Documents", "Visa Form", "Medical Report", "Police Clearance", "Other",
];

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusIcon(status: DocumentStatus) {
  switch (status) {
    case "Approved":    return <CheckCircle size={13} className="text-green-500" />;
    case "Rejected":    return <XCircle size={13} className="text-red-500" />;
    case "Uploaded":
    case "Under Review": return <Clock size={13} className="text-blue-500" />;
    case "Revision Requested": return <AlertTriangle size={13} className="text-yellow-500" />;
    default:            return <AlertTriangle size={13} className="text-gray-400" />;
  }
}

function statusBadge(status: DocumentStatus) {
  const colors: Record<string, string> = {
    Approved: "text-green-600 bg-green-50",
    Rejected: "text-red-500 bg-red-50",
    Uploaded: "text-blue-600 bg-blue-50",
    "Under Review": "text-purple-600 bg-purple-50",
    "Revision Requested": "text-yellow-600 bg-yellow-50",
    Requested: "text-gray-600 bg-gray-100",
  };
  return colors[status] || "text-gray-600 bg-gray-100";
}

export default function StudentDocuments({ token }: Props) {
  const [docs, setDocs] = useState<StudentDocument[]>([]);
  const [tab, setTab] = useState<"requested" | "uploaded">("requested");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<StudentDocument | null>(null);
  const [viewDoc, setViewDoc] = useState<StudentDocument | null>(null);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const data = await getMyDocuments(token);
      setDocs(data.documents || []);
    } catch {}
  }

  useEffect(() => { load(); }, [token]);

  const requested = docs.filter(d => d.status === "Requested" || d.status === "Revision Requested");
  const uploaded = docs.filter(d => d.status !== "Requested");

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", selectedDoc?.documentType || docType);
      if (selectedDoc?._id) fd.append("existingDocId", selectedDoc._id);
      await uploadDocument(token, fd, true);
      setShowUpload(false);
      setFile(null);
      setSelectedDoc(null);
      load();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-4">
      {/* Document detail modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setViewDoc(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#b08800]" />
                <h4 className="text-sm font-black text-[#00000F]">{viewDoc.documentType}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(viewDoc.status)}`}>
                  {viewDoc.status}
                </span>
                <button onClick={() => setViewDoc(null)} className="text-[#00000F]/30 hover:text-[#00000F] transition">
                  <X size={16} />
                </button>
              </div>
            </div>

            {viewDoc.fileName && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">File Name</p>
                  <p className="text-xs font-semibold text-[#00000F] break-all">{viewDoc.originalName || viewDoc.fileName}</p>
                </div>
                {viewDoc.fileSize && (
                  <div>
                    <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">File Size</p>
                    <p className="text-xs font-semibold text-[#00000F]">{formatFileSize(viewDoc.fileSize)}</p>
                  </div>
                )}
                {viewDoc.mimeType && (
                  <div>
                    <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">File Type</p>
                    <p className="text-xs font-semibold text-[#00000F]">{viewDoc.mimeType}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-[#00000F]/40 uppercase">Uploaded By</p>
                  <p className="text-xs font-semibold text-[#00000F]">{viewDoc.uploadedBy === "student" ? "You" : "Staff"}</p>
                </div>
              </div>
            )}

            {viewDoc.requestNote && (
              <div>
                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase mb-1">Request Note</p>
                <p className="text-xs text-[#00000F]/60 bg-yellow-50 border border-yellow-100 rounded-xl p-2.5">{viewDoc.requestNote}</p>
              </div>
            )}

            {viewDoc.reviewNote && (
              <div>
                <p className="text-[10px] font-bold text-[#00000F]/40 uppercase mb-1">Review Feedback</p>
                <p className="text-xs text-[#00000F]/60 bg-gray-50 rounded-xl p-2.5">{viewDoc.reviewNote}</p>
              </div>
            )}

            <p className="text-[10px] text-[#00000F]/30">Submitted {new Date(viewDoc.createdAt).toLocaleDateString()}</p>

            {(viewDoc.status === "Requested" || viewDoc.status === "Revision Requested") ? (
              <button
                onClick={() => { setViewDoc(null); setSelectedDoc(viewDoc); setShowUpload(true); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition">
                <Upload size={14} /> Upload Document
              </button>
            ) : viewDoc.filePath ? (
              <a
                href={viewDoc.filePath.startsWith("http") ? viewDoc.filePath : `${API_URL}${viewDoc.filePath}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition">
                Download / View File
              </a>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {(["requested", "uploaded"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                tab === t ? "bg-white text-[#00000F] shadow-sm" : "text-[#00000F]/50 hover:text-[#00000F]"
              }`}>
              {t} {t === "requested" ? `(${requested.length})` : `(${uploaded.length})`}
            </button>
          ))}
        </div>
        <button onClick={() => { setShowUpload(true); setSelectedDoc(null); }}
          className="flex items-center gap-1.5 text-xs font-black text-[#00000F] bg-[#FACE39] px-3 py-2 rounded-xl hover:bg-[#f0c020] transition">
          <Upload size={12} /> Upload
        </button>
      </div>

      {showUpload && (
        <div className="rounded-2xl border border-[#FACE39]/30 bg-white p-5">
          <h4 className="text-sm font-black text-[#00000F] mb-4">
            {selectedDoc ? `Upload: ${selectedDoc.documentType}` : "Upload Document"}
          </h4>
          {!selectedDoc && (
            <div className="mb-3">
              <label className="block text-xs font-bold text-[#00000F]/50 mb-1 uppercase tracking-wide">Document Type</label>
              <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FACE39] transition"
                value={docType} onChange={e => setDocType(e.target.value)}>
                {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          )}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#FACE39]/50 hover:bg-[#FACE39]/3 transition">
            <Upload size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#00000F]/50">
              {file ? file.name : "Click to select file"}
            </p>
            <p className="text-xs text-[#00000F]/30 mt-1">PDF, JPG, PNG, DOC — max 10MB</p>
          </div>
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={e => setFile(e.target.files?.[0] || null)} />
          <div className="flex gap-2 mt-4">
            <button onClick={handleUpload} disabled={!file || uploading}
              className="px-4 py-2 rounded-xl text-sm font-black text-[#00000F] bg-[#FACE39] hover:bg-[#f0c020] transition disabled:opacity-50">
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <button onClick={() => { setShowUpload(false); setFile(null); setSelectedDoc(null); }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#00000F]/50 border border-gray-200 hover:border-gray-300 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {tab === "requested" && (
        <div className="space-y-3">
          {requested.length === 0 ? (
            <div className="text-center py-12 text-[#00000F]/40">
              <p className="text-sm font-bold">No pending document requests</p>
            </div>
          ) : requested.map(doc => (
            <div key={doc._id}
              onClick={() => setViewDoc(doc)}
              className="rounded-2xl border border-gray-100 bg-white p-4 flex items-center justify-between cursor-pointer hover:border-[#FACE39]/30 hover:shadow-[0_2px_16px_rgba(250,206,57,0.1)] transition-all">
              <div className="flex items-center gap-3">
                {statusIcon(doc.status)}
                <div>
                  <p className="text-sm font-bold text-[#00000F]">{doc.documentType}</p>
                  {doc.requestNote && <p className="text-xs text-[#00000F]/40 mt-0.5">{doc.requestNote}</p>}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setSelectedDoc(doc); setShowUpload(true); }}
                className="text-xs font-black text-[#00000F] bg-[#FACE39] px-3 py-1.5 rounded-lg hover:bg-[#f0c020] transition flex-shrink-0">
                Upload
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "uploaded" && (
        <div className="space-y-3">
          {uploaded.length === 0 ? (
            <div className="text-center py-12 text-[#00000F]/40">
              <p className="text-sm font-bold">No uploaded documents</p>
            </div>
          ) : uploaded.map(doc => (
            <div key={doc._id}
              onClick={() => setViewDoc(doc)}
              className="rounded-2xl border border-gray-100 bg-white p-4 cursor-pointer hover:border-[#FACE39]/30 hover:shadow-[0_2px_16px_rgba(250,206,57,0.1)] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#b08800]" />
                  <p className="text-sm font-bold text-[#00000F]">{doc.documentType}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              {doc.reviewNote && (
                <p className="text-xs text-[#00000F]/50 mt-2 pl-5">{doc.reviewNote}</p>
              )}
              <p className="text-[10px] text-[#00000F]/30 mt-1 pl-5">
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
