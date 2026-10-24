import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Building2, 
  Phone, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Droplets,
  Lightbulb,
  Trash2,
  Construction
} from 'lucide-react';
import { AMC_WARDS } from '../data/mockData';

// Enriched ward situation data for Ahmedabad areas
const AREA_SITUATION_DATA = [
  {
    wardId: 'W12',
    name: 'Navrangpura',
    zone: 'West Zone',
    condition: 'Moderate Attention',
    conditionScore: 78,
    conditionColor: 'amber',
    activeIssuesCount: 4,
    resolvedThisWeek: 18,
    potholes: { count: 2, severity: 'High', status: 'Patch gang dispatched on CG Road' },
    garbage: { count: 1, severity: 'Low', status: 'Door-to-door collection 94% on time' },
    streetlights: { count: 1, severity: 'Medium', status: '3 non-functional poles reported' },
    drainage: { count: 0, severity: 'Good', status: 'Catchpits cleaned pre-monsoon' },
    hotspot: 'CG Road near Municipal Market (Road resurfacing underway)',
    lastInspected: 'Today at 02:30 PM',
    engineer: 'Er. Rajesh K. Patel (AE-Roads)',
    contact: '079-26569100'
  },
  {
    wardId: 'W27',
    name: 'Maninagar',
    zone: 'South Zone',
    condition: 'Active Clearance',
    conditionScore: 71,
    conditionColor: 'amber',
    activeIssuesCount: 6,
    resolvedThisWeek: 23,
    potholes: { count: 1, severity: 'Low', status: 'Minor surface erosion on Rambaug road' },
    garbage: { count: 3, severity: 'High', status: 'Compactor vehicle GJ-01-CZ-4412 dispatched' },
    streetlights: { count: 1, severity: 'Low', status: 'Routine LED maintenance' },
    drainage: { count: 1, severity: 'Medium', status: 'Secondary storm line desilting' },
    hotspot: 'Kankaria Gate No. 3 (High footfall waste clearance priority)',
    lastInspected: 'Today at 01:15 PM',
    engineer: 'Er. Sandeep Desai (SWM Inspector)',
    contact: '079-25462211'
  },
  {
    wardId: 'W15',
    name: 'Vastrapur',
    zone: 'North-West Zone',
    condition: 'Good / Stable',
    conditionScore: 89,
    conditionColor: 'emerald',
    activeIssuesCount: 2,
    resolvedThisWeek: 31,
    potholes: { count: 0, severity: 'Good', status: 'Lake periphery roads clear' },
    garbage: { count: 1, severity: 'Low', status: 'Bin clearance completed at 10 AM' },
    streetlights: { count: 1, severity: 'Medium', status: 'Leaning pole repair scheduled' },
    drainage: { count: 0, severity: 'Good', status: 'Super-sucker desilting verified' },
    hotspot: 'Vastrapur Lake perimeter (Pedestrian footpath inspection)',
    lastInspected: 'Today at 11:45 AM',
    engineer: 'Er. Paresh Solanki (Electrical)',
    contact: '079-26857430'
  },
  {
    wardId: 'W18',
    name: 'Gota',
    zone: 'North-West Zone',
    condition: 'Under Monitoring',
    conditionScore: 68,
    conditionColor: 'rose',
    activeIssuesCount: 7,
    resolvedThisWeek: 14,
    potholes: { count: 3, severity: 'High', status: 'Service lane crater inspection' },
    garbage: { count: 2, severity: 'Medium', status: 'Secondary dump spot identified' },
    streetlights: { count: 0, severity: 'Good', status: 'Solar LED street lamps normal' },
    drainage: { count: 2, severity: 'High', status: 'SG Highway underpass drainage pump active' },
    hotspot: 'SG Highway Service Road near Gota Flyover',
    lastInspected: 'Today at 03:00 PM',
    engineer: 'Er. Mukesh Trivedi (Drainage)',
    contact: '079-27663412'
  },
  {
    wardId: 'W16',
    name: 'Satellite',
    zone: 'South-West Zone',
    condition: 'Excellent',
    conditionScore: 92,
    conditionColor: 'emerald',
    activeIssuesCount: 1,
    resolvedThisWeek: 28,
    potholes: { count: 1, severity: 'Low', status: 'Minor paver block settlement' },
    garbage: { count: 0, severity: 'Good', status: 'Smart segregation 98% compliant' },
    streetlights: { count: 0, severity: 'Good', status: 'All smart poles online' },
    drainage: { count: 0, severity: 'Good', status: 'Normal water flow' },
    hotspot: 'Jodhpur Cross Road (Traffic signal & street furniture check)',
    lastInspected: 'Today at 09:30 AM',
    engineer: 'Er. Anand Joshi (Public Works)',
    contact: '079-26928811'
  },
  {
    wardId: 'W11',
    name: 'Paldi',
    zone: 'West Zone',
    condition: 'Good / Stable',
    conditionScore: 84,
    conditionColor: 'emerald',
    activeIssuesCount: 3,
    resolvedThisWeek: 21,
    potholes: { count: 1, severity: 'Medium', status: 'Mahalaxmi crossroad resurfacing scheduled' },
    garbage: { count: 1, severity: 'Low', status: 'Commercial area bin cycle normal' },
    streetlights: { count: 1, severity: 'Low', status: 'Timer check on riverfront approach' },
    drainage: { count: 0, severity: 'Good', status: 'Drainage sumps fully functional' },
    hotspot: 'Anandnagar - Paldi Link Road',
    lastInspected: 'Today at 12:15 PM',
    engineer: 'Er. Chetan Bhatt (Roads)',
    contact: '079-26578912'
  }
];

export default function AreaSituationView({ onSelectAreaForUpload }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState(AREA_SITUATION_DATA[0]);

  const filteredAreas = AREA_SITUATION_DATA.filter(area => 
    area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    area.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    area.wardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    area.hotspot.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Banner & Search */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-xl p-4 sm:p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 border border-blue-400/40 text-blue-200">
                LIVE AMC CIVIC SITUATION
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Updated 15 mins ago
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold mt-1">
              Know Situation of Areas in Ahmedabad
            </h3>
            <p className="text-xs text-blue-100/90 max-w-xl mt-0.5">
              Check real-time road conditions, garbage clearance status, street lighting, and waterlogging across AMC wards before you step out.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search area (e.g. Navrangpura)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-blue-200 focus:placeholder:text-slate-400 pl-9 pr-3 py-2 rounded-lg text-xs font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Quick Area Pill Selector */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/10 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-blue-200 font-medium shrink-0">Popular Areas:</span>
          {AREA_SITUATION_DATA.map((area) => (
            <button
              key={area.wardId}
              onClick={() => setSelectedArea(area)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shrink-0 ${
                selectedArea.wardId === area.wardId
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Area Highlight Card */}
      {selectedArea && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                {selectedArea.wardId}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">{selectedArea.name}</h4>
                  <span className="text-xs text-slate-500 font-medium">({selectedArea.zone})</span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Inspected: {selectedArea.lastInspected}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-semibold">{selectedArea.resolvedThisWeek} resolved this week</span>
                </p>
              </div>
            </div>

            {/* Condition Health Score */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ward Health Index</span>
                <p className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    selectedArea.conditionColor === 'emerald' ? 'bg-emerald-500' :
                    selectedArea.conditionColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                  }`}></span>
                  {selectedArea.condition}
                </p>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-lg font-black font-mono border ${
                selectedArea.conditionColor === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                selectedArea.conditionColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {selectedArea.conditionScore}%
              </div>
            </div>
          </div>

          {/* 4 Infrastructure Pillars Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {/* Potholes / Roads */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Construction className="w-3.5 h-3.5 text-amber-600" />
                  Roads & Potholes
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  selectedArea.potholes.count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedArea.potholes.count} active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                {selectedArea.potholes.status}
              </p>
            </div>

            {/* Garbage & SWM */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-blue-600" />
                  Garbage & Cleanliness
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  selectedArea.garbage.count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedArea.garbage.count} active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                {selectedArea.garbage.status}
              </p>
            </div>

            {/* Streetlights */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Street Lighting
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  selectedArea.streetlights.count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedArea.streetlights.count} active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                {selectedArea.streetlights.status}
              </p>
            </div>

            {/* Drainage / Waterlogging */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                  Storm Drainage
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  selectedArea.drainage.count > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedArea.drainage.count} active
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                {selectedArea.drainage.status}
              </p>
            </div>
          </div>

          {/* Area Nodal Officer Contact & Hotspot */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-blue-50/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Area Nodal Officer</span>
                <p className="font-bold text-slate-800">{selectedArea.engineer}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedArea.contact}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 font-semibold transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedArea.contact}</span>
              </a>

              {onSelectAreaForUpload && (
                <button
                  onClick={() => onSelectAreaForUpload(selectedArea.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Report Issue in {selectedArea.name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Ahmedabad Areas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>All Ahmedabad Municipal Corporation Wards ({filteredAreas.length})</span>
          </h4>
          <span className="text-[11px] text-slate-400">Click any area to inspect live conditions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredAreas.map((area) => (
            <div
              key={area.wardId}
              onClick={() => setSelectedArea(area)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedArea?.wardId === area.wardId
                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-400/40 shadow-xs'
                  : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-blue-700">
                  {area.wardId}
                </span>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">{area.name}</h5>
                  <p className="text-[11px] text-slate-500">{area.zone} • {area.activeIssuesCount} active grievances</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  area.conditionColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                  area.conditionColor === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {area.conditionScore}% Clean
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
