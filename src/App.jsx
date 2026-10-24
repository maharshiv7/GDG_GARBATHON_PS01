import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CitizenChat from './components/CitizenChat';
import AgentToolTrace from './components/AgentToolTrace';
import CivicPortalTable from './components/CivicPortalTable';
import SocialEscalationDraft from './components/SocialEscalationDraft';
import AreaSituationView from './components/AreaSituationView';
import LoginPage from './components/LoginPage';
import initialAmcData from './amcData.json';
import { runCivicAgent } from './geminiAgent';
import { PRESET_DEFECTS, AMC_WARDS } from './data/mockData';
import { 
  Database, 
  Share2, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Lock, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

const STORAGE_KEY = 'amc_civicpulse_db_state_v1';
const AUTH_KEY = 'amc_civicpulse_auth_user_v1';

// 1. Initialize complaints table state from amcData.json (and sync updates to localStorage)
const getInitialDbState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.complaints) && parsed.complaints.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read dbState from localStorage, using amcData.json:', err);
  }
  return initialAmcData;
};

// 2. Initialize current logged-in user from localStorage (null = show Login Page)
const getInitialAuthUser = () => {
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Could not read auth user:', err);
  }
  return null;
};

const INITIAL_TOOL_STEPS = [
  {
    id: 'identify_civic_issue',
    title: 'Image Analysis',
    toolName: 'identify_civic_issue (Gemini 4 Argon)',
    status: 'completed',
    latency: '380ms',
    summary: 'Asphalt Pothole (High Severity)',
    output: {
      issue: 'pothole',
      severity: 'High',
      summary: 'Deep asphalt crater detected on road carriageway requiring immediate municipal action.'
    }
  },
  {
    id: 'lookup_ward_and_department',
    title: 'Ward & Dept Lookup',
    toolName: 'lookup_ward_and_department (AMC GIS)',
    status: 'completed',
    latency: '290ms',
    summary: 'Navrangpura (Ward W12, West Zone) -> Roads & Buildings',
    output: {
      ward: 'W12',
      wardName: 'Navrangpura',
      zone: 'West',
      department: 'Roads & Buildings'
    }
  },
  {
    id: 'create_amc_complaint',
    title: 'Ticket Creation',
    toolName: 'create_amc_complaint (AMC CRM)',
    status: 'completed',
    latency: '460ms',
    summary: 'Docket #AMC-2026-000123 Registered',
    output: {
      trackingId: 'AMC-2026-000123',
      ward: 'W12',
      department: 'Roads & Buildings',
      issue: 'pothole',
      area: 'CG Road',
      status: 'Assigned',
      filedAt: '2026-10-24T17:20:00+05:30'
    }
  },
  {
    id: 'get_complaint_status',
    title: 'Status Fetch',
    toolName: 'get_complaint_status (Firebase Core)',
    status: 'completed',
    latency: '240ms',
    summary: 'Status: Assigned (Roads & Buildings)',
    output: {
      trackingId: 'AMC-2026-000123',
      status: 'Assigned',
      ward: 'W12',
      department: 'Roads & Buildings',
      area: 'CG Road'
    }
  }
];

const INITIAL_CHAT = [
  {
    id: 'msg-1',
    sender: 'agent',
    text: "Namaste! Welcome to **AMC CivicPulse** — your AI Grievance & Ward Routing Assistant. You can upload a photo of potholes, garbage, streetlights, or waterlogging, and I will automatically identify the defect, look up the responsible AMC Ward & Department, file an official ticket, and generate an escalation post if needed.",
    timestamp: '11:30 AM',
  },
  {
    id: 'msg-2',
    sender: 'citizen',
    text: "What is the status of AMC-2026-000123?",
    timestamp: '11:31 AM',
  },
  {
    id: 'msg-3',
    sender: 'agent',
    text: "Here is the live status for **#AMC-2026-000123**:\n\n• **Issue:** POTHOLE (CG Road)\n• **Ward:** W12 (West Zone)\n• **Department:** Roads & Buildings\n• **Status:** 🔵 **Assigned**\n• **Filed At:** 24 Oct 2026, 5:20 PM\n\nYou can view full details in the Live AMC Portal Database on the right.",
    timestamp: '11:31 AM',
    ticketRef: 'AMC-2026-000123',
  },
];

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(getInitialAuthUser);

  // Complaints state initialized from amcData.json
  const [dbState, setDbState] = useState(getInitialDbState);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dbState));
    } catch (err) {
      console.error('Failed to sync dbState to localStorage:', err);
    }
  }, [dbState]);

  // Chat messages
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);

  // Active locality and defect
  const [selectedLocality, setSelectedLocality] = useState('Navrangpura');
  const [activeDefect, setActiveDefect] = useState(PRESET_DEFECTS[0]);

  // Base64 string & mimeType state
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [imagePreview, setImagePreview] = useState('/assets/pothole.jpg');

  // Convert default preset image to base64 on initial mount
  useEffect(() => {
    const primeDefault = async () => {
      try {
        const res = await fetch('/assets/pothole.jpg');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result;
          const cleanBase64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
          setImageBase64(cleanBase64);
          setMimeType(blob.type || 'image/jpeg');
          setImagePreview('/assets/pothole.jpg');
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.warn('Could not prime initial image:', e);
      }
    };
    primeDefault();
  }, []);

  // Right Column Tab:
  // For User (Citizen): 'area' (Know situation of areas) or 'portal' (Track civic dockets)
  // For Admin: 'portal', 'social', 'area'
  const [activeTab, setActiveTab] = useState(() => {
    const user = getInitialAuthUser();
    return user?.role === 'admin' ? 'portal' : 'area';
  });

  // Active Ticket for social draft & detail view
  const [currentSelectedTicket, setCurrentSelectedTicket] = useState(
    () => dbState.complaints[0] || initialAmcData.complaints[0]
  );

  // Agent Tool Trace State
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [toolSteps, setToolSteps] = useState(INITIAL_TOOL_STEPS);

  const isAdmin = currentUser?.role === 'admin';

  // Handle Login
  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Could not save auth user:', e);
    }
    // Set appropriate starting tab based on role
    if (user.role === 'admin') {
      setActiveTab('portal');
    } else {
      setActiveTab('area');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.error('Could not remove auth user:', e);
    }
  };

  // Switch Role
  const handleSwitchRole = () => {
    if (isAdmin) {
      handleLogin({
        role: 'user',
        name: 'Aarav Mehta (Citizen)',
        email: 'aarav.mehta@ahmedabad.in',
        locality: 'Navrangpura',
        ward: 'W12',
        badge: 'Citizen User'
      });
    } else {
      handleLogin({
        role: 'admin',
        name: 'Dr. Hardik Shah, IAS',
        title: 'Municipal Commissioner & Admin',
        email: 'commissioner@ahmedabadcity.gov.in',
        department: 'AMC Central Administrative Secretariat',
        badge: 'AMC Municipal Admin'
      });
    }
  };

  // Update Ticket Status (Admin capability)
  const handleUpdateTicketStatus = (ticketId, newStatus, resolutionNotes) => {
    setDbState((prev) => {
      const updatedComplaints = prev.complaints.map((c) => {
        const match = (c.trackingId || c.id)?.toLowerCase() === ticketId?.toLowerCase();
        if (match) {
          return {
            ...c,
            status: newStatus,
            resolutionNotes: resolutionNotes || c.resolutionNotes || `Status updated to ${newStatus} by AMC Admin`,
          };
        }
        return c;
      });
      return {
        ...prev,
        complaints: updatedComplaints,
      };
    });
  };

  // onToolStep callback wired directly to Right Column's 4-Step Live Agent Tool-Call Trace
  const handleToolStep = ({ name, status, input, output }) => {
    const stepMap = {
      identify_civic_issue: 0,
      lookup_ward_and_department: 1,
      create_amc_complaint: 2,
      get_complaint_status: 3,
    };

    const stepIndex = stepMap[name];
    if (stepIndex === undefined) return;

    setActiveStepIndex(stepIndex);

    setToolSteps((prev) => {
      const copy = [...prev];
      const prevStep = copy[stepIndex];
      let summaryText = prevStep.summary;

      if (status === 'running') {
        summaryText = `Running ${name}...`;
      } else if (status === 'completed' && output) {
        if (name === 'identify_civic_issue') {
          summaryText = `${(output.issue || 'Defect').toUpperCase()} (${output.severity || 'High'}) — ${output.summary || 'Identified'}`;
        } else if (name === 'lookup_ward_and_department') {
          summaryText = `${output.wardName || output.ward} (${output.zone || 'AMC'} Zone) -> ${output.department}`;
        } else if (name === 'create_amc_complaint') {
          summaryText = `Docket #${output.trackingId} Registered (${output.status})`;
        } else if (name === 'get_complaint_status') {
          summaryText = output.error ? `Failed: ${output.error}` : `Docket #${output.trackingId} — ${output.status}`;
        }
      }

      copy[stepIndex] = {
        ...prevStep,
        status,
        summary: summaryText,
        output: output !== undefined ? output : (input ? { parameters: input } : null),
        latency: status === 'completed' ? `${Math.floor(Math.random() * 150 + 260)}ms` : prevStep.latency,
      };
      return copy;
    });

    // Update Social Media Escalation Draft when new complaint is created
    if (name === 'create_amc_complaint' && status === 'completed' && output) {
      const newEscalationTicket = {
        trackingId: output.trackingId,
        id: output.trackingId,
        ward: output.ward,
        department: output.department,
        issue: output.issue,
        area: output.area || selectedLocality,
        summary: output.summary,
        image: imagePreview || '/assets/pothole.jpg',
        status: output.status,
        filedAt: output.filedAt || new Date().toISOString(),
      };
      setCurrentSelectedTicket(newEscalationTicket);
    }
  };

  // Run civic agent
  const executeCivicAgent = async (promptOverride = null) => {
    setIsExecuting(true);

    const isStatus = promptOverride
      ? promptOverride.includes('AMC-2026') || promptOverride.toLowerCase().includes('status')
      : false;

    // Reset relevant steps visually
    if (!isStatus) {
      setToolSteps((prev) =>
        prev.map((s, idx) => (idx < 3 ? { ...s, status: 'idle', latency: '...' } : s))
      );
    } else {
      setToolSteps((prev) =>
        prev.map((s, idx) => (idx === 3 ? { ...s, status: 'idle', latency: '...' } : s))
      );
    }

    const promptText =
      promptOverride ||
      `Analyze this photo of ${activeDefect?.title || 'civic defect'} in ${selectedLocality}, find the right ward and department, and file the complaint.`;

    try {
      const responseText = await runCivicAgent({
        promptText,
        imageBase64,
        mimeType,
        dbState,
        setDbState,
        onToolStep: handleToolStep,
      });

      if (responseText) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'msg-agent-' + Date.now(),
            sender: 'agent',
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ticketRef: responseText.match(/AMC-2026-\d+/i)?.[0]?.toUpperCase(),
          },
        ]);
      }
    } catch (err) {
      console.error('Civic agent execution error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'msg-agent-err-' + Date.now(),
          sender: 'agent',
          text: `⚠️ Agent execution error: ${err.message || 'Unknown issue'}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsExecuting(false);
      setActiveStepIndex(-1);
    }
  };

  // Handle citizen text message submission
  const handleSendMessage = async (text) => {
    const userMsg = {
      id: 'msg-user-' + Date.now(),
      sender: 'citizen',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    await executeCivicAgent(text);
  };

  // Reset entire demo
  const handleResetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setDbState(initialAmcData);
    setChatMessages(INITIAL_CHAT);
    setActiveDefect(PRESET_DEFECTS[0]);
    setToolSteps(INITIAL_TOOL_STEPS);
    setCurrentSelectedTicket(initialAmcData.complaints[0]);
  };

  const handleSelectTicketFromChat = (ticketId) => {
    const found = dbState.complaints.find(
      (t) => (t.trackingId || t.id)?.toUpperCase() === ticketId?.toUpperCase()
    );
    if (found) {
      setCurrentSelectedTicket(found);
      setActiveTab('portal');
    }
  };

  // If user is not logged in, show LoginPage
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar 
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onResetDemo={handleResetDemo} 
      />

      {/* Main Container: 2-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT COLUMN: Citizen Complaint & Status Chat (5 cols) ================= */}
          {/* Available to both Citizen and Admin (for issue uploadation and live reporting) */}
          <div className="lg:col-span-5 flex flex-col min-h-[760px]">
            <CitizenChat
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              onFileGrievance={() => executeCivicAgent()}
              selectedLocality={selectedLocality}
              setSelectedLocality={setSelectedLocality}
              activeDefect={activeDefect}
              setActiveDefect={setActiveDefect}
              imagePreview={imagePreview}
              onImageChange={({ base64, mimeType: mType, previewUrl }) => {
                setImageBase64(base64);
                setMimeType(mType);
                setImagePreview(previewUrl);
              }}
              onClearImage={() => {
                setImageBase64(null);
                setMimeType('image/jpeg');
                setImagePreview(null);
              }}
              isAnalyzing={isExecuting}
              onSelectTicket={handleSelectTicketFromChat}
            />
          </div>

          {/* ================= RIGHT COLUMN: Role-Based Content (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            
            {/* Top Card for Admin: Live Agent Tool-Call Trace */}
            {isAdmin ? (
              <AgentToolTrace
                steps={toolSteps}
                activeStepIndex={activeStepIndex}
                isExecuting={isExecuting}
                onRunSimulation={() => executeCivicAgent()}
              />
            ) : (
              /* Top Card for Citizen: Issue Upload & Area Safety Overview Banner */
              <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-xl p-5 text-white shadow-sm border border-blue-600/30">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                      Citizen Portal Dashboard
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 border border-white/20 text-white">
                    Logged in as: {currentUser.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 text-xs">
                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>Issue Upload</span>
                    </div>
                    <p className="text-[11px] text-blue-100">
                      Upload photo & select locality on the left to file an official grievance.
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      <MapPin className="w-4 h-4 text-rose-300" />
                      <span>Area Situation</span>
                    </div>
                    <p className="text-[11px] text-blue-100">
                      Check real-time road conditions, waterlogging & clean index below.
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      <Clock className="w-4 h-4 text-emerald-300" />
                      <span>24h AMC SLA</span>
                    </div>
                    <p className="text-[11px] text-blue-100">
                      Automated routing to responsible AMC Ward Officer & prompt tracking.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Card: Role-Aware Tabbed Views */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex-1 flex flex-col">
              
              {/* Tab Header Selector */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 flex-wrap gap-2">
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  
                  {/* Tab: Know Situation of Areas (Primary for Citizen, available to Admin) */}
                  <button
                    onClick={() => setActiveTab('area')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'area'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>Know Situation of Areas</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        activeTab === 'area' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {AMC_WARDS.length} Wards
                    </span>
                  </button>

                  {/* Tab: Live AMC Portal Database / Docket Tracker */}
                  <button
                    onClick={() => setActiveTab('portal')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'portal'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>{isAdmin ? 'AMC Central Portal (CRM)' : 'Track Community Dockets'}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        activeTab === 'portal' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {dbState.complaints.length}
                    </span>
                  </button>

                  {/* Tab: Social Media Escalation Draft (ADMIN ONLY) */}
                  {isAdmin ? (
                    <button
                      onClick={() => setActiveTab('social')}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'social'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Social Media Escalation Draft</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                          activeTab === 'social' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        𝕏 / IG
                      </span>
                    </button>
                  ) : (
                    <div 
                      title="Only AMC Admin can broadcast official escalation notices"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 bg-slate-50 border border-dashed border-slate-200 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Official Broadcast (Admin Only)</span>
                    </div>
                  )}

                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sync: Live Firestore</span>
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="flex-1">
                {activeTab === 'area' ? (
                  <AreaSituationView 
                    onSelectAreaForUpload={(areaName) => {
                      setSelectedLocality(areaName);
                    }}
                  />
                ) : activeTab === 'portal' ? (
                  <CivicPortalTable 
                    tickets={dbState.complaints} 
                    isAdmin={isAdmin}
                    onUpdateStatus={handleUpdateTicketStatus}
                  />
                ) : (
                  isAdmin && (
                    <SocialEscalationDraft
                      currentTicket={currentSelectedTicket || dbState.complaints[0]}
                      uploadedImage={imagePreview}
                      locality={selectedLocality}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Ahmedabad Municipal Corporation (AMC) CivicPulse System</span>
            <span className="text-slate-300">•</span>
            <span>GDG Garbathone PS-01</span>
          </p>
          <p className="text-slate-400 text-[11px]">
            Role-Based Access: Citizen (Situation & Uploads) | Admin (Comprehensive CRM & Broadcaster)
          </p>
        </div>
      </footer>
    </div>
  );
}
