import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Bookmark, 
  Send, 
  MapPin, 
  AlertCircle,
  Edit3
} from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function SocialEscalationDraft({ 
  currentTicket, 
  uploadedImage, 
  locality 
}) {
  const [platform, setPlatform] = useState('twitter'); // 'twitter' or 'instagram'
  const [tone, setTone] = useState('urgent'); // 'urgent', 'formal', 'community'
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Active ticket data fallback
  const trackingId = currentTicket?.trackingId || currentTicket?.id || 'AMC-2026-000123';
  const issueText = currentTicket?.issue || 'civic defect';
  const wardText = currentTicket?.ward || 'W12 (Navrangpura)';
  const departmentText = currentTicket?.department || 'Roads & Buildings';
  const locationText = currentTicket?.area || locality || 'Navrangpura';
  const photo = uploadedImage || currentTicket?.image || '/assets/pothole.jpg';

  // Tone templates with @AhmedabadAMC, matched ward & department
  const getDraftText = () => {
    switch (tone) {
      case 'formal':
        return `Attn @AhmedabadAMC & Department of ${departmentText}:\n\nFormal civic grievance submission regarding ${issueText} in ${locationText} (Ward: ${wardText}).\n\n• Docket ID: #${trackingId}\n• Responsible Dept: ${departmentText}\n• Ward: ${wardText}\n\nRequesting immediate inspection and repair as per citizen charter SLA.\n\n#AhmedabadAMC #CleanAhmedabad #SmartCityAMC #AMC_Grievance`;
      case 'community':
        return `Amdavadis, please be cautious near ${locationText} (Ward: ${wardText})! Reported this ${issueText.toLowerCase()} to @AhmedabadAMC.\n\nDocket #${trackingId} has been filed with AMC ${departmentText}.\n\nLet's ensure our city remains clean and safe for all! 🙏 @CommissionerAMC\n\n#AhmedabadAMC #AmdavadCivicAlert #MissionCleanAmdavad #Ward_${wardText.replace(/[^a-zA-Z0-9]/g, '')}`;
      case 'urgent':
      default:
        return `🚨 URGENT CIVIC HAZARD: Critical ${issueText.toLowerCase()} reported in ${locationText} (Ward: ${wardText}).\n\nFiled official ticket with @AhmedabadAMC.\n\n📌 Tracking Docket: #${trackingId}\n🏛️ Department: ${departmentText}\n📍 Ward: ${wardText}, Ahmedabad\nCc: @CommissionerAMC\n\nKindly dispatch field repair gang immediately.\n#AhmedabadAMC #CleanAhmedabad #AmdavadCivicAlert #SmartCityAMC`;
    }
  };

  const [customText, setCustomText] = useState(getDraftText());

  // Update when ticket changes if not manually editing
  React.useEffect(() => {
    if (!isEditing) {
      setCustomText(getDraftText());
    }
  }, [tone, currentTicket, locality, trackingId, wardText, departmentText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(customText)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      
      {/* Platform & Tone Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        
        {/* Platform Toggle */}
        <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
          <button
            onClick={() => setPlatform('twitter')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              platform === 'twitter'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="font-bold">𝕏</span>
            <span>X / Twitter</span>
          </button>
          <button
            onClick={() => setPlatform('instagram')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              platform === 'instagram'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </button>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Tone:</span>
          {[
            { id: 'urgent', label: '🚨 Urgent' },
            { id: 'formal', label: '📋 Formal' },
            { id: 'community', label: '🙏 Citizen' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTone(t.id);
                setIsEditing(false);
              }}
              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${
                tone === t.id
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Social Post Preview Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 sm:p-5 text-slate-900 relative">
        
        {/* Post Author Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              CR
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Citizen Voice Ahmedabad
                </span>
                <span className="text-[11px] text-slate-400">@CitizenAmdavad</span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-400">Just now</span>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>Ahmedabad, Gujarat</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              title="Edit draft text"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Post Text: View or Edit */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={5}
              className="w-full text-xs p-2.5 border border-blue-400 rounded-lg bg-blue-50/20 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">Editing escalation post draft...</p>
          </div>
        ) : (
          <div className="text-xs sm:text-[13px] leading-relaxed text-slate-800 whitespace-pre-line mb-3">
            {customText}
          </div>
        )}

        {/* Attached Defect Photo */}
        {photo && (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-3.5 group max-h-64 sm:max-h-72 flex items-center justify-center">
            <img 
              src={photo} 
              alt="Civic Issue Proof" 
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            
            {/* Overlay badge with AMC Tracking ID */}
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              #{trackingId} • Verified Evidence
            </div>
          </div>
        )}

        {/* Fake Engagement Metrics */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-slate-500 text-xs">
          {platform === 'twitter' ? (
            <>
              <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" /> 18
              </span>
              <span className="flex items-center gap-1.5 hover:text-emerald-600 cursor-pointer">
                <Repeat2 className="w-3.5 h-3.5" /> 42
              </span>
              <span className="flex items-center gap-1.5 hover:text-rose-600 cursor-pointer">
                <Heart className="w-3.5 h-3.5" /> 129
              </span>
              <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
                <Bookmark className="w-3.5 h-3.5" /> 15
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <MessageCircle className="w-4 h-4 hover:text-slate-800" />
                <Send className="w-4 h-4 hover:text-slate-800" />
              </div>
              <span className="text-[11px] text-slate-400">184 likes</span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons: Copy Text & Publish Intent */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <p className="text-[11px] text-slate-500 italic">
          Draft automatically includes official tags <span className="font-semibold text-blue-700">@AhmedabadAMC</span> & <span className="font-semibold text-blue-700">#{trackingId}</span>
        </p>

        <div className="flex items-center space-x-2">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Draft</span>
              </>
            )}
          </button>

          {/* Open in X/Twitter */}
          <button
            onClick={handleOpenTwitter}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Escalate on 𝕏</span>
          </button>
        </div>
      </div>

    </div>
  );
}
