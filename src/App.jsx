import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CitizenChat from './components/CitizenChat';
import AgentToolTrace from './components/AgentToolTrace';
import CivicPortalTable from './components/CivicPortalTable';
import SocialEscalationDraft from './components/SocialEscalationDraft';
import initialAmcData from './amcData.json';
import { runCivicAgent } from './geminiAgent';
import { PRESET_DEFECTS, AMC_WARDS } from './data/mockData';
import { Database, Share2, Building2 } from 'lucide-react';

const STORAGE_KEY = 'amc_civicpulse_db_state_v1';

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
  // 1. Complaints state initialized from amcData.json
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

  // 2. Base64 string & mimeType state
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

  // Right Column Bottom Tab ('portal' or 'social')
  const [activeTab, setActiveTab] = useState('portal');

  // Active Ticket for social draft & detail view
  const [currentSelectedTicket, setCurrentSelectedTicket] = useState(
    () => dbState.complaints[0] || initialAmcData.complaints[0]
  );

  // 4. Agent Tool Trace State
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [toolSteps, setToolSteps] = useState(INITIAL_TOOL_STEPS);

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

    // 5. Whenever create_amc_complaint finishes, automatically update the Social Media Escalation Draft tab
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

  // 3. Run civic agent when user submits complaint or queries status
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onResetDemo={handleResetDemo} />

      {/* Main Container: 2-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT COLUMN: Citizen Complaint & Status Chat (5 cols) ================= */}
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

          {/* ================= RIGHT COLUMN: Tool-Call Trace + Tabbed Civic View (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            
            {/* Right Column Top: Live Agent Tool-Call Trace Card */}
            <AgentToolTrace
              steps={toolSteps}
              activeStepIndex={activeStepIndex}
              isExecuting={isExecuting}
              onRunSimulation={() => executeCivicAgent()}
            />

            {/* Right Column Bottom: Tabbed Civic View Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex-1 flex flex-col">
              
              {/* Tab Header Selector */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  {/* Tab 1: Live AMC Portal Database */}
                  <button
                    onClick={() => setActiveTab('portal')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'portal'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>Live AMC Portal Database</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        activeTab === 'portal' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {dbState.complaints.length}
                    </span>
                  </button>

                  {/* Tab 2: Social Media Escalation Draft */}
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
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sync: Live Firestore</span>
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="flex-1">
                {activeTab === 'portal' ? (
                  <CivicPortalTable tickets={dbState.complaints} />
                ) : (
                  <SocialEscalationDraft
                    currentTicket={currentSelectedTicket || dbState.complaints[0]}
                    uploadedImage={imagePreview}
                    locality={selectedLocality}
                  />
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
            Powered by Gemini 4 Argon • Google Maps Geocoding API • Firebase Cloud Firestore
          </p>
        </div>
      </footer>
    </div>
  );
}
