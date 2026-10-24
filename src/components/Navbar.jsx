import React from 'react';
import { Sparkles, MapPin, Database, ShieldCheck, PhoneCall, Building2 } from 'lucide-react';

export default function Navbar({ onResetDemo }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Official AMC Header */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
              <Building2 className="w-6 h-6" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white leading-none">A</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>AMC CivicPulse</span>
                  <span className="text-slate-400 font-light hidden sm:inline">—</span>
                  <span className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md hidden md:inline">
                    AI Grievance & Ward Routing Agent
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-slate-700">Ahmedabad Municipal Corporation</span>
                <span className="text-slate-300">•</span>
                <span className="hidden sm:inline">અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  48 Wards Active
                </span>
              </p>
            </div>
          </div>

          {/* Right Badges: Gemini 4 Argon, Google Maps Geocoding, Firebase */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Gemini 4 Argon Badge */}
            <div 
              title="LLM Multimodal Defect Classifier & Reasoning Agent"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-medium shadow-xs transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-800">Gemini 4 Argon</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded hidden lg:inline">AI Vision</span>
            </div>

            {/* Google Maps Geocoding Badge */}
            <div 
              title="Reverse Geocoding & AMC GIS Ward Boundary Locator"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-medium shadow-xs transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-semibold text-slate-800">Google Maps Geocoding</span>
              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-medium px-1.5 py-0.2 rounded hidden xl:inline">GIS Ward</span>
            </div>

            {/* Firebase Badge */}
            <div 
              title="Real-Time Civic Database & Citizen Notification Gateway"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-medium shadow-xs transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-slate-800">Firebase</span>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-medium px-1.5 py-0.2 rounded hidden sm:inline">Sync Active</span>
            </div>

            {/* Helpline / Support */}
            <a 
              href="tel:155303" 
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-200 text-xs font-semibold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>AMC Helpline: 155303</span>
            </a>

          </div>

        </div>
      </div>
    </header>
  );
}
