import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Building, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  FileText,
  ShieldCheck,
  Edit3
} from 'lucide-react';

export default function TicketDetailModal({ ticket, onClose, isAdmin, onUpdateStatus }) {
  if (!ticket) return null;

  const [currentStatus, setCurrentStatus] = useState(ticket.status || 'Assigned');
  const [resolutionNote, setResolutionNote] = useState(ticket.resolutionNotes || '');
  const [isSaved, setIsSaved] = useState(false);

  const trackingId = ticket.trackingId || ticket.id || 'AMC-2026';
  const displayDate = ticket.filedAt ? new Date(ticket.filedAt).toLocaleString('en-IN') : (ticket.date || 'Today');
  
  const getDefectImage = () => {
    if (ticket.image) return ticket.image;
    const issueLower = (ticket.issue || '').toLowerCase();
    if (issueLower.includes('pothole')) return '/assets/pothole.jpg';
    if (issueLower.includes('garbage') || issueLower.includes('waste')) return '/assets/garbage.jpg';
    if (issueLower.includes('light') || issueLower.includes('streetlight')) return '/assets/streetlight.jpg';
    if (issueLower.includes('water') || issueLower.includes('flood') || issueLower.includes('drain')) return '/assets/waterlogging.jpg';
    return '/assets/pothole.jpg';
  };

  const getStatusBadge = (status = '') => {
    if (status.includes('Progress') || status.includes('Logged')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">🟡 {status}</span>;
    }
    if (status.includes('Assigned')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">🔵 Assigned</span>;
    }
    if (status.includes('Resolved')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Resolved</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">⚪ {status}</span>;
  };

  const handleAdminStatusChange = (newSt) => {
    setCurrentStatus(newSt);
    if (onUpdateStatus) {
      onUpdateStatus(trackingId, newSt, resolutionNote);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              #{trackingId}
            </span>
            <span className="text-xs text-slate-400 font-medium">Official Grievance Docket</span>
            {isAdmin && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Admin Edit Mode
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Main Title & Image */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <img 
              src={getDefectImage()} 
              alt={ticket.issue}
              className="w-full sm:w-36 h-28 object-cover rounded-xl border border-slate-200 shadow-2xs shrink-0" 
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                {getStatusBadge(currentStatus)}
                <span className="text-xs font-medium text-slate-500">{displayDate}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug capitalize">
                {ticket.issue}
              </h3>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Ward: {ticket.ward} {ticket.area ? `(${ticket.area})` : ''}</span>
              </p>
            </div>
          </div>

          {/* Admin Triage & Status Control Bar (Admin Only) */}
          {isAdmin ? (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  Admin Docket Status Control
                </span>
                {isSaved && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Updated!
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {['Assigned', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleAdminStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentStatus.includes(st)
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-white hover:bg-amber-100/60 text-slate-700 border border-amber-200/80'
                    }`}
                  >
                    Set: {st}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200/60 text-[11px] text-blue-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Citizen View: Live municipal status synced from Ahmedabad Municipal Corporation.</span>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            <div>
              <p className="text-slate-400 font-medium text-[11px]">AMC DEPARTMENT</p>
              <p className="font-semibold text-slate-800 mt-0.5">{ticket.department}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px]">ASSIGNED NODAL OFFICER</p>
              <p className="font-semibold text-slate-800 mt-0.5">{ticket.assignedTo || 'Ward Inspector (AMC)'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px]">SLA RESOLUTION WINDOW</p>
              <p className="font-semibold text-blue-700 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{ticket.slaDeadline || '24 Hours'}</span>
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium text-[11px]">PRIORITY CLASSIFICATION</p>
              <p className="font-semibold text-amber-700 mt-0.5">{ticket.priority || 'P1 - High'}</p>
            </div>
          </div>

          {/* Inspection / Field Notes */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Inspection & Dispatch Notes</span>
            </h4>
            <div className="p-3 rounded-lg bg-blue-50/40 border border-blue-100 text-xs text-slate-700 leading-relaxed font-mono">
              {ticket.resolutionNotes || 'Complaint verified by Gemini Vision. Routed to zonal control room. Field unit assigned.'}
            </div>
          </div>

          {/* Citizen Details */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Complainant: <strong className="text-slate-700">{ticket.citizenName || 'Citizen User'}</strong></span>
            <span>Phone: <strong className="text-slate-700">{ticket.citizenContact || '+91 98795-XXXXX'}</strong></span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Authenticated via AMC Central Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
