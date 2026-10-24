import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  MapPin, 
  Crosshair, 
  Send, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Building2, 
  CornerDownLeft,
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { PRESET_DEFECTS, AMC_WARDS } from '../data/mockData';

// Formatted Message helper: transforms **bold** or __bold__ into actual bold text, renders clean bullets, and removes raw markdown symbols
function FormattedMessage({ text, isAgent }) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1" />;
        }

        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
        const lineContent = isBullet ? line.trim().replace(/^[•\-]\s*/, '') : line;

        // Parse **bold** or __bold__ patterns
        const parts = [];
        let lastIndex = 0;
        const boldRegex = /(\*\*|__)(.*?)\1/g;
        let match;

        while ((match = boldRegex.exec(lineContent)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              type: 'text',
              content: lineContent.substring(lastIndex, match.index)
            });
          }
          parts.push({
            type: 'bold',
            content: match[2]
          });
          lastIndex = boldRegex.lastIndex;
        }

        if (lastIndex < lineContent.length) {
          parts.push({
            type: 'text',
            content: lineContent.substring(lastIndex)
          });
        }

        const renderedLine = parts.map((p, pIdx) => {
          if (p.type === 'bold') {
            return (
              <strong 
                key={pIdx} 
                className={`font-bold ${isAgent ? 'text-slate-900' : 'text-white'}`}
              >
                {p.content}
              </strong>
            );
          }
          return <span key={pIdx}>{p.content}</span>;
        });

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 text-xs my-0.5">
              <span className={`shrink-0 ${isAgent ? 'text-blue-600 font-bold' : 'text-blue-200'}`}>•</span>
              <div className="flex-1 leading-snug">{renderedLine}</div>
            </div>
          );
        }

        return (
          <div key={lineIdx} className="leading-relaxed">
            {renderedLine}
          </div>
        );
      })}
    </div>
  );
}

export default function CitizenChat({
  chatMessages,
  onSendMessage,
  onFileGrievance,
  selectedLocality,
  setSelectedLocality,
  activeDefect,
  setActiveDefect,
  imagePreview,
  onImageChange,
  onClearImage,
  isAnalyzing,
  onSelectTicket
}) {
  const [inputText, setInputText] = useState('');
  const [landmarkInput, setLandmarkInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [gpsLocked, setGpsLocked] = useState(false);
  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAnalyzing]);

  // Convert uploaded image file to stripped base64 and mimeType
  const handleFileUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const mimeType = file.type || 'image/jpeg';
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Strip "data:image/...;base64," prefix
      const base64Clean = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

      onImageChange({
        base64: base64Clean,
        mimeType: mimeType,
        previewUrl: dataUrl
      });

      setActiveDefect({
        id: 'custom-' + Date.now(),
        title: 'Uploaded Civic Defect',
        locality: selectedLocality || 'Navrangpura',
        landmark: landmarkInput || 'Citizen Reported Location',
        image: dataUrl,
        category: 'Civic Grievance',
        department: 'AMC Central Engineering',
        description: 'Citizen submitted photographic evidence of urban infrastructure defect.',
        severity: 'High / P1',
        slaHours: 24,
        gps: { lat: 23.0365, lng: 72.5611 },
      });
      setGpsLocked(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Convert preset photo to base64 and select
  const handleSelectPreset = async (defect) => {
    setActiveDefect(defect);
    setSelectedLocality(defect.locality);
    setLandmarkInput(defect.landmark);
    setGpsLocked(false);

    try {
      const res = await fetch(defect.image);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64Clean = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
        onImageChange({
          base64: base64Clean,
          mimeType: blob.type || 'image/jpeg',
          previewUrl: defect.image
        });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Could not read preset as blob:', err);
      onImageChange({
        base64: '',
        mimeType: 'image/jpeg',
        previewUrl: defect.image
      });
    }
  };

  // Use Photo GPS simulation
  const handleUsePhotoGPS = () => {
    setGpsLocked(true);
    if (activeDefect?.gps) {
      // Find matching ward or default
      const matched = AMC_WARDS.find(w => w.name.toLowerCase() === activeDefect.locality.toLowerCase());
      if (matched) {
        setSelectedLocality(matched.name);
      }
    } else {
      setSelectedLocality('Navrangpura');
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !activeDefect) return;

    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    } else if (activeDefect) {
      onFileGrievance({
        defect: activeDefect,
        locality: selectedLocality,
        landmark: landmarkInput,
      });
    }
  };

  const currentDisplayImage = imagePreview || activeDefect?.image;

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col h-full overflow-hidden">
      
      {/* Top Card Title */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
          <h2 className="text-sm font-bold text-slate-800">
            Citizen Grievance & AI Status Gateway
          </h2>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
          Ward Routing Active
        </span>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4 overflow-y-auto">
        
        {/* ================= 1. Image Upload Dropzone ================= */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              Upload Civic Issue Photo
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Potholes, Garbage, Streetlights, Waterlogging
            </span>
          </label>

          {currentDisplayImage ? (
            /* Active Photo Preview Box */
            <div className="relative rounded-xl border border-blue-200 bg-blue-50/20 p-2.5 overflow-hidden">
              <div className="flex items-start gap-3">
                <img 
                  src={currentDisplayImage} 
                  alt="Defect Preview" 
                  className="w-24 h-20 sm:w-28 sm:h-24 object-cover rounded-lg border border-slate-200 shadow-2xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      {activeDefect?.title || 'Selected Defect'}
                    </span>
                    <button
                      onClick={() => {
                        setActiveDefect(null);
                        onClearImage && onClearImage();
                        setGpsLocked(false);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                    {activeDefect?.category || 'Civic Infrastructure Defect'}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {activeDefect?.description || 'Ready for Gemini multimodal vision analysis'}
                  </p>

                  {/* Simulated EXIF GPS tag */}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      <Crosshair className="w-2.5 h-2.5 text-emerald-600" />
                      EXIF GPS: {activeDefect?.gps?.lat || 23.0365}° N, {activeDefect?.gps?.lng || 72.5611}° E
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Dropzone */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/70' 
                  : 'border-slate-300 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="p-2.5 rounded-full bg-blue-100/70 text-blue-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Drop grievance photo here, or <span className="text-blue-600 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports PNG, JPG, WEBP (Max 10MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preset Sample Photo Buttons */}
          <div className="mt-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Or test with sample civic issues:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {PRESET_DEFECTS.map(def => (
                <button
                  key={def.id}
                  onClick={() => handleSelectPreset(def)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-left flex items-center gap-1.5 transition-all ${
                    activeDefect?.id === def.id
                      ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-2xs font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">
                    {def.id === 'pothole' ? '🕳️' : def.id === 'garbage' ? '🗑️' : def.id === 'streetlight' ? '💡' : '🌊'}
                  </span>
                  <span className="truncate">{def.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 2. Location Bar ================= */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Locality & Ward Resolution
            </span>

            {/* 'Use Photo GPS' Button */}
            <button
              onClick={handleUsePhotoGPS}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all shadow-2xs ${
                gpsLocked 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                  : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <Crosshair className={`w-3 h-3 ${gpsLocked ? 'animate-spin' : ''}`} />
              <span>{gpsLocked ? 'GPS Locked: 23.0365° N' : 'Use Photo GPS'}</span>
            </button>
          </div>

          {/* Quick-select locality chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">Quick Ward:</span>
            {['Navrangpura', 'Maninagar', 'Vastrapur', 'Gota'].map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocality(loc)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedLocality === loc
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Landmark / Road text input */}
          <input
            type="text"
            placeholder="Specific landmark / road (e.g. Near Municipal Market, CG Road)"
            value={landmarkInput}
            onChange={(e) => setLandmarkInput(e.target.value)}
            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* ================= 3. Chat Thread ================= */}
        <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3 pr-1 border-t border-slate-100 pt-3">
          {chatMessages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 ${isAgent ? 'items-start' : 'items-end justify-end'}`}
              >
                {isAgent && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                )}

                <div 
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                      : 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                  }`}
                >
                  <FormattedMessage text={msg.text} isAgent={isAgent} />
                  
                  {msg.ticketRef && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                      <span className="font-mono text-[10.5px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                        #{msg.ticketRef.replace(/^#+/, '')}
                      </span>
                      <button
                        onClick={() => onSelectTicket && onSelectTicket(msg.ticketRef.replace(/^#+/, ''))}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        Inspect Docket <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className={`text-[9px] mt-1 text-right ${isAgent ? 'text-slate-400' : 'text-blue-100'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing / Analyzing Indicator */}
          {isAnalyzing && (
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs text-slate-600 shadow-2xs flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[11px] font-medium text-slate-600">
                  AMC Agent executing Vision & GIS tools...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* ================= 4. Quick-Query Buttons ================= */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Quick Queries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'What is the status of #AMC-2026-104?',
              'Report pothole on CG Road, Navrangpura',
              'Check waste pickup schedule in Ward 12',
              'How do I escalate an urgent civic issue?'
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (q.includes('pothole')) {
                    handleSelectPreset(PRESET_DEFECTS[0]);
                  }
                  onSendMessage(q);
                }}
                className="text-[10.5px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/60 transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Action button if image is ready to file */}
        {activeDefect && (
          <button
            onClick={() => onFileGrievance({
              defect: activeDefect,
              locality: selectedLocality,
              landmark: landmarkInput,
            })}
            disabled={isAnalyzing}
            className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Process & Route Grievance via AI Agent</span>
          </button>
        )}

        {/* ================= 5. Bottom Input Box ================= */}
        <form onSubmit={handleSend} className="relative mt-auto pt-1">
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              placeholder="Describe grievance or ask ticket status (e.g. #AMC-2026-104)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() && !activeDefect}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg shadow-xs transition-colors shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
