import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
  Camera
} from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [activeRole, setActiveRole] = useState('user'); // 'user' or 'admin'
  const [emailOrPhone, setEmailOrPhone] = useState('citizen.ahmedabad@gmail.com');
  const [password, setPassword] = useState('citizen123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleTab = (role) => {
    setActiveRole(role);
    setErrorMsg('');
    if (role === 'user') {
      setEmailOrPhone('citizen.ahmedabad@gmail.com');
      setPassword('citizen123');
    } else {
      setEmailOrPhone('commissioner@ahmedabadcity.gov.in');
      setPassword('amcadmin2026');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMsg('Please enter your email or identifier.');
      return;
    }

    if (activeRole === 'user') {
      onLogin({
        role: 'user',
        name: 'Aarav Mehta (Citizen)',
        email: emailOrPhone,
        locality: 'Navrangpura',
        ward: 'W12',
        badge: 'Citizen User'
      });
    } else {
      onLogin({
        role: 'admin',
        name: 'Dr. Hardik Shah, IAS',
        title: 'Municipal Commissioner & Admin',
        email: emailOrPhone,
        department: 'AMC Central Administrative Secretariat',
        badge: 'AMC Municipal Admin'
      });
    }
  };

  // Quick 1-click Demo Logins
  const handleQuickLogin = (role) => {
    if (role === 'user') {
      onLogin({
        role: 'user',
        name: 'Aarav Mehta (Citizen)',
        email: 'aarav.mehta@ahmedabad.in',
        locality: 'Navrangpura',
        ward: 'W12',
        badge: 'Citizen User'
      });
    } else {
      onLogin({
        role: 'admin',
        name: 'Dr. Hardik Shah, IAS',
        title: 'Municipal Commissioner & Admin',
        email: 'commissioner@ahmedabadcity.gov.in',
        department: 'AMC Central Administrative Secretariat',
        badge: 'AMC Municipal Admin'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-10 px-6 py-5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">AMC CivicPulse</span>
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  AI Ward Routing & Grievance
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Ahmedabad Municipal Corporation • અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AMC 48 Wards GIS Active</span>
          </div>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="max-w-md w-full bg-slate-850/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Role Tab Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 border-b border-slate-700/70">
            <button
              type="button"
              onClick={() => handleRoleTab('user')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'user'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen / User</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTab('admin')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AMC Admin / Officer</span>
            </button>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Role Header Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  activeRole === 'user'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  {activeRole === 'user' ? 'Public Citizen Access' : 'Full Administrative Access'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1.5">
                {activeRole === 'user' ? 'Citizen Sign In' : 'AMC Officer Portal'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {activeRole === 'user'
                  ? 'Access live situation of Ahmedabad areas and upload photos of civic issues.'
                  : 'Comprehensive administrative oversight: CRM docket management, AI tool traces, and social escalations.'}
              </p>
            </div>

            {/* Quick 1-Click Demo Login Button */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Instant Demo Access
                </span>
                <span className="text-[10px] text-slate-400">One-click login</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin(activeRole)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${
                  activeRole === 'user'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                }`}
              >
                <span>
                  {activeRole === 'user' 
                    ? '🚀 Quick Login as Citizen (Aarav Mehta)' 
                    : '🛡️ Quick Login as AMC Admin (Commissioner)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-700/80 w-full"></div>
              <span className="bg-slate-850 px-3 text-[11px] font-medium text-slate-400 shrink-0 uppercase tracking-wider">
                Or sign in with credentials
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Identifier Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  {activeRole === 'user' ? 'Email or Mobile Number' : 'Official AMC Officer Email ID'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={activeRole === 'user' ? 'citizen@gmail.com or 98795-xxxxx' : 'officer@ahmedabadcity.gov.in'}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  {activeRole === 'user' ? 'Password / OTP' : 'AMC Official Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs rounded-xl pl-9 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                  activeRole === 'user'
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                }`}
              >
                Sign In to {activeRole === 'user' ? 'Citizen Portal' : 'Admin Console'}
              </button>
            </form>

            {/* Role Permissions Summary Box */}
            <div className="pt-3 border-t border-slate-800 text-xs">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {activeRole === 'user' ? 'Your Citizen Permissions:' : 'Admin Full Privileges:'}
              </p>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {activeRole === 'user' ? (
                  <>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Know Situation of Areas:</strong> Live cleanliness & road conditions</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Uploadation of Issues:</strong> Camera & photo upload with AI routing</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-500 line-through">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Modify ticket statuses or assign municipal engineers</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-500 line-through">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Publish official social media escalation announcements</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-1.5 text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Complete Access:</strong> All 48 Wards, Departments & Tickets</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>CRM Control:</strong> Change statuses, resolve & assign officers</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>Broadcast:</strong> Official @AhmedabadAMC social escalations</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span><strong>AI Diagnostic:</strong> Gemini 4 Argon live function call trace</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-800">
        <p>Ahmedabad Municipal Corporation (AMC) CivicPulse System • GDG Garbathone PS-01</p>
      </footer>
    </div>
  );
}
