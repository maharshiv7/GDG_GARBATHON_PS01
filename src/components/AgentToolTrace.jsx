import React, { useState } from 'react';
import { 
  Eye, 
  MapPinned, 
  FileCheck2, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';

export default function AgentToolTrace({ 
  steps, 
  activeStepIndex, 
  isExecuting, 
  onRunSimulation 
}) {
  const [expandedSteps, setExpandedSteps] = useState({
    0: true, // keep first step expanded by default
    1: false,
    2: false,
    3: false,
  });
  const [copiedStep, setCopiedStep] = useState(null);

  const toggleExpand = (index) => {
    setExpandedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleAll = () => {
    const allExpanded = Object.values(expandedSteps).every(Boolean);
    setExpandedSteps({
      0: !allExpanded,
      1: !allExpanded,
      2: !allExpanded,
      3: !allExpanded,
    });
  };

  const copyToClipboard = (jsonContent, stepIndex, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(jsonContent, null, 2));
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const isAllExpanded = Object.values(expandedSteps).every(Boolean);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 transition-all">
      {/* Top Header of the Trace Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Live Agent Tool-Call Trace
              </h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isExecuting 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                  : completedCount === 4 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                    Executing Pipeline...
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-emerald-600" />
                    {completedCount} / 4 Tools Executed
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous reasoning cycle via Gemini 4 Argon, Maps Geocoding & AMC CRM
            </p>
          </div>
        </div>

        {/* Action Buttons to toggle all or re-run */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-200 transition-colors"
            title="Expand or collapse all step JSON previews"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
          </button>

          <button
            onClick={onRunSimulation}
            disabled={isExecuting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            title="Simulate all 4 agent tool calls sequentially"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-blue-600" />
                <span>Re-run Trace</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4-Step Pipeline: Grid / Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, index) => {
          const isCurrentRunning = isExecuting && activeStepIndex === index;
          const isDone = step.status === 'completed';
          const isIdle = step.status === 'idle';
          const isExpanded = !!expandedSteps[index];

          // Icons per step
          const stepIcons = [
            <Eye className="w-4 h-4" />,
            <MapPinned className="w-4 h-4" />,
            <FileCheck2 className="w-4 h-4" />,
            <RefreshCw className="w-4 h-4" />
          ];

          return (
            <div 
              key={step.id}
              className={`rounded-lg border transition-all duration-200 ${
                isCurrentRunning
                  ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-100 shadow-sm'
                  : isDone
                    ? 'border-emerald-200 bg-emerald-50/15'
                    : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              {/* Step Card Header */}
              <div 
                onClick={() => toggleExpand(index)}
                className="p-3 cursor-pointer select-none flex flex-col justify-between hover:bg-slate-100/40 rounded-t-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Step 0{index + 1}
                  </span>

                  {/* Status Indicator Pill */}
                  {isCurrentRunning ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      Running
                    </span>
                  ) : isDone ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      {step.latency || 'Completed'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                </div>

                {/* Step Title & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                      isCurrentRunning
                        ? 'bg-blue-600 text-white'
                        : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}>
                      {stepIcons[index]}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {step.toolName}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Brief Result Line */}
                <p className="text-[11px] text-slate-600 mt-2 line-clamp-1 italic">
                  {step.summary || (isCurrentRunning ? 'Evaluating prompt & media payload...' : 'Awaiting trigger')}
                </p>
              </div>

              {/* Collapsible JSON Output Preview */}
              {isExpanded && (
                <div className="border-t border-slate-200/80 bg-slate-900 text-slate-100 rounded-b-lg p-2.5 font-mono text-[10px] relative group overflow-hidden">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-slate-400">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                      Tool Output Payload (JSON)
                    </span>
                    <button
                      onClick={(e) => copyToClipboard(step.output, index, e)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded transition-colors"
                      title="Copy JSON to clipboard"
                    >
                      {copiedStep === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="overflow-x-auto max-h-48 text-[10.5px] leading-tight text-blue-200">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
