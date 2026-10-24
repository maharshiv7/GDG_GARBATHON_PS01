import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Database, 
  ShieldCheck, 
  User, 
  LogOut, 
  RefreshCw, 
  Building2, 
  SlidersHorizontal 
} from 'lucide-react';

export default function Navbar({ currentUser, onSwitchRole, onLogout, onResetDemo }) {
  const isAdmin = currentUser?.role === 'admin';

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
                  <span className={`text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-md hidden md:inline border ${
                    isAdmin 
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200/80'
                  }`}>
                    {isAdmin ? 'Admin Console & Triage' : 'Citizen Grievance & Area Monitor'}
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

          {/* Right Section: Role Status, Switcher, Badges, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* User Profile & Role Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  isAdmin 
                    ? 'bg-amber-50/90 border-amber-200 text-amber-900' 
                    : 'bg-blue-50/90 border-blue-200 text-blue-900'
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                    isAdmin ? 'bg-amber-600' : 'bg-blue-600'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-bold truncate max-w-[140px]">{currentUser.name}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        isAdmin ? 'bg-amber-200/80 text-amber-900' : 'bg-blue-200/80 text-blue-900'
                      }`}>
                        {isAdmin ? 'ADMIN' : 'CITIZEN'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isAdmin ? 'Full Privileges' : 'Area Status & Uploads'}
                    </span>
                  </div>
                </div>

                {/* Switch Role Fast-Toggle */}
                {onSwitchRole && (
                  <button
                    onClick={onSwitchRole}
                    title={isAdmin ? "Switch to Citizen view" : "Switch to Admin view"}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                    <span className="hidden md:inline">
                      Switch to {isAdmin ? 'Citizen' : 'Admin'}
                    </span>
                  </button>
                )}

                {/* Logout Button */}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Sign out to Login screen"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                )}
              </div>
            )}

            {/* AI Agent Badge */}
            <div 
              title="Gemini 4 Argon AI Classifier"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-800">Gemini 4 Argon</span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
