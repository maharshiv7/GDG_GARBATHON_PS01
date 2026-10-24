import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ExternalLink, 
  ChevronRight, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye
} from 'lucide-react';
import TicketDetailModal from './TicketDetailModal';

export default function CivicPortalTable({ tickets }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Image lookup fallback by issue
  const getDefectImage = (ticket) => {
    if (ticket.image) return ticket.image;
    const issueLower = (ticket.issue || '').toLowerCase();
    if (issueLower.includes('pothole')) return '/assets/pothole.jpg';
    if (issueLower.includes('garbage') || issueLower.includes('waste')) return '/assets/garbage.jpg';
    if (issueLower.includes('light') || issueLower.includes('streetlight')) return '/assets/streetlight.jpg';
    if (issueLower.includes('water') || issueLower.includes('flood') || issueLower.includes('drain')) return '/assets/waterlogging.jpg';
    return '/assets/pothole.jpg';
  };

  // Filter tickets
  const filteredTickets = tickets.map(t => ({
    ...t,
    trackingId: t.trackingId || t.id,
    displayDate: t.filedAt ? new Date(t.filedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (t.date || 'Today')
  })).filter(ticket => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      (ticket.trackingId && ticket.trackingId.toLowerCase().includes(q)) ||
      (ticket.issue && ticket.issue.toLowerCase().includes(q)) ||
      (ticket.ward && ticket.ward.toLowerCase().includes(q)) ||
      (ticket.department && ticket.department.toLowerCase().includes(q)) ||
      (ticket.area && ticket.area.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' 
      ? true 
      : statusFilter === 'In Progress' 
        ? (ticket.status.includes('Progress') || ticket.status.includes('Logged'))
        : ticket.status.includes(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const getStatusPill = (status) => {
    if (!status) return null;
    if (status.includes('Progress') || status.includes('Logged')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          {status.includes('Logged') ? 'Logged (Assigned)' : 'In Progress'}
        </span>
      );
    }
    if (status.includes('Assigned')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Assigned
        </span>
      );
    }
    if (status.includes('Resolved')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        
        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracking ID, issue, ward, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {['All', 'In Progress', 'Assigned', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {st} {st === 'All' ? `(${tickets.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Tracking ID</th>
              <th className="py-2.5 px-3">Civic Issue</th>
              <th className="py-2.5 px-3">Ward & Area</th>
              <th className="py-2.5 px-3">Department</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket, idx) => (
                <tr 
                  key={ticket.trackingId || idx}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                    idx === 0 ? 'bg-blue-50/20' : ''
                  }`}
                >
                  {/* Tracking ID */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      #{ticket.trackingId}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ticket.displayDate}</div>
                  </td>

                  {/* Issue & Photo */}
                  <td className="py-3 px-3 max-w-xs">
                    <div className="flex items-center space-x-2.5">
                      <img 
                        src={getDefectImage(ticket)} 
                        alt="Defect" 
                        className="w-10 h-10 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1 group-hover:text-blue-700 transition-colors capitalize">
                          {ticket.issue}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {ticket.summary || `${ticket.department} • 24h SLA`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Ward */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <p className="font-medium text-slate-800">{ticket.ward}</p>
                    <p className="text-[10px] text-slate-500">{ticket.area || ticket.zone || 'Ahmedabad'}</p>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200/60">
                      {ticket.department}
                    </span>
                  </td>

                  {/* Status Pill */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusPill(ticket.status)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(ticket);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No grievances found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
